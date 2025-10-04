import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageSender } from '../types';
import { SendIcon, DocumentArrowDownIcon, ClipboardIcon, CheckIcon } from './icons/IconDefs';
import ToggleSwitch from './ToggleSwitch';

interface ChatPanelProps {
  isOpen: boolean;
  messages: ChatMessage[];
  onSendMessage: (message: string, useDocumentContext: boolean) => Promise<void>;
  onInsertText: (text: string) => void;
  isLoading: boolean;
  isDocumentSelected: boolean;
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg my-2 relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-white/50 dark:bg-zinc-800/50 rounded-md text-zinc-500 dark:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy code"
      >
        {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardIcon className="w-4 h-4" />}
      </button>
      <pre className="p-4 text-sm text-zinc-800 dark:text-zinc-200 overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const AIMessage: React.FC<{ msg: ChatMessage, onInsertText: (text: string) => void }> = ({ msg, onInsertText }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(msg.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const parts = msg.text.split(/(```[\s\S]*?```)/g).filter(Boolean);

    return (
        <div className="flex flex-col items-start">
            <div className="max-w-xs md:max-w-sm rounded-lg px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none">
                <div className="text-sm whitespace-pre-wrap">
                    {parts.map((part, index) => {
                        if (part.startsWith('```') && part.endsWith('```')) {
                            const code = part.slice(3, -3).trim();
                            return <CodeBlock key={index} code={code} />;
                        }
                        return <span key={index}>{part}</span>;
                    })}
                </div>
            </div>
            <div className="mt-1.5 flex items-center space-x-4 text-xs text-zinc-500">
                 <button onClick={() => onInsertText(msg.text)} className="flex items-center space-x-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <DocumentArrowDownIcon className="w-3.5 h-3.5" />
                    <span>Insert</span>
                </button>
                 <button onClick={handleCopy} className="flex items-center space-x-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {copied ? <CheckIcon className="w-3.5 h-3.5 text-green-500" /> : <ClipboardIcon className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
            </div>
        </div>
    );
};


const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, messages, onSendMessage, onInsertText, isLoading, isDocumentSelected }) => {
  const [input, setInput] = useState('');
  const [useDocumentContext, setUseDocumentContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      await onSendMessage(input.trim(), useDocumentContext);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`w-full h-full flex flex-col bg-white/50 dark:bg-zinc-900/50 border-l border-slate-200/50 dark:border-zinc-800/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        {isOpen && (
          <>
            <div className="flex-grow p-4 overflow-y-auto">
              <div className="space-y-6">
                {messages.map((msg) => {
                    if (msg.sender === MessageSender.USER) {
                        return (
                             <div key={msg.id} className="flex flex-col items-end">
                                <div className="max-w-xs md:max-w-sm rounded-lg px-4 py-2 bg-blue-600 text-white rounded-br-none">
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        );
                    }
                    if (msg.sender === MessageSender.AI) {
                        return <AIMessage key={msg.id} msg={msg} onInsertText={onInsertText} />;
                    }
                    if (msg.sender === MessageSender.SYSTEM) {
                        return (
                            <div key={msg.id} className="flex justify-center">
                                <div className="px-4 py-2 bg-red-900/50 text-red-300 text-sm rounded-md">
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}
                {isLoading && (
                   <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-zinc-800 rounded-lg px-4 py-3 rounded-bl-none">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                   </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200/50 dark:border-zinc-800/50">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask Codex..."
                  rows={2}
                  className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg pr-12 pl-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500 dark:placeholder:text-zinc-600"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors"
                  title="Send Message"
                >
                  <SendIcon className="w-4 h-4" />
                </button>
              </div>
              <div className={`flex items-center justify-between mt-2 transition-opacity duration-300 ${isDocumentSelected ? 'opacity-100' : 'opacity-50'}`}>
                  <div className="flex items-center space-x-2">
                      <ToggleSwitch id="doc-context" checked={useDocumentContext} onChange={setUseDocumentContext} disabled={!isDocumentSelected} />
                      <label htmlFor="doc-context" className="text-xs text-zinc-600 dark:text-zinc-400">
                          Use document context
                      </label>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-600">Powered by Gemini</p>
              </div>
            </div>
          </>
        )}
    </div>
  );
};

export default ChatPanel;