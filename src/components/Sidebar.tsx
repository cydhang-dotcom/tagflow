import React, { useState } from 'react';
import { useAppStore } from '../store/useStore';
import { Book, Plus, Settings, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { CreateLedgerModal } from './CreateLedgerModal';
import { ConfirmModal } from './ui/ConfirmModal';

export function Sidebar() {
  const { ledgers, activeLedgerId, setActiveLedger, deleteLedger } = useAppStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [ledgerToDelete, setLedgerToDelete] = useState<string | null>(null);

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900 flex items-center gap-2">
          <Book className="w-5 h-5 text-indigo-600" />
          多账本记录
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-3">
          我的账本
        </div>
        {ledgers.map(ledger => (
          <div
            key={ledger.id}
            className={cn(
              "group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors",
              activeLedgerId === ledger.id 
                ? "bg-indigo-100 text-indigo-900" 
                : "text-gray-700 hover:bg-gray-200"
            )}
            onClick={() => setActiveLedger(ledger.id)}
          >
            <span className="font-medium truncate">{ledger.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLedgerToDelete(ledger.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建账本
        </button>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          <Settings className="w-4 h-4" />
          设置
        </button>
      </div>

      <CreateLedgerModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

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
    </div>
  );
}
