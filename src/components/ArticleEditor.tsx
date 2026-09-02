import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Save, 
  Eye, 
  Columns, 
  Edit3, 
  ArrowLeft, 
  Sparkles, 
  Lightbulb, 
  AlertTriangle, 
  Trophy, 
  Info, 
  Code, 
  Table, 
  List, 
  CheckSquare, 
  History, 
  Settings, 
  ShieldCheck, 
  Check, 
  Trash2,
  Share2,
  FileCode,
  Tag,
  Clock,
  Layers,
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Article, ArticleDifficulty, ArticleStatus, Category } from '../types';
import confetti from 'canvas-confetti';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ImageUploadModal } from './ImageUploadModal';

export const ArticleEditor: React.FC = () => {
  const {
    articles,
    categories,
    editingArticleId,
    saveArticle,
    deleteArticle,
    currentUser,
    setCurrentView,
    setActiveArticleId,
  } = useApp();

  // Find existing article or initialize blank
  const existingArticle = articles.find(a => a.id === editingArticleId);

  const [title, setTitle] = useState(existingArticle?.title || '');
  const [subtitle, setSubtitle] = useState(existingArticle?.subtitle || '');
  const [slug, setSlug] = useState(existingArticle?.slug || '');
  const [categoryId, setCategoryId] = useState(existingArticle?.categoryId || categories[0]?.id || '3d-printing');
  const [difficulty, setDifficulty] = useState<ArticleDifficulty>(existingArticle?.difficulty || 'intermediate');
  const [estimatedMinutes, setEstimatedMinutes] = useState(existingArticle?.estimatedMinutes || 12);
  const [author, setAuthor] = useState(existingArticle?.author || currentUser.name);
  const [authorRole, setAuthorRole] = useState(existingArticle?.authorRole || currentUser.hardwareSpecialty || 'Hardware Contributor');
  const [tagsInput, setTagsInput] = useState(existingArticle?.tags?.join(', ') || 'Hardware, Engineering');
  const [prereqsInput, setPrereqsInput] = useState(existingArticle?.prerequisites?.join(', ') || 'Basic Hand Tools');
  const [content, setContent] = useState(existingArticle?.content || `## 1. Overview & Objectives

Provide the technical background, mechanism overview, or fabrication techniques.

:::tip Pro Tip
Key manufacturing tolerance or assembly detail.
:::

---

## 2. Engineering Specifications
- **Tolerances:** ±0.15mm
- **Materials:** Aluminum 6061-T6 / Polycarbonate
- **Fasteners:** M3 / M4 BHCS with Loctite 242

\`\`\`
// Critical dimensions or configuration parameters
\`\`\`
`);

  const [status, setStatus] = useState<ArticleStatus>(existingArticle?.status || (currentUser.role === 'contributor' ? 'under_review' : 'published'));
  const [revisionSummary, setRevisionSummary] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Sync state if editingArticleId changes
  useEffect(() => {
    if (existingArticle) {
      setTitle(existingArticle.title);
      setSubtitle(existingArticle.subtitle || '');
      setSlug(existingArticle.slug || '');
      setCategoryId(existingArticle.categoryId);
      setDifficulty(existingArticle.difficulty);
      setEstimatedMinutes(existingArticle.estimatedMinutes);
      setAuthor(existingArticle.author);
      setAuthorRole(existingArticle.authorRole);
      setTagsInput(existingArticle.tags?.join(', ') || '');
      setPrereqsInput(existingArticle.prerequisites?.join(', ') || '');
      setContent(existingArticle.content);
      setStatus(existingArticle.status);
    }
  }, [editingArticleId]);

  // Auto-slug generator when title changes (if new article)
  useEffect(() => {
    if (!existingArticle && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  }, [title, existingArticle]);

  const handleInsertText = (before: string, after: string = '', defaultContent: string = '') => {
    const textarea = document.getElementById('article-content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || defaultContent;
    const replacement = before + selected + after;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  const handleInsertMarkdown = (textToInsert: string) => {
    const textarea = document.getElementById('article-content-textarea') as HTMLTextAreaElement;
    if (!textarea) {
      setContent(prev => prev + textToInsert);
      return;
    }

    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;
    const newContent = content.substring(0, start) + textToInsert + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 50);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
              const now = new Date();
              const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              handleInsertMarkdown(`\n\n![Pasted Mechanism Screenshot (${dateStr})](${dataUrl})\n\n`);
              setSaveSuccessMsg('Screenshot image inserted!');
              setTimeout(() => setSaveSuccessMsg(''), 3000);
            }
          };
          reader.readAsDataURL(file);
        }
        return;
      }
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          if (dataUrl) {
            const cleanName = file.name
              .replace(/\.[^/.]+$/, '')
              .replace(/[-_]/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
            handleInsertMarkdown(`\n\n![${cleanName}](${dataUrl})\n\n`);
            setSaveSuccessMsg(`Image "${cleanName}" inserted!`);
            setTimeout(() => setSaveSuccessMsg(''), 3000);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSave = (publishDirect: boolean = false) => {
    if (!title.trim()) {
      alert('Please provide an article title.');
      return;
    }

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const prerequisites = prereqsInput.split(',').map(p => p.trim()).filter(Boolean);
    const finalStatus: ArticleStatus = publishDirect ? 'published' : status;

    const saved = saveArticle({
      id: existingArticle?.id,
      title,
      subtitle,
      slug: slug || `article-${Date.now()}`,
      categoryId,
      difficulty,
      estimatedMinutes: Number(estimatedMinutes) || 10,
      author,
      authorRole,
      tags,
      prerequisites,
      content,
      status: finalStatus,
    }, revisionSummary || (existingArticle ? 'Updated technical parameters' : 'Created initial article'));

    setSaveSuccessMsg('Saved successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 2500);

    if (publishDirect) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }

    setActiveArticleId(saved.id);
  };

  const handleSaveAndExit = () => {
    handleSave();
    setCurrentView('reader');
  };

  const handleDelete = () => {
    if (!existingArticle || currentUser.role !== 'admin') return;
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!existingArticle || currentUser.role !== 'admin') return;
    const deletedId = existingArticle.id;
    deleteArticle(deletedId);
    setShowDeleteModal(false);
    const remaining = articles.filter(a => a.id !== deletedId);
    if (remaining.length > 0) {
      setActiveArticleId(remaining[0].id);
      setCurrentView('reader');
    } else {
      setActiveArticleId('');
      setCurrentView('home');
    }
  };

  const restoreRevision = (revContent: string, _revNote?: string) => {
    setContent(revContent);
    setIsHistoryModalOpen(false);
    setSaveSuccessMsg('Revision restored');
    setTimeout(() => setSaveSuccessMsg(''), 2500);
  };

  // Preview renderer using full MarkdownRenderer
  const renderPreview = () => {
    return (
      <div className="p-6 sm:p-8 bg-white min-h-full">
        <div className="mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
              {difficulty} Track
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {estimatedMinutes} min read
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">
              Category: {categories.find(c => c.id === categoryId)?.title}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] mb-2">
            {title || 'Untitled Article'}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-slate-600 font-normal">
              {subtitle}
            </p>
          )}
        </div>

        <MarkdownRenderer content={content} />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-100">
      
      {/* Top Editor Header */}
      <header className="h-14 bg-slate-900 border-b border-blue-950 px-4 flex items-center justify-between gap-3 text-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setCurrentView('reader')}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Back to Reader"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="min-w-0 flex-1 max-w-xs sm:max-w-md md:max-w-lg">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title (e.g. 3D Printed HTD Pulleys)..."
              className="w-full bg-slate-800/80 hover:bg-slate-800 text-sm sm:text-base font-semibold text-white placeholder-slate-400 px-3 py-1.5 rounded-lg border border-slate-700 focus:border-blue-500 focus:bg-slate-900 focus:outline-none transition-all"
            />
          </div>

          {saveSuccessMsg && (
            <span className="text-xs text-emerald-400 font-medium animate-in fade-in flex items-center gap-1 shrink-0">
              <Check className="w-3.5 h-3.5" />
              {saveSuccessMsg}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* View Mode Toggle - Responsive */}
          <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                viewMode === 'edit' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Markdown Edit Only"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Edit</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                viewMode === 'split' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Split View (Editor + Live Rendered Preview)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                viewMode === 'preview' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Full Rendered Preview"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Preview</span>
            </button>
          </div>

          {/* Revisions History Button */}
          {existingArticle?.revisions && existingArticle.revisions.length > 0 && (
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative"
              title="Version Revisions"
            >
              <History className="w-4 h-4" />
            </button>
          )}

          {/* Metadata Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isSidebarOpen ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Configure Article Metadata & Chapter"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Save Button */}
          <button
            onClick={() => handleSave(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>

          {/* Delete Article Button (Header) - Admin Only */}
          {existingArticle && currentUser.role === 'admin' && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 rounded-lg transition-colors"
              title="Delete this article (Admin only)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}

          {/* Publish / Submit CTA */}
          <button
            onClick={() => handleSave(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm shadow-blue-500/30 border border-blue-400/30 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentUser.role === 'contributor' ? 'Submit for Review' : 'Publish Article'}</span>
          </button>
        </div>
      </header>

      {/* Formatting Quick Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-1 overflow-x-auto text-xs text-slate-700 shrink-0">
        <button
          onClick={() => handleInsertText('**', '**', 'bold text')}
          className="p-1.5 hover:bg-slate-100 rounded font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          onClick={() => handleInsertText('*', '*', 'italic text')}
          className="p-1.5 hover:bg-slate-100 rounded italic"
          title="Italic"
        >
          I
        </button>
        <div className="h-4 w-px bg-slate-300 mx-1" />
        
        <button
          onClick={() => handleInsertText('## ', '\n', 'Section Title')}
          className="p-1.5 hover:bg-slate-100 rounded font-bold"
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => handleInsertText('### ', '\n', 'Subsection Title')}
          className="p-1.5 hover:bg-slate-100 rounded font-bold"
          title="Heading 3"
        >
          H3
        </button>
        <div className="h-4 w-px bg-slate-300 mx-1" />

        {/* Image / Diagram Inserter & Uploader */}
        <button
          type="button"
          onClick={() => setIsImageModalOpen(true)}
          className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded font-medium border border-emerald-200 transition-colors"
          title="Upload or Insert CAD Renders, Photos & Diagrams"
        >
          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>Insert Image</span>
        </button>
        <div className="h-4 w-px bg-slate-300 mx-1" />

        {/* Custom Callout Inserters */}
        <button
          onClick={() => handleInsertText(':::tip Advanced Insight\n', '\n:::\n', 'Write your pro engineering tip here.')}
          className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-medium"
          title="Insert Engineering Tip"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Tip</span>
        </button>

        <button
          onClick={() => handleInsertText(':::warning Hardware Pitfall\n', '\n:::\n', 'Warning about mechanism or electrical failure mode.')}
          className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded font-medium"
          title="Insert Warning Callout"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Warning</span>
        </button>

        <button
          onClick={() => handleInsertText(':::pro Championship Standard\n', '\n:::\n', 'World-class standard used by top alliance captains.')}
          className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-800 hover:bg-purple-100 rounded font-medium"
          title="Insert Pro Standard Callout"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Pro</span>
        </button>

        <button
          onClick={() => handleInsertText(':::math Mathematical Kinematics\n$$\n', '\n$$\n:::\n', '\\Delta \\theta = \\frac{\\Delta R - \\Delta L}{B}')}
          className="flex items-center gap-1 px-2 py-1 bg-slate-900 text-blue-300 hover:bg-slate-800 rounded font-mono"
          title="Insert Math Equation Block"
        >
          <span>f(x)</span>
        </button>
        <div className="h-4 w-px bg-slate-300 mx-1" />

        {/* Code Snippet & Tables */}
        <button
          onClick={() => handleInsertText('```java\n', '\n```\n', '// FTC SDK Java code here\npublic void init() {\n    \n}')}
          className="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded font-mono text-slate-800"
          title="Insert Java Code Block"
        >
          <Code className="w-3.5 h-3.5 text-blue-600" />
          <span>Java Code</span>
        </button>

        <button
          onClick={() => handleInsertText('| Parameter | Value | Notes |\n| :--- | :--- | :--- |\n| Gear Ratio | 19.2:1 | High torque |\n| Velocity | 1.8 m/s | Sprint speed |\n')}
          className="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded text-slate-800"
          title="Insert Table"
        >
          <Table className="w-3.5 h-3.5 text-indigo-600" />
          <span>Table</span>
        </button>

        <button
          onClick={() => handleInsertText('- [ ] Step 1: Calibration\n- [ ] Step 2: TeleOp verification\n')}
          className="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded text-slate-800"
          title="Insert Checklist"
        >
          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>Checklist</span>
        </button>
      </div>

      {/* Editor Main Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Editor / Preview Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Markdown Textarea */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={handleFileDrop}
              className={`relative flex-1 flex flex-col bg-slate-900 text-slate-100 ${viewMode === 'split' ? 'border-r border-slate-800' : ''}`}
            >
              <div className="px-4 py-1.5 bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>MARKDOWN SOURCE</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[10px] text-slate-500">Drag &amp; drop images or paste (Ctrl+V)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{content.length} chars • ~{Math.ceil(content.split(/\s+/).length / 200)} min</span>
                  {viewMode === 'edit' && (
                    <button
                      onClick={() => setViewMode('split')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded text-[10px] font-sans"
                    >
                      Show Preview
                    </button>
                  )}
                </div>
              </div>

              {/* Drag file active overlay */}
              {isDraggingFile && (
                <div className="absolute inset-0 z-20 bg-blue-900/80 backdrop-blur-xs border-2 border-dashed border-blue-400 flex flex-col items-center justify-center p-6 text-center text-white pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-blue-500/30 flex items-center justify-center mb-3">
                    <ImageIcon className="w-8 h-8 text-blue-300" />
                  </div>
                  <p className="text-base font-bold">Drop Image to Insert</p>
                  <p className="text-xs text-blue-200 mt-1">Image will be automatically converted and placed in the article</p>
                </div>
              )}

              <textarea
                id="article-content-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                placeholder="Write your technical guide in Markdown here... (Drag images or paste screenshots anytime)"
                className="flex-1 w-full p-4 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none selection:bg-blue-600"
                spellCheck={false}
              />
            </div>
          )}

          {/* Live Preview Pane */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="flex-1 overflow-y-auto bg-white">
              <div className="px-4 py-1.5 bg-slate-100 border-b border-slate-200 text-[11px] font-mono text-slate-500 flex items-center justify-between sticky top-0 z-10">
                <span className="font-semibold text-slate-700">LIVE RENDERED PREVIEW</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Markdown Rendering Active
                </span>
              </div>
              {renderPreview()}
            </div>
          )}

        </div>

        {/* Right Metadata Sidebar */}
        {isSidebarOpen && (
          <aside className="w-80 bg-white border-l border-slate-200 p-4 overflow-y-auto shrink-0 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider font-['Outfit']">
                Guide Metadata & Category
              </span>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                v2.4
              </span>
            </div>

            {/* Title Field in Sidebar for direct clarity */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Guide Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 3D Printed HTD Pulleys & Slicing"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subtitle / Summary</label>
              <textarea
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                rows={2}
                placeholder="Brief technical outcome description..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Chapter / Category */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Curriculum Chapter</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Track */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Difficulty Level</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['intermediate', 'advanced', 'elite'] as ArticleDifficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`py-1.5 rounded-lg capitalize font-medium transition-colors ${
                      difficulty === diff
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Read Time */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Read Time (Minutes)</label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 5)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tags (Comma Separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Odometry, Kinematics, Pedro..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Prerequisites */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prerequisites (Comma Separated)</label>
              <input
                type="text"
                value={prereqsInput}
                onChange={(e) => setPrereqsInput(e.target.value)}
                placeholder="Trigonometry, FTC SDK Basics..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Publication Status */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Publication Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                disabled={currentUser.role === 'contributor'}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="published">Published (Live to all readers)</option>
                <option value="draft">Draft (Private)</option>
                <option value="under_review">Under Review</option>
                <option value="archived">Archived</option>
              </select>
              {currentUser.role === 'contributor' && (
                <p className="text-[10px] text-amber-700 mt-1">
                  Contributors submit articles in "Under Review" status for Editor approval.
                </p>
              )}
            </div>

            {/* Revision Commit Note */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Revision Summary Note</label>
              <input
                type="text"
                value={revisionSummary}
                onChange={(e) => setRevisionSummary(e.target.value)}
                placeholder="e.g. Added dead axle deflection tolerance table"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Delete Article button (Admin only) */}
            {existingArticle && currentUser.role === 'admin' && (
              <div className="pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Article</span>
                </button>
              </div>
            )}

          </aside>
        )}

      </div>

      {/* Revision History Modal */}
      {isHistoryModalOpen && existingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 font-['Outfit']">Revision History</h3>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3">
              {existingArticle.revisions?.map((rev, idx) => (
                <div key={rev.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-xs text-slate-900">{rev.summary}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      By {rev.author} on {rev.timestamp}
                    </p>
                  </div>
                  <button
                    onClick={() => restoreRevision(rev.content, rev.summary)}
                    className="px-2.5 py-1 text-xs bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg font-medium"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Upload & Diagram Insertion Modal */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsertImage={(markdown) => {
          handleInsertMarkdown(markdown);
          setSaveSuccessMsg('Image inserted into article!');
          setTimeout(() => setSaveSuccessMsg(''), 3000);
        }}
      />

      {/* Delete Article Confirmation Modal (no window.confirm, 100% works in iframe) */}
      {showDeleteModal && existingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 font-['Outfit'] text-base">Delete Article</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-semibold text-slate-900">"{existingArticle.title}"</span> from the engineering manual?
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-500/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Article</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
