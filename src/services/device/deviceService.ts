import { supabase } from '../supabase/supabaseClient';

export interface UserDevice {
  id: string;
  user_id: string;
  device_name: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  ip_address?: string;
  last_active_at: string;
  created_at?: string;
}

const DEVICE_ID_KEY = 'aurum_device_id';
const LOCAL_DEVICES_KEY = 'aurum_user_devices_v1';

export class DeviceService {
  /**
   * Retrieves or creates a unique, persistent client device ID for this browser.
   */
  public static getDeviceId(): string {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'aurum-dev-' + Math.random().toString(36).substring(2, 12) + '-' + Date.now().toString(36);
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  /**
   * Detects current device characteristics from user agent and system environment.
   */
  public static detectCurrentDevice(userId: string): UserDevice {
    const deviceId = this.getDeviceId();
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    
    let deviceName = 'Bilinmeyen Cihaz';
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';

    // Device detection
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isIPhone = /iPhone/.test(ua);
    const isIPad = /iPad/.test(ua) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    const isWindows = /Windows NT/i.test(ua);
    const isMac = /Macintosh|Mac OS X/i.test(ua) && !isIOS;
    const isLinux = /Linux/i.test(ua) && !isAndroid;

    if (isIPhone) {
      deviceName = 'Apple iPhone';
      deviceType = 'mobile';
    } else if (isIPad) {
      deviceName = 'Apple iPad';
      deviceType = 'tablet';
    } else if (isAndroid) {
      if (/Mobile/i.test(ua)) {
        deviceName = 'Android Telefon';
        deviceType = 'mobile';
      } else {
        deviceName = 'Android Tablet';
        deviceType = 'tablet';
      }
    } else if (isWindows) {
      deviceName = 'Windows PC';
      deviceType = 'desktop';
    } else if (isMac) {
      deviceName = 'Apple Mac (macOS)';
      deviceType = 'desktop';
    } else if (isLinux) {
      deviceName = 'Linux Cihazı';
      deviceType = 'desktop';
    }

    // Browser detection
    let browser = 'Modern Web Tarayıcı';
    if (/SamsungBrowser/i.test(ua)) {
      browser = 'Samsung Internet';
    } else if (/Edg/i.test(ua)) {
      browser = 'Microsoft Edge';
    } else if (/Chrome|CriOS/i.test(ua)) {
      browser = isIOS ? 'Chrome iOS' : 'Google Chrome';
    } else if (/Firefox|FxiOS/i.test(ua)) {
      browser = isIOS ? 'Firefox iOS' : 'Mozilla Firefox';
    } else if (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua)) {
      browser = isIOS ? 'Safari Mobile' : 'Safari';
    } else if (/OPR|Opera/i.test(ua)) {
      browser = 'Opera';
    }

    // Location / Timezone
    let location = 'Türkiye';
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && tz.includes('Istanbul')) {
        location = 'İstanbul, Türkiye';
      } else if (tz) {
        location = tz.replace('_', ' ');
      }
    } catch {
      // ignore
    }

    return {
      id: deviceId,
      user_id: userId,
      device_name: deviceName,
      device_type: deviceType,
      browser,
      location,
      last_active_at: new Date().toISOString(),
    };
  }

  /**
   * Registers or updates current device in Supabase and local cache.
   */
  public static async syncCurrentDevice(userId: string): Promise<UserDevice> {
    const currentDevice = this.detectCurrentDevice(userId);

    // 1. Update local storage cache first
    try {
      const localDevices = this.getLocalDevices(userId);
      const index = localDevices.findIndex((d) => d.id === currentDevice.id);
      if (index >= 0) {
        localDevices[index] = { ...localDevices[index], ...currentDevice };
      } else {
        localDevices.unshift(currentDevice);
      }
      this.saveLocalDevices(userId, localDevices);
    } catch (e) {
      console.warn('Local device cache update warning:', e);
    }

    // 2. Upsert to Supabase if connected
    try {
      const { error } = await supabase.from('user_devices').upsert({
        id: currentDevice.id,
        user_id: userId,
        device_name: currentDevice.device_name,
        device_type: currentDevice.device_type,
        browser: currentDevice.browser,
        location: currentDevice.location,
        last_active_at: currentDevice.last_active_at,
      });

      if (error) {
        console.warn('Supabase syncCurrentDevice warning:', error.message);
      }
    } catch (e) {
      console.warn('Supabase syncCurrentDevice error (table may not exist yet):', e);
    }

    return currentDevice;
  }

  /**
   * Fetches all registered devices for the user (from Supabase, with local cache fallback).
   */
  public static async getUserDevices(userId: string): Promise<UserDevice[]> {
    const currentDevice = this.detectCurrentDevice(userId);
    let devices: UserDevice[] = [];

    try {
      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', userId)
        .order('last_active_at', { ascending: false });

      if (!error && data && data.length > 0) {
        devices = data as UserDevice[];
        this.saveLocalDevices(userId, devices);
        return devices;
      }
    } catch (e) {
      console.warn('Supabase getUserDevices error:', e);
    }

    // Fallback: Local Cache
    const local = this.getLocalDevices(userId);
    if (local.length > 0) {
      const hasCurrent = local.some((d) => d.id === currentDevice.id);
      if (!hasCurrent) {
        local.unshift(currentDevice);
      }
      return local;
    }

    return [currentDevice];
  }

  /**
   * Removes a specific device (e.g. revoking a session).
   */
  public static async removeDevice(userId: string, deviceId: string): Promise<void> {
    // 1. Remove from local cache
    const local = this.getLocalDevices(userId);
    const updated = local.filter((d) => d.id !== deviceId);
    this.saveLocalDevices(userId, updated);

    // 2. Remove from Supabase
    try {
      await supabase
        .from('user_devices')
        .delete()
        .eq('id', deviceId)
        .eq('user_id', userId);
    } catch (e) {
      console.warn('Supabase removeDevice error:', e);
    }
  }

  /**
   * Revokes all devices except the current one.
   */
  public static async revokeOtherDevices(userId: string): Promise<void> {
    const currentDeviceId = this.getDeviceId();

    // 1. Keep only current in local cache
    const local = this.getLocalDevices(userId);
    const updated = local.filter((d) => d.id === currentDeviceId);
    this.saveLocalDevices(userId, updated);

    // 2. Remove from Supabase
    try {
      await supabase
        .from('user_devices')
        .delete()
        .neq('id', currentDeviceId)
        .eq('user_id', userId);
    } catch (e) {
      console.warn('Supabase revokeOtherDevices error:', e);
    }
  }

  private static getLocalDevices(userId: string): UserDevice[] {
    try {
      const raw = localStorage.getItem(`${LOCAL_DEVICES_KEY}_${userId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return [];
  }

  private static saveLocalDevices(userId: string, devices: UserDevice[]): void {
    try {
      localStorage.setItem(`${LOCAL_DEVICES_KEY}_${userId}`, JSON.stringify(devices));
    } catch {
      // ignore
    }
  }
}
