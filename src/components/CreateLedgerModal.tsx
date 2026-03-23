import React, { useState, useEffect } from 'react';
import { BottomSheet } from './ui/BottomSheet';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAppStore } from '../store/useStore';
import { TEMPLATES } from '../constants';
import { LedgerTemplateType } from '../types';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateLedgerModal({ isOpen, onClose }: Props) {
  const { createLedger } = useAppStore();
  const [name, setName] = useState('');
  const [template, setTemplate] = useState<LedgerTemplateType>('personal');

  useEffect(() => {
    if (isOpen) {
      setTemplate('personal');
      setName(TEMPLATES['personal'].name);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createLedger(name, template);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="h-[85vh]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold tracking-tight">新建账本</h2>
        <button onClick={onClose} className="text-[15px] font-medium text-indigo-600 active:opacity-70">
          取消
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        <div>
          <label className="block text-[15px] font-semibold text-gray-900 mb-3">
            账本名称
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：2024日常开销 / 新房装修"
            className="bg-gray-50 border-transparent focus:bg-white text-lg py-4"
            autoFocus
            required
          />
        </div>

        <div>
          <label className="block text-[15px] font-semibold text-gray-900 mb-4">
            选择模板
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(TEMPLATES) as [LedgerTemplateType, typeof TEMPLATES[LedgerTemplateType]][]).map(([key, tpl]) => (
              <div
                key={key}
                onClick={() => {
                  setTemplate(key);
                  setName(tpl.name);
                }}
                className={cn(
                  "cursor-pointer rounded-2xl border-2 p-4 transition-all active:scale-95",
                  template === key
                    ? "border-indigo-600 bg-indigo-50/50"
                    : "border-transparent bg-gray-50"
                )}
              >
                <div className={cn(
                  "font-semibold mb-1.5",
                  template === key ? "text-indigo-900" : "text-gray-900"
                )}>
                  {tpl.name}
                </div>
                <div className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">
                  {tpl.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 inset-x-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 pb-safe">
          <Button 
            type="submit" 
            disabled={!name.trim()}
            className="w-full h-14 text-lg font-semibold rounded-2xl shadow-lg shadow-indigo-200"
          >
            创建账本
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
