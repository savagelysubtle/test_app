import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Document, ChatMessage, MessageSender, AppView, UserSettings, Theme, ExportFormat } from './types';
import Header from './components/Header';
import Explorer from './components/Explorer';
import Editor from './components/Editor';
import Settings from './components/Settings';
import ChatPanel from './components/ChatPanel';
import Footer from './components/Footer';
import Tabs from './components/Tabs';
import { sendMessageToAI } from './services/geminiService';
import ToggleSwitch from './components/ToggleSwitch';

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return 'dark';
    }
  }
  return 'light';
};

const App: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [openDocumentIds, setOpenDocumentIds] = useState<string[]>([]);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'initial', sender: MessageSender.AI, text: "Hello! I'm Codex. How can I help you with your document today?" }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('editor');

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    const savedSettings = localStorage.getItem('userSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      fontSize: 'base',
      fontFamily: 'sans',
      wordWrap: true,
      autoSave: true,
    };
  });

  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
  }, [userSettings]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const handleSettingsChange = (newSettings: Partial<UserSettings>) => {
    setUserSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleCreateDocument = useCallback(() => {
    const newDocCount = documents.length + 1;
    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      name: `Untitled Document ${newDocCount}`,
      content: '',
    };
    setDocuments(prevDocs => [...prevDocs, newDocument]);
    setActiveDocumentId(newDocument.id);
    if (!openDocumentIds.includes(newDocument.id)) {
      setOpenDocumentIds(prev => [...prev, newDocument.id]);
    }
    if (!isExplorerOpen) {
      setIsExplorerOpen(true);
    }
    setCurrentView('editor');
  }, [documents.length, isExplorerOpen, openDocumentIds]);

  const handleSelectDocument = (id: string) => {
    setActiveDocumentId(id);
    if (!openDocumentIds.includes(id)) {
      setOpenDocumentIds(prev => [...prev, id]);
    }
    setCurrentView('editor');
  };

  const handleContentChange = (content: string) => {
    if (!activeDocumentId) return;
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === activeDocumentId ? { ...doc, content } : doc
      )
    );
  };
  
  const handleSendMessage = async (messageText: string, useDocumentContext: boolean) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: MessageSender.USER,
      text: messageText
    };
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    const activeDoc = documents.find(doc => doc.id === activeDocumentId);
    const context = useDocumentContext && activeDoc ? activeDoc.content : undefined;

    const aiResponse = await sendMessageToAI(messageText, context);
    
    setChatMessages(prev => [...prev, aiResponse]);
    setIsChatLoading(false);
  };

  const handleInsertTextFromAI = (text: string) => {
    if (!activeDocumentId) return;
    handleContentChange(documents.find(d => d.id === activeDocumentId)!.content + '\n' + text);
  }

  const handleExportDocument = useCallback((format: ExportFormat) => {
    const documentToExport = documents.find(doc => doc.id === activeDocumentId);
    if (!documentToExport) return;

    let content: string;
    let mimeType: string;
    const filename = `${documentToExport.name.replace(/\s+/g, '_')}.${format}`;

    switch (format) {
      case 'json':
        content = JSON.stringify(documentToExport, null, 2);
        mimeType = 'application/json';
        break;
      case 'md':
        content = documentToExport.content;
        mimeType = 'text/markdown';
        break;
      case 'txt':
      default:
        content = documentToExport.content;
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  }, [documents, activeDocumentId]);

  const handleRenameDocument = (id: string, newName: string) => {
    setDocuments(docs => docs.map(doc => doc.id === id ? { ...doc, name: newName } : doc));
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(docs => docs.filter(doc => doc.id !== id));
    setOpenDocumentIds(ids => ids.filter(docId => docId !== id));
    if (activeDocumentId === id) {
        const remainingOpenDocs = openDocumentIds.filter(docId => docId !== id);
        setActiveDocumentId(remainingOpenDocs.length > 0 ? remainingOpenDocs[0] : null);
    }
  };

  const handleCloseTab = (id: string) => {
    const newOpenDocumentIds = openDocumentIds.filter(docId => docId !== id);
    setOpenDocumentIds(newOpenDocumentIds);
    if (activeDocumentId === id) {
      setActiveDocumentId(newOpenDocumentIds.length > 0 ? newOpenDocumentIds[0] : null);
    }
  };
  
  const activeDocument = documents.find(doc => doc.id === activeDocumentId) || null;
  const openDocuments = useMemo(() => openDocumentIds.map(id => documents.find(doc => doc.id === id)).filter((d): d is Document => !!d), [openDocumentIds, documents]);

  const { wordCount, charCount } = useMemo(() => {
    if (!activeDocument) return { wordCount: 0, charCount: 0 };
    const content = activeDocument.content;
    const words = content.trim().split(/\s+/).filter(Boolean);
    return {
      wordCount: words.length === 1 && words[0] === '' ? 0 : words.length,
      charCount: content.length,
    };
  }, [activeDocument]);

  const editorDashboard = (
    <div className="flex flex-grow min-h-0">
      <aside className={`transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${isExplorerOpen ? 'w-80' : 'w-0'} backdrop-blur-sm`}>
          <Explorer
            isOpen={isExplorerOpen}
            documents={documents}
            selectedDocumentId={activeDocumentId}
            onCreateDocument={handleCreateDocument}
            onSelectDocument={handleSelectDocument}
            onRenameDocument={handleRenameDocument}
            onDeleteDocument={handleDeleteDocument}
          />
      </aside>
      <main className="flex-grow flex flex-col min-w-0 shadow-2xl shadow-slate-200/50 dark:shadow-black/50">
        <Tabs
          openDocuments={openDocuments}
          activeDocumentId={activeDocumentId}
          onSelectTab={setActiveDocumentId}
          onCloseTab={handleCloseTab}
        />
        <Editor
          document={activeDocument}
          onContentChange={handleContentChange}
          onCreateDocument={handleCreateDocument}
          userSettings={userSettings}
          theme={theme}
        />
      </main>
      <aside className={`transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${isChatPanelOpen ? 'w-96' : 'w-0'} backdrop-blur-sm`}>
          <ChatPanel 
            isOpen={isChatPanelOpen}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onInsertText={handleInsertTextFromAI}
            isLoading={isChatLoading}
            isDocumentSelected={!!activeDocumentId}
          />
      </aside>
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col font-sans overflow-hidden bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30 dark:from-zinc-950 dark:via-zinc-950 dark:to-blue-950/20">
      <Header 
        isExplorerOpen={isExplorerOpen}
        isChatPanelOpen={isChatPanelOpen}
        onToggleExplorer={() => setIsExplorerOpen(prev => !prev)}
        onToggleChatPanel={() => setIsChatPanelOpen(prev => !prev)}
        onNavigate={setCurrentView}
        onCreateDocument={handleCreateDocument}
        currentView={currentView}
        onExportDocument={handleExportDocument}
        isDocumentSelected={!!activeDocumentId}
      />
      {currentView === 'editor' ? editorDashboard : (
        <Settings 
          onNavigateBack={() => setCurrentView('editor')}
          theme={theme}
          onThemeChange={setTheme}
          userSettings={userSettings}
          onSettingsChange={handleSettingsChange}
        />
      )}
      <Footer wordCount={wordCount} charCount={charCount} />
    </div>
  );
};

export default App;