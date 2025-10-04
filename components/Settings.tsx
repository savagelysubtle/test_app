import React from 'react';
import { ChevronIcon } from './icons/IconDefs';
import { Theme, UserSettings, FontSize, FontFamily } from '../types';
import ToggleSwitch from './ToggleSwitch';

interface SettingsProps {
  onNavigateBack: () => void;
  theme: Theme;
  onThemeChange: (newTheme: Theme) => void;
  userSettings: UserSettings;
  onSettingsChange: (newSettings: Partial<UserSettings>) => void;
}

const SettingsRow: React.FC<{title: string, description: string, children: React.ReactNode}> = ({title, description, children}) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 border-b border-slate-200/60 dark:border-zinc-800/40 last:border-b-0">
    <div className="mb-4 sm:mb-0 sm:pr-8">
      <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{description}</p>
    </div>
    <div className="flex-shrink-0">
      {children}
    </div>
  </div>
);

const Settings: React.FC<SettingsProps> = ({ onNavigateBack, theme, onThemeChange, userSettings, onSettingsChange }) => {
  
  const fontSizes: { key: FontSize; name: string }[] = [{ key: 'sm', name: 'Small' },{ key: 'base', name: 'Medium' },{ key: 'lg', name: 'Large' }];
  const fontFamilies: { key: FontFamily; name: string }[] = [{ key: 'sans', name: 'Sans Serif' },{ key: 'serif', name: 'Serif' },{ key: 'mono', name: 'Monospace' }];

  return (
    <div className="flex-grow flex flex-col items-center bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30 dark:from-zinc-950 dark:via-zinc-950 dark:to-blue-950/20 p-8 w-full overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-white tracking-tight">Settings</h1>
           <button
            onClick={onNavigateBack}
            className="flex items-center space-x-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 hover:scale-105 shadow-sm"
          >
            <ChevronIcon direction="left" className="w-4 h-4" />
            <span>Back to Editor</span>
          </button>
        </div>

        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-12">Customize your editor and personalize your experience.</p>

        {/* Editor Card */}
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Editor</h2>
          <SettingsRow title="Font Size" description="Adjust the text size in the editor.">
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-xl shadow-inner">
              {fontSizes.map(({key, name}) => (
                <button
                  key={key}
                  onClick={() => onSettingsChange({ fontSize: key })}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${userSettings.fontSize === key ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-md scale-105' : 'text-zinc-600 dark:text-zinc-400 hover:bg-white/70 dark:hover:bg-zinc-700/50 hover:scale-105'}`}
                >{name}</button>
              ))}
            </div>
          </SettingsRow>
          <SettingsRow title="Font Family" description="Choose the editor's typeface.">
            <select
                value={userSettings.fontFamily}
                onChange={(e) => onSettingsChange({ fontFamily: e.target.value as FontFamily })}
                className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 shadow-sm cursor-pointer"
            >
                {fontFamilies.map(({ key, name }) => <option key={key} value={key}>{name}</option>)}
            </select>
          </SettingsRow>
           <SettingsRow title="Word Wrap" description="Automatically wrap lines that exceed the editor width.">
            <ToggleSwitch id="word-wrap" checked={userSettings.wordWrap} onChange={(checked) => onSettingsChange({ wordWrap: checked })} />
          </SettingsRow>
           <SettingsRow title="Auto-Save" description="Automatically save changes to your documents.">
            <ToggleSwitch id="auto-save" checked={userSettings.autoSave} onChange={(checked) => onSettingsChange({ autoSave: checked })} />
          </SettingsRow>
        </div>

        {/* Appearance Card */}
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xl">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Appearance</h2>
          <SettingsRow title="Theme" description="Choose between a light or dark interface.">
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-zinc-950 p-2 rounded-full shadow-inner">
              <button
                onClick={() => onThemeChange('light')}
                className={`px-7 py-2.5 text-sm font-bold rounded-full transition-all duration-200 ${
                  theme === 'light' ? 'bg-white text-zinc-900 shadow-lg scale-105' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:scale-105'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                className={`px-7 py-2.5 text-sm font-bold rounded-full transition-all duration-200 ${
                  theme === 'dark' ? 'bg-zinc-800 text-white shadow-lg scale-105' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:scale-105'
                }`}
              >
                Dark
              </button>
            </div>
          </SettingsRow>
        </div>
      </div>
    </div>
  );
};

export default Settings;
