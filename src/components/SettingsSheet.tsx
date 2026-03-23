import React, { useState } from 'react';
import { BottomSheet } from './ui/BottomSheet';
import { useAppStore } from '../store/useStore';
import { Ledger, Tag } from '../types';
import { Trash2, GripVertical } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ConfirmModal } from './ui/ConfirmModal';
import { Reorder } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ledger: Ledger;
}

export function SettingsSheet({ isOpen, onClose, ledger }: Props) {
  const { addTag, deleteTag, reorderTags } = useAppStore();
  const [newTag, setNewTag] = useState('');
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      const tagsToCreate = newTag.split('#').map(t => t.trim()).filter(t => t.length > 0);
      tagsToCreate.forEach(tag => {
        if (!ledger.tags.find(t => t.name === tag)) {
          addTag(ledger.id, tag);
        }
      });
      setNewTag('');
    }
  };

  const handleReorder = (newTags: Tag[]) => {
    reorderTags(ledger.id, newTags);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="h-[85vh]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold tracking-tight">账本设置</h2>
        <button onClick={onClose} className="text-[15px] font-medium text-indigo-600 active:opacity-70">
          完成
        </button>
      </div>

      <div className="space-y-8">
        {/* Tag Management */}
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4">标签管理</h3>
          
          <form onSubmit={handleAddTag} className="flex gap-3 mb-6">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="输入新标签(可用#分割多个)..."
              className="bg-gray-50 border-transparent focus:bg-white flex-1"
            />
            <Button type="submit" disabled={!newTag.trim()} className="px-6 rounded-2xl">
              添加
            </Button>
          </form>

          <Reorder.Group axis="y" values={ledger.tags} onReorder={handleReorder} className="space-y-3">
            {ledger.tags.map(tag => (
              <Reorder.Item 
                key={tag.id} 
                value={tag}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl cursor-grab active:cursor-grabbing relative bg-white shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 -ml-2 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color || '#6366f1' }} />
                  <span className="font-medium text-gray-900">{tag.name}</span>
                </div>
                <button
                  onClick={() => setTagToDelete(tag.id)}
                  className="p-2.5 text-gray-400 hover:text-red-500 active:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(null)}
        onConfirm={() => {
          if (tagToDelete) {
            deleteTag(ledger.id, tagToDelete);
          }
        }}
        title="删除标签"
        message="确定要删除这个标签吗？已使用该标签的记录将保留，但不再显示此标签。"
        confirmText="删除"
      />
    </BottomSheet>
  );
}
