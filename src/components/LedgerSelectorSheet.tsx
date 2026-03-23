import React, { useState } from 'react';
import { BottomSheet } from './ui/BottomSheet';
import { useAppStore } from '../store/useStore';
import { Check, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { ConfirmModal } from './ui/ConfirmModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreateNew: () => void;
}

export function LedgerSelectorSheet({ isOpen, onClose, onCreateNew }: Props) {
  const { ledgers, activeLedgerId, setActiveLedger, deleteLedger } = useAppStore();
  const [ledgerToDelete, setLedgerToDelete] = useState<string | null>(null);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold tracking-tight">切换账本</h2>
        <button onClick={onClose} className="text-[15px] font-medium text-indigo-600 active:opacity-70">
          完成
        </button>
      </div>
      
      <div className="space-y-3 mb-6">
        {ledgers.map(ledger => (
          <div
            key={ledger.id}
            onClick={() => {
              setActiveLedger(ledger.id);
              onClose();
            }}
            className={cn(
              "flex items-center justify-between p-4 rounded-3xl transition-all active:scale-[0.98] cursor-pointer",
              activeLedgerId === ledger.id 
                ? "bg-indigo-50 border-2 border-indigo-100" 
                : "bg-gray-50 border-2 border-transparent"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-semibold",
                activeLedgerId === ledger.id ? "bg-indigo-100 text-indigo-600" : "bg-white text-gray-500 shadow-sm"
              )}>
                {ledger.name.charAt(0)}
              </div>
              <div>
                <div className={cn("font-semibold text-[17px] leading-tight", activeLedgerId === ledger.id ? "text-indigo-900" : "text-gray-900")}>
                  {ledger.name}
                </div>
                <div className="text-[13px] text-gray-500 mt-1">
                  {ledger.tags.length} 个标签
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {activeLedgerId === ledger.id && (
                <Check className="w-6 h-6 text-indigo-600" />
              )}
              {ledgers.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLedgerToDelete(ledger.id);
                  }}
                  className="p-2.5 text-gray-400 hover:text-red-500 active:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          onClose();
          onCreateNew();
        }}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-3xl bg-gray-50 text-indigo-600 font-semibold active:bg-gray-100 transition-colors"
      >
        <Plus className="w-6 h-6" />
        <span className="text-[17px]">新建账本</span>
      </button>

      <ConfirmModal
        isOpen={!!ledgerToDelete}
        onClose={() => setLedgerToDelete(null)}
        onConfirm={() => {
          if (ledgerToDelete) {
            deleteLedger(ledgerToDelete);
          }
        }}
        title="删除账本"
        message="确定要删除这个账本吗？相关记录将一并删除，此操作不可恢复。"
        confirmText="删除"
      />
    </BottomSheet>
  );
}
