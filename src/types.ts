export type UserRole = 'admin' | 'editor' | 'contributor' | 'viewer';

export type ArticleDifficulty = 'intermediate' | 'advanced' | 'elite';

export type ArticleStatus = 'published' | 'draft' | 'under_review' | 'archived';

export interface ArticleRevision {
  id: string;
  timestamp: string;
  author: string;
  summary: string;
  content: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  categoryId: string;
  difficulty: ArticleDifficulty;
  estimatedMinutes: number;
  author: string;
  authorRole?: string;
  lastUpdated: string;
  tags: string[];
  prerequisites: string[];
  content: string;
  order: number;
  status: ArticleStatus;
  likes: number;
  views: number;
  revisions?: ArticleRevision[];
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  iconName: string;
  description: string;
  order: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamNumber?: string;
  status: 'active' | 'suspended';
  lastActive: string;
  avatarUrl?: string;
  hardwareSpecialty?: string;
  joinedDate?: string;
  password?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'create_article' | 'update_article' | 'delete_article' | 'publish_article' | 'unpublish_article' | 'role_change' | 'category_update' | 'user_signup' | 'user_login';
  details: string;
  targetId?: string;
}

export interface TOCHeading {
  id: string;
  text: string;
  level: number;
}

