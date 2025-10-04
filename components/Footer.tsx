import React from 'react';

interface FooterProps {
    wordCount: number;
    charCount: number;
}

const Footer: React.FC<FooterProps> = ({ wordCount, charCount }) => {
  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-slate-200/50 dark:border-zinc-800/50 px-4 py-1.5 text-xs h-8 flex items-center justify-end space-x-4 text-zinc-500 dark:text-zinc-400">
      <span>{wordCount} words</span>
      <div className="h-4 w-px bg-slate-200 dark:bg-zinc-700"></div>
      <span>{charCount} characters</span>
    </footer>
  );
};

export default Footer;