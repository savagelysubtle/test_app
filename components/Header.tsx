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
    <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border-b border-slate-200/80 dark:border-zinc-800/50 p-3 flex items-center justify-between z-30 flex-shrink-0">
      <div className="flex items-center space-x-2">
        {currentView === 'editor' && (
          <button 
            onClick={onToggleExplorer} 
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
            title={isExplorerOpen ? 'Collapse Explorer' : 'Expand Explorer'}
          >
            {isExplorerOpen ? <ChevronDoubleLeftIcon /> : <ChevronDoubleRightIcon />}
          </button>
        )}
        
        <div className="flex items-center gap-3">
            <PencilSwooshIcon className="w-7 h-7 text-blue-600" />
            <div className="flex flex-col">
                <h1 className="font-bold text-lg text-zinc-800 dark:text-white leading-tight">Codex Editor</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">AI-Powered Documents</p>
            </div>
        </div>

      </div>
      <div className="flex items-center space-x-2">
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(prev => !prev)}
              className="font-semibold text-sm px-4 py-2 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-center space-x-2 text-zinc-700 dark:text-zinc-200 shadow-sm"
            >
              <span>File</span>
              <ChevronIcon direction="down" className="w-4 h-4" />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md shadow-lg py-1 z-40">
                <button 
                  onClick={handleCreateDocumentClick}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-left text-zinc-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-800/50"
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
                    className="w-full flex items-center justify-between space-x-3 px-4 py-2 text-sm text-left text-zinc-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-800/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <DownloadIcon className="w-4 h-4" />
                      <span>Export As</span>
                    </div>
                    <ChevronIcon direction="right" className="w-4 h-4" />
                  </button>
                  {isExportMenuOpen && (
                    <div className="absolute left-full top-0 -mt-1 ml-1 w-40 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md shadow-lg py-1">
                      <button onClick={() => handleExportClick('txt')} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-800/50">Plain Text (.txt)</button>
                      <button onClick={() => handleExportClick('md')} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-800/50">Markdown (.md)</button>
                      <button onClick={() => handleExportClick('json')} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-800/50">JSON (.json)</button>
                    </div>
                  )}
                </div>

                <div className="my-1 border-t border-slate-200 dark:border-zinc-800"></div>
                <button
                  onClick={handleSettingsClick}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-left text-zinc-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-800/50"
                >
                  <CogIcon className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            )}
          </div>
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-full">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          <div className="pr-2">
            <div className="text-sm font-medium text-zinc-800 dark:text-white">simpleflowwoks</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">simpleflowwoks@gmail.com</div>
          </div>
        </div>
        {currentView === 'editor' && (
          <button 
            onClick={onToggleChatPanel}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
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