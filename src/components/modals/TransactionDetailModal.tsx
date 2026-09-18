import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowRightLeft, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Landmark, 
  CheckCircle2, 
  Clock3, 
  Pencil, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type { Transaction } from '../../services/portfolio/types';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/formatters';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const { 
    updateTransaction, 
    deleteTransaction, 
    markTransactionStatus, 
    accounts, 
    formatMoney, 
    currencyCode 
  } = usePortfolio();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editAccountId, setEditAccountId] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editNote, setEditNote] = useState('');

  React.useEffect(() => {
    if (transaction) {
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setEditTitle(transaction.title || transaction.name || '');
      setEditAmount(transaction.totalValue.toString());
      setEditAccountId(transaction.accountId || '');
      setEditDate(transaction.transactionDate || transaction.date || '');
      setEditTime(transaction.transactionTime || '12:00');
      setEditNote(transaction.note || '');
    }
  }, [transaction, isOpen]);

  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === 'income';
  const isExpense = transaction.type === 'expense';
  const isTransfer = transaction.type === 'transfer';
  const isBuy = transaction.type === 'buy';
  const isSell = transaction.type === 'sell';

  const sourceAccount = accounts.find((a) => a.id === transaction.accountId);
  const targetAccount = accounts.find((a) => a.id === transaction.targetAccountId);

  const isCompleted = transaction.status === 'completed' || transaction.status === undefined;
  const isExpected = transaction.status === 'expected';

  const handleMarkCompleted = () => {
    markTransactionStatus(transaction.id, 'completed');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseCurrencyInput(editAmount, currencyCode);
    if (isNaN(num) || num <= 0) return;

    updateTransaction(transaction.id, {
      title: editTitle.trim(),
      totalValue: num,
      accountId: editAccountId || undefined,
      transactionDate: editDate,
      transactionTime: editTime,
      date: editDate,
      note: editNote.trim() || undefined,
    });

    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-[2.25rem] bg-[#121218] border border-white/10 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(229,184,92,0.12)] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 ${
          isIncome ? 'bg-emerald-500/10' : isExpense ? 'bg-rose-500/10' : isTransfer ? 'bg-sky-500/10' : 'bg-amber-500/10'
        }`} />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${
              isIncome 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                : isExpense 
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
                : isTransfer 
                ? 'bg-sky-500/10 border border-sky-500/20 text-sky-400' 
                : 'bg-amber-500/10 border border-amber-500/20 text-[#F5C042]'
            }`}>
              {isIncome && <ArrowDownLeft className="w-5 h-5" />}
              {isExpense && <ArrowUpRight className="w-5 h-5" />}
              {isTransfer && <ArrowRightLeft className="w-5 h-5" />}
              {(isBuy || isSell) && <TrendingUp className="w-5 h-5" />}
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-white tracking-tight">
                {isEditing ? 'İşlemi Düzenle' : 'İşlem Ayrıntısı'}
              </h2>
              <span className="text-xs text-zinc-400 capitalize">
                {isIncome ? 'Gelir Girişi' : isExpense ? 'Gider Harcaması' : isTransfer ? 'Para Transferi' : isBuy ? 'Varlık Alımı' : 'Varlık Satışı'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DELETE CONFIRMATION DIALOG (No browser confirm!) */}
        {showDeleteConfirm ? (
          <div className="my-6 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-4 animate-scale-up">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Bu işlemi silmek istediğinize emin misiniz?</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Silinen işlem ilgili hesap bakiyesine ve toplam net varlık hesabına anında geri yansıtılacaktır. Bu işlem geri alınamaz.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg transition-all cursor-pointer"
              >
                İşlemi Kesin Sil
              </button>
            </div>
          </div>
        ) : isEditing ? (
          /* EDITING FORM */
          <form onSubmit={handleSaveEdit} className="space-y-4 mt-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                İşlem Başlığı
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Tutar
                </label>
                <input
                  type="text"
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(formatCurrencyInput(e.target.value, currencyCode))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Hesap
                </label>
                <select
                  value={editAccountId}
                  onChange={(e) => setEditAccountId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#181822] border border-white/[0.08] text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="">Seçilmedi</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Tarih
                </label>
                <input
                  type="text"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Saat
                </label>
                <input
                  type="text"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Not
              </label>
              <input
                type="text"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-bold text-zinc-400"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-[#E5B85C] text-[#0A0A0C] text-xs font-extrabold"
              >
                Kaydet
              </button>
            </div>
          </form>
        ) : (
          /* READ-ONLY DETAIL VIEW */
          <div className="space-y-6 mt-6">
            {/* Amount Hero Badge */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                İşlem Tutarı
              </span>
              <div className={`font-display text-3xl font-black tabular-nums ${
                isIncome ? 'text-emerald-400' : isExpense ? 'text-rose-400' : isTransfer ? 'text-sky-400' : 'text-white'
              }`}>
                {isIncome ? '+' : isExpense ? '-' : ''}{formatMoney(transaction.totalValue, true)}
              </div>
              <p className="text-sm font-bold text-zinc-200">
                {transaction.title || transaction.name || 'Finansal Hareket'}
              </p>
            </div>

            {/* Details Table List */}
            <div className="space-y-3 divide-y divide-white/[0.05]">
              {/* Status */}
              <div className="flex items-center justify-between pt-3 first:pt-0">
                <span className="text-xs text-zinc-400 font-medium">İşlem Durumu</span>
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Gerçekleşti
                    </span>
                  ) : isExpected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Clock3 className="w-3.5 h-3.5" />
                      Bekleniyor
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-500">İptal Edildi</span>
                  )}
                </div>
              </div>

              {/* Category */}
              {transaction.category && (
                <div className="flex items-center justify-between pt-3">
                  <span className="text-xs text-zinc-400 font-medium">Kategori</span>
                  <span className="text-xs font-bold text-white capitalize">
                    {transaction.category}
                  </span>
                </div>
              )}

              {/* Source Account */}
              {sourceAccount && (
                <div className="flex items-center justify-between pt-3">
                  <span className="text-xs text-zinc-400 font-medium">
                    {isTransfer ? 'Kaynak Hesap' : 'Ödeme / Kaynak Hesap'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Landmark className="w-3.5 h-3.5 text-[#E5B85C]" />
                    <span>{sourceAccount.name}</span>
                  </div>
                </div>
              )}

              {/* Target Account (if transfer) */}
              {isTransfer && targetAccount && (
                <div className="flex items-center justify-between pt-3">
                  <span className="text-xs text-zinc-400 font-medium">Hedef Hesap</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                    <Landmark className="w-3.5 h-3.5" />
                    <span>{targetAccount.name}</span>
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-zinc-400 font-medium">Tarih & Saat</span>
                <div className="text-right text-xs font-semibold text-zinc-200 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    {transaction.transactionDate || transaction.date}
                  </span>
                  {transaction.transactionTime && (
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Clock className="w-3 h-3" />
                      {transaction.transactionTime}
                    </span>
                  )}
                </div>
              </div>

              {/* Note */}
              {transaction.note && (
                <div className="flex items-start justify-between pt-3">
                  <span className="text-xs text-zinc-400 font-medium">Not</span>
                  <span className="text-xs text-zinc-300 max-w-xs text-right">
                    {transaction.note}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Action: If expected, allow marking as completed */}
            {isExpected && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-400">Ödeme Gerçekleşti mi?</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Bakiyeyi hesaba hemen yansıtın</div>
                </div>
                <button
                  onClick={handleMarkCompleted}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#0A0A0C] text-xs font-black transition-all cursor-pointer"
                >
                  Gerçekleşti İşaretle
                </button>
              </div>
            )}

            {/* Footer Action Buttons: Edit & Delete */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-rose-500/25 hover:bg-rose-500/10 text-xs font-bold text-rose-400 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sil</span>
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:bg-white/[0.05] text-xs font-bold text-white transition-all cursor-pointer"
              >
                <Pencil className="w-4 h-4 text-[#E5B85C]" />
                <span>Düzenle</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
