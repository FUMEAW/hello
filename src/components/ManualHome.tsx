import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Printer, 
  Boxes, 
  Wrench, 
  Compass, 
  Layers, 
  ArrowRight, 
  FileText
} from 'lucide-react';

export const ManualHome: React.FC = () => {
  const {
    categories,
    articles,
    setActiveArticleId,
    setCurrentView,
    openNewArticleEditor,
    setIsSearchOpen,
    currentUser,
  } = useApp();

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Printer':
        return <Printer className="w-4 h-4 text-blue-600" />;
      case 'Boxes':
        return <Boxes className="w-4 h-4 text-indigo-600" />;
      case 'Wrench':
        return <Wrench className="w-4 h-4 text-emerald-600" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-amber-600" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-purple-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-blue-600" />;
    }
  };

  const getCategoryTopics = (categoryId: string): string[] => {
    switch (categoryId) {
      case '3d-printing':
        return ['FDM Filaments (PLA+, PETG, TPU, PA-CF)', 'Slicing Perimeters & Wall Rigidity', 'Heat-Set Brass Inserts (M3/M4)', 'Printed HTD Pulleys'];
      case 'molding-casting':
        return ['Silicone Shore Hardness (20A–60A)', 'Clamshell Mold Design & Draft', 'Vacuum Degassing & Pouring', 'Hub Overmolding'];
      case 'hardware-materials':
        return ['Aluminum 6061-T6 vs 7075-T6', 'Polycarbonate Cold-Bending', 'Delrin Bushings', 'Fasteners & Anti-Vibration'];
      case 'drivebase-motion':
        return ['Plate & Tube Chassis', 'Bellypan Shear Webs', '8mm REX Shafting', 'Bearing Distribution'];
      case 'power-transmission-slides':
        return ['HTD 3M / 5M Center-to-Center', '#25 Chain Tensioning', 'Linear Slide Rigging', 'UHMWPE Cord Routing'];
      default:
        return ['Design Guidelines', 'Tolerancing'];
    }
  };

  return (
    <div className="flex-1 w-full bg-slate-50 overflow-y-auto pb-12">
      
      {/* Hero */}
      <div className="bg-slate-900 text-white border-b border-slate-800 pt-8 pb-9 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-4">
          
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Hardware Manual
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
              v3.0
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] text-white">
              FTC Hardware Engineering Manual
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              helping intermediate teams reach an advanced level
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 max-w-md pt-1">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <span className="text-[10px] text-slate-400 block font-medium">Chapters</span>
              <span className="text-sm font-bold font-['Outfit'] text-white">5 Sections</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <span className="text-[10px] text-slate-400 block font-medium">Guides</span>
              <span className="text-sm font-bold font-['Outfit'] text-blue-400">
                {articles.filter(a => a.status === 'published').length} Active
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <span className="text-[10px] text-slate-400 block font-medium">Role</span>
              <span className="text-sm font-mono font-bold text-emerald-400 capitalize block">
                {currentUser.role}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => openNewArticleEditor()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Draft Guide</span>
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span>Search (⌘K)</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-6 space-y-8">
        
        {/* Empty state notice */}
        {articles.length === 0 && (
          <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-slate-600">Manual workspace ready for new technical guides.</span>
            </div>
            <button
              onClick={() => openNewArticleEditor()}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded text-xs shrink-0 transition-colors"
            >
              + Write Guide
            </button>
          </div>
        )}

        {/* Chapters */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 font-['Outfit']">
              Curriculum Chapters
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              {categories.length} Sections
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {categories.map((category) => {
              const categoryArticles = articles.filter(a => a.categoryId === category.id);
              const topics = getCategoryTopics(category.id);

              return (
                <div 
                  key={category.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200">
                          {getCategoryIcon(category.iconName)}
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">
                          {category.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {categoryArticles.length}
                      </span>
                    </div>

                    <div className="pt-1">
                      <ul className="space-y-1">
                        {topics.map((topic, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                            <div className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                            <span className="truncate">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {categoryArticles.length > 0 && (
                      <div className="pt-2 space-y-1">
                        {categoryArticles.map((article) => (
                          <button
                            key={article.id}
                            onClick={() => {
                              setActiveArticleId(article.id);
                              setCurrentView('reader');
                            }}
                            className="w-full flex items-center justify-between p-1.5 rounded bg-slate-50 hover:bg-blue-50 text-left text-xs text-slate-800 hover:text-blue-700 font-medium transition-colors border border-slate-200/60"
                          >
                            <span className="truncate">{article.title}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => openNewArticleEditor()}
                      className="text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      + Draft Guide
                    </button>

                    {categoryArticles.length > 0 ? (
                      <button
                        onClick={() => {
                          setActiveArticleId(categoryArticles[0].id);
                          setCurrentView('reader');
                        }}
                        className="text-[11px] font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1 transition-colors"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">Empty</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};
