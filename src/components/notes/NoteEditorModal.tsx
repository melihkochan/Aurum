import React, { useState, useEffect } from 'react';
import { X, Tag, Calendar, AlertCircle, CheckSquare, FileText } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type { NoteItem, TodoPriority } from '../../services/portfolio/types';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialNote?: NoteItem | null;
}

const PRESET_TAGS = ['Yatırım', 'Hedef', 'Ödeme', 'Kişisel', 'Altın', 'Bütçe', 'Maaş', 'Kira'];

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  initialNote,
}) => {
  const { addNote, updateNote } = usePortfolio();

  const [type, setType] = useState<'note' | 'todo'>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialNote) {
      setType(initialNote.type);
      setTitle(initialNote.title);
      setContent(initialNote.content || '');
      setPriority(initialNote.priority || 'medium');
      setDueDate(initialNote.dueDate || '');
      setTags(initialNote.tags || []);
    } else {
      setType('note');
      setTitle('');
      setContent('');
      setPriority('medium');
      setDueDate('');
      setTags([]);
    }
    setTagInput('');
    setError(null);
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Lütfen bir başlık giriniz.');
      return;
    }

    if (initialNote) {
      updateNote(initialNote.id, {
        type,
        title: title.trim(),
        content: content.trim(),
        priority: type === 'todo' ? priority : undefined,
        dueDate: dueDate ? dueDate : undefined,
        tags,
      });
    } else {
      addNote({
        type,
        title: title.trim(),
        content: content.trim(),
        completed: false,
        priority: type === 'todo' ? priority : undefined,
        dueDate: dueDate ? dueDate : undefined,
        tags,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-[2rem] bg-[#0E0F12] border border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#E5B85C]/10 border border-[#E5B85C]/20 flex items-center justify-center text-[#F3C969]">
              {type === 'todo' ? <CheckSquare className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                {initialNote ? 'Notu / Görevi Düzenle' : 'Yeni Not veya Görev'}
              </h3>
              <p className="text-xs text-zinc-400">
                Finansal hedeflerinizi ve notlarınızı organize edin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Selector */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Tür
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setType('note')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  type === 'note'
                    ? 'bg-[#E5B85C] text-[#0A0A0C] shadow-[0_2px_10px_rgba(229,184,92,0.3)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Not</span>
              </button>
              <button
                type="button"
                onClick={() => setType('todo')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  type === 'todo'
                    ? 'bg-[#E5B85C] text-[#0A0A0C] shadow-[0_2px_10px_rgba(229,184,92,0.3)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Yapılacak Görev</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Başlık
            </label>
            <input
              type="text"
              placeholder={type === 'todo' ? 'Örn: Çeyrek altın birikim hedefini güncelle' : 'Örn: Kira ve aidat planı'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/50 text-sm text-white focus:outline-none transition-colors placeholder:text-zinc-600"
              autoFocus
            />
          </div>

          {/* Content / Description */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              İçerik / Açıklama
            </label>
            <textarea
              placeholder="Detaylar, hatırlatıcılar veya strateji notları..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/50 text-sm text-white focus:outline-none transition-colors resize-none placeholder:text-zinc-600 aurum-scrollbar"
            />
          </div>

          {/* Todo specific fields: Priority & Due Date */}
          {type === 'todo' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                  Öncelik
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  {(
                    [
                      { key: 'low', label: 'Düşük', color: 'text-blue-400' },
                      { key: 'medium', label: 'Orta', color: 'text-amber-400' },
                      { key: 'high', label: 'Yüksek', color: 'text-rose-400' },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPriority(p.key)}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        priority === p.key
                          ? 'bg-white/[0.12] text-white font-bold'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <span className={priority === p.key ? p.color : ''}>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#E5B85C]" />
                    Bitiş Tarihi (İsteğe Bağlı)
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDueDate(new Date().toISOString().split('T')[0])}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-[#E5B85C]/20 text-zinc-400 hover:text-[#F3C969] transition-colors cursor-pointer"
                    >
                      Bugün
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        setDueDate(d.toISOString().split('T')[0]);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-[#E5B85C]/20 text-zinc-400 hover:text-[#F3C969] transition-colors cursor-pointer"
                    >
                      Yarın
                    </button>
                    {dueDate && (
                      <button
                        type="button"
                        onClick={() => setDueDate('')}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                      >
                        Temizle
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E5B85C] pointer-events-none" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/50 text-xs text-white focus:outline-none transition-colors [color-scheme:dark] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#E5B85C]" />
                  Bitiş / Hedef Tarihi (İsteğe Bağlı)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDueDate(new Date().toISOString().split('T')[0])}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-[#E5B85C]/20 text-zinc-400 hover:text-[#F3C969] transition-colors cursor-pointer"
                  >
                    Bugün
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      setDueDate(d.toISOString().split('T')[0]);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-[#E5B85C]/20 text-zinc-400 hover:text-[#F3C969] transition-colors cursor-pointer"
                  >
                    +1 Hafta
                  </button>
                  {dueDate && (
                    <button
                      type="button"
                      onClick={() => setDueDate('')}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                    >
                      Temizle
                    </button>
                  )}
                </div>
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E5B85C] pointer-events-none" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/50 text-xs text-white focus:outline-none transition-colors [color-scheme:dark] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2 flex items-center justify-between">
              <span>Etiketler</span>
              <span className="text-[10px] text-zinc-500 lowercase">Enter veya virgül ile ekle</span>
            </label>
            
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E5B85C]/10 border border-[#E5B85C]/20 text-[#F3C969] text-xs font-medium"
                >
                  <Tag className="w-3 h-3" />
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-400 ml-0.5 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <input
              type="text"
              placeholder="Yeni etiket yazıp Enter'a basınız..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDownTag}
              className="w-full px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/50 text-xs text-white focus:outline-none transition-colors placeholder:text-zinc-600"
            />

            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-zinc-500">Hızlı ekle:</span>
              {PRESET_TAGS.filter((pt) => !tags.includes(pt)).slice(0, 5).map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => handleAddTag(pt)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] transition-colors cursor-pointer"
                >
                  +{pt}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F3C969] via-[#E5B85C] to-[#D6A84F] text-[#0A0A0C] text-xs font-bold shadow-[0_4px_16px_rgba(229,184,92,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              {initialNote ? 'Değişiklikleri Kaydet' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
