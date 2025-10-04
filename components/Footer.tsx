import React from 'react';

interface FooterProps {
    wordCount: number;
    charCount: number;
}

const Footer: React.FC<FooterProps> = ({ wordCount, charCount }) => {
  return (
    <footer className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-slate-200/60 dark:border-zinc-800/60 px-6 py-2 text-xs flex items-center justify-end space-x-4 text-zinc-500 dark:text-zinc-400 font-medium shadow-sm">
      <span className="flex items-center space-x-1.5">
        <span className="text-zinc-400 dark:text-zinc-500">Words:</span>
        <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{wordCount}</span>
      </span>
      <div className="h-4 w-px bg-slate-300 dark:bg-zinc-700"></div>
      <span className="flex items-center space-x-1.5">
        <span className="text-zinc-400 dark:text-zinc-500">Characters:</span>
        <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{charCount}</span>
      </span>
    </footer>
  );
};

export default Footer;