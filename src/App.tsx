/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ArticleView } from './components/ArticleView';
import { ArticleEditor } from './components/ArticleEditor';
import { AdminPortal } from './components/AdminPortal';
import { ManualHome } from './components/ManualHome';
import { SearchModal } from './components/SearchModal';
import { Menu, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentView } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      {/* Sticky Top Header */}
      <Header />

      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Menu Floating Trigger Button (Reader view only) */}
      {currentView === 'reader' && (
        <div className="lg:hidden sticky top-16 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
          >
            {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4 text-blue-600" />}
            <span>{isMobileSidebarOpen ? 'Close Chapters' : 'Browse Chapters'}</span>
          </button>
          <span className="text-xs font-mono text-slate-500 font-medium">
            ftcmanual guide
          </span>
        </div>
      )}

      {/* Main Content View Switcher */}
      <main className="flex-1 flex w-full">
        {currentView === 'home' && (
          <div className="flex-1 w-full">
            <ManualHome />
          </div>
        )}

        {currentView === 'reader' && (
          <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
            {/* Left Sidebar Tree */}
            <Sidebar 
              isMobileOpen={isMobileSidebarOpen} 
              onCloseMobile={() => setIsMobileSidebarOpen(false)} 
            />

            {/* Middle Main Content & Right TOC */}
            <ArticleView />
          </div>
        )}

        {currentView === 'editor' && (
          <div className="flex-1 w-full">
            <ArticleEditor />
          </div>
        )}

        {currentView === 'admin' && (
          <div className="flex-1 w-full">
            <AdminPortal />
          </div>
        )}
      </main>

      {/* Global Spotlight Search Modal */}
      <SearchModal />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

