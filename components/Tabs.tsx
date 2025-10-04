import React from 'react';
import { Document } from '../types';
import { SmallDocumentIcon, XMarkIcon } from './icons/IconDefs';

interface TabsProps {
  openDocuments: Document[];
  activeDocumentId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ openDocuments, activeDocumentId, onSelectTab, onCloseTab }) => {
  if (openDocuments.length === 0) {
    return null;
  }
  
  return (
    <div className="flex-shrink-0 bg-slate-100 dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800/50 flex items-end">
      <div className="flex items-center overflow-x-auto">
        {openDocuments.map(doc => (
          <div
            key={doc.id}
            onClick={() => onSelectTab(doc.id)}
            className={`flex items-center space-x-2 pl-3 pr-2 py-2 text-sm cursor-pointer border-r border-slate-200/80 dark:border-zinc-800/50 relative group
              ${activeDocumentId === doc.id
                ? 'bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-800/40'
              }`}
          >
            <SmallDocumentIcon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate max-w-xs">{doc.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(doc.id);
              }}
              className="p-0.5 rounded-full hover:bg-slate-300/50 dark:hover:bg-zinc-700/50"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
