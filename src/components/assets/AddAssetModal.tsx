import React, { useState, useEffect } from 'react';
import { Plus, Minus, CheckCircle, Sparkles, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';
import { GoldModal } from '../ui/GoldModal';
import { GoldButton } from '../ui/GoldButton';
import { usePortfolio } from '../../context/PortfolioContext';
import { ASSET_DEFINITIONS } from '../../services/market/types';
import type { AssetKey } from '../../services/market/types';
import { ASSET_IMAGES } from '../ui/AssetIcon';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/formatters';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedAssetKey?: AssetKey | null;
}

type MainCategory = 'gold' | 'usd' | 'eur' | 'try';

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  preselectedAssetKey,
}) => {
  const { marketPrices, addAsset, formatMoney, currencySymbol, currencyCode } = usePortfolio();

  const [category, setCategory] = useState<MainCategory>('gold');
  const [selectedAsset, setSelectedAsset] = useState<AssetKey>('quarterGold');
  const [quantity, setQuantity] = useState<number>(1);
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Synchronize when preselected key changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (preselectedAssetKey) {
        if (preselectedAssetKey === 'usd') {
          setCategory('usd');
          setSelectedAsset('usd');
          setQuantity(50);
        } else if (preselectedAssetKey === 'eur') {
          setCategory('eur');
          setSelectedAsset('eur');
          setQuantity(50);
        } else if (preselectedAssetKey === 'try') {
          setCategory('try');
          setSelectedAsset('try');
          setQuantity(1000);
        } else {
          setCategory('gold');
          setSelectedAsset(preselectedAssetKey);
          setQuantity(1);
        }
      } else {
        setCategory('gold');
        setSelectedAsset('quarterGold');
        setQuantity(1);
      }
      setPurchasePrice('');
      setShowAdvanced(false);
    }
  }, [preselectedAssetKey, isOpen]);

  // Handle category change
  const handleCategoryChange = (cat: MainCategory) => {
    setCategory(cat);
    if (cat === 'gold') {
      setSelectedAsset('quarterGold');
      setQuantity(1);
    } else if (cat === 'usd') {
      setSelectedAsset('usd');
      setQuantity(50);
    } else if (cat === 'eur') {
      setSelectedAsset('eur');
      setQuantity(50);
    } else if (cat === 'try') {
      setSelectedAsset('try');
      setQuantity(1000);
    }
  };

  const currentDef = ASSET_DEFINITIONS[selectedAsset];
  const quote = marketPrices ? marketPrices[selectedAsset] : null;
  const currentPrice = quote ? quote.price : 0;
  const totalValue = Number((quantity * currentPrice).toFixed(2));

  // Profit/Loss calculation if purchase price is entered
  const parsedPurchasePrice = parseCurrencyInput(purchasePrice, currencyCode);
  const hasPurchasePrice = !isNaN(parsedPurchasePrice) && parsedPurchasePrice > 0;
  const unitDiff = hasPurchasePrice ? currentPrice - parsedPurchasePrice : 0;
  const totalDiff = hasPurchasePrice ? unitDiff * quantity : 0;
  const diffPercent = hasPurchasePrice && parsedPurchasePrice > 0 ? (unitDiff / parsedPurchasePrice) * 100 : 0;

  const handleQuickQuantity = (amount: number) => {
    const minVal = 1;
    setQuantity((prev) => Math.max(minVal, Math.round(prev + amount)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    const optPurchasePrice = hasPurchasePrice ? parsedPurchasePrice : undefined;
    addAsset(selectedAsset, quantity, undefined, optPurchasePrice);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      // Reset defaults
      setQuantity(category === 'gold' ? 1 : category === 'try' ? 1000 : 50);
      setPurchasePrice('');
      setShowAdvanced(false);
    }, 850);
  };

  const goldTypes: { key: AssetKey; label: string; desc: string }[] = [
    { key: 'gramGold', label: 'Gram Altın', desc: '1.00g (24K)' },
    { key: 'quarterGold', label: 'Çeyrek Altın', desc: '1.75g (22K)' },
    { key: 'halfGold', label: 'Yarım Altın', desc: '3.50g (22K)' },
    { key: 'fullGold', label: 'Tam Altın', desc: '7.00g (22K)' },
  ];

  // Unit display name
  const getUnitName = () => {
    if (selectedAsset === 'usd') return 'USD';
    if (selectedAsset === 'eur') return 'EUR';
    if (selectedAsset === 'try') return 'TL';
    return currentDef.unitNameTr;
  };

  // Preset buttons
  const getPresets = () => {
    if (category === 'gold') {
      return [1, 2, 5, 10, 20];
    }
    if (category === 'try') {
      return [500, 1000, 5000, 10000, 25000];
    }
    return [5, 10, 50, 100, 500];
  };

  return (
    <GoldModal
      isOpen={isOpen}
      onClose={onClose}
      title="YENİ BİRİKİM EKLE"
      subtitle="Portföyünüze altın, döviz veya nakit TL ekleyin."
      maxWidth="max-w-md"
    >
      {isSuccess ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#E5B85C]/15 border border-[#E5B85C] flex items-center justify-center text-[#F5C042] animate-bounce">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-white font-display">Birikim Başarıyla Eklendi!</h4>
          <p className="text-xs text-zinc-400">
            {quantity} {getUnitName()} {category === 'gold' ? currentDef.nameTr : ''} portföyünüze eklendi ve toplam değer güncellendi.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Main Category Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              1. Varlık Türü
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleCategoryChange('gold')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                  category === 'gold'
                    ? 'bg-[#E5B85C]/20 border-[#E5B85C] text-[#F5C042] shadow-[0_0_15px_rgba(229,184,92,0.25)]'
                    : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white'
                }`}
              >
                <img src={ASSET_IMAGES.gramGold} alt="Altın" className="w-4 h-4 object-contain select-none shrink-0" />
                <span className="whitespace-nowrap">Altın</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('usd')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                  category === 'usd'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                    : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white'
                }`}
              >
                <img src={ASSET_IMAGES.usd} alt="USD" className="w-4 h-4 object-contain select-none shrink-0" />
                <span className="whitespace-nowrap">USD</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('eur')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                  category === 'eur'
                    ? 'bg-purple-500/20 border-purple-400 text-purple-400 shadow-[0_0_15px_rgba(167,139,250,0.25)]'
                    : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white'
                }`}
              >
                <img src={ASSET_IMAGES.eur} alt="EUR" className="w-4 h-4 object-contain select-none shrink-0" />
                <span className="whitespace-nowrap">EUR</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('try')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                  category === 'try'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                    : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white'
                }`}
              >
                <img src={ASSET_IMAGES.try} alt="TRY" className="w-4 h-4 object-contain select-none shrink-0" />
                <span className="whitespace-nowrap text-[11px] sm:text-xs">Nakit TL</span>
              </button>
            </div>
          </div>


          {/* Step 2: Gold Subtype Selection (if gold is selected) */}
          {category === 'gold' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                2. Altın Çeşidi
              </label>
              <div className="grid grid-cols-2 gap-2">
                {goldTypes.map((gt) => {
                  const isSelected = selectedAsset === gt.key;
                  return (
                    <button
                      key={gt.key}
                      type="button"
                      onClick={() => setSelectedAsset(gt.key)}
                      className={`p-3 text-left rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-[#E5B85C]/15 border-[#E5B85C] text-[#F5C042]'
                          : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <img
                        src={ASSET_IMAGES[gt.key] || '/gramaltin.png'}
                        alt={gt.label}
                        className="w-7 h-7 object-contain shrink-0 select-none"
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-bold">{gt.label}</div>
                        <div className="text-[10px] opacity-75">{gt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Quantity Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                {category === 'gold' ? '3. Adet' : '2. Miktar'}
              </label>
              <span className="text-xs font-semibold text-[#F5C042]">
                {quantity} {getUnitName()}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex-1 relative flex items-center">
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={quantity || ''}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    setQuantity(isNaN(parsed) ? 0 : Math.max(0, parsed));
                  }}
                  placeholder="1"
                  className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-[#E5B85C] rounded-2xl pl-4 pr-16 py-3 text-white font-black text-xl focus:outline-none transition-colors tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                />
                <span className="absolute right-4 text-xs text-zinc-400 font-bold pointer-events-none select-none">
                  {getUnitName()}
                </span>
              </div>

              {/* Modern Steppers */}
              <div className="flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleQuickQuantity(category === 'gold' ? -1 : -10)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] active:scale-95 border border-white/[0.06] flex items-center justify-center text-zinc-300 hover:text-white transition-all disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                  title="Azalt"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickQuantity(category === 'gold' ? 1 : 10)}
                  className="w-10 h-10 rounded-xl bg-[#E5B85C]/15 hover:bg-[#E5B85C]/25 active:scale-95 border border-[#E5B85C]/30 flex items-center justify-center text-[#F5C042] transition-all cursor-pointer shadow-sm"
                  title="Arttır"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Quick preset increments */}
            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              {getPresets().map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => setQuantity(inc)}
                  className={`px-3 py-1 text-xs rounded-xl border transition-all cursor-pointer tabular-nums font-bold ${
                    quantity === inc
                      ? 'bg-[#E5B85C]/20 border-[#E5B85C] text-[#F5C042]'
                      : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white'
                  }`}
                >
                  {inc} {getUnitName()}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Optional Purchase Price (Alış Fiyatı) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <span>Alış Fiyatı Belirt (Opsiyonel)</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="mt-2 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <label className="text-[11px] text-zinc-400 block font-medium">
                  Birim Alış Maliyeti ({currencySymbol})
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(formatCurrencyInput(e.target.value, currencyCode))}
                  placeholder={currencyCode === 'USD' ? `Örn: ${currencySymbol}${Math.floor(currentPrice).toLocaleString('en-US')}` : `Örn: ${currencySymbol}${Math.floor(currentPrice).toLocaleString('tr-TR')}`}
                  className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-[#E5B85C] rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none transition-colors tabular-nums"
                />

                {hasPurchasePrice && (
                  <div className="pt-2 flex items-center justify-between text-xs font-bold tabular-nums">
                    <span className="text-zinc-400">Anlık Fark / Kâr-Zarar:</span>
                    <span className={`flex items-center gap-1 ${unitDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {unitDiff >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{unitDiff >= 0 ? '+' : ''}{currencySymbol}{Math.abs(totalDiff).toLocaleString(currencyCode === 'USD' ? 'en-US' : 'tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({unitDiff >= 0 ? '+' : ''}{diffPercent.toFixed(2)}%)</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Calculation Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#E5B85C]/10 via-white/[0.02] to-transparent border border-[#E5B85C]/25 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#F5C042] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              GÜNCEL DEĞER HESAPLAMASI
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Varlık:</span>
              <span className="text-white font-bold">
                {quantity} × {category === 'gold' ? currentDef.nameTr : getUnitName()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Güncel {category === 'gold' ? 'Birim Fiyat' : 'Kur'}:</span>
              <span className="text-white font-semibold tabular-nums">
                {currencySymbol}{currentPrice.toLocaleString(currencyCode === 'USD' ? 'en-US' : 'tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-sm font-bold text-white">Toplam Portföy Değeri:</span>
              <span className="font-display text-xl font-black text-[#F5C042] tabular-nums">
                {formatMoney(totalValue, true)}
              </span>
            </div>
          </div>

          {/* Submit Action (Primary Gold CTA) */}
          <GoldButton
            type="submit"
            variant="gold"
            size="lg"
            className="w-full py-4 text-base tracking-wide font-black cursor-pointer"
          >
            PORTFÖYE EKLE
          </GoldButton>
        </form>
      )}
    </GoldModal>
  );
};
