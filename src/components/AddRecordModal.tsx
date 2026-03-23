import React, { useState, useEffect } from 'react';
import { BottomSheet } from './ui/BottomSheet';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAppStore } from '../store/useStore';
import { Ledger } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ledger: Ledger;
}

export function AddRecordModal({ isOpen, onClose, ledger }: Props) {
  const { addRecord, addTag, deleteTag } = useAppStore();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEditingTags, setIsEditingTags] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setNote('');
      setSelectedTags([]);
      setNewTag('');
      setError(null);
      setIsEditingTags(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    if (selectedTags.length === 0) {
      setError('请至少选择一个标签');
      return;
    }

    addRecord({
      ledgerId: ledger.id,
      amount: Number(amount),
      date: new Date(date).getTime(),
      note,
      tagIds: selectedTags
    });
    onClose();
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      const tagsToCreate = newTag.split('#').map(t => t.trim()).filter(t => t.length > 0);
      tagsToCreate.forEach(tag => {
        // Prevent duplicate names if needed, but for now just add
        if (!ledger.tags.find(t => t.name === tag)) {
          addTag(ledger.id, tag);
        }
      });
      setNewTag('');
    }
  };

  const toggleTag = (tagId: string) => {
    if (isEditingTags) {
      deleteTag(ledger.id, tagId);
      setSelectedTags(prev => prev.filter(id => id !== tagId));
      return;
    }
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
    setError(null);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="h-[92vh]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold tracking-tight">记一笔</h2>
        <button onClick={onClose} className="text-[15px] font-medium text-indigo-600 active:opacity-70">
          取消
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center text-gray-900">
            <span className="text-4xl font-medium mr-2 text-gray-400">¥</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-6xl font-bold bg-transparent text-center outline-none w-full max-w-[240px] placeholder:text-gray-300"
              placeholder="0.00"
              required
              autoFocus
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-[15px] font-semibold text-gray-900">
                标签 <span className="text-gray-400 font-normal text-sm">(可多选)</span>
              </label>
              {ledger.tags.length > 0 && (
                <button 
                  type="button" 
                  onClick={() => setIsEditingTags(!isEditingTags)} 
                  className="text-[13px] font-medium text-indigo-600 active:opacity-70"
                >
                  {isEditingTags ? '完成' : '编辑'}
                </button>
              )}
            </div>
            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
            <div className="flex flex-wrap gap-2.5 mb-4">
              {ledger.tags.map(tag => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <div key={tag.id} className="relative">
                    <button
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        "px-4 py-2 rounded-2xl text-[15px] font-medium transition-all active:scale-95 flex items-center gap-1.5",
                        isSelected && !isEditingTags
                          ? "text-white shadow-md" 
                          : "bg-gray-100 text-gray-600",
                        isEditingTags && "pr-3 border border-red-200 bg-red-50 text-red-600"
                      )}
                      style={isSelected && !isEditingTags ? { backgroundColor: tag.color || '#6366f1' } : {}}
                    >
                      {tag.name}
                      {isEditingTags && <X className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="输入新标签(可用#分割多个)并按回车..."
              className="bg-gray-50 border-transparent focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[15px] font-semibold text-gray-900 mb-3">日期</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="bg-gray-50 border-transparent focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[15px] font-semibold text-gray-900 mb-3">备注</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="写点什么..."
              className="bg-gray-50 border-transparent focus:bg-white"
            />
          </div>
        </div>

        <div className="fixed bottom-0 inset-x-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 pb-safe">
          <Button 
            type="submit" 
            disabled={!amount || selectedTags.length === 0}
            className="w-full h-14 text-lg font-semibold rounded-2xl shadow-lg shadow-indigo-200"
          >
            保存记录
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
