import React, { useState, useRef, useEffect } from 'react';
import { Document, UserSettings, Theme, AIAction } from '../types';
import { LargeDocumentIcon, PlusIcon, SparklesIcon } from './icons/IconDefs';
import { performAIAction } from '../services/geminiService';

interface EditorProps {
  document: Document | null;
  onContentChange: (content: string) => void;
  onCreateDocument: () => void;
  userSettings: UserSettings;
  theme: Theme;
}

const AIActionToolbar: React.FC<{
  position: { top: number, left: number };
  onAction: (action: AIAction) => void;
}> = ({ position, onAction }) => (
  <div
    className="absolute z-20 bg-zinc-900/95 backdrop-blur-md text-white rounded-xl p-2 flex items-center space-x-2 shadow-2xl border border-zinc-700/50 animate-in fade-in zoom-in-95 duration-200"
    style={{ top: position.top, left: position.left, transform: 'translateY(-100%)' }}
  >
    <button title="Improve writing" onClick={() => onAction('improve')} className="px-3 py-2 text-sm font-medium hover:bg-zinc-700 rounded-lg transition-all duration-200 hover:scale-105">Improve</button>
    <button title="Summarize selection" onClick={() => onAction('summarize')} className="px-3 py-2 text-sm font-medium hover:bg-zinc-700 rounded-lg transition-all duration-200 hover:scale-105">Summarize</button>
    <button title="Fix spelling & grammar" onClick={() => onAction('fix')} className="px-3 py-2 text-sm font-medium hover:bg-zinc-700 rounded-lg transition-all duration-200 hover:scale-105">Fix Spelling</button>
    <button title="Translate to English" onClick={() => onAction('translate')} className="px-3 py-2 text-sm font-medium hover:bg-zinc-700 rounded-lg transition-all duration-200 hover:scale-105">Translate</button>
  </div>
);

const Editor: React.FC<EditorProps> = ({ document, onContentChange, onCreateDocument, userSettings }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<{ start: number, end: number, text: string } | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number, left: number } | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);

  const handleSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea || isAILoading) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);

    if (selectedText.trim().length > 0) {
      setSelection({ start: selectionStart, end: selectionEnd, text: selectedText });
      
      const startPos = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, startPos);

      // Create a temporary div to calculate the position of the selection
      // FIX: The prop 'document' is shadowing the global 'document' object. Use window.document to access the DOM.
      const div = window.document.createElement('div');
      div.style.position = 'absolute';
      div.style.visibility = 'hidden';
      div.style.whiteSpace = 'pre-wrap'; // Match textarea wrapping
      div.style.font = window.getComputedStyle(textarea).font;
      div.style.width = `${textarea.clientWidth}px`;
      div.style.padding = window.getComputedStyle(textarea).padding;
      div.style.border = window.getComputedStyle(textarea).border;
      div.style.boxSizing = 'border-box';
      
      div.textContent = textBefore;
      // FIX: The prop 'document' is shadowing the global 'document' object. Use window.document to access the DOM.
      window.document.body.appendChild(div);

      // FIX: The prop 'document' is shadowing the global 'document' object. Use window.document to access the DOM.
      const span = window.document.createElement('span');
      span.textContent = selectedText;
      div.appendChild(span);
      
      const rect = textarea.getBoundingClientRect();
      const spanRect = span.getBoundingClientRect();

      // FIX: The prop 'document' is shadowing the global 'document' object. Use window.document to access the DOM.
      window.document.body.removeChild(div);
      
      setToolbarPosition({ top: rect.top + spanRect.top - div.getBoundingClientRect().top, left: rect.left + spanRect.left - div.getBoundingClientRect().left });

    } else {
      setSelection(null);
      setToolbarPosition(null);
    }
  };

  const handleAIAction = async (action: AIAction) => {
    if (!document || !selection) return;

    setIsAILoading(true);
    setToolbarPosition(null);

    const result = await performAIAction(action, selection.text);
    
    const originalContent = document.content;
    const pre = originalContent.substring(0, selection.start);
    const post = originalContent.substring(selection.end);

    onContentChange(pre + result + post);
    setIsAILoading(false);
    setSelection(null);
  };

  useEffect(() => {
    setSelection(null);
    setToolbarPosition(null);
  }, [document?.id]);

  if (!document) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-600 p-8">
        <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-zinc-900/20 rounded-3xl">
            <LargeDocumentIcon className="w-32 h-32 opacity-20" />
        </div>
        <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200 mb-3">No document selected</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-center max-w-md">Choose a document from the explorer or create a new one to get started.</p>
        <button
          onClick={onCreateDocument}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3.5 rounded-xl shadow-xl shadow-blue-500/30 transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create New Document</span>
        </button>
      </div>
    );
  }

  const fontClasses = { sm: 'text-sm', base: 'text-base', lg: 'text-lg' };
  const familyClasses = { sans: 'font-sans', serif: 'font-serif', mono: 'font-mono' };

  const textareaClasses = [
    'flex-grow w-full h-full bg-transparent p-8 text-zinc-800 dark:text-zinc-200 resize-none focus:outline-none leading-relaxed placeholder:text-zinc-400 dark:placeholder:text-zinc-600',
    fontClasses[userSettings.fontSize],
    familyClasses[userSettings.fontFamily],
    userSettings.wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto',
  ].join(' ');

  return (
    <div className="flex-grow flex flex-col bg-white dark:bg-zinc-950 min-h-0 relative">
      <div className="flex-grow relative">
        {toolbarPosition && <AIActionToolbar position={toolbarPosition} onAction={handleAIAction} />}
        <textarea
          ref={textareaRef}
          key={document.id}
          value={document.content}
          onChange={(e) => onContentChange(e.target.value)}
          onMouseUp={handleSelection}
          onScroll={() => setToolbarPosition(null)}
          placeholder="Start writing your document..."
          className={textareaClasses + ' absolute inset-0 selection:bg-blue-200 selection:text-blue-900 dark:selection:bg-blue-800 dark:selection:text-blue-100'}
          disabled={isAILoading}
        />
        {isAILoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex flex-col items-center justify-center z-10">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/30 dark:to-zinc-900/30 rounded-3xl shadow-2xl">
                  <SparklesIcon className="w-16 h-16 text-blue-500 animate-pulse" />
              </div>
              <p className="mt-6 text-xl font-semibold text-zinc-700 dark:text-zinc-300">Codex is thinking...</p>
              <div className="flex space-x-2 mt-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;