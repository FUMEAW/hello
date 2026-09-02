import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Article, Category, UserProfile, AuditLogEntry, UserRole } from '../types';
import { DEFAULT_ARTICLES, DEFAULT_CATEGORIES, DEFAULT_USERS } from '../data/defaultArticles';

interface AppContextType {
  articles: Article[];
  categories: Category[];
  activeArticle: Article | null;
  activeArticleId: string;
  currentUser: UserProfile;
  users: UserProfile[];
  auditLogs: AuditLogEntry[];
  bookmarks: string[];
  completedArticles: string[];
  currentView: 'home' | 'reader' | 'editor' | 'admin';
  adminInitialTab: 'overview' | 'articles' | 'categories' | 'access' | 'audit' | 'signup' | 'settings';
  editingArticleId: string | null;
  searchQuery: string;
  isSearchOpen: boolean;
  fontSize: 'sm' | 'base' | 'lg';
  isAuthenticated: boolean;
  
  // Actions
  setActiveArticleId: (id: string) => void;
  setCurrentView: (view: 'home' | 'reader' | 'editor' | 'admin') => void;
  setAdminInitialTab: (tab: 'overview' | 'articles' | 'categories' | 'access' | 'audit' | 'signup' | 'settings') => void;
  setIsSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFontSize: (size: 'sm' | 'base' | 'lg') => void;
  
  // Auth & Account Actions
  signUpUser: (data: {
    name: string;
    email: string;
    teamNumber: string;
    role: UserRole;
    hardwareSpecialty: string;
    passcode?: string;
  }) => { success: boolean; message: string; user?: UserProfile };
  loginUser: (email: string, passcode?: string) => { success: boolean; message: string; user?: UserProfile };
  logoutUser: () => void;
  switchActiveUser: (userId: string) => void;
  
  // Article CRUD
  saveArticle: (articleData: Partial<Article>, revisionNote?: string) => Article;
  deleteArticle: (id: string) => boolean;
  togglePublishStatus: (id: string) => void;
  likeArticle: (id: string) => void;
  openNewArticleEditor: () => void;
  openEditArticleEditor: (id: string) => void;
  
  // Category CRUD
  saveCategory: (catData: Partial<Category>) => void;
  deleteCategory: (id: string) => boolean;
  reorderCategories: (cats: Category[]) => void;
  
  // Access Management & Users
  updateUserRole: (userId: string, newRole: UserRole) => void;
  switchCurrentUserRole: (role: UserRole) => void;
  addNewUser: (user: Omit<UserProfile, 'id' | 'lastActive'>) => void;
  toggleUserStatus: (userId: string) => void;
  
  // Bookmarking & Learning Tracking
  toggleBookmark: (id: string) => void;
  toggleCompleted: (id: string) => void;
  
  // Data reset & export
  resetToDefaults: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ARTICLES: 'ftcmanual_articles_v6',
  CATEGORIES: 'ftcmanual_categories_v6',
  USERS: 'ftcmanual_users_v6',
  LOGS: 'ftcmanual_audit_v6',
  BOOKMARKS: 'ftcmanual_bookmarks_v6',
  COMPLETED: 'ftcmanual_completed_v6',
  CURRENT_USER_ID: 'ftcmanual_active_uid_v6',
  IS_AUTH: 'ftcmanual_is_auth_v6',
};

