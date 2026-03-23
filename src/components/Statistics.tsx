import React, { useMemo, useState, useEffect } from 'react';
import { useAppStore } from '../store/useStore';
import { Ledger } from '../types';
import { ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, eachMonthOfInterval, isSameMonth } from 'date-fns';
import { X, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Statistics({ ledger }: { ledger: Ledger }) {
  const { records } = useAppStore();
  
  const [timeRange, setTimeRange] = useState<'month' | 'half_year'>('month');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [expandedTags, setExpandedTags] = useState(false);

  // Reset expanded state when tags or time change
  useEffect(() => {
    setExpandedTags(false);
  }, [selectedTagIds, timeRange]);

  const now = new Date();
  
  const timeFilteredRecords = useMemo(() => {
    const start = timeRange === 'month' ? startOfMonth(now) : startOfMonth(subMonths(now, 5));
    const end = endOfMonth(now);
    return records.filter(r => 
      r.ledgerId === ledger.id && 
      r.date >= start.getTime() && 
      r.date <= end.getTime()
    );
  }, [records, ledger.id, timeRange]);

  const filteredRecords = useMemo(() => {
    return timeFilteredRecords.filter(r => 
      selectedTagIds.every(id => r.tagIds.includes(id))
    );
  }, [timeFilteredRecords, selectedTagIds]);

  const totalFilteredAmount = useMemo(() => 
    filteredRecords.reduce((sum, r) => sum + r.amount, 0),
  [filteredRecords]);

  const trendData = useMemo(() => {
    if (timeRange === 'month') {
      const days = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) });
      return days.map(day => {
        const amount = filteredRecords
          .filter(r => isSameDay(new Date(r.date), day))
          .reduce((sum, r) => sum + r.amount, 0);
        return { date: format(day, 'MM-dd'), amount };
      });
    } else {
      const months = eachMonthOfInterval({ start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) });
      return months.map(month => {
        const amount = filteredRecords
          .filter(r => isSameMonth(new Date(r.date), month))
          .reduce((sum, r) => sum + r.amount, 0);
        return { date: format(month, 'MM月'), amount };
      });
    }
  }, [filteredRecords, timeRange]);

  const distribution = useMemo(() => {
    let onlyCurrentAmount = 0;
    const tagAmounts: Record<string, number> = {};

    filteredRecords.forEach(record => {
      const otherTags = record.tagIds.filter(id => !selectedTagIds.includes(id));
      
      if (otherTags.length === 0) {
        if (selectedTagIds.length > 0) {
          onlyCurrentAmount += record.amount;
        }
      } else {
        otherTags.forEach(tagId => {
          tagAmounts[tagId] = (tagAmounts[tagId] || 0) + record.amount;
        });
      }
    });

    const list = Object.entries(tagAmounts).map(([tagId, amount]) => {
      const tag = ledger.tags.find(t => t.id === tagId);
      return {
        id: tagId,
        name: tag?.name || '未知标签',
        color: tag?.color || '#cbd5e1',
        amount
      };
    }).sort((a, b) => b.amount - a.amount);

    return { list, onlyCurrentAmount };
  }, [filteredRecords, selectedTagIds, ledger.tags]);

  if (timeFilteredRecords.length === 0 && selectedTagIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-24 h-24 bg-white rounded-[32px] shadow-sm flex items-center justify-center mb-6">
          <span className="text-4xl">📊</span>
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">暂无数据</h3>
        <p className="text-[15px] text-gray-500">记几笔账后再来看看统计吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar: Time Selector */}
      <div className="flex justify-end">
        <div className="bg-gray-200/50 p-1 rounded-xl inline-flex">
          <button 
            onClick={() => setTimeRange('month')}
            className={cn("px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all", timeRange === 'month' ? "bg-white shadow-sm text-gray-900" : "text-gray-500")}
          >
            本月
          </button>
          <button 
            onClick={() => setTimeRange('half_year')}
            className={cn("px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all", timeRange === 'half_year' ? "bg-white shadow-sm text-gray-900" : "text-gray-500")}
          >
            近半年
          </button>
        </div>
      </div>

      {/* Filter Breadcrumbs */}
      {selectedTagIds.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {selectedTagIds.map(id => {
            const tag = ledger.tags.find(t => t.id === id);
            return (
              <div key={id} className="flex-shrink-0 flex items-center gap-1.5 bg-indigo-50 text-indigo-700 pl-3 pr-1.5 py-1.5 rounded-full">
                <span className="text-[13px] font-semibold">{tag?.name}</span>
                <button 
                  onClick={() => setSelectedTagIds(prev => prev.filter(t => t !== id))}
                  className="p-0.5 hover:bg-indigo-100 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
          <button 
            onClick={() => setSelectedTagIds([])} 
            className="flex-shrink-0 text-[13px] font-medium text-gray-400 px-2 active:text-gray-600"
          >
            清空
          </button>
        </div>
      )}

      {/* Trend Chart Area */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm">
        <div className="text-[15px] font-semibold text-gray-500 mb-1">
          {selectedTagIds.length === 0 ? '大盘总支出' : '当前条件总支出'}
        </div>
        <div className="text-4xl font-bold text-gray-900 tracking-tight mb-6">
          <span className="text-2xl font-medium text-gray-400 mr-1">¥</span>
          {totalFilteredAmount.toFixed(2)}
        </div>
        <div className="h-[180px] -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#9ca3af' }} 
                dy={10}
                minTickGap={20}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickFormatter={(val) => `¥${val}`}
                width={50}
              />
              <Tooltip
                formatter={(value: number) => [`¥ ${value.toFixed(2)}`, '金额']}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#6366f1" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution Area */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight px-1">
          {selectedTagIds.length === 0 ? '支出分布' : '关联标签分布'}
        </h3>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTagIds.join('-')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {distribution.list.length === 0 && selectedTagIds.length > 0 ? (
              <div className="space-y-6">
                <div className="text-center py-8 bg-gray-50 rounded-[32px]">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <p className="text-[15px] font-medium text-gray-900">没有更多细分标签啦</p>
                  <p className="text-[13px] text-gray-500 mt-1">以下是符合当前条件的明细</p>
                </div>
                
                <div className="bg-white rounded-[32px] shadow-sm overflow-hidden">
                  {filteredRecords.map((record, index) => (
                    <div 
                      key={record.id} 
                      className={`p-5 flex items-center justify-between ${
                        index !== filteredRecords.length - 1 ? 'border-b border-gray-50' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="text-[13px] text-gray-400 mb-1">{format(record.date, 'MM-dd')}</div>
                        <div className="text-[15px] font-medium text-gray-900 truncate">{record.note || '无备注'}</div>
                      </div>
                      <span className="font-semibold text-gray-900 text-[17px]">
                        {record.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {distribution.onlyCurrentAmount > 0 && (
                  <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm p-4 border border-gray-100">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gray-100" 
                      style={{ width: `${(distribution.onlyCurrentAmount / totalFilteredAmount) * 100}%` }} 
                    />
                    <div className="relative flex justify-between items-center">
                      <span className="font-medium text-gray-600 text-[15px]">仅当前标签</span>
                      <span className="font-semibold text-gray-900 text-[15px]">¥{distribution.onlyCurrentAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                
                {distribution.list.slice(0, expandedTags ? undefined : 10).map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedTagIds(prev => [...prev, item.id])}
                    className="relative overflow-hidden rounded-2xl bg-white shadow-sm p-4 border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer group"
                  >
                    <div 
                      className="absolute inset-y-0 left-0 opacity-10 transition-all group-hover:opacity-20" 
                      style={{ width: `${(item.amount / totalFilteredAmount) * 100}%`, backgroundColor: item.color }} 
                    />
                    <div className="relative flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-gray-900 text-[15px]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-[15px]">¥{item.amount.toFixed(2)}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
                
                {!expandedTags && distribution.list.length > 10 && (
                  <button 
                    onClick={() => setExpandedTags(true)} 
                    className="w-full py-4 text-[13px] font-medium text-gray-500 text-center active:opacity-70"
                  >
                    查看其余 {distribution.list.length - 10} 个较小花费
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
