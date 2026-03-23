import React, { useMemo, useState } from 'react';
import { useAppStore } from '../store/useStore';
import { Ledger, RecordItem } from '../types';
import { format, isToday, isYesterday } from 'date-fns';
import { Trash2, FileText } from 'lucide-react';
import { ConfirmModal } from './ui/ConfirmModal';

export function RecordList({ ledger }: { ledger: Ledger }) {
  const { records, deleteRecord } = useAppStore();
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  
  const ledgerRecords = useMemo(() => 
    records.filter(r => r.ledgerId === ledger.id).sort((a, b) => b.date - a.date),
  [records, ledger.id]);

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

  if (ledgerRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-24 h-24 bg-white rounded-[32px] shadow-sm flex items-center justify-center mb-6">
          <FileText className="w-12 h-12 text-gray-300" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">暂无记录</h3>
        <p className="text-[15px] text-gray-500">点击下方的“+”开始记录吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedRecords.map(([dateStr, dayRecords]) => {
        const dayTotal = dayRecords.reduce((sum, r) => sum + r.amount, 0);
        return (
          <div key={dateStr}>
            <div className="flex justify-between items-end mb-3 px-2">
              <h3 className="text-[15px] font-semibold text-gray-500">{getDateLabel(dateStr)}</h3>
              <span className="text-[13px] font-medium text-gray-400">支出 ¥{dayTotal.toFixed(2)}</span>
            </div>
            <div className="bg-white rounded-[32px] shadow-sm overflow-hidden">
              {dayRecords.map((record, index) => (
                <div 
                  key={record.id} 
                  className={`p-5 flex items-center justify-between active:bg-gray-50 transition-colors ${
                    index !== dayRecords.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                      {record.tagIds[0] ? (
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: ledger.tags.find(t => t.id === record.tagIds[0])?.color || '#6366f1' }}
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {record.tagIds.map(tagId => {
                          const tag = ledger.tags.find(t => t.id === tagId);
                          if (!tag) return null;
                          return (
                            <span key={tagId} className="text-[15px] font-semibold text-gray-900">
                              {tag.name}
                            </span>
                          );
                        })}
                      </div>
                      <div className="text-[13px] text-gray-500 truncate">
                        {record.note || '无备注'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-4">
                    <span className="font-semibold text-gray-900 text-[17px]">
                      {record.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => setRecordToDelete(record.id)}
                      className="p-2.5 text-gray-300 hover:text-red-500 active:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

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
    </div>
  );
}
