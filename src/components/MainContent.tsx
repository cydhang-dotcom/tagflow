import React, { useState } from 'react';
import { useAppStore } from '../store/useStore';
import { Plus, LayoutDashboard, List as ListIcon, ChevronDown, Settings, Book } from 'lucide-react';
import { AddRecordModal } from './AddRecordModal';
import { RecordList } from './RecordList';
import { Statistics } from './Statistics';
import { LedgerSelectorSheet } from './LedgerSelectorSheet';
import { CreateLedgerModal } from './CreateLedgerModal';
import { SettingsSheet } from './SettingsSheet';
import { cn } from '../lib/utils';

export function MainContent() {
  const { ledgers, activeLedgerId } = useAppStore();
  const [view, setView] = useState<'list' | 'stats'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLedgerSelectorOpen, setIsLedgerSelectorOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activeLedger = ledgers.find(l => l.id === activeLedgerId);

  if (!activeLedger) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F5F7]">
        <div className="text-center px-6 w-full max-w-sm">
          <div className="w-24 h-24 bg-white rounded-[32px] shadow-sm flex items-center justify-center mx-auto mb-8">
            <Book className="w-12 h-12 text-indigo-500" />
          </div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">欢迎使用多账本</h2>
          <p className="text-gray-500 mb-10 text-lg">请新建一个账本开始记录</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full bg-indigo-600 text-white rounded-3xl py-4 text-lg font-semibold active:scale-95 transition-transform shadow-sm"
          >
            新建账本
          </button>
          <CreateLedgerModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <header className="sticky top-0 z-20 bg-[#F5F5F7]/80 backdrop-blur-xl px-6 pt-12 pb-4 flex justify-between items-center">
        <button 
          onClick={() => setIsLedgerSelectorOpen(true)} 
          className="flex items-center gap-1.5 text-2xl font-semibold tracking-tight active:opacity-70 transition-opacity"
        >
          {activeLedger.name} <ChevronDown className="w-6 h-6 text-gray-400" />
        </button>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-900 active:scale-95 transition-transform"
        >
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-32 pt-2">
        {view === 'list' ? (
          <RecordList ledger={activeLedger} />
        ) : (
          <Statistics ledger={activeLedger} />
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/80 backdrop-blur-xl border-t border-gray-100 pb-safe">
        <div className="flex items-center justify-around h-24 px-6 relative">
          <button 
            onClick={() => setView('list')}
            className={cn(
              "flex flex-col items-center gap-1.5 w-20 active:scale-95 transition-all",
              view === 'list' ? "text-indigo-600" : "text-gray-400"
            )}
          >
            <ListIcon className="w-7 h-7" />
            <span className="text-[11px] font-semibold">明细</span>
          </button>

          {/* FAB */}
          <div className="relative -top-8">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-200 active:scale-90 transition-transform"
            >
              <Plus className="w-10 h-10" />
            </button>
          </div>

          <button 
            onClick={() => setView('stats')}
            className={cn(
              "flex flex-col items-center gap-1.5 w-20 active:scale-95 transition-all",
              view === 'stats' ? "text-indigo-600" : "text-gray-400"
            )}
          >
            <LayoutDashboard className="w-7 h-7" />
            <span className="text-[11px] font-semibold">统计</span>
          </button>
        </div>
      </div>

      <LedgerSelectorSheet 
        isOpen={isLedgerSelectorOpen} 
        onClose={() => setIsLedgerSelectorOpen(false)} 
        onCreateNew={() => setIsCreateModalOpen(true)}
      />
      <CreateLedgerModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
      <AddRecordModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        ledger={activeLedger} 
      />
      <SettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        ledger={activeLedger}
      />
    </div>
  );
}
