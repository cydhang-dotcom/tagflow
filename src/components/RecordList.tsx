import React, { useMemo, useState } from 'react';
import { useAppStore } from '../store/useStore';
import { Ledger, RecordItem } from '../types';
import { format, isToday, isYesterday, isSameMonth, subMonths, addMonths } from 'date-fns';
import { Trash2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { ConfirmModal } from './ui/ConfirmModal';
import { AddRecordModal } from './AddRecordModal';
import { cn } from '../lib/utils';

export function RecordList({ ledger }: { ledger: Ledger }) {
  const { records, deleteRecord } = useAppStore();
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<RecordItem | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  const ledgerRecords = useMemo(() => 
    records
      .filter(r => r.ledgerId === ledger.id && isSameMonth(new Date(r.date), selectedMonth))
      .sort((a, b) => b.date - a.date),
  [records, ledger.id, selectedMonth]);

  const groupedRecords = useMemo(() => {
    const groups: Record<string, RecordItem[]> = {};
    ledgerRecords.forEach(r => {
      const dateStr = format(r.date, 'yyyy-MM-dd');
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(r);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [ledgerRecords]);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return '今天';
    if (isYesterday(date)) return '昨天';
    return format(date, 'MM月dd日');
  };

  const monthTotal = useMemo(() => {
    return ledgerRecords.reduce((sum, r) => sum + r.amount, 0);
  }, [ledgerRecords]);

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="flex items-center justify-between bg-white p-4 rounded-[24px] shadow-sm">
        <button 
          onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[17px] font-semibold text-gray-900 tracking-tight">
            {format(selectedMonth, 'yyyy年MM月')}
          </span>
          <span className="text-[13px] text-gray-500 font-medium mt-0.5">
            总支出 ¥{monthTotal.toFixed(2)}
          </span>
        </div>
        <button 
          onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {ledgerRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-24 h-24 bg-white rounded-[32px] shadow-sm flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 tracking-tight">本月暂无记录</h3>
          <p className="text-[15px] text-gray-500">点击下方的“+”开始记录吧</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedRecords.map(([dateStr, dayRecords]) => {
            const dayTotal = dayRecords.reduce((sum, r) => sum + r.amount, 0);
            return (
                <div key={dateStr} className="bg-white rounded-[32px] shadow-sm overflow-hidden">
                  <div className="flex justify-between items-baseline px-6 pt-6 pb-2">
                    <h3 className="text-[18px] font-extrabold text-gray-900 tracking-tight">
                      {getDateLabel(dateStr)}
                    </h3>
                    <span className="text-[14px] font-semibold text-gray-500">
                      合计 ¥{dayTotal.toFixed(2)}
                    </span>
                  </div>
                  {dayRecords.map((record, index) => (
                    <div 
                      key={record.id} 
                      onClick={() => setEditingRecord(record)}
                      className={`px-6 py-4 flex flex-col gap-2 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                        index !== dayRecords.length - 1 ? 'border-b border-gray-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex flex-wrap items-center flex-1">
                          {record.tagIds.map((tagId, tagIndex) => {
                            const tag = ledger.tags.find(t => t.id === tagId);
                            if (!tag) return null;
                            const rotation = tagIndex % 3 === 0 ? '-rotate-2' : tagIndex % 3 === 1 ? 'rotate-3' : '-rotate-1';
                            return (
                              <span
                                key={tagId}
                                className={cn(
                                  "px-3 py-1 rounded-full text-[13px] font-bold transition-all duration-300 hover:scale-110 hover:z-10 relative shadow-sm ring-2 ring-white backdrop-blur-md",
                                  tagIndex > 0 ? "-ml-3" : "",
                                  rotation
                                )}
                                style={{ 
                                  backgroundColor: `${tag.color || '#6366f1'}33`,
                                  color: tag.color || '#6366f1',
                                }}
                              >
                                {tag.name}
                              </span>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-semibold text-indigo-900 text-[20px] tracking-tighter">
                            {record.amount.toFixed(2)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRecordToDelete(record.id);
                            }}
                            className="p-2 -mr-2 text-gray-300 hover:text-red-500 active:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {record.note && (
                        <div className="relative mt-3 ml-2">
                          <div className="absolute -top-1 left-4 w-3 h-3 bg-indigo-50 rotate-45"></div>
                          <div className="text-[14px] text-indigo-900 font-medium italic bg-indigo-50 px-4 py-2 rounded-2xl shadow-sm">
                            {record.note}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
      )}

      <ConfirmModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={() => {
          if (recordToDelete) {
            deleteRecord(recordToDelete);
          }
        }}
        title="删除记录"
        message="确定删除这条记录吗？此操作不可恢复。"
        confirmText="删除"
      />

      <AddRecordModal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        ledger={ledger}
        editingRecord={editingRecord}
      />
    </div>
  );
}