const PASSCODE_HASH = 'FTC2026';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Articles state - Starts empty (all placeholders removed)
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      return saved ? JSON.parse(saved) : DEFAULT_ARTICLES;
    } catch {
      return DEFAULT_ARTICLES;
    }
  });

  // Categories state
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  // Users state
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  // Current active user ID
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      return saved || 'usr-contributor-1';
    } catch {
      return 'usr-contributor-1';
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IS_AUTH);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : [
        {
          id: 'log-seed-1',
          timestamp: new Date().toLocaleString(),
          userId: 'usr-admin-owner',
          userName: 'System Lead',
          action: 'category_update',
          details: 'Initialized hardware chapters.',
        }
      ];
    } catch {
      return [];
    }
  });

  // Bookmarks & Completion
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [completedArticles, setCompletedArticles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPLETED);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // View state - Defaults to 'home'
  const [activeArticleId, setActiveArticleId] = useState<string>(() => {
    return articles.length > 0 ? articles[0].id : '';
  });

  const [currentView, setCurrentView] = useState<'home' | 'reader' | 'editor' | 'admin'>('home');
  const [adminInitialTab, setAdminInitialTab] = useState<'overview' | 'articles' | 'categories' | 'access' | 'audit' | 'signup' | 'settings'>('overview');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
    } catch (e) {
      console.error('Failed to save articles', e);
    }
  }, [articles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
    } catch (e) {
      console.error('Failed to save audit logs', e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to save bookmarks', e);
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(completedArticles));
    } catch (e) {
      console.error('Failed to save completed list', e);
    }
  }, [completedArticles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
      localStorage.setItem(STORAGE_KEYS.IS_AUTH, JSON.stringify(isAuthenticated));
    } catch (e) {
      console.error('Failed to save user id', e);
    }
  }, [currentUserId, isAuthenticated]);

  // Current active user object
  const currentUser: UserProfile = users.find(u => u.id === currentUserId) || users.find(u => u.role === 'contributor') || users[0] || {
    id: 'usr-contributor-1',
    name: 'Hardware Design Contributor',
    email: 'contributor@ftcmanual.org',
    role: 'contributor',
    teamNumber: 'FTC #16072',
    status: 'active',
    lastActive: 'Just now',
    hardwareSpecialty: '3D Printing & FDM Materials',
    joinedDate: '2026-01-10',
  };

  const addAuditLog = useCallback((action: AuditLogEntry['action'], details: string, targetId?: string) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      targetId,
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]);
  }, [currentUser]);

  // Auth Operations
  const signUpUser = (data: {
    name: string;
    email: string;
    teamNumber: string;
    role: UserRole;
    hardwareSpecialty: string;
    passcode?: string;
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    
    // Check if email already exists
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: 'Account with this email already exists.' };
    }

    const hasAuthKey = data.passcode?.trim() === PASSCODE_HASH;
    const finalRole: UserRole = hasAuthKey ? 'admin' : 'contributor';

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      role: finalRole,
      teamNumber: data.teamNumber.trim() || 'FTC Team',
      status: 'active',
      lastActive: 'Just now',
      hardwareSpecialty: data.hardwareSpecialty.trim() || 'Hardware',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
    
    addAuditLog('user_signup', `User registered: ${newUser.name} (${newUser.role})`, newUser.id);
    return { success: true, message: `Account created (${newUser.role}).`, user: newUser };
  };

  const loginUser = (email: string, passcode?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return { success: false, message: 'No registered user found. Please create an account.' };
    }
    if (found.status === 'suspended') {
      return { success: false, message: 'Account suspended.' };
    }

    setCurrentUserId(found.id);
    setIsAuthenticated(true);
    addAuditLog('user_login', `Login: ${found.name}`, found.id);
    return { success: true, message: `Welcome back, ${found.name}.`, user: found };
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    const guestUser = users.find(u => u.role === 'viewer') || {
      id: 'usr-guest-viewer',
      name: 'Guest Reader',
      email: 'guest@ftcmanual.org',
      role: 'viewer' as UserRole,
      teamNumber: 'Guest',
      status: 'active' as const,
      lastActive: 'Just now',
      hardwareSpecialty: 'Reading Documentation',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setCurrentUserId(guestUser.id);
  };

  const switchActiveUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUserId(found.id);
      setIsAuthenticated(true);
      addAuditLog('user_login', `Switched active session to user: ${found.name}`, found.id);
    }
  };

  // Find active article
  const activeArticle = articles.find(a => a.id === activeArticleId) || articles[0] || null;

  // Article CRUD
  const saveArticle = (articleData: Partial<Article>, revisionNote?: string): Article => {
    let savedArticle: Article;
    
    if (articleData.id) {
      // Update existing
      const existing = articles.find(a => a.id === articleData.id);
      const revision = {
        id: `rev-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        author: currentUser.name,
        summary: revisionNote || 'Updated hardware manual content and design specs',
        content: articleData.content || existing?.content || '',
      };

      savedArticle = {
        ...(existing || DEFAULT_ARTICLES[0]),
        ...articleData,
        lastUpdated: new Date().toISOString().split('T')[0],
        revisions: [revision, ...(existing?.revisions || [])],
      } as Article;

      setArticles(prev => prev.map(a => a.id === savedArticle.id ? savedArticle : a));
      addAuditLog('update_article', `Updated manual article: "${savedArticle.title}"`, savedArticle.id);
    } else {
      // Create new
      const newId = `art-${Date.now()}`;
      const slug = articleData.slug || (articleData.title ? articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `article-${Date.now()}`);
      
      savedArticle = {
        id: newId,
        slug,
        title: articleData.title || 'Untitled Hardware Engineering Guide',
        subtitle: articleData.subtitle || 'Hardware specifications, manufacturing tolerances, and CAD guidelines.',
        categoryId: articleData.categoryId || categories[0]?.id || '3d-printing',
        difficulty: articleData.difficulty || 'intermediate',
        estimatedMinutes: articleData.estimatedMinutes || 12,
        author: currentUser.name,
        authorRole: currentUser.hardwareSpecialty || (currentUser.role === 'admin' ? 'Lead Mechanical Architect' : 'Hardware Contributor'),
        lastUpdated: new Date().toISOString().split('T')[0],
        tags: articleData.tags || ['Hardware', '3D Printing'],
        prerequisites: articleData.prerequisites || ['Basic Workshop Tools'],
        content: articleData.content || '## 1. Subsystem Engineering Overview\n\nEnter advanced technical documentation here...',
        order: articles.length + 1,
        status: currentUser.role === 'contributor' ? 'under_review' : (articleData.status || 'published'),
        likes: 0,
        views: 1,
        revisions: [{
          id: `rev-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          author: currentUser.name,
          summary: 'Initial article creation',
          content: articleData.content || '',
        }],
      };

      setArticles(prev => [...prev, savedArticle]);
      setActiveArticleId(newId);
      addAuditLog('create_article', `Created new article: "${savedArticle.title}" in status [${savedArticle.status}]`, newId);
    }

    return savedArticle;
  };

  const deleteArticle = (id: string): boolean => {
    if (currentUser.role !== 'admin') {
      alert('Access Denied: Only administrators have permission to delete manual articles.');
      return false;
    }
    const target = articles.find(a => a.id === id);
    setArticles(prev => prev.filter(a => a.id !== id));
    if (activeArticleId === id) {
      const remaining = articles.filter(a => a.id !== id);
      if (remaining.length > 0) {
        setActiveArticleId(remaining[0].id);
      }
    }
    addAuditLog('delete_article', `Deleted article: "${target?.title || id}"`, id);
    return true;
  };

  const togglePublishStatus = (id: string) => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'editor') {
      alert('Access Denied: Only Admins and Editors can publish or unpublish articles.');
      return;
    }
    setArticles(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'published' ? 'draft' : 'published';
        addAuditLog(nextStatus === 'published' ? 'publish_article' : 'unpublish_article', `Changed status of "${a.title}" to ${nextStatus}`, id);
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  const likeArticle = (id: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, likes: a.likes + 1 } : a));
  };

  const openNewArticleEditor = () => {
    if (currentUser.role === 'viewer') {
      alert('Access Denied: Viewers cannot create articles. Please register or elevate your role in the access management settings.');
      return;
    }
    setEditingArticleId(null);
    setCurrentView('editor');
  };

  const openEditArticleEditor = (id: string) => {
    if (currentUser.role === 'viewer') {
      alert('Access Denied: Viewers cannot edit articles. Switch to an Editor or Admin account.');
      return;
    }
    setEditingArticleId(id);
    setCurrentView('editor');
  };

  // Category CRUD
  const saveCategory = (catData: Partial<Category>) => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'editor') {
      alert('Access Denied: Only Admins and Editors can configure manual chapters.');
      return;
    }
    if (catData.id) {
      setCategories(prev => prev.map(c => c.id === catData.id ? { ...c, ...catData } as Category : c));
      addAuditLog('category_update', `Updated chapter "${catData.title}"`, catData.id);
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        title: catData.title || 'New Hardware Section',
        slug: catData.slug || (catData.title ? catData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `cat-${Date.now()}`),
        iconName: catData.iconName || 'Wrench',
        description: catData.description || 'Advanced hardware engineering documentation.',
        order: categories.length + 1,
      };
      setCategories(prev => [...prev, newCat]);
      addAuditLog('category_update', `Created new manual chapter: "${newCat.title}"`, newCat.id);
    }
  };

  const deleteCategory = (id: string): boolean => {
    if (currentUser.role !== 'admin') {
      alert('Access Denied: Only Admins can delete manual chapters.');
      return false;
    }
    const hasArticles = articles.some(a => a.categoryId === id);
    if (hasArticles) {
      alert('Cannot delete category because it contains active articles. Please reassign or delete the articles first.');
      return false;
    }
    setCategories(prev => prev.filter(c => c.id !== id));
    addAuditLog('category_update', `Deleted chapter ID: ${id}`, id);
    return true;
  };

  const reorderCategories = (newCats: Category[]) => {
    if (currentUser.role !== 'admin') return;
    setCategories(newCats);
    addAuditLog('category_update', 'Reordered manual chapter sequence.');
  };

  // Access Management & Users
  const updateUserRole = (userId: string, newRole: UserRole) => {
    if (currentUser.role !== 'admin') {
      alert('Access Denied: Only administrators can modify user access roles.');
      return;
    }
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        addAuditLog('role_change', `Changed role for user ${u.name} (${u.email}) to [${newRole.toUpperCase()}]`, userId);
        return { ...u, role: newRole };
      }
      return u;
    }));
  };

  const switchCurrentUserRole = (role: UserRole) => {
    if (role === 'admin') {
      const adminUser = users.find(u => u.role === 'admin');
      if (adminUser) {
        setCurrentUserId(adminUser.id);
        setIsAuthenticated(true);
      }
      return;
    }

    const matchingUser = users.find(u => u.role === role);
    if (matchingUser) {
      setCurrentUserId(matchingUser.id);
    } else {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, role } : u));
    }
  };

  const addNewUser = (userData: Omit<UserProfile, 'id' | 'lastActive'>) => {
    if (currentUser.role !== 'admin') {
      alert('Access Denied: Only the Lead Administrator can add or invite team members.');
      return;
    }
    const newUser: UserProfile = {
      ...userData,
      id: `usr-${Date.now()}`,
      lastActive: 'Just now',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setUsers(prev => [...prev, newUser]);
    addAuditLog('role_change', `Added new team contributor: ${newUser.name} with role [${newUser.role.toUpperCase()}]`, newUser.id);
  };

  const toggleUserStatus = (userId: string) => {
    if (currentUser.role !== 'admin') return;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        addAuditLog('role_change', `Toggled account status for ${u.name} to ${nextStatus}`, userId);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  // Bookmarking
  const toggleBookmark = (id: string) => {
    setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const toggleCompleted = (id: string) => {
    setCompletedArticles(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  // Reset & Backup
  const resetToDefaults = () => {
    if (currentUser.role !== 'admin') {
      alert('Access Denied: Only the Lead Administrator can reset manual data.');
      return;
    }
    setArticles(DEFAULT_ARTICLES);
    setCategories(DEFAULT_CATEGORIES);
    setUsers(DEFAULT_USERS);
    setCurrentUserId('usr-contributor-1');
    setIsAuthenticated(true);
    setActiveArticleId(DEFAULT_ARTICLES[0].id);
    setBookmarks(['art-fdm-materials', 'art-silicone-shore-hardness']);
    setCompletedArticles([]);
    addAuditLog('category_update', 'Reset workspace scaffolding to default FTC hardware engineering manual.');
  };

  const exportDatabaseJson = (): string => {
    const data = {
      version: '3.0',
      exportDate: new Date().toISOString(),
      articles,
      categories,
      users,
      auditLogs,
    };
    return JSON.stringify(data, null, 2);
  };

  const importDatabaseJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.articles && Array.isArray(data.articles)) {
        setArticles(data.articles);
      }
      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
      if (data.users && Array.isArray(data.users)) {
        setUsers(data.users);
      }
      addAuditLog('category_update', 'Imported hardware manual backup database.');
      return true;
    } catch (e) {
      console.error('Invalid JSON backup file', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        articles,
        categories,
        activeArticle,
        activeArticleId,
        currentUser,
        users,
        auditLogs,
        bookmarks,
        completedArticles,
        currentView,
        adminInitialTab,
        editingArticleId,
        searchQuery,
        isSearchOpen,
        fontSize,
        isAuthenticated,
        setActiveArticleId,
        setCurrentView,
        setAdminInitialTab,
        setIsSearchOpen,
        setSearchQuery,
        setFontSize,
        signUpUser,
        loginUser,
        logoutUser,
        switchActiveUser,
        saveArticle,
        deleteArticle,
        togglePublishStatus,
        likeArticle,
        openNewArticleEditor,
        openEditArticleEditor,
        saveCategory,
        deleteCategory,
        reorderCategories,
        updateUserRole,
        switchCurrentUserRole,
        addNewUser,
        toggleUserStatus,
        toggleBookmark,
        toggleCompleted,
        resetToDefaults,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
