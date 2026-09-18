import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Edit3, 
  Check, 
  X, 
  Calendar, 
  TrendingUp, 
  History,
  Clock,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { GoldModal } from '../ui/GoldModal';
import { usePortfolio } from '../../context/PortfolioContext';
import { ASSET_DEFINITIONS } from '../../services/market/types';
import type { AssetAllocationItem } from '../../context/PortfolioContext';
import type { Transaction } from '../../services/portfolio/types';
import { ASSET_IMAGES } from '../ui/AssetIcon';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { formatCurrencyInput, parseCurrencyInput, getCurrencyLocale } from '../../utils/formatters';

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetAllocationItem | null;
  onAddMore?: (assetKey: string) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  isOpen,
  onClose,
  asset,
  onAddMore: _onAddMore,
}) => {
  const { 
    marketPrices, 
    transactions, 
    ownedAssets,
    updateTransaction, 
    deleteTransaction, 
    addAsset,
    formatMoney,
    currencySymbol,
    currencyCode
  } = usePortfolio();

  const locale = getCurrencyLocale(currencyCode);

  // State for Sales Toggle (Default closed)
  const [showSales, setShowSales] = useState(false);

  // State for adding a new buy record
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQty, setNewQty] = useState<string>('1');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newTxDate, setNewTxDate] = useState<string>('');
  const [newTxTime, setNewTxTime] = useState<string>('');
  const [newNote, setNewNote] = useState<string>('');

  // State for editing an existing transaction
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editQty, setEditQty] = useState<string>('');
  const [editTxDate, setEditTxDate] = useState<string>('');
  const [editTxTime, setEditTxTime] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');

  // Confirmation dialog state
  const [confirmTxToDelete, setConfirmTxToDelete] = useState<string | null>(null);

  if (!asset) return null;

  // Single source of truth: retrieve the reactive, centrally-computed asset metrics from PortfolioContext
  const currentAsset = ownedAssets.find((a) => a.key === asset.key) || asset;

  const def = ASSET_DEFINITIONS[currentAsset.key];
  const quote = marketPrices ? marketPrices[currentAsset.key] : null;
  const currentUnitPrice = quote ? quote.price : currentAsset.unitPrice;
  const is24hPositive = quote ? quote.change24hPercent >= 0 : true;

  // Filter transactions for this asset
  const allAssetTx = transactions.filter((t) => t.assetKey === currentAsset.key);
  const buyTransactions = allAssetTx.filter((t) => t.type === 'buy');
  const saleTransactions = allAssetTx.filter((t) => t.type === 'sell');

  const isProfit = currentAsset.totalProfitLoss >= 0;

  // Date & Time conversion helpers
  const toInputDate = (dateStr?: string): string => {
    if (!dateStr) {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    
    const now = new Date();
    if (dateStr.toLowerCase().includes('bugün')) {
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    if (dateStr.toLowerCase().includes('dün')) {
      const y = new Date(now.getTime() - 86400000);
      return `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
    }
    
    const monthsTr: Record<string, string> = {
      'ocak': '01', 'şubat': '02', 'mart': '03', 'nisan': '04', 'mayıs': '05', 'haziran': '06',
      'temmuz': '07', 'ağustos': '08', 'eylül': '09', 'ekim': '10', 'kasım': '11', 'aralık': '12'
    };
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length >= 3) {
      const day = parts[0].replace(/\D/g, '').padStart(2, '0');
      const mStr = parts[1].toLowerCase();
      const month = monthsTr[mStr] || '01';
      const year = parts[2].replace(/\D/g, '');
      if (year.length === 4) {
        return `${year}-${month}-${day}`;
      }
    }
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const formatDisplayDate = (isoDate: string): string => {
    if (!isoDate) return '';
    const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${day} ${months[monthIndex] || ''} ${year}`;
    }
    return isoDate;
  };

  const toInputTime = (timeStr?: string): string => {
    if (!timeStr) {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    const match = timeStr.match(/\b\d{1,2}:\d{2}\b/);
    if (match) {
      const [h, m] = match[0].split(':');
      return `${h.padStart(2, '0')}:${m}`;
    }
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  // Initialize new buy form with current date & time
  const handleOpenAddForm = () => {
    const now = new Date();
    setNewTxDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    setNewTxTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    setNewPrice(currentUnitPrice ? formatCurrencyInput(currentUnitPrice.toFixed(2), currencyCode) : '');
    setNewQty('1');
    setNewNote('');
    setShowAddForm(true);
  };

  const handleSaveNewBuy = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQty = parseFloat(newQty);
    const parsedPrice = parseCurrencyInput(newPrice, currencyCode);

    if (isNaN(parsedQty) || parsedQty <= 0 || isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Lütfen geçerli bir miktar ve alış fiyatı girin.');
      return;
    }

    const displayDate = formatDisplayDate(newTxDate) || newTxDate;

    addAsset(
      asset.key,
      parsedQty,
      newNote.trim() || undefined,
      parsedPrice,
      displayDate,
      newTxTime.trim() || undefined,
      currentUnitPrice
    );

    setShowAddForm(false);
  };

  const handleStartEdit = (tx: Transaction) => {
    setEditingTxId(tx.id);
    const rawPrice = tx.purchasePrice || tx.unitPrice || currentUnitPrice;
    setEditPrice(rawPrice ? formatCurrencyInput(rawPrice.toFixed(2), currencyCode) : '');
    setEditQty(String(tx.quantity || 1));
    setEditTxDate(toInputDate(tx.transactionDate || tx.date));
    setEditTxTime(toInputTime(tx.transactionTime));
    setEditNote(tx.note || '');
  };

  const handleSaveEdit = (txId: string) => {
    const parsedPrice = parseCurrencyInput(editPrice, currencyCode);
    const parsedQty = parseFloat(editQty);

    if (isNaN(parsedPrice) || parsedPrice <= 0 || isNaN(parsedQty) || parsedQty <= 0) {
      alert('Lütfen geçerli bir fiyat ve miktar girin.');
      return;
    }

    const displayDate = formatDisplayDate(editTxDate) || editTxDate;

    updateTransaction(txId, {
      purchasePrice: parsedPrice,
      unitPrice: parsedPrice,
      quantity: parsedQty,
      transactionDate: displayDate,
      transactionTime: editTxTime.trim() || undefined,
      date: displayDate,
      note: editNote.trim() || undefined,
    });
    setEditingTxId(null);
  };

  const handleConfirmDelete = () => {
    if (confirmTxToDelete) {
      deleteTransaction(confirmTxToDelete);
      setConfirmTxToDelete(null);
    }
  };

  return (
    <>
      <GoldModal
        isOpen={isOpen}
        onClose={onClose}
        title={(currentAsset.customName || def.nameTr).toUpperCase()}
        subtitle={currentAsset.customDesc || def.descriptionTr}
        icon={
          <div className="w-10 h-10 rounded-xl p-1 bg-white/10 border border-white/20 flex items-center justify-center shadow shrink-0 overflow-hidden">
            <img
              src={currentAsset.customImageUrl || ASSET_IMAGES[currentAsset.key] || '/gramaltin.png'}
              alt={currentAsset.customName || def.nameTr}
              className="w-full h-full object-contain rounded-lg drop-shadow"
            />
          </div>
        }
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6 pt-1 max-h-[82vh] overflow-y-auto pr-1.5 aurum-scrollbar">
          {/* Asset Summary Value Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] relative overflow-hidden">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
                Portföydeki Güncel Değer
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums">
                <AnimatedNumber
                  value={currentAsset.currentValue}
                  cacheKey={`asset_val_${currentAsset.key}`}
                  duration={750}
                  formatFn={(val) => formatMoney(val)}
                  highlightOnChange
                />
              </div>
              <div className="text-xs text-zinc-400 font-semibold mt-1 flex items-center gap-2">
                <span className="text-white font-bold">
                  <AnimatedNumber
                    value={currentAsset.quantity}
                    cacheKey={`asset_qty_${currentAsset.key}`}
                    decimals={0}
                    duration={600}
                    formatFn={(val) => `${Number(val.toFixed(2)).toLocaleString('tr-TR')} ${def.unitNameTr} mevcut`}
                  />
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-[#E5B85C]">%{currentAsset.percentage.toFixed(1)} Portföy Payı</span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
                Net Kâr / Zarar Durumu
              </span>
              <div className={`flex items-center gap-1.5 text-base sm:text-lg font-black tabular-nums ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isProfit ? <TrendingUp className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>
                  {isProfit ? '+' : ''}
                  <AnimatedNumber
                    value={currentAsset.totalProfitLoss}
                    cacheKey={`asset_pnl_${currentAsset.key}`}
                    duration={750}
                    formatFn={(val) => formatMoney(val)}
                  />
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-white/[0.05] font-bold">
                  {isProfit ? '+' : ''}
                  <AnimatedNumber
                    value={currentAsset.profitLossPercent}
                    cacheKey={`asset_pnl_pct_${currentAsset.key}`}
                    decimals={2}
                    duration={750}
                    formatFn={(val) => `${val >= 0 ? '+' : ''}%${val.toFixed(2)}`}
                  />
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 mt-1 tabular-nums">
                Toplam Alış: {currentAsset.totalBoughtQty} {def.unitNameTr} {currentAsset.totalSoldQty > 0 ? `• Satış: ${currentAsset.totalSoldQty} ${def.unitNameTr}` : ''}
              </span>
            </div>
          </div>

          {/* Top Summary Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white/[0.025] border border-white/[0.05]">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                Güncel Birim Fiyat
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white tabular-nums">
                {currencySymbol}{currentUnitPrice.toLocaleString(locale, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.025] border border-white/[0.05]">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                Ort. Alış Maliyeti
              </span>
              <span className="text-sm sm:text-base font-extrabold text-zinc-200 tabular-nums">
                <AnimatedNumber
                  value={currentAsset.avgPurchasePrice}
                  cacheKey={`asset_avg_${currentAsset.key}`}
                  duration={750}
                  formatFn={(val) => `${currencySymbol}${val.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.025] border border-white/[0.05]">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                24S Piyasa Değişimi
              </span>
              <div className={`flex items-center gap-1 text-sm sm:text-base font-extrabold tabular-nums ${is24hPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {is24hPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{is24hPositive ? '+' : ''}{quote ? quote.change24hPercent.toFixed(2) : '0.00'}%</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.025] border border-white/[0.05]">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                Toplam Kâr / Zarar
              </span>
              <div className={`flex items-center gap-1 text-sm sm:text-base font-extrabold tabular-nums ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{isProfit ? '+' : ''}{currentAsset.profitLossPercent.toFixed(1)}%</span>
              </div>
              <span className={`text-[10px] font-semibold block mt-0.5 tabular-nums ${isProfit ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                {isProfit ? '+' : ''}
                <AnimatedNumber
                  value={currentAsset.totalProfitLoss}
                  duration={750}
                  formatFn={(val) => formatMoney(val)}
                />
              </span>
            </div>
          </div>

          {/* Section Header: Alış & İşlem Geçmişi */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#E5B85C]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-200">
                  Alış & İşlem Geçmişi ({buyTransactions.length} Kayıt)
                </h4>
              </div>

              <div className="flex items-center gap-3">
                {/* Sales Toggle (Section 5) */}
                {saleTransactions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSales(!showSales)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      showSales 
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' 
                        : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-white'
                    }`}
                  >
                    {showSales ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showSales ? 'Satışları Gizle' : `Satışları Göster (${saleTransactions.length})`}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => (showAddForm ? setShowAddForm(false) : handleOpenAddForm())}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#F3C969] via-[#E5B85C] to-[#D6A84F] text-[#0A0A0C] text-xs font-extrabold shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{showAddForm ? 'Vazgeç' : 'Yeni Alış Ekle'}</span>
                </button>
              </div>
            </div>

            {/* Form to Add New / Retroactive Purchase (Section 3) */}
            {showAddForm && (
              <form
                onSubmit={handleSaveNewBuy}
                className="mb-5 p-5 rounded-2xl bg-gradient-to-b from-[#E5B85C]/10 to-transparent border border-[#E5B85C]/35 space-y-4 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#E5B85C]" />
                    <span>YENİ ALIŞ KAYDI EKLE</span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    O Anki Piyasa Kuru: <strong className="text-white">{currencySymbol}{currentUnitPrice.toLocaleString(locale, { minimumFractionDigits: 2 })}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Miktar ({def.unitNameTr})</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={newQty}
                      onChange={(e) => setNewQty(e.target.value)}
                      placeholder="Örn: 2"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:border-[#E5B85C] focus:outline-none tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Alış Birim Fiyatı ({currencySymbol})</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(formatCurrencyInput(e.target.value, currencyCode))}
                      placeholder={`${currencySymbol}${Math.round(currentUnitPrice).toLocaleString(locale)}`}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:border-[#E5B85C] focus:outline-none tabular-nums"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">İşlem Tarihi</label>
                      <div className="flex items-center gap-1 text-[9px]">
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            setNewTxDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
                          }}
                          className="text-[#E5B85C] hover:underline cursor-pointer"
                        >
                          Bugün
                        </button>
                        <span className="text-zinc-600">•</span>
                        <button
                          type="button"
                          onClick={() => {
                            const y = new Date(Date.now() - 86400000);
                            setNewTxDate(`${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`);
                          }}
                          className="text-zinc-400 hover:text-white cursor-pointer"
                        >
                          Dün
                        </button>
                      </div>
                    </div>
                    <input
                      type="date"
                      required
                      value={newTxDate}
                      onChange={(e) => setNewTxDate(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-[#E5B85C] focus:outline-none cursor-pointer [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">İşlem Saati</label>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          setNewTxTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
                        }}
                        className="text-[9px] text-[#E5B85C] hover:underline cursor-pointer"
                      >
                        Şimdi
                      </button>
                    </div>
                    <input
                      type="time"
                      value={newTxTime}
                      onChange={(e) => setNewTxTime(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-[#E5B85C] focus:outline-none cursor-pointer [color-scheme:dark] tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Not / Açıklama (Opsiyonel)</label>
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Örn: Kapalıçarşı kuyumcudan fiziki alım"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#E5B85C] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                  <div className="text-xs text-zinc-300 font-semibold">
                    Toplam Maliyet:{' '}
                    <span className="font-extrabold text-[#F3C969] text-sm tabular-nums">
                      {currencySymbol}{((parseFloat(newQty) || 0) * (parseCurrencyInput(newPrice, currencyCode) || 0)).toLocaleString(locale, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white cursor-pointer"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.5 rounded-xl bg-[#E5B85C] hover:bg-[#F5C042] text-black font-extrabold text-xs transition-colors cursor-pointer"
                    >
                      Kaydet & Portföye Ekle
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Buys List */}
            {buyTransactions.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center space-y-2 mb-4">
                <p className="text-xs text-zinc-400">
                  Bu varlık için henüz kayıtlı münferit alış işlemi bulunmuyor. Mevcut bakiyeniz: <strong className="text-white">{currentAsset.quantity.toLocaleString('tr-TR')} {def.unitNameTr}</strong>
                </p>
                <button
                  onClick={handleOpenAddForm}
                  className="text-xs text-[#E5B85C] font-bold hover:underline cursor-pointer"
                >
                  İlk alış fiyatını ve tarihini girmek için tıklayın
                </button>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {buyTransactions.map((tx) => {
                  const isEditing = editingTxId === tx.id;
                  const buyUnitPrice = tx.purchasePrice || tx.unitPrice || currentUnitPrice;
                  const buyQty = tx.quantity || 1;
                  const cost = buyUnitPrice * buyQty;
                  const currentVal = currentUnitPrice * buyQty;
                  const diff = currentVal - cost;
                  const diffPct = cost > 0 ? (diff / cost) * 100 : 0;
                  const isTxProfit = diff >= 0;

                  return (
                    <div
                      key={tx.id}
                      className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-3"
                    >
                      {isEditing ? (
                        /* Editing Form Mode */
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-[#F5C042]">
                            <span>Alış Kaydını Düzenle</span>
                            <span className="text-zinc-500 font-normal">ID: {tx.id.slice(0, 8)}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Miktar ({def.unitNameTr})</label>
                              <input
                                type="number"
                                step="any"
                                value={editQty}
                                onChange={(e) => setEditQty(e.target.value)}
                                className="w-full bg-black/50 border border-[#E5B85C]/40 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none tabular-nums"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Alış Fiyatı ({currencySymbol})</label>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={editPrice}
                                onChange={(e) => setEditPrice(formatCurrencyInput(e.target.value, currencyCode))}
                                className="w-full bg-black/50 border border-[#E5B85C]/40 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none tabular-nums"
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-400">İşlem Tarihi</label>
                                <div className="flex items-center gap-1 text-[9px]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const now = new Date();
                                      setEditTxDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
                                    }}
                                    className="text-[#E5B85C] hover:underline cursor-pointer"
                                  >
                                    Bugün
                                  </button>
                                  <span className="text-zinc-600">•</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const y = new Date(Date.now() - 86400000);
                                      setEditTxDate(`${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`);
                                    }}
                                    className="text-zinc-400 hover:text-white cursor-pointer"
                                  >
                                    Dün
                                  </button>
                                </div>
                              </div>
                              <input
                                type="date"
                                required
                                value={editTxDate}
                                onChange={(e) => setEditTxDate(e.target.value)}
                                className="w-full bg-black/60 border border-[#E5B85C]/40 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-[#E5B85C] focus:outline-none cursor-pointer [color-scheme:dark]"
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-400">İşlem Saati</label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const now = new Date();
                                    setEditTxTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
                                  }}
                                  className="text-[9px] text-[#E5B85C] hover:underline cursor-pointer"
                                >
                                  Şimdi
                                </button>
                              </div>
                              <input
                                type="time"
                                value={editTxTime}
                                onChange={(e) => setEditTxTime(e.target.value)}
                                className="w-full bg-black/60 border border-[#E5B85C]/40 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-[#E5B85C] focus:outline-none cursor-pointer [color-scheme:dark] tabular-nums"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingTxId(null)}
                              className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Vazgeç</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(tx.id)}
                              className="px-4 py-1.5 rounded-xl bg-[#E5B85C] hover:bg-[#F5C042] text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Kaydet</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Display Card Mode (Section 2) */
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400">
                                ALIŞ
                              </span>
                              <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                                <Calendar className="w-3.5 h-3.5 text-[#E5B85C]" />
                                <span className="font-bold">{tx.transactionDate || tx.date}</span>
                                {tx.transactionTime && (
                                  <span className="text-zinc-500 font-mono text-[11px]">• {tx.transactionTime}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(tx)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-[#E5B85C] hover:bg-white/[0.04] transition-colors cursor-pointer"
                                title="Alış Kaydını Düzenle"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmTxToDelete(tx.id);
                                }}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Kaydı Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            <div>
                              <span className="text-[10px] text-zinc-400 uppercase font-bold block">İşlem Miktarı</span>
                              <span className="text-xs sm:text-sm font-extrabold text-white tabular-nums">
                                {buyQty} {def.unitNameTr}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Alış Kuru / Fiyat</span>
                              <span className="text-xs sm:text-sm font-extrabold text-zinc-200 tabular-nums">
                                {currencySymbol}{buyUnitPrice.toLocaleString(locale, { minimumFractionDigits: 2 })}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Toplam Maliyet</span>
                              <span className="text-xs sm:text-sm font-extrabold text-zinc-300 tabular-nums">
                                {formatMoney(cost)}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Kâr / Zarar</span>
                              <div className={`text-xs sm:text-sm font-extrabold tabular-nums flex items-center gap-1 ${isTxProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                <span>{isTxProfit ? '+' : ''}%{diffPct.toFixed(1)}</span>
                                <span className="text-[11px] opacity-80">({isTxProfit ? '+' : ''}{formatMoney(diff)})</span>
                              </div>
                            </div>
                          </div>

                          {/* Distinct Transaction Date vs Creation Date (Section 2) */}
                          <div className="flex flex-wrap items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-white/[0.04]">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-zinc-600" />
                              <span>
                                İşlem Anı:{' '}
                                <strong className="text-zinc-400">
                                  {tx.transactionDate || tx.date} {tx.transactionTime ? `• ${tx.transactionTime}` : ''}
                                </strong>
                              </span>
                            </div>
                            {tx.createdDateStr && (
                              <span>
                                AURUM Kayıt Tarihi: <strong className="text-zinc-400">{tx.createdDateStr}</strong>
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sales History Section (Toggleable, Section 5) */}
            {showSales && saleTransactions.length > 0 && (
              <div className="pt-3 border-t border-white/[0.06] space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 uppercase">
                    Satış Geçmişi ({saleTransactions.length})
                  </span>
                  <span className="text-xs text-zinc-400">Toplam {currentAsset.totalSoldQty} {def.unitNameTr} satıldı</span>
                </div>

                <div className="space-y-2.5">
                  {saleTransactions.map((tx) => {
                    const sellUnitPrice = tx.unitPrice || tx.purchasePrice || currentUnitPrice;
                    const sellQty = tx.quantity || 1;
                    const totalProceeds = sellUnitPrice * sellQty;

                    return (
                      <div
                        key={tx.id}
                        className="p-3.5 rounded-2xl bg-rose-950/10 border border-rose-500/15 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold text-rose-400">SATIŞ</span>
                            <span className="text-zinc-300 font-semibold">{tx.transactionDate || tx.date}</span>
                            {tx.transactionTime && <span className="text-zinc-500 text-[11px]">• {tx.transactionTime}</span>}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmTxToDelete(tx.id);
                            }}
                            className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Kaydı Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-zinc-400 block">Satılan Miktar</span>
                            <span className="font-bold text-white">{sellQty} {def.unitNameTr}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 block">Satış Fiyatı</span>
                            <span className="font-bold text-zinc-200">{currencySymbol}{sellUnitPrice.toLocaleString(locale, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 block">Toplam Tutar</span>
                            <span className="font-extrabold text-[#F3C969]">{formatMoney(totalProceeds)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </GoldModal>


      {/* Delete Confirmation Dialog (Section 4) */}
      <ConfirmDialog
        isOpen={confirmTxToDelete !== null}
        title="İşlem Kaydını Sil"
        message="Bu işlem kaydını silmek istediğinize emin misiniz? İlgili miktar portföyünüzden otomatik olarak düşülecek ve kâr/zarar hesaplamaları yeniden yapılacaktır."
        confirmText="Kaydı Sil"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmTxToDelete(null)}
      />
    </>
  );
};
