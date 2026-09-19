import { supabase } from './supabaseClient';
import type {
  HoldingsMap,
  Transaction,
  Goal,
  NoteItem,
  CustomAssetMap,
  CustomAssetMeta,
  Account,
  Category,
  RecurringTransaction,
  UserPreferences,
} from '../portfolio/types';
import type { AssetKey } from '../market/types';
import type { User } from '../auth/types';

export class SupabaseService {
  // ==========================================
  // USER PROFILES & PREFERENCES
  // ==========================================
  public static async getProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        name: data.full_name?.split(' ')[0] || data.username || 'Kullanıcı',
        username: data.username,
        avatar: data.avatar || 'beam-2',
        avatarType: data.avatar_type || 'beam',
        avatarColor: data.avatar_color || 'orange',
        authProvider: (data.auth_provider as any) || 'email',
        plan: data.plan || 'AURUM Pro',
        currencyPreference: data.currency_preference || 'TRY',
        onboardingCompleted: Boolean(data.onboarding_completed),
        createdAt: data.created_at,
      };
    } catch (e) {
      console.warn('Supabase getProfile failed, fallback to local:', e);
      return null;
    }
  }

  public static async updateProfile(userId: string, updates: Partial<User & { onboardingCompleted?: boolean }>): Promise<void> {
    try {
      const dbUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.username !== undefined) dbUpdates.username = updates.username;
      if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
      if (updates.avatarType !== undefined) dbUpdates.avatar_type = updates.avatarType;
      if (updates.avatarColor !== undefined) dbUpdates.avatar_color = updates.avatarColor;
      if (updates.currencyPreference !== undefined) dbUpdates.currency_preference = updates.currencyPreference;
      if (updates.authProvider !== undefined) dbUpdates.auth_provider = updates.authProvider;
      if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;

      await supabase.from('user_profiles').update(dbUpdates).eq('id', userId);
    } catch (e) {
      console.error('Supabase updateProfile error:', e);
    }
  }

  public static async getPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        name: data.full_name?.split(' ')[0] || 'Melih',
        currency: (data.currency_preference as any) || 'TRY',
        isBalanceHidden: Boolean(data.is_balance_hidden),
        autoRefreshEnabled: Boolean(data.auto_refresh_enabled ?? true),
        refreshIntervalSeconds: Number(data.refresh_interval_seconds) || 45,
        performancePeriod: (data.performance_period as any) || 'daily',
        theme: (data.theme as any) || 'aurum-gold',
      };
    } catch {
      return null;
    }
  }

  public static async savePreferences(userId: string, prefs: UserPreferences): Promise<void> {
    try {
      await supabase.from('user_profiles').update({
        currency_preference: prefs.currency,
        is_balance_hidden: prefs.isBalanceHidden,
        auto_refresh_enabled: prefs.autoRefreshEnabled,
        refresh_interval_seconds: prefs.refreshIntervalSeconds,
        performance_period: prefs.performancePeriod,
        theme: prefs.theme,
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
    } catch (e) {
      console.warn('Supabase savePreferences warning:', e);
    }
  }

  // ==========================================
  // HOLDINGS (Asset Reserves)
  // ==========================================
  public static async getHoldings(userId: string): Promise<HoldingsMap | null> {
    try {
      const { data, error } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        gramGold: Number(data.gram_gold) || 0,
        quarterGold: Number(data.quarter_gold) || 0,
        halfGold: Number(data.half_gold) || 0,
        fullGold: Number(data.full_gold) || 0,
        usd: Number(data.usd) || 0,
        eur: Number(data.eur) || 0,
        try: Number(data.try_cash) || 0,
      };
    } catch {
      return null;
    }
  }

  public static async saveHoldings(userId: string, holdings: HoldingsMap): Promise<void> {
    try {
      await supabase.from('holdings').upsert({
        user_id: userId,
        gram_gold: holdings.gramGold || 0,
        quarter_gold: holdings.quarterGold || 0,
        half_gold: holdings.halfGold || 0,
        full_gold: holdings.fullGold || 0,
        usd: holdings.usd || 0,
        eur: holdings.eur || 0,
        try_cash: holdings.try || 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    } catch (e) {
      console.warn('Supabase saveHoldings warning:', e);
    }
  }

  // ==========================================
  // TRANSACTIONS
  // ==========================================
  public static async getTransactions(userId: string): Promise<Transaction[] | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        assetKey: row.asset_key,
        quantity: Number(row.quantity) || 0,
        type: row.type,
        unitPrice: row.unit_price ? Number(row.unit_price) : undefined,
        totalValue: Number(row.total_value) || 0,
        purchasePrice: row.purchase_price ? Number(row.purchase_price) : undefined,
        date: row.date || '',
        timestamp: row.timestamp ? Number(row.timestamp) : new Date(row.created_at).getTime(),
        transactionDate: row.transaction_date,
        transactionTime: row.transaction_time,
        category: row.category,
        categoryId: row.category_id,
        title: row.title,
        accountId: row.account_id,
        targetAccountId: row.target_account_id,
        status: row.status || 'completed',
        note: row.note,
        marketPriceAtTransaction: row.market_price_at_transaction ? Number(row.market_price_at_transaction) : undefined,
      }));
    } catch {
      return null;
    }
  }

  public static async saveTransaction(userId: string, tx: Transaction): Promise<void> {
    try {
      await supabase.from('transactions').upsert({
        id: tx.id,
        user_id: userId,
        asset_key: tx.assetKey,
        quantity: tx.quantity,
        type: tx.type,
        unit_price: tx.unitPrice,
        total_value: tx.totalValue,
        purchase_price: tx.purchasePrice,
        date: tx.date,
        timestamp: tx.timestamp,
        transaction_date: tx.transactionDate,
        transaction_time: tx.transactionTime,
        category: tx.category,
        category_id: tx.categoryId,
        title: tx.title,
        account_id: tx.accountId,
        target_account_id: tx.targetAccountId,
        status: tx.status || 'completed',
        note: tx.note,
        market_price_at_transaction: tx.marketPriceAtTransaction,
      });
    } catch (e) {
      console.warn('Supabase saveTransaction warning:', e);
    }
  }

  public static async deleteTransaction(userId: string, txId: string): Promise<void> {
    try {
      await supabase.from('transactions').delete().eq('id', txId).eq('user_id', userId);
    } catch (e) {
      console.warn('Supabase deleteTransaction warning:', e);
    }
  }

  // ==========================================
  // ACCOUNTS
  // ==========================================
  public static async getAccounts(userId: string): Promise<Account[] | null> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        bankName: row.bank_name,
        initialBalance: Number(row.initial_balance) || 0,
        balance: Number(row.balance) || 0,
        currency: row.currency || 'TRY',
        icon: row.icon || 'Building2',
        color: row.color || '#E11D48',
        createdAt: new Date(row.created_at).getTime(),
      }));
    } catch {
      return null;
    }
  }

  public static async saveAccount(userId: string, account: Account): Promise<void> {
    try {
      await supabase.from('accounts').upsert({
        id: account.id,
        user_id: userId,
        name: account.name,
        type: account.type,
        bank_name: account.bankName,
        initial_balance: account.initialBalance,
        balance: account.balance,
        currency: account.currency,
        icon: account.icon,
        color: account.color,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase saveAccount warning:', e);
    }
  }

  public static async deleteAccount(userId: string, accountId: string): Promise<void> {
    try {
      await supabase.from('accounts').delete().eq('id', accountId).eq('user_id', userId);
    } catch (e) {
      console.warn('Supabase deleteAccount warning:', e);
    }
  }

  // ==========================================
  // CATEGORIES
  // ==========================================
  public static async getCategories(userId: string): Promise<Category[] | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        icon: row.icon || 'Circle',
        color: row.color || '#F59E0B',
        active: Boolean(row.active),
        createdAt: new Date(row.created_at).getTime(),
      }));
    } catch {
      return null;
    }
  }

  public static async saveCategory(userId: string, category: Category): Promise<void> {
    try {
      await supabase.from('categories').upsert({
        id: category.id,
        user_id: userId,
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        active: category.active,
      });
    } catch (e) {
      console.warn('Supabase saveCategory warning:', e);
    }
  }

  public static async deleteCategory(userId: string, categoryId: string): Promise<void> {
    try {
      await supabase.from('categories').delete().eq('id', categoryId).eq('user_id', userId);
    } catch (e) {
      console.warn('Supabase deleteCategory warning:', e);
    }
  }


  // ==========================================
  // RECURRING TRANSACTIONS
  // ==========================================
  public static async getRecurring(userId: string): Promise<RecurringTransaction[] | null> {
    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', userId);

      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        type: row.type,
        name: row.name,
        categoryId: row.category_id,
        amount: Number(row.amount) || 0,
        frequency: row.frequency || 'monthly',
        dayOfMonth: row.day_of_month,
        accountId: row.account_id,
        startDate: row.start_date,
        nextOccurrence: row.next_occurrence,
        installmentCurrent: row.installment_current,
        installmentTotal: row.installment_total,
        installmentRemaining: row.installment_remaining,
        active: Boolean(row.active),
        createdAt: new Date(row.created_at).getTime(),
        updatedAt: new Date(row.updated_at).getTime(),
      }));
    } catch {
      return null;
    }
  }

  public static async saveRecurring(userId: string, rec: RecurringTransaction): Promise<void> {
    try {
      await supabase.from('recurring_transactions').upsert({
        id: rec.id,
        user_id: userId,
        type: rec.type,
        name: rec.name,
        category_id: rec.categoryId,
        amount: rec.amount,
        frequency: rec.frequency,
        day_of_month: rec.dayOfMonth,
        account_id: rec.accountId,
        start_date: rec.startDate,
        next_occurrence: rec.nextOccurrence,
        installment_current: rec.installmentCurrent,
        installment_total: rec.installmentTotal,
        installment_remaining: rec.installmentRemaining,
        active: rec.active,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase saveRecurring warning:', e);
    }
  }

  public static async deleteRecurring(userId: string, id: string): Promise<void> {
    try {
      await supabase.from('recurring_transactions').delete().eq('id', id).eq('user_id', userId);
    } catch (e) {
      console.warn('Supabase deleteRecurring warning:', e);
    }
  }

  // ==========================================
  // GOALS
  // ==========================================
  public static async getGoals(userId: string): Promise<Goal[] | null> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);

      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        title: row.title,
        targetAmount: Number(row.target_amount) || 0,
        currentAmount: Number(row.current_amount) || 0,
        targetDate: row.target_date,
        icon: row.icon || '🎯',
        imageUrl: row.image_url,
        category: row.category || 'other',
        note: row.note,
        createdAt: new Date(row.created_at).getTime(),
      }));
    } catch {
      return null;
    }
  }

  public static async saveGoal(userId: string, goal: Goal): Promise<void> {
    try {
      await supabase.from('goals').upsert({
        id: goal.id,
        user_id: userId,
        title: goal.title,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount,
        target_date: goal.targetDate,
        icon: goal.icon,
        image_url: goal.imageUrl,
        category: goal.category,
        note: goal.note,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase saveGoal warning:', e);
    }
  }

  public static async deleteGoal(userId: string, goalId: string): Promise<void> {
    try {
      await supabase.from('goals').delete().eq('id', goalId).eq('user_id', userId);
    } catch (e) {
      console.warn('Supabase deleteGoal warning:', e);
    }
  }

  // ==========================================
  // NOTES & TODOS
  // ==========================================
  public static async getNotes(userId: string): Promise<NoteItem[] | null> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        title: row.title,
        content: row.content || '',
        type: row.type || 'note',
        tags: Array.isArray(row.tags) ? row.tags : [],
        completed: Boolean(row.completed),
        priority: row.priority,
        dueDate: row.due_date,
        createdAt: new Date(row.created_at).getTime(),
        updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
      }));
    } catch {
      return null;
    }
  }

  public static async saveNote(userId: string, note: NoteItem): Promise<void> {
    try {
      await supabase.from('notes').upsert({
        id: note.id,
        user_id: userId,
        title: note.title,
        content: note.content,
        type: note.type,
        tags: note.tags || [],
        completed: note.completed ?? false,
        priority: note.priority,
        due_date: note.dueDate,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase saveNote warning:', e);
    }
  }

  public static async deleteNote(userId: string, noteId: string): Promise<void> {
    try {
      await supabase.from('notes').delete().eq('id', noteId).eq('user_id', userId);
    } catch (e) {
      console.warn('Supabase deleteNote warning:', e);
    }
  }

  // ==========================================
  // CUSTOM ASSETS
  // ==========================================
  public static async getCustomAssets(userId: string): Promise<CustomAssetMap | null> {
    try {
      const { data, error } = await supabase
        .from('custom_assets')
        .select('*')
        .eq('user_id', userId);

      if (error || !data) return null;

      const map: CustomAssetMap = {};
      data.forEach((row: any) => {
        if (row.key) {
          map[row.key as AssetKey] = {
            customName: row.name,
            customDescription: row.notes,
            imageUrl: row.image_url,
            customImage: row.image_url,
            note: row.notes,
            updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
          };
        }
      });
      return map;
    } catch {
      return null;
    }
  }

  public static async saveCustomAsset(userId: string, assetKey: AssetKey, meta: CustomAssetMeta): Promise<void> {
    try {
      await supabase.from('custom_assets').upsert({
        id: `${userId}_${assetKey}`,
        user_id: userId,
        key: assetKey,
        name: meta.customName || assetKey,
        symbol: assetKey.toUpperCase(),
        image_url: meta.imageUrl || meta.customImage,
        notes: meta.customDescription || meta.note,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase saveCustomAsset warning:', e);
    }
  }

  public static async saveAllCustomAssets(userId: string, customMap: CustomAssetMap): Promise<void> {
    try {
      const entries = Object.entries(customMap) as [AssetKey, CustomAssetMeta][];
      if (entries.length === 0) return;
      const rows = entries.map(([key, meta]) => ({
        id: `${userId}_${key}`,
        user_id: userId,
        key: key,
        name: meta?.customName || key,
        symbol: key.toUpperCase(),
        image_url: meta?.imageUrl || meta?.customImage,
        notes: meta?.customDescription || meta?.note,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from('custom_assets').upsert(rows);
    } catch (e) {
      console.warn('Supabase saveAllCustomAssets warning:', e);
    }
  }

  // ==========================================
  // UNIFIED FETCH ALL USER DATA
  // ==========================================
  public static async fetchAllUserData(userId: string) {
    try {
      const [
        holdings,
        transactions,
        accounts,
        categories,
        recurring,
        goals,
        notes,
        customAssets,
        preferences,
      ] = await Promise.all([
        this.getHoldings(userId),
        this.getTransactions(userId),
        this.getAccounts(userId),
        this.getCategories(userId),
        this.getRecurring(userId),
        this.getGoals(userId),
        this.getNotes(userId),
        this.getCustomAssets(userId),
        this.getPreferences(userId),
      ]);

      return {
        holdings,
        transactions,
        accounts,
        categories,
        recurring,
        goals,
        notes,
        customAssets,
        preferences,
      };
    } catch (e) {
      console.warn('Supabase fetchAllUserData warning:', e);
      return null;
    }
  }
}
