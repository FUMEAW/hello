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
  HelpCircle
} from 'lucide-react';
import { Article, ArticleDifficulty, ArticleStatus, Category } from '../types';
import confetti from 'canvas-confetti';

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
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

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
    if (!existingArticle) return;
    if (confirm(`Are you sure you want to delete "${existingArticle.title}"? This cannot be undone.`)) {
      deleteArticle(existingArticle.id);
      setCurrentView('reader');
    }
  };

  const restoreRevision = (revContent: string, revNote: string) => {
    if (confirm(`Restore to revision "${revNote}"? Current unsaved changes will be overwritten.`)) {
      setContent(revContent);
      setIsHistoryModalOpen(false);
    }
  };

  // Preview renderer
  const renderPreview = () => {
    return (
      <div className="p-6 bg-white min-h-full article-prose text-sm sm:text-base">
        <div className="mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
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
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            {subtitle || 'Subsystem design and modeling guide.'}
          </p>
        </div>

        {content.split('\n\n').map((block, idx) => {
          const trimmed = block.trim();
          if (trimmed.startsWith(':::tip') || trimmed.startsWith(':::warning') || trimmed.startsWith(':::pro') || trimmed.startsWith(':::math') || trimmed.startsWith(':::note')) {
            return (
              <div key={idx} className="my-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950">
                <p className="font-bold text-xs mb-1">Custom Callout Block</p>
                <div className="text-sm whitespace-pre-wrap">{trimmed}</div>
              </div>
            );
          }
          if (trimmed.startsWith('```')) {
            return (
              <pre key={idx} className="my-4 p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto">
                {trimmed}
              </pre>
            );
          }
          if (trimmed.startsWith('## ')) {
            return <h2 key={idx} className="text-xl font-bold text-slate-900 mt-6 mb-3">{trimmed.replace('## ', '')}</h2>;
          }
          if (trimmed.startsWith('### ')) {
            return <h3 key={idx} className="text-lg font-bold text-blue-900 mt-4 mb-2">{trimmed.replace('### ', '')}</h3>;
          }
          return <p key={idx} className="my-3 text-slate-700">{trimmed}</p>;
        })}
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
          
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                viewMode === 'edit' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                viewMode === 'split' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                viewMode === 'preview' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
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
            <div className={`flex-1 flex flex-col bg-slate-900 text-slate-100 ${viewMode === 'split' ? 'border-r border-slate-800' : ''}`}>
              <div className="px-4 py-1.5 bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>MARKDOWN EDITOR</span>
                <span>{content.length} characters • ~{Math.ceil(content.split(/\s+/).length / 200)} min read</span>
              </div>
              <textarea
                id="article-content-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your technical guide here..."
                className="flex-1 w-full p-4 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none selection:bg-blue-600"
                spellCheck={false}
              />
            </div>
          )}

          {/* Live Preview Pane */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="flex-1 overflow-y-auto bg-white">
              <div className="px-4 py-1.5 bg-slate-100 border-b border-slate-200 text-[11px] font-mono text-slate-500 flex items-center justify-between sticky top-0 z-10">
                <span>LIVE PREVIEW</span>
                <span className="text-emerald-700 font-semibold">Real-time sync</span>
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
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 font-semibold transition-colors"
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

    </div>
  );
};
