import React, { useState, useRef, useEffect } from 'react';
import { Document } from '../types';
import { PlusIcon, SearchIcon, SmallDocumentIcon, LargeDocumentIcon, PencilIcon, TrashIcon } from './icons/IconDefs';

interface ExplorerProps {
  documents: Document[];
  selectedDocumentId: string | null;
  onCreateDocument: () => void;
  onSelectDocument: (id: string) => void;
  onRenameDocument: (id: string, newName: string) => void;
  onDeleteDocument: (id: string) => void;
  isOpen: boolean;
}

const Explorer: React.FC<ExplorerProps> = ({
  documents,
  selectedDocumentId,
  onCreateDocument,
  onSelectDocument,
  onRenameDocument,
  onDeleteDocument,
  isOpen,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; docId: string } | null>(null);
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu && contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu]);
  
  useEffect(() => {
    if (renamingDocId && renameInputRef.current) {
        renameInputRef.current.focus();
        renameInputRef.current.select();
    }
  }, [renamingDocId]);

  const handleRightClick = (e: React.MouseEvent<HTMLButtonElement>, docId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, docId });
  };

  const handleRename = () => {
    if (!contextMenu) return;
    const doc = documents.find(d => d.id === contextMenu.docId);
    if (doc) {
      setRenamingDocId(contextMenu.docId);
      setRenameValue(doc.name);
    }
    setContextMenu(null);
  };
  
  const handleDelete = () => {
    if (!contextMenu) return;
    if (window.confirm(`Are you sure you want to delete this document? This action cannot be undone.`)) {
        onDeleteDocument(contextMenu.docId);
    }
    setContextMenu(null);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingDocId && renameValue.trim()) {
      onRenameDocument(renamingDocId, renameValue.trim());
    }
    setRenamingDocId(null);
    setRenameValue('');
  };

  return (
    <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl w-full h-full flex flex-col border-r border-slate-200/60 dark:border-zinc-800/60">
      <div className={`p-4 flex flex-col h-full transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Explorer</h2>
          <button
            onClick={onCreateDocument}
            className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-white rounded-lg transition-all duration-200 hover:scale-110"
            title="Create New Document"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search files..."
            className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-all duration-200 shadow-sm"
          />
        </div>
        <div className="flex-grow overflow-y-auto -mr-2 pr-2">
          {documents.length > 0 ? (
            <ul>
              {documents.map((doc) => (
                <li key={doc.id}>
                    {renamingDocId === doc.id ? (
                        <form onSubmit={handleRenameSubmit} className="px-3 py-2">
                            <input
                                ref={renameInputRef}
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={() => setRenamingDocId(null)}
                                className="w-full bg-white dark:bg-zinc-800 border-2 border-blue-500 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-zinc-800 dark:text-zinc-200 shadow-lg"
                            />
                        </form>
                    ) : (
                        <button
                            onClick={() => onSelectDocument(doc.id)}
                            onContextMenu={(e) => handleRightClick(e, doc.id)}
                            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 text-left rounded-lg text-sm transition-all duration-200 group relative hover:scale-[1.02]
                            ${selectedDocumentId === doc.id
                                ? 'bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-800'
                                : 'text-zinc-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/70 border border-transparent'
                            }`}
                        >
                            <SmallDocumentIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate font-medium">{doc.name}</span>
                        </button>
                    )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-zinc-500 dark:text-zinc-600 mt-10 px-4">
               <LargeDocumentIcon className="w-16 h-16 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No documents yet.</p>
              <p className="text-xs mt-1">Click the '+' button to create one.</p>
            </div>
          )}
        </div>
      </div>
       {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="absolute z-50 w-44 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-150"
        >
          <button onClick={handleRename} className="w-full flex items-center space-x-2.5 px-3 py-2.5 text-sm text-left text-zinc-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg mx-1 transition-colors">
            <PencilIcon />
            <span>Rename</span>
          </button>
          <button onClick={handleDelete} className="w-full flex items-center space-x-2.5 px-3 py-2.5 text-sm text-left text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg mx-1 transition-colors">
            <TrashIcon />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Explorer;