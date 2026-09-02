import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  FileText, 
  Layers, 
  Users, 
  Activity, 
  Settings, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw, 
  Eye,
  Clock,
  UserPlus,
  LogOut
} from 'lucide-react';
import { Article, Category, UserRole } from '../types';
import { AdminAuth } from './AdminAuth';

export const AdminPortal: React.FC = () => {
  const {
    articles,
    categories,
    users,
    auditLogs,
    currentUser,
    adminInitialTab,
    togglePublishStatus,
    deleteArticle,
    openEditArticleEditor,
    openNewArticleEditor,
    saveCategory,
    deleteCategory,
    updateUserRole,
    addNewUser,
    toggleUserStatus,
    switchActiveUser,
    resetToDefaults,
    exportDatabaseJson,
    importDatabaseJson,
    setCurrentView,
    setActiveArticleId,
    isAuthenticated,
    logoutUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'categories' | 'access' | 'audit' | 'signup' | 'settings'>(
    !isAuthenticated ? 'signup' : (adminInitialTab || 'overview')
  );
  
  // Filters
  const [articleSearch, setArticleSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('contributor');
  const [newUserTeam, setNewUserTeam] = useState('');
  const [newUserSpecialty, setNewUserSpecialty] = useState('Hardware');

  const [importStatus, setImportStatus] = useState<string>('');

  const filteredArticles = articles.filter(a => {
    if (filterCategory !== 'all' && a.categoryId !== filterCategory) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (articleSearch) {
      const q = articleSearch.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.author.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.title) return;
    saveCategory(editingCategory);
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    addNewUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      teamNumber: newUserTeam || 'FTC Team',
      status: 'active',
      hardwareSpecialty: newUserSpecialty,
    });
    setIsUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('contributor');
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ftcmanual-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDatabaseJson(content);
        if (success) {
          setImportStatus('Restored.');
          setTimeout(() => setImportStatus(''), 2500);
        } else {
          setImportStatus('Invalid JSON format.');
        }
      }
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 min-h-[calc(100vh-4rem)] bg-slate-950 p-4 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full mb-3">
          <button
            onClick={() => setCurrentView('home')}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            ← Back to Manual
          </button>
        </div>
        <AdminAuth onSuccess={() => setActiveTab('overview')} />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg sm:text-xl font-bold font-['Outfit']">
                Management Portal
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Role: <span className="font-mono text-emerald-400 capitalize">{currentUser.role}</span> ({currentUser.name})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openNewArticleEditor}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Guide</span>
            </button>
            <button
              onClick={() => setCurrentView('home')}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg border border-slate-700 transition-colors"
            >
              Manual Home
            </button>
            <button
              onClick={() => {
                logoutUser();
                setCurrentView('home');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-300 hover:text-white hover:bg-red-900/60 bg-slate-800 rounded-lg border border-slate-700 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'overview' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'articles' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Guides ({articles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'categories' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Chapters ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('access')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'access' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Access ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('signup')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'signup' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Account</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'audit' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Audit</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'settings' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Backup</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Guides</span>
                <div className="text-2xl font-bold text-slate-900 mt-0.5">{articles.length}</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Chapters</span>
                <div className="text-2xl font-bold text-blue-600 mt-0.5">{categories.length}</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Members</span>
                <div className="text-2xl font-bold text-indigo-600 mt-0.5">{users.length}</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Current</span>
                <div className="text-sm font-mono font-bold text-emerald-600 mt-1 capitalize truncate">{currentUser.role}</div>
              </div>
            </div>

            {/* Quick action triggers */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">Actions</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={openNewArticleEditor}
                  className="p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left text-xs font-medium text-slate-800 transition-colors"
                >
                  + Author Guide
                </button>
                <button
                  onClick={() => setActiveTab('access')}
                  className="p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left text-xs font-medium text-slate-800 transition-colors"
                >
                  Manage Permissions
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left text-xs font-medium text-slate-800 transition-colors"
                >
                  Export Database
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Articles */}
        {activeTab === 'articles' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/60">
              <div className="flex items-center gap-1.5 flex-1 min-w-[200px] max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                  placeholder="Filter articles..."
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="all">All Chapters</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>

                <button
                  onClick={openNewArticleEditor}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white rounded transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>New</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Title</th>
                    <th className="px-3.5 py-2.5">Chapter</th>
                    <th className="px-3.5 py-2.5">Author</th>
                    <th className="px-3.5 py-2.5">Status</th>
                    <th className="px-3.5 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                        No guides found.
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map((art) => {
                      const category = categories.find(c => c.id === art.categoryId);
                      return (
                        <tr key={art.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3.5 py-2.5 font-semibold text-slate-900 truncate max-w-xs">
                            {art.title}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-600 truncate">
                            {category?.title || art.categoryId}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-600">
                            {art.author}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <button
                              onClick={() => togglePublishStatus(art.id)}
                              disabled={currentUser.role === 'contributor' || currentUser.role === 'viewer'}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                                art.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {art.status}
                            </button>
                          </td>
                          <td className="px-3.5 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { setActiveArticleId(art.id); setCurrentView('reader'); }}
                                className="p-1 text-slate-500 hover:text-blue-600 rounded"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditArticleEditor(art.id)}
                                className="p-1 text-blue-600 hover:text-blue-800 rounded"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {currentUser.role === 'admin' && (
                                <button
                                  onClick={() => setArticleToDelete(art)}
                                  className="p-1 text-red-600 hover:text-red-800 rounded hover:bg-red-50 transition-colors"
                                  title={`Delete "${art.title}" (Admin only)`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Chapters */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">
                Chapters
              </h3>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => {
                    setEditingCategory({ title: '', description: '', iconName: 'Wrench' });
                    setIsCategoryModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white rounded"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Chapter</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {categories.map((cat, idx) => {
                const count = articles.filter(a => a.categoryId === cat.id).length;
                return (
                  <div key={cat.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-500 w-4">{idx + 1}.</span>
                      <div>
                        <span className="font-bold text-slate-900">{cat.title}</span>
                        <span className="ml-2 text-slate-400">({count} articles)</span>
                      </div>
                    </div>

                    {currentUser.role === 'admin' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingCategory(cat); setIsCategoryModalOpen(true); }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Access */}
        {activeTab === 'access' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Members Directory</h4>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setIsUserModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white rounded"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Member</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Member</th>
                    <th className="px-3.5 py-2.5">Team</th>
                    <th className="px-3.5 py-2.5">Role</th>
                    <th className="px-3.5 py-2.5">Status</th>
                    <th className="px-3.5 py-2.5 text-right">Session</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3.5 py-2.5">
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-600 font-mono">
                        {user.teamNumber || '—'}
                      </td>
                      <td className="px-3.5 py-2.5">
                        {currentUser.role === 'admin' ? (
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-medium uppercase text-slate-800"
                          >
                            <option value="contributor">Contributor</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        ) : (
                          <span className="capitalize font-mono text-[11px] font-semibold">{user.role}</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          disabled={currentUser.role !== 'admin'}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            user.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.status}
                        </button>
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <button
                          onClick={() => switchActiveUser(user.id)}
                          className={`px-2 py-0.5 text-xs rounded transition-colors ${
                            user.id === currentUser.id ? 'bg-blue-600 text-white font-semibold' : 'text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {user.id === currentUser.id ? 'Active' : 'Switch'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Audit */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Audit Logs</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.slice(0, 20).map((log) => (
                <div key={log.id} className="py-2 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-800">{log.userName}: </span>
                    <span className="text-slate-600">{log.details}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Backup & Storage</h3>
            {importStatus && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
                {importStatus}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleDownloadBackup}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 text-left text-xs transition-colors"
              >
                <Download className="w-4 h-4 text-blue-600 mb-1" />
                <div className="font-bold text-slate-900">Export Backup</div>
                <div className="text-[11px] text-slate-500">Download JSON</div>
              </button>

              <label className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 text-left text-xs cursor-pointer transition-colors block">
                <Upload className="w-4 h-4 text-indigo-600 mb-1" />
                <div className="font-bold text-slate-900">Import Backup</div>
                <div className="text-[11px] text-slate-500">Restore JSON</div>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-3 rounded-lg border border-red-200 bg-red-50/40 hover:bg-red-50 text-left text-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-red-600 mb-1" />
                <div className="font-bold text-red-950">Reset Defaults</div>
                <div className="text-[11px] text-red-700">Clear all data</div>
              </button>
            </div>
          </div>
        )}

        {/* Tab 7: Sign Up */}
        {activeTab === 'signup' && (
          <div className="py-2">
            <AdminAuth onSuccess={() => setActiveTab('overview')} />
          </div>
        )}

      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveCategory} className="bg-white rounded-xl max-w-sm w-full p-4 border border-slate-200 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Chapter</h3>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={editingCategory?.title || ''}
                onChange={(e) => setEditingCategory(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={editingCategory?.description || ''}
                onChange={(e) => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <form onSubmit={handleAddUser} className="bg-white rounded-xl max-w-sm w-full p-4 border border-slate-200 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add Member</h3>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
              >
                <option value="contributor">Contributor</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Article Confirmation Modal */}
      {articleToDelete && (
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
              Are you sure you want to permanently delete <span className="font-semibold text-slate-900">"{articleToDelete.title}"</span> from the engineering manual?
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setArticleToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentUser.role === 'admin') {
                    deleteArticle(articleToDelete.id);
                  }
                  setArticleToDelete(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-500/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Article</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 font-['Outfit'] text-base">Reset Database</h3>
                <p className="text-xs text-slate-500">Reset manual data to default state</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to reset all articles and categories to their initial state?
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDefaults();
                  setShowResetConfirm(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-500/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
