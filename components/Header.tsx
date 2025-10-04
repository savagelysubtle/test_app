import React, { useState, useRef, useEffect } from 'react';
import { UserIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, DocumentPlusIcon, CogIcon, DownloadIcon, ChevronIcon, PencilSwooshIcon } from './icons/IconDefs';
import { AppView, ExportFormat } from '../types';

interface HeaderProps {
  isExplorerOpen: boolean;
  isChatPanelOpen: boolean;
  onToggleExplorer: () => void;
  onToggleChatPanel: () => void;
  onNavigate: (view: AppView) => void;
  onCreateDocument: () => void;
  currentView: AppView;
  onExportDocument: (format: ExportFormat) => void;
  isDocumentSelected: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  isExplorerOpen, 
  isChatPanelOpen, 
  onToggleExplorer, 
  onToggleChatPanel,
  onNavigate,
  onCreateDocument,
  currentView,
  onExportDocument,
  isDocumentSelected,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreateDocumentClick = () => {
    onCreateDocument();
    setIsDropdownOpen(false);
  }

  const handleSettingsClick = () => {
    onNavigate('settings');
    setIsDropdownOpen(false);
  }
  
  const handleExportClick = (format: ExportFormat) => {
    onExportDocument(format);
    setIsExportMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-zinc-800/60 px-4 py-3 flex items-center justify-between z-30 flex-shrink-0 shadow-sm">
      <div className="flex items-center space-x-2">
        {currentView === 'editor' && (
          <button
            onClick={onToggleExplorer}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-all duration-200 hover:scale-105"
            title={isExplorerOpen ? 'Collapse Explorer' : 'Expand Explorer'}
          >
            {isExplorerOpen ? <ChevronDoubleLeftIcon /> : <ChevronDoubleRightIcon />}
          </button>
        )}
        
        <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                <PencilSwooshIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
                <h1 className="font-bold text-xl text-zinc-800 dark:text-white leading-tight tracking-tight">Codex</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">AI Document Editor</p>
            </div>
        </div>

      </div>
      <div className="flex items-center space-x-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(prev => !prev)}
              className="font-semibold text-sm px-4 py-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all duration-200 hover:scale-105 flex items-center space-x-2 text-zinc-700 dark:text-zinc-200 shadow-sm"
            >
              <span>File</span>
              <ChevronIcon direction="down" className="w-4 h-4" />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={handleCreateDocumentClick}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-left text-zinc-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg mx-1 transition-colors"
                >
                  <DocumentPlusIcon className="w-4 h-4" />
                  <span>New Document</span>
                </button>

                <div 
                  className="relative" 
                  onMouseEnter={() => { if (isDocumentSelected) setIsExportMenuOpen(true); }}
                  onMouseLeave={() => setIsExportMenuOpen(false)}
                >
                  <button
                    disabled={!isDocumentSelected}
                    className="w-full flex items-center justify-between space-x-3 px-4 py-2.5 text-sm text-left text-zinc-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg mx-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <DownloadIcon className="w-4 h-4" />
                      <span>Export As</span>
                    </div>
                    <ChevronIcon direction="right" className="w-4 h-4" />
                  </button>
                  {isExportMenuOpen && (
                    <div className="absolute left-full top-0 -mt-1 ml-1 w-40 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl py-1.5">
                      <button onClick={() => handleExportClick('txt')} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg mx-1 transition-colors">Plain Text (.txt)</button>
                      <button onClick={() => handleExportClick('md')} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg mx-1 transition-colors">Markdown (.md)</button>
                      <button onClick={() => handleExportClick('json')} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg mx-1 transition-colors">JSON (.json)</button>
                    </div>
                  )}
                </div>

                <div className="my-1 border-t border-slate-200 dark:border-zinc-800"></div>
                <button
                  onClick={handleSettingsClick}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-left text-zinc-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg mx-1 transition-colors"
                >
                  <CogIcon className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            )}
          </div>
        <div className="flex items-center space-x-3 bg-slate-100 dark:bg-zinc-800 px-3 py-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          <div className="pr-1">
            <div className="text-sm font-semibold text-zinc-800 dark:text-white">simpleflowwoks</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">simpleflowwoks@gmail.com</div>
          </div>
        </div>
        {currentView === 'editor' && (
          <button
            onClick={onToggleChatPanel}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-all duration-200 hover:scale-105"
            title={isChatPanelOpen ? 'Collapse Chat Panel' : 'Expand Chat Panel'}
          >
            {isChatPanelOpen ? <ChevronDoubleRightIcon /> : <ChevronDoubleLeftIcon />}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;