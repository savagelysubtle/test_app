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
    className="absolute z-20 bg-zinc-900/90 backdrop-blur-sm text-white rounded-lg p-1 flex items-center space-x-1 shadow-xl"
    style={{ top: position.top, left: position.left, transform: 'translateY(-100%)' }}
  >
    <button title="Improve writing" onClick={() => onAction('improve')} className="px-3 py-1.5 text-sm hover:bg-zinc-700 rounded-md transition-colors">Improve</button>
    <button title="Summarize selection" onClick={() => onAction('summarize')} className="px-3 py-1.5 text-sm hover:bg-zinc-700 rounded-md transition-colors">Summarize</button>
    <button title="Fix spelling & grammar" onClick={() => onAction('fix')} className="px-3 py-1.5 text-sm hover:bg-zinc-700 rounded-md transition-colors">Fix Spelling</button>
    <button title="Translate to English" onClick={() => onAction('translate')} className="px-3 py-1.5 text-sm hover:bg-zinc-700 rounded-md transition-colors">Translate</button>
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
        <LargeDocumentIcon className="w-32 h-32 mb-4 opacity-10" />
        <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2">No document selected</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">Choose a document from the explorer or create a new one.</p>
        <button
          onClick={onCreateDocument}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
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
    'flex-grow w-full h-full bg-transparent p-6 text-zinc-800 dark:text-zinc-200 resize-none focus:outline-none leading-relaxed placeholder:text-zinc-400 dark:placeholder:text-zinc-600',
    fontClasses[userSettings.fontSize],
    familyClasses[userSettings.fontFamily],
    userSettings.wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto',
  ].join(' ');

  return (
    <div className="flex-grow flex flex-col bg-white dark:bg-zinc-950 min-h-0">
      <div className="flex-grow relative">
        {toolbarPosition && <AIActionToolbar position={toolbarPosition} onAction={handleAIAction} />}
        <textarea
          ref={textareaRef}
          key={document.id}
          value={document.content}
          onChange={(e) => onContentChange(e.target.value)}
          onMouseUp={handleSelection}
          onScroll={() => setToolbarPosition(null)}
          placeholder="Start typing..."
          className={textareaClasses + ' absolute inset-0'}
          disabled={isAILoading}
        />
        {isAILoading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <SparklesIcon className="w-10 h-10 text-blue-500 animate-pulse" />
              <p className="mt-4 text-lg font-medium text-zinc-700 dark:text-zinc-300">Codex is thinking...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;