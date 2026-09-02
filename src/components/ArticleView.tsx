import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { TableOfContents } from './TableOfContents';
import { InteractiveTool } from './InteractiveTool';
import { 
  Clock, 
  User, 
  Calendar, 
  CheckCircle2, 
  Bookmark, 
  Share2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  ThumbsUp, 
  Sparkles, 
  AlertTriangle, 
  Lightbulb, 
  Info, 
  Trophy, 
  Calculator,
  Copy,
  Check,
  CheckCircle,
  Circle,
  ExternalLink,
  Code,
  BookOpen
} from 'lucide-react';
import { Article, TOCHeading } from '../types';
import confetti from 'canvas-confetti';

export const ArticleView: React.FC = () => {
  const {
    activeArticle,
    articles,
    categories,
    setActiveArticleId,
    currentUser,
    openEditArticleEditor,
    openNewArticleEditor,
    setCurrentView,
    bookmarks,
    toggleBookmark,
    completedArticles,
    toggleCompleted,
    likeArticle,
    fontSize,
  } = useApp();

  const [hasLiked, setHasLiked] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Extract headings for Table of Contents
  const headings: TOCHeading[] = useMemo(() => {
    if (!activeArticle) return [];
    const lines = activeArticle.content.split('\n');
    const result: TOCHeading[] = [];
    
    lines.forEach((line) => {
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);
      
      if (h2Match) {
        const text = h2Match[1].replace(/[\$\`\*]/g, '');
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        result.push({ id, text, level: 2 });
      } else if (h3Match) {
        const text = h3Match[1].replace(/[\$\`\*]/g, '');
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        result.push({ id, text, level: 3 });
      }
    });

    return result;
  }, [activeArticle]);

  if (!activeArticle) {
    return (
      <div className="flex-1 p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="max-w-md space-y-1">
          <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">No Guide Selected</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Select a guide from the sidebar chapters or return to the manual homepage to explore topics.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setCurrentView('home')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Manual Home
          </button>
          {currentUser.role !== 'viewer' && (
            <button
              onClick={() => openNewArticleEditor()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Draft New Guide
            </button>
          )}
        </div>
      </div>
    );
  }

  // Find active category
  const activeCategory = categories.find(c => c.id === activeArticle.categoryId);

  // Previous and Next articles navigation
  const currentIndex = articles.findIndex(a => a.id === activeArticle.id);
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  const isBookmarked = bookmarks.includes(activeArticle.id);
  const isCompleted = completedArticles.includes(activeArticle.id);

  const handleCompleteCelebration = () => {
    toggleCompleted(activeArticle.id);
    if (!isCompleted) {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#0F52BA', '#3B82F6', '#60A5FA', '#93C5FD', '#1E40AF'],
      });
    }
  };

  const copyCodeToClipboard = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Custom GM0 Markdown parser & callout rendering
  const renderFormattedMarkdown = (content: string) => {
    const rawBlocks = content.split('\n\n');
    let codeIndexTracker = 0;

    return rawBlocks.map((block, bIdx) => {
      const trimmed = block.trim();

      // Callout: :::tip ... :::
      if (trimmed.startsWith(':::tip') || trimmed.startsWith(':::note') || trimmed.startsWith(':::warning') || trimmed.startsWith(':::pro') || trimmed.startsWith(':::math')) {
        const lines = trimmed.split('\n');
        const firstLine = lines[0];
        const type = firstLine.startsWith(':::tip') ? 'tip' : 
                     firstLine.startsWith(':::warning') ? 'warning' :
                     firstLine.startsWith(':::pro') ? 'pro' :
                     firstLine.startsWith(':::math') ? 'math' : 'note';
        
        const titleMatch = firstLine.match(/:::\w+\s*(.*)/);
        const title = titleMatch && titleMatch[1] ? titleMatch[1] : 
                      type === 'tip' ? 'Advanced Engineering Tip' :
                      type === 'warning' ? 'Critical Pitfall & Warning' :
                      type === 'pro' ? 'Championship Standard' :
                      type === 'math' ? 'Mathematical Formulation' : 'Important Note';
        
        const bodyLines = lines.slice(1, lines[lines.length - 1].startsWith(':::') ? lines.length - 1 : lines.length).join('\n');

        const calloutStyles = {
          tip: {
            bg: 'bg-blue-50/90 border-blue-300 text-blue-950',
            icon: <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
            badge: 'bg-blue-600 text-white',
          },
          warning: {
            bg: 'bg-amber-50/90 border-amber-300 text-amber-950',
            icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
            badge: 'bg-amber-600 text-white',
          },
          pro: {
            bg: 'bg-indigo-50/90 border-indigo-300 text-indigo-950',
            icon: <Trophy className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />,
            badge: 'bg-indigo-600 text-white',
          },
          math: {
            bg: 'bg-slate-900 border-blue-800 text-slate-100 shadow-md',
            icon: <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />,
            badge: 'bg-blue-700 text-white',
          },
          note: {
            bg: 'bg-slate-100 border-slate-300 text-slate-900',
            icon: <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />,
            badge: 'bg-slate-700 text-white',
          },
        }[type];

        return (
          <div key={bIdx} className={`my-5 p-4 rounded-xl border ${calloutStyles.bg} shadow-xs`}>
            <div className="flex items-start gap-3">
              {calloutStyles.icon}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm tracking-tight mb-1 flex items-center gap-2">
                  <span>{title}</span>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {bodyLines}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Code blocks: ```java ... ```
      if (trimmed.startsWith('```')) {
        const lines = trimmed.split('\n');
        const lang = lines[0].replace('```', '').trim() || 'java';
        const code = lines.slice(1, lines.length - 1).join('\n');
        const currentIndex = codeIndexTracker++;

        return (
          <div key={bIdx} className="my-6 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-blue-400" />
                <span className="uppercase text-slate-300 font-semibold">{lang}</span>
              </div>
              <button
                onClick={() => copyCodeToClipboard(code, currentIndex)}
                className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors text-[11px]"
              >
                {copiedCodeIndex === currentIndex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs sm:text-sm font-mono text-slate-100 overflow-x-auto leading-relaxed selection:bg-blue-600">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Headings: ## or ###
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace('## ', '');
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return (
          <h2 key={bIdx} id={id} className="text-xl sm:text-2xl font-bold text-slate-900 mt-10 mb-4 pb-2 border-b border-slate-200 scroll-mt-20 font-['Outfit']">
            {text}
          </h2>
        );
      }

      if (trimmed.startsWith('### ')) {
        const text = trimmed.replace('### ', '');
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return (
          <h3 key={bIdx} id={id} className="text-lg font-bold text-blue-900 mt-6 mb-2 scroll-mt-20 font-['Outfit']">
            {text}
          </h3>
        );
      }

      // Markdown Tables
      if (trimmed.includes('|') && trimmed.split('\n').length > 1) {
        const tableLines = trimmed.split('\n').filter(l => l.trim().startsWith('|'));
        if (tableLines.length >= 2) {
          const headerCols = tableLines[0].split('|').map(c => c.trim()).filter(Boolean);
          const bodyRows = tableLines.slice(2).map(r => r.split('|').map(c => c.trim()).filter(Boolean));

          return (
            <div key={bIdx} className="my-6 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900 text-white font-semibold">
                  <tr>
                    {headerCols.map((hc, i) => (
                      <th key={i} className="px-4 py-3 font-medium tracking-wider">{hc}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-3 text-slate-700">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
      }

      // Lists: - or 1.
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').map(l => l.replace(/^[-*]\s+/, ''));
        return (
          <ul key={bIdx} className="my-4 pl-5 list-disc space-y-1.5 text-slate-700 text-sm sm:text-base leading-relaxed">
            {items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        );
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const items = trimmed.split('\n').map(l => l.replace(/^\d+\.\s+/, ''));
        return (
          <ol key={bIdx} className="my-4 pl-5 list-decimal space-y-1.5 text-slate-700 text-sm sm:text-base leading-relaxed">
            {items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ol>
        );
      }

      // Default Paragraph
      return (
        <p key={bIdx} className="my-4 text-slate-700 leading-relaxed text-sm sm:text-base font-normal">
          {trimmed}
        </p>
      );
    });
  };

  const fontSizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  }[fontSize];

  return (
    <div className="flex-1 flex justify-center py-6 px-4 sm:px-8 lg:px-12 bg-white min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-4xl min-w-0">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6 flex-wrap">
          <button 
            onClick={() => setActiveArticleId(articles[0].id)}
            className="hover:text-blue-600 transition-colors"
          >
            ftcmanual
          </button>
          <span>/</span>
          <span className="text-slate-700">{activeCategory?.title || 'Guides'}</span>
          <span>/</span>
          <span className="text-blue-600 font-semibold truncate max-w-xs">{activeArticle.title}</span>
        </div>

        {/* Article Header Card */}
        <header className="border-b border-slate-200 pb-6 mb-8">
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              activeArticle.difficulty === 'elite' 
                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                : activeArticle.difficulty === 'advanced'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {activeArticle.difficulty} Track
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {activeArticle.estimatedMinutes} min read
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Updated {activeArticle.lastUpdated}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] mb-3 leading-tight">
            {activeArticle.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal mb-5">
            {activeArticle.subtitle}
          </p>

          {/* Author & Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                {activeArticle.author.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{activeArticle.author}</p>
                <p className="text-[11px] text-slate-500">{activeArticle.authorRole || 'FTC Engineering Contributor'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCompleteCelebration}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                }`}
              >
                {isCompleted ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4 text-slate-400" />}
                <span>{isCompleted ? 'Mastered' : 'Mark as Mastered'}</span>
              </button>

              <button
                onClick={() => toggleBookmark(activeArticle.id)}
                className={`p-2 rounded-lg border transition-colors ${
                  isBookmarked
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }`}
                title="Bookmark for match prep"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`} />
              </button>

              {currentUser.role !== 'viewer' && (
                <button
                  onClick={() => openEditArticleEditor(activeArticle.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                  title="Edit article"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Prerequisites Banner */}
        {activeArticle.prerequisites && activeArticle.prerequisites.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-slate-900 block mb-1">
                Recommended Prerequisites for this Technical Module:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeArticle.prerequisites.map((prereq, idx) => (
                  <span key={idx} className="bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 text-xs font-medium">
                    ✓ {prereq}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Formatted Article Content */}
        <div className={`article-prose ${fontSizeClasses}`}>
          {renderFormattedMarkdown(activeArticle.content)}
        </div>

        {/* Embedded Subsystem Calculator */}
        <InteractiveTool />

        {/* Article Feedback & Reaction Bar */}
        <div className="my-10 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base font-['Outfit']">
              Did this guide help level up your subsystem?
            </h4>
            <p className="text-xs text-slate-500">
              Your feedback shapes advanced FTC documentation and community benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!hasLiked) {
                  likeArticle(activeArticle.id);
                  setHasLiked(true);
                  confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                hasLiked
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{hasLiked ? 'Helpful!' : 'Helpful'}</span>
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-900 rounded-full text-[10px] font-mono">
                {activeArticle.likes}
              </span>
            </button>
          </div>
        </div>

        {/* Previous & Next Article Navigation Cards */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 pt-6 border-t border-slate-200">
          {prevArticle ? (
            <button
              onClick={() => setActiveArticleId(prevArticle.id)}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left group"
            >
              <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Previous Guide
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate block">
                  {prevArticle.title}
                </span>
              </div>
            </button>
          ) : (
            <div />
          )}

          {nextArticle && (
            <button
              onClick={() => setActiveArticleId(nextArticle.id)}
              className="flex items-center justify-end text-right gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Next Guide
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate block">
                  {nextArticle.title}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </button>
          )}
        </nav>

      </div>

      {/* Right Table of Contents */}
      <TableOfContents headings={headings} />

    </div>
  );
};
