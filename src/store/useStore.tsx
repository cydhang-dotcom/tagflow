import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ledger, RecordItem, Tag, LedgerTemplateType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { TEMPLATES, COLORS } from '../constants';

interface AppState {
  ledgers: Ledger[];
  records: RecordItem[];
  activeLedgerId: string | null;
}

interface AppContextType extends AppState {
  createLedger: (name: string, template: LedgerTemplateType) => void;
  deleteLedger: (id: string) => void;
  setActiveLedger: (id: string) => void;
  addRecord: (record: Omit<RecordItem, 'id' | 'createdAt'>) => void;
  deleteRecord: (id: string) => void;
  addTag: (ledgerId: string, name: string) => void;
  deleteTag: (ledgerId: string, tagId: string) => void;
  reorderTags: (ledgerId: string, newTags: Tag[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'multi_ledger_app_data';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.ledgers && parsed.ledgers.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse local storage', e);
      }
    }
    
    // Create default ledger if no data exists
    const defaultTemplate = TEMPLATES['personal'];
    const defaultLedger: Ledger = {
      id: uuidv4(),
      name: defaultTemplate.name,
      template: 'personal',
      tags: defaultTemplate.defaultTags.map((t, i) => ({
        id: uuidv4(),
        name: t,
        color: COLORS[i % COLORS.length]
      })),
      createdAt: Date.now(),
    };

    return { ledgers: [defaultLedger], records: [], activeLedgerId: defaultLedger.id };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const createLedger = (name: string, templateType: LedgerTemplateType) => {
    const template = TEMPLATES[templateType];
    const newLedger: Ledger = {
      id: uuidv4(),
      name,
      template: templateType,
      tags: template.defaultTags.map((t, i) => ({
        id: uuidv4(),
        name: t,
        color: COLORS[i % COLORS.length]
      })),
      createdAt: Date.now(),
    };

    setState(prev => ({
      ...prev,
      ledgers: [...prev.ledgers, newLedger],
      activeLedgerId: newLedger.id
    }));
  };

  const deleteLedger = (id: string) => {
    setState(prev => {
      const newLedgers = prev.ledgers.filter(l => l.id !== id);
      return {
        ...prev,
        ledgers: newLedgers,
        records: prev.records.filter(r => r.ledgerId !== id),
        activeLedgerId: prev.activeLedgerId === id ? (newLedgers[0]?.id || null) : prev.activeLedgerId
      };
    });
  };

  const setActiveLedger = (id: string) => {
    setState(prev => ({ ...prev, activeLedgerId: id }));
  };

  const addRecord = (record: Omit<RecordItem, 'id' | 'createdAt'>) => {
    const newRecord: RecordItem = {
      ...record,
      id: uuidv4(),
      createdAt: Date.now()
    };
    setState(prev => ({
      ...prev,
      records: [...prev.records, newRecord]
    }));
  };

  const deleteRecord = (id: string) => {
    setState(prev => ({
      ...prev,
      records: prev.records.filter(r => r.id !== id)
    }));
  };

  const addTag = (ledgerId: string, name: string) => {
    setState(prev => ({
      ...prev,
      ledgers: prev.ledgers.map(l => {
        if (l.id === ledgerId) {
          return {
            ...l,
            tags: [...l.tags, { id: uuidv4(), name, color: COLORS[l.tags.length % COLORS.length] }]
          };
        }
        return l;
      })
    }));
  };

  const deleteTag = (ledgerId: string, tagId: string) => {
    setState(prev => ({
      ...prev,
      ledgers: prev.ledgers.map(l => {
        if (l.id === ledgerId) {
          return {
            ...l,
            tags: l.tags.filter(t => t.id !== tagId)
          };
        }
        return l;
      }),
      // Remove the tag from existing records
      records: prev.records.map(r => {
        if (r.ledgerId === ledgerId && r.tagIds.includes(tagId)) {
          return {
            ...r,
            tagIds: r.tagIds.filter(id => id !== tagId)
          };
        }
        return r;
      })
    }));
  };

  const reorderTags = (ledgerId: string, newTags: Tag[]) => {
    setState(prev => ({
      ...prev,
      ledgers: prev.ledgers.map(l => {
        if (l.id === ledgerId) {
          return {
            ...l,
            tags: newTags
          };
        }
        return l;
      })
    }));
  };

  return (
    <AppContext.Provider value={{ ...state, createLedger, deleteLedger, setActiveLedger, addRecord, deleteRecord, addTag, deleteTag, reorderTags }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
