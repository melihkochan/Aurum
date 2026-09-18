import React, { useState, useEffect } from 'react';
import { Check, Upload, RotateCcw } from 'lucide-react';
import { GoldModal } from '../ui/GoldModal';
import { usePortfolio } from '../../context/PortfolioContext';
import { ASSET_DEFINITIONS } from '../../services/market/types';
import type { AssetKey } from '../../services/market/types';
import { ASSET_IMAGES } from '../ui/AssetIcon';

interface AssetEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetKey: AssetKey | null;
  assetName?: string;
}

export const AssetEditModal: React.FC<AssetEditModalProps> = ({
  isOpen,
  onClose,
  assetKey,
}) => {
  const { customAssets, updateCustomAssetMeta } = usePortfolio();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (assetKey) {
      const def = ASSET_DEFINITIONS[assetKey];
      const custom = customAssets[assetKey] || {};
      setName(custom.name || def.nameTr);
      setDescription(custom.description || def.descriptionTr);
      setImageUrl(custom.imageUrl || null);
      setNote(custom.note || '');
    }
  }, [assetKey, customAssets, isOpen]);

  if (!assetKey) return null;

  const def = ASSET_DEFINITIONS[assetKey];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Görsel boyutu 2MB üzerinde olamaz.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomAssetMeta(assetKey, {
      name: name.trim() || undefined,
      description: description.trim() || undefined,
      imageUrl: imageUrl || undefined,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const handleResetDefaults = () => {
    updateCustomAssetMeta(assetKey, {
      name: undefined,
      description: undefined,
      imageUrl: undefined,
      note: undefined,
    });
    setName(def.nameTr);
    setDescription(def.descriptionTr);
    setImageUrl(null);
    setNote('');
  };

  return (
    <GoldModal
      isOpen={isOpen}
      onClose={onClose}
      title="VARLIĞI DÜZENLE"
      subtitle={`${def.nameTr} için özel isim, açıklama ve görsel ayarla`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSave} className="space-y-4 pt-1">
        {/* Visual / Image Picker */}
        <div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
            Varlık Görseli / İkonu
          </label>
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.025] border border-white/[0.06]">
            <div className="w-14 h-14 rounded-2xl p-1 bg-white/10 border border-white/15 flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
              <img
                src={imageUrl || ASSET_IMAGES[assetKey] || '/gramaltin.png'}
                alt={name}
                className="w-full h-full object-contain rounded-xl drop-shadow"
              />
            </div>

            <div className="flex-1 space-y-1.5">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[#E5B85C]" />
                <span>Özel Görsel Yükle</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="block text-[11px] text-rose-400 hover:underline cursor-pointer"
                >
                  Varsayılan ikona dön
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Custom Name */}
        <div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
            Varlık Adı
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={def.nameTr}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#E5B85C]/60 text-sm font-bold text-white focus:outline-none transition-all"
          />
        </div>

        {/* Custom Description */}
        <div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
            Açıklama / Not
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={def.descriptionTr}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#E5B85C]/60 text-xs text-white focus:outline-none transition-all"
          />
        </div>

        {/* Additional Note */}
        <div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
            Özel Saklama Notu (Opsiyonel)
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Örn: Evdeki çelik kasada, 2. rafta."
            className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#E5B85C]/60 text-xs text-white focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Reset & Submit Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Varsayılana Dön</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#F3C969] via-[#E5B85C] to-[#D6A84F] text-[#0A0A0C] text-xs font-extrabold shadow-[0_4px_16px_rgba(229,184,92,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Kaydet</span>
            </button>
          </div>
        </div>
      </form>
    </GoldModal>
  );
};
