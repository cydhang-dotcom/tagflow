export type LedgerTemplateType = 'personal' | 'renovation' | 'company' | 'custom';

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Ledger {
  id: string;
  name: string;
  template: LedgerTemplateType;
  tags: Tag[];
  createdAt: number;
}

export interface RecordItem {
  id: string;
  ledgerId: string;
  amount: number;
  date: number; // timestamp
  note: string;
  tagIds: string[];
  createdAt: number;
}
