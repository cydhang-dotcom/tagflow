import { LedgerTemplateType } from './types';

export const TEMPLATES: Record<LedgerTemplateType, { name: string; description: string; defaultTags: string[] }> = {
  personal: {
    name: '个人账本',
    description: '适合日常开销记录，简单明了。',
    defaultTags: ['餐饮', '交通', '购物', '娱乐', '居住', '社交']
  },
  renovation: {
    name: '装修账本',
    description: '适合装修过程中的复杂支出，按空间和工种分类。',
    defaultTags: ['硬装', '软装', '家电', '家具', '人工', '设计', '增项']
  },
  company: {
    name: '小微企业',
    description: '适合团队或小公司的日常报销与项目支出。',
    defaultTags: ['办公费', '差旅费', '招待费', '营销费', '设备', '福利']
  },
  custom: {
    name: '自定义账本',
    description: '从零开始，完全自定义你的账本结构。',
    defaultTags: []
  }
};

export const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];
