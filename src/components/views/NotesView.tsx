import React, { useState } from 'react';
import {
  Plus,
  Search,
  CheckSquare,
  FileText,
  Trash2,
  Pencil,
  Calendar,
  Tag,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type { NoteItem } from '../../services/portfolio/types';
import { NoteEditorModal } from '../notes/NoteEditorModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

const formatNoteDate = (timestamp?: number | string) => {
  if (!timestamp) return '';
  const d = new Date(typeof timestamp === 'string' && !isNaN(Number(timestamp)) ? Number(timestamp) : timestamp);
  if (isNaN(d.getTime())) return String(timestamp);
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${day} ${month} ${year} • ${time}`;
};

const isDatePast = (dateStr?: string) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  d.setHours(23, 59, 59, 999);
  return d.getTime() < Date.now();
};

export const NotesView: React.FC = () => {
  const { notes, toggleTodo, deleteNote } = usePortfolio();

  const [activeTab, setActiveTab] = useState<'all' | 'notes' | 'todos' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NoteItem | null>(null);

  // Filter notes based on active tab and search term
  const filteredNotes = notes.filter((n) => {
    if (activeTab === 'notes' && n.type !== 'note') return false;
    if (activeTab === 'todos' && (n.type !== 'todo' || n.completed)) return false;
    if (activeTab === 'completed' && (!n.completed || n.type !== 'todo')) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const inTitle = n.title.toLowerCase().includes(q);
      const inContent = n.content?.toLowerCase().includes(q);
      const inTags = n.tags?.some((t) => t.toLowerCase().includes(q));
      return inTitle || inContent || inTags;
    }

    return true;
  });

  const todoItems = filteredNotes.filter((n) => n.type === 'todo');
  const textNotes = filteredNotes.filter((n) => n.type === 'note');

  // Counts for quick stats
  const totalNotesCount = notes.filter((n) => n.type === 'note').length;
  const pendingTodosCount = notes.filter((n) => n.type === 'todo' && !n.completed).length;
  const completedTodosCount = notes.filter((n) => n.type === 'todo' && n.completed).length;

  const handleEdit = (note: NoteItem) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedNote(null);
    setIsEditorOpen(true);
  };

  return (
    <div className="space-y-8 pb-20 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Notlar ve Yapılacaklar
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Finansal hedeflerinize yönelik hatırlatıcılar, strateji notları ve yapılacaklar listesi
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F3C969] via-[#E5B85C] to-[#D6A84F] text-[#0A0A0C] text-xs font-bold shadow-[0_4px_16px_rgba(229,184,92,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Yeni Not / Görev</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-[1.75rem] bg-white/[0.025] border border-white/[0.05] backdrop-blur-xl">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#E5B85C]" />
            Kayıtlı Notlar
          </span>
          <div className="text-3xl font-extrabold text-white tracking-tight mt-2 tabular-nums">
            {totalNotesCount} <span className="text-sm font-semibold text-zinc-500">Not</span>
          </div>
          <span className="text-xs text-zinc-500 mt-1 block">Yatırım ve birikim notları</span>
        </div>

        <div className="p-6 rounded-[1.75rem] bg-white/[0.025] border border-white/[0.05] backdrop-blur-xl">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Bekleyen Görevler
          </span>
          <div className="text-3xl font-extrabold text-amber-400 tracking-tight mt-2 tabular-nums">
            {pendingTodosCount} <span className="text-sm font-semibold text-zinc-500">Görev</span>
          </div>
          <span className="text-xs text-zinc-500 mt-1 block">Tamamlanması gereken hedefler</span>
        </div>

        <div className="p-6 rounded-[1.75rem] bg-white/[0.025] border border-white/[0.05] backdrop-blur-xl">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Tamamlanan Görevler
          </span>
          <div className="text-3xl font-extrabold text-emerald-400 tracking-tight mt-2 tabular-nums">
            {completedTodosCount} <span className="text-sm font-semibold text-zinc-500">Tamamlandı</span>
          </div>
          <span className="text-xs text-emerald-500/80 mt-1 block">Başarıyla gerçekleştirildi</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Not, görev veya etiket ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] focus:border-[#E5B85C]/50 text-sm text-white focus:outline-none transition-colors placeholder:text-zinc-500"
          />
        </div>

        {/* Filter Pills Container - Spaciously & Symmetrically Padded */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto aurum-scrollbar bg-white/[0.03] border border-white/[0.06] p-2 rounded-2xl">
          {(
            [
              { key: 'all', label: 'Tümü' },
              { key: 'notes', label: 'Notlar' },
              { key: 'todos', label: 'Yapılacaklar' },
              { key: 'completed', label: 'Tamamlananlar' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#E5B85C]/20 text-[#F5C042] border border-[#E5B85C]/35 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E5B85C]/10 border border-[#E5B85C]/20 flex items-center justify-center text-[#F3C969]">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Henüz kayıtlı not veya görev bulunamadı</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Yatırım hedeflerinizi, ödeme planlarınızı veya finansal hatırlatıcılarınızı hemen kaydedin.
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 rounded-xl bg-[#E5B85C]/15 hover:bg-[#E5B85C]/25 text-[#F3C969] text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>İlk Notunu Oluştur</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Todo Items Section */}
          {todoItems.length > 0 && activeTab !== 'notes' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#E5B85C]" />
                <span>Yapılacak Görevler ({todoItems.length})</span>
              </h3>

              <div className="rounded-[1.75rem] bg-white/[0.025] border border-white/[0.05] p-5 divide-y divide-white/[0.04]">
                {todoItems.map((todo) => {
                  const priorityColor =
                    todo.priority === 'high'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : todo.priority === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20';

                  const priorityLabel =
                    todo.priority === 'high' ? 'Yüksek' : todo.priority === 'medium' ? 'Orta' : 'Düşük';
                  const isOverdue = todo.dueDate && !todo.completed && isDatePast(todo.dueDate);
                  const isDoneOrExpired = todo.completed || isOverdue;

                  return (
                    <div
                      key={todo.id}
                      className={`py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 transition-opacity group ${todo.completed ? 'opacity-60' : 'opacity-100'
                        }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          className="mt-0.5 text-zinc-500 hover:text-[#F3C969] transition-colors cursor-pointer shrink-0"
                          title={todo.completed ? 'Görevi geri al' : 'Tamamlandı olarak işaretle'}
                        >
                          {todo.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4
                              className={`text-sm font-bold transition-all ${isDoneOrExpired ? 'line-through text-zinc-500' : 'text-white'
                                }`}
                            >
                              {todo.title}
                            </h4>

                            {todo.priority && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${priorityColor}`}>
                                {priorityLabel}
                              </span>
                            )}

                            {isOverdue && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold">
                                Süresi Doldu
                              </span>
                            )}
                          </div>

                          {todo.content && (
                            <p
                              className={`text-xs mt-1 leading-relaxed ${isDoneOrExpired ? 'line-through text-zinc-600' : 'text-zinc-400'
                                }`}
                            >
                              {todo.content}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-zinc-500">
                            {/* Eklenme Tarih & Saati */}
                            {todo.createdAt && (
                              <span className="text-zinc-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-zinc-600" />
                                <span>{formatNoteDate(todo.createdAt)}</span>
                              </span>
                            )}

                            {/* Bitiş Tarihi */}
                            {todo.dueDate && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                                isOverdue 
                                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
                                  : 'bg-white/[0.04] border border-white/[0.08] text-zinc-300'
                              }`}>
                                <Calendar className="w-3 h-3 text-[#E5B85C]" />
                                <span>Bitiş: {todo.dueDate}</span>
                              </span>
                            )}

                            {todo.tags?.map((t) => (
                              <span key={t} className="flex items-center gap-0.5 text-zinc-400 bg-white/[0.03] px-2 py-0.5 rounded">
                                <Tag className="w-2.5 h-2.5 text-[#E5B85C]" />
                                <span>#{t}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons on hover */}
                      <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(todo)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                          title="Düzenle"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(todo)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Text Notes Section */}
          {textNotes.length > 0 && activeTab !== 'todos' && activeTab !== 'completed' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E5B85C]" />
                <span>Notlar ({textNotes.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {textNotes.map((note) => {
                  const isNoteOverdue = note.dueDate && isDatePast(note.dueDate);
                  return (
                    <div
                      key={note.id}
                      className="p-6 rounded-[1.75rem] bg-white/[0.025] border border-white/[0.05] hover:border-white/[0.1] backdrop-blur-xl transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className={`text-base font-bold transition-colors ${
                              isNoteOverdue ? 'line-through text-zinc-500' : 'text-white group-hover:text-[#F3C969]'
                            }`}>
                              {note.title}
                            </h4>
                            {isNoteOverdue && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold">
                                Süresi Doldu
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleEdit(note)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                              title="Düzenle"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(note)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className={`text-xs leading-relaxed whitespace-pre-line mb-4 line-clamp-4 ${
                          isNoteOverdue ? 'line-through text-zinc-600' : 'text-zinc-400'
                        }`}>
                          {note.content}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {note.dueDate && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                              isNoteOverdue
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-[#E5B85C]/10 text-[#F3C969] border border-[#E5B85C]/20'
                            }`}>
                              <Calendar className="w-2.5 h-2.5" />
                              <span>Bitiş: {note.dueDate}</span>
                            </span>
                          )}

                          {note.tags?.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-300 text-[10px] font-medium"
                            >
                              <Tag className="w-2.5 h-2.5 text-[#E5B85C]" />
                              <span>#{t}</span>
                            </span>
                          ))}
                        </div>
                        <span className="font-mono text-[11px] text-zinc-400">{formatNoteDate(note.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Editor Modal */}
      <NoteEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialNote={selectedNote}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteNote(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Silme Onayı"
        message={`"${deleteTarget?.title}" başlıklı ${deleteTarget?.type === 'todo' ? 'görevi' : 'notu'} silmek istediğinize emin misiniz?`}
        confirmText="Evet, Sil"
        confirmVariant="danger"
      />
    </div>
  );
};
