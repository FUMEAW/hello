import { Article, Category, UserProfile } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: '3d-printing',
    title: '1. Custom Manufacturing: 3D Printing',
    slug: '3d-printing',
    iconName: 'Printer',
    description: 'FDM material selection, slicing strength, heat-set inserts, TPU compliance, and printed power transmission.',
    order: 1,
  },
  {
    id: 'molding-casting',
    title: '2. Custom Manufacturing: Molding & Casting',
    slug: 'molding-casting',
    iconName: 'Boxes',
    description: 'Silicone & urethane casting, Shore durometers (20A–60A), CAD mold geometry, degassing, and hex core inserts.',
    order: 2,
  },
  {
    id: 'hardware-materials',
    title: '3. Hardware Fundamentals & Materials',
    slug: 'hardware-materials',
    iconName: 'Wrench',
    description: 'Aluminum 6061 vs 7075, Polycarbonate, Delrin, Carbon Fiber, and anti-vibration fastening standards.',
    order: 3,
  },
  {
    id: 'drivebase-motion',
    title: '4. Drivebases & Structural Hardware',
    slug: 'drivebase-motion',
    iconName: 'Compass',
    description: 'Chassis framing, 8mm REX vs hex shafting, flanged ball bearings, and ground clearance optimization.',
    order: 4,
  },
  {
    id: 'power-transmission-slides',
    title: '5. Power Transmission & Linear Slides',
    slug: 'power-transmission-slides',
    iconName: 'Layers',
    description: 'HTD 3M/5M timing belts, #25 chain center-to-center pitch, and SAR330 / Misumi slide rigging with UHMWPE.',
    order: 5,
  },
];

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'usr-admin-owner',
    name: 'Bubblotics Admin',
    email: 'bubblotics@gmail.com',
    role: 'admin',
    teamNumber: 'Bubblotics Lead',
    status: 'active',
    lastActive: 'Just now',
    hardwareSpecialty: 'Lead Hardware Architect',
    joinedDate: '2025-09-01',
    password: 'lovebubbles',
  },
  {
    id: 'usr-contributor-1',
    name: 'Manufacturing Lead',
    email: 'contributor@ftcmanual.org',
    role: 'contributor',
    teamNumber: 'FTC #16072',
    status: 'active',
    lastActive: '1 hour ago',
    hardwareSpecialty: '3D Printing & FDM Materials',
    joinedDate: '2026-01-10',
  },
  {
    id: 'usr-contributor-2',
    name: 'Tooling Specialist',
    email: 'tooling@ftcmanual.org',
    role: 'contributor',
    teamNumber: 'FTC #8680',
    status: 'active',
    lastActive: '2 hours ago',
    hardwareSpecialty: 'Silicone Molding & CNC',
    joinedDate: '2025-10-15',
  },
  {
    id: 'usr-guest-viewer',
    name: 'Guest Reader',
    email: 'guest@ftcmanual.org',
    role: 'viewer',
    teamNumber: 'Guest',
    status: 'active',
    lastActive: 'Just now',
    hardwareSpecialty: 'Reading Documentation',
    joinedDate: '2026-03-01',
  },
];

export const DEFAULT_ARTICLES: Article[] = [];

