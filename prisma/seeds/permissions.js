import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });

import { prisma } from '@skill-learn/database';

/**
 * Comprehensive permissions catalog for multi-tenant RBAC system
 * Categories organize permissions for easier management in the UI
 */
const PERMISSIONS = [
  // ============================================
  // USER MANAGEMENT
  // ============================================
  { 
    name: 'users.create', 
    displayName: 'Create Users', 
    category: 'users',
    description: 'Permission to create new users in the tenant'
  },
  { 
    name: 'users.read', 
    displayName: 'View Users', 
    category: 'users',
    description: 'Permission to view user profiles and information'
  },
  { 
    name: 'users.update', 
    displayName: 'Edit Users', 
    category: 'users',
    description: 'Permission to modify user information'
  },
  { 
    name: 'users.delete', 
    displayName: 'Delete Users', 
    category: 'users',
    description: 'Permission to remove users from the tenant'
  },
  { 
    name: 'users.import', 
    displayName: 'Import Users', 
    category: 'users',
    description: 'Permission to bulk import users'
  },
  { 
    name: 'users.export', 
    displayName: 'Export Users', 
    category: 'users',
    description: 'Permission to export user data'
  },

  // ============================================
  // QUIZ MANAGEMENT
  // ============================================
  { 
    name: 'quizzes.create', 
    displayName: 'Create Quizzes', 
    category: 'quizzes',
    description: 'Permission to create new quizzes'
  },
  { 
    name: 'quizzes.read', 
    displayName: 'View Quizzes', 
    category: 'quizzes',
    description: 'Permission to view quiz details and questions'
  },
  { 
    name: 'quizzes.update', 
    displayName: 'Edit Quizzes', 
    category: 'quizzes',
    description: 'Permission to modify existing quizzes'
  },
  { 
    name: 'quizzes.delete', 
    displayName: 'Delete Quizzes', 
    category: 'quizzes',
    description: 'Permission to remove quizzes'
  },
  { 
    name: 'quizzes.publish', 
    displayName: 'Publish Quizzes', 
    category: 'quizzes',
    description: 'Permission to publish or unpublish quizzes'
  },
  { 
    name: 'quizzes.assign', 
    displayName: 'Assign Quizzes', 
    category: 'quizzes',
    description: 'Permission to assign quizzes to users/groups'
  },
  { 
    name: 'quizzes.grade', 
    displayName: 'Grade Quizzes', 
    category: 'quizzes',
    description: 'Permission to grade quiz submissions'
  },

  // ============================================
  // COURSE MANAGEMENT
  // ============================================
  { 
    name: 'courses.create', 
    displayName: 'Create Courses', 
    category: 'courses',
    description: 'Permission to create new courses'
  },
  { 
    name: 'courses.read', 
    displayName: 'View Courses', 
    category: 'courses',
    description: 'Permission to view course details'
  },
  { 
    name: 'courses.update', 
    displayName: 'Edit Courses', 
    category: 'courses',
    description: 'Permission to modify existing courses'
  },
  { 
    name: 'courses.delete', 
    displayName: 'Delete Courses', 
    category: 'courses',
    description: 'Permission to remove courses'
  },
  { 
    name: 'courses.publish', 
    displayName: 'Publish Courses', 
    category: 'courses',
    description: 'Permission to publish or unpublish courses'
  },
  { 
    name: 'courses.assign', 
    displayName: 'Assign Courses', 
    category: 'courses',
    description: 'Permission to assign courses to users/groups'
  },

  // ============================================
  // CATEGORY MANAGEMENT
  // ============================================
  { 
    name: 'categories.create', 
    displayName: 'Create Categories', 
    category: 'categories',
    description: 'Permission to create new categories'
  },
  { 
    name: 'categories.read', 
    displayName: 'View Categories', 
    category: 'categories',
    description: 'Permission to view categories'
  },
  { 
    name: 'categories.update', 
    displayName: 'Edit Categories', 
    category: 'categories',
    description: 'Permission to modify existing categories'
  },
  { 
    name: 'categories.delete', 
    displayName: 'Delete Categories', 
    category: 'categories',
    description: 'Permission to remove categories'
  },

  // ============================================
  // REWARDS MANAGEMENT
  // ============================================
  { 
    name: 'rewards.create', 
    displayName: 'Create Rewards', 
    category: 'rewards',
    description: 'Permission to create new rewards'
  },
  { 
    name: 'rewards.read', 
    displayName: 'View Rewards', 
    category: 'rewards',
    description: 'Permission to view reward details'
  },
  { 
    name: 'rewards.update', 
    displayName: 'Edit Rewards', 
    category: 'rewards',
    description: 'Permission to modify existing rewards'
  },
  { 
    name: 'rewards.delete', 
    displayName: 'Delete Rewards', 
    category: 'rewards',
    description: 'Permission to remove rewards'
  },
  { 
    name: 'rewards.approve', 
    displayName: 'Approve Redemptions', 
    category: 'rewards',
    description: 'Permission to approve or reject reward redemptions'
  },
  { 
    name: 'rewards.fulfill', 
    displayName: 'Fulfill Rewards', 
    category: 'rewards',
    description: 'Permission to mark rewards as fulfilled'
  },
  { 
    name: 'rewards.redeem', 
    displayName: 'Redeem Rewards', 
    category: 'rewards',
    description: 'Permission to redeem rewards'
  },

  // ============================================
  // POINTS MANAGEMENT
  // ============================================
  { 
    name: 'points.view', 
    displayName: 'View Points', 
    category: 'points',
    description: 'Permission to view user points'
  },
  { 
    name: 'points.grant', 
    displayName: 'Grant Points', 
    category: 'points',
    description: 'Permission to manually award points to users'
  },
  { 
    name: 'points.deduct', 
    displayName: 'Deduct Points', 
    category: 'points',
    description: 'Permission to deduct points from users'
  },
  { 
    name: 'points.history', 
    displayName: 'View Points History', 
    category: 'points',
    description: 'Permission to view points transaction history'
  },

  // ============================================
  // GAMES MANAGEMENT
  // ============================================
  { 
    name: 'games.create', 
    displayName: 'Create Games', 
    category: 'games',
    description: 'Permission to create new games'
  },
  { 
    name: 'games.read', 
    displayName: 'View Games', 
    category: 'games',
    description: 'Permission to view game details'
  },
  { 
    name: 'games.update', 
    displayName: 'Edit Games', 
    category: 'games',
    description: 'Permission to modify existing games'
  },
  { 
    name: 'games.delete', 
    displayName: 'Delete Games', 
    category: 'games',
    description: 'Permission to remove games'
  },
  { 
    name: 'games.play', 
    displayName: 'Play Games', 
    category: 'games',
    description: 'Permission to play games'
  },

  // ============================================
  // REPORTS & ANALYTICS
  // ============================================
  { 
    name: 'reports.view', 
    displayName: 'View Reports', 
    category: 'reports',
    description: 'Permission to view reports and analytics'
  },
  { 
    name: 'reports.export', 
    displayName: 'Export Reports', 
    category: 'reports',
    description: 'Permission to export report data'
  },
  { 
    name: 'reports.create', 
    displayName: 'Create Custom Reports', 
    category: 'reports',
    description: 'Permission to create custom reports'
  },
  { 
    name: 'reports.schedule', 
    displayName: 'Schedule Reports', 
    category: 'reports',
    description: 'Permission to schedule automated reports'
  },

  // ============================================
  // LEADERBOARD
  // ============================================
  { 
    name: 'leaderboard.view', 
    displayName: 'View Leaderboard', 
    category: 'leaderboard',
    description: 'Permission to view the leaderboard'
  },
  { 
    name: 'leaderboard.manage', 
    displayName: 'Manage Leaderboard', 
    category: 'leaderboard',
    description: 'Permission to manage leaderboard settings'
  },

  // ============================================
  // AUDIT LOGS
  // ============================================
  { 
    name: 'audit.view', 
    displayName: 'View Audit Logs', 
    category: 'audit',
    description: 'Permission to view audit logs'
  },
  { 
    name: 'audit.export', 
    displayName: 'Export Audit Logs', 
    category: 'audit',
    description: 'Permission to export audit logs'
  },

  // ============================================
  // TENANT SETTINGS
  // ============================================
  { 
    name: 'settings.view', 
    displayName: 'View Settings', 
    category: 'settings',
    description: 'Permission to view tenant settings'
  },
  { 
    name: 'settings.update', 
    displayName: 'Update Settings', 
    category: 'settings',
    description: 'Permission to modify tenant settings'
  },

  // ============================================
  // ROLES & PERMISSIONS (Tenant Admin)
  // ============================================
  { 
    name: 'roles.create', 
    displayName: 'Create Roles', 
    category: 'roles',
    description: 'Permission to create new roles within the tenant'
  },
  { 
    name: 'roles.read', 
    displayName: 'View Roles', 
    category: 'roles',
    description: 'Permission to view roles and their permissions'
  },
  { 
    name: 'roles.update', 
    displayName: 'Edit Roles', 
    category: 'roles',
    description: 'Permission to modify existing roles'
  },
  { 
    name: 'roles.delete', 
    displayName: 'Delete Roles', 
    category: 'roles',
    description: 'Permission to remove roles'
  },
  { 
    name: 'roles.assign', 
    displayName: 'Assign Roles', 
    category: 'roles',
    description: 'Permission to assign roles to users'
  },

  // ============================================
  // BILLING (Tenant Admin)
  // ============================================
  { 
    name: 'billing.view', 
    displayName: 'View Billing', 
    category: 'billing',
    description: 'Permission to view billing information'
  },
  { 
    name: 'billing.manage', 
    displayName: 'Manage Billing', 
    category: 'billing',
    description: 'Permission to manage billing and subscriptions'
  },

  // ============================================
  // DASHBOARD ACCESS
  // ============================================
  { 
    name: 'dashboard.admin', 
    displayName: 'Admin Dashboard Access', 
    category: 'dashboard',
    description: 'Permission to access the admin dashboard'
  },
  { 
    name: 'dashboard.manager', 
    displayName: 'Manager Dashboard Access', 
    category: 'dashboard',
    description: 'Permission to access the manager dashboard view'
  },
  { 
    name: 'dashboard.user', 
    displayName: 'User Dashboard Access', 
    category: 'dashboard',
    description: 'Permission to access the user dashboard'
  },

  // ============================================
  // CONTENT (Generic content permissions)
  // ============================================
  { 
    name: 'content.create', 
    displayName: 'Create Content', 
    category: 'content',
    description: 'Permission to create new content'
  },
  { 
    name: 'content.read', 
    displayName: 'View Content', 
    category: 'content',
    description: 'Permission to view content'
  },
  { 
    name: 'content.update', 
    displayName: 'Edit Content', 
    category: 'content',
    description: 'Permission to modify existing content'
  },
  { 
    name: 'content.delete', 
    displayName: 'Delete Content', 
    category: 'content',
    description: 'Permission to remove content'
  },
  { 
    name: 'content.publish', 
    displayName: 'Publish Content', 
    category: 'content',
    description: 'Permission to publish or unpublish content'
  },

  // ============================================
  // ACHIEVEMENTS
  // ============================================
  { 
    name: 'achievements.view', 
    displayName: 'View Achievements', 
    category: 'achievements',
    description: 'Permission to view achievements'
  },
  { 
    name: 'achievements.manage', 
    displayName: 'Manage Achievements', 
    category: 'achievements',
    description: 'Permission to create and manage achievements'
  },

  // ============================================
  // TRAINING
  // ============================================
  { 
    name: 'training.view', 
    displayName: 'View Training', 
    category: 'training',
    description: 'Permission to view training materials'
  },
  { 
    name: 'training.complete', 
    displayName: 'Complete Training', 
    category: 'training',
    description: 'Permission to complete training modules'
  },
  { 
    name: 'training.manage', 
    displayName: 'Manage Training', 
    category: 'training',
    description: 'Permission to create and manage training materials'
  },
];

/**
 * Role Template Sets for easy tenant onboarding
 * Each set contains predefined roles with permission patterns
 * 
 * Permission patterns:
 * - "*.*" = All permissions
 * - "category.*" = All permissions in category (e.g., "users.*")
 * - "category.action" = Specific permission (e.g., "users.read")
 */
const ROLE_TEMPLATE_SETS = {
  generic: {
    name: 'Generic Roles',
    isDefault: true,
    description: 'Standard role set suitable for most organizations',
    roles: [
      {
        name: 'Administrator',
        description: 'Full system access and user management',
        position: 1,
        permissions: ['*.*'] // All permissions
      },
      {
        name: 'Manager',
        description: 'Can manage content, users, and view reports',
        position: 2,
        permissions: [
          'users.read',
          'users.update',
          'quizzes.*',
          'courses.*',
          'categories.*',
          'rewards.*',
          'points.*',
          'games.read',
          'reports.view',
          'reports.export',
          'leaderboard.*',
          'audit.view',
          'settings.view',
          'roles.read',
          'roles.assign',
          'dashboard.admin',
          'dashboard.manager',
          'content.*',
          'achievements.*',
          'training.*'
        ]
      },
      {
        name: 'Team Lead',
        description: 'Lead teams, assign content, manage points',
        position: 3,
        permissions: [
          'users.read',
          'quizzes.read',
          'quizzes.assign',
          'courses.read',
          'courses.assign',
          'categories.read',
          'rewards.read',
          'rewards.approve',
          'points.view',
          'points.grant',
          'points.history',
          'games.read',
          'reports.view',
          'leaderboard.view',
          'dashboard.manager',
          'content.read',
          'achievements.view',
          'training.view',
          'training.complete'
        ]
      },
      {
        name: 'Member',
        description: 'Standard user with basic access',
        position: 4,
        permissions: [
          'quizzes.read',
          'courses.read',
          'categories.read',
          'rewards.read',
          'rewards.redeem',
          'points.view',
          'games.read',
          'games.play',
          'leaderboard.view',
          'dashboard.user',
          'content.read',
          'achievements.view',
          'training.view',
          'training.complete'
        ]
      },
      {
        name: 'Guest',
        description: 'Limited read-only access for external users',
        position: 5,
        permissions: [
          'quizzes.read',
          'courses.read',
          'categories.read',
          'content.read',
          'leaderboard.view'
        ]
      }
    ]
  },

  education: {
    name: 'Education',
    isDefault: false,
    description: 'Role set for educational institutions',
    roles: [
      {
        name: 'School Admin',
        description: 'Full administrative access to the institution',
        position: 1,
        permissions: ['*.*']
      },
      {
        name: 'Teacher',
        description: 'Can create courses, quizzes, and grade students',
        position: 2,
        permissions: [
          'users.read',
          'quizzes.*',
          'courses.*',
          'categories.read',
          'rewards.read',
          'points.view',
          'points.grant',
          'points.history',
          'reports.view',
          'reports.export',
          'leaderboard.view',
          'dashboard.manager',
          'content.*',
          'achievements.view',
          'training.*'
        ]
      },
      {
        name: 'Teaching Assistant',
        description: 'Can help with courses and assist students',
        position: 3,
        permissions: [
          'users.read',
          'quizzes.read',
          'quizzes.assign',
          'courses.read',
          'categories.read',
          'rewards.read',
          'points.view',
          'points.grant',
          'reports.view',
          'leaderboard.view',
          'dashboard.manager',
          'content.read',
          'content.create',
          'achievements.view',
          'training.view'
        ]
      },
      {
        name: 'Student',
        description: 'Can access courses, take quizzes, and earn rewards',
        position: 4,
        permissions: [
          'quizzes.read',
          'courses.read',
          'categories.read',
          'rewards.read',
          'rewards.redeem',
          'points.view',
          'games.read',
          'games.play',
          'reports.view',
          'leaderboard.view',
          'dashboard.user',
          'content.read',
          'achievements.view',
          'training.view',
          'training.complete'
        ]
      },
      {
        name: 'Parent',
        description: 'Can view student progress and reports',
        position: 5,
        permissions: [
          'reports.view',
          'leaderboard.view',
          'achievements.view'
        ]
      }
    ]
  },

  business: {
    name: 'Business',
    isDefault: false,
    description: 'Role set for corporate training and development',
    roles: [
      {
        name: 'Owner',
        description: 'Full control including billing and organization settings',
        position: 1,
        permissions: ['*.*']
      },
      {
        name: 'HR Manager',
        description: 'Manage employees, training programs, and reports',
        position: 2,
        permissions: [
          'users.*',
          'quizzes.*',
          'courses.*',
          'categories.*',
          'rewards.*',
          'points.*',
          'reports.*',
          'leaderboard.*',
          'audit.view',
          'settings.view',
          'roles.read',
          'roles.assign',
          'dashboard.admin',
          'dashboard.manager',
          'content.*',
          'achievements.*',
          'training.*'
        ]
      },
      {
        name: 'Department Head',
        description: 'Manage team training and performance',
        position: 3,
        permissions: [
          'users.read',
          'quizzes.read',
          'quizzes.assign',
          'courses.read',
          'courses.assign',
          'categories.read',
          'rewards.read',
          'rewards.approve',
          'points.view',
          'points.grant',
          'reports.view',
          'reports.export',
          'leaderboard.view',
          'dashboard.manager',
          'content.read',
          'achievements.view',
          'training.view',
          'training.manage'
        ]
      },
      {
        name: 'Employee',
        description: 'Standard employee with training access',
        position: 4,
        permissions: [
          'quizzes.read',
          'courses.read',
          'categories.read',
          'rewards.read',
          'rewards.redeem',
          'points.view',
          'games.read',
          'games.play',
          'reports.view',
          'leaderboard.view',
          'dashboard.user',
          'content.read',
          'achievements.view',
          'training.view',
          'training.complete'
        ]
      },
      {
        name: 'Contractor',
        description: 'Limited access for external workers',
        position: 5,
        permissions: [
          'quizzes.read',
          'courses.read',
          'categories.read',
          'content.read',
          'training.view',
          'training.complete'
        ]
      }
    ]
  },

  support: {
    name: 'Support Team',
    isDefault: false,
    description: 'Role set for customer support and service teams',
    roles: [
      {
        name: 'Support Director',
        description: 'Full access to support operations',
        position: 1,
        permissions: ['*.*']
      },
      {
        name: 'Support Manager',
        description: 'Oversee support team and complex cases',
        position: 2,
        permissions: [
          'users.read',
          'users.update',
          'quizzes.*',
          'courses.*',
          'categories.*',
          'rewards.*',
          'points.*',
          'reports.*',
          'leaderboard.*',
          'audit.view',
          'settings.view',
          'roles.read',
          'roles.assign',
          'dashboard.admin',
          'dashboard.manager',
          'content.*',
          'achievements.*',
          'training.*'
        ]
      },
      {
        name: 'Senior Agent',
        description: 'Handle escalations and train new agents',
        position: 3,
        permissions: [
          'users.read',
          'quizzes.read',
          'courses.read',
          'categories.read',
          'rewards.read',
          'rewards.approve',
          'points.view',
          'points.grant',
          'reports.view',
          'leaderboard.view',
          'dashboard.manager',
          'content.read',
          'content.create',
          'content.update',
          'achievements.view',
          'training.*'
        ]
      },
      {
        name: 'Support Agent',
        description: 'Handle standard customer support',
        position: 4,
        permissions: [
          'users.read',
          'quizzes.read',
          'courses.read',
          'categories.read',
          'rewards.read',
          'points.view',
          'reports.view',
          'leaderboard.view',
          'dashboard.user',
          'content.read',
          'content.create',
          'achievements.view',
          'training.view',
          'training.complete'
        ]
      },
      {
        name: 'Customer',
        description: 'Self-service access for customers',
        position: 5,
        permissions: [
          'quizzes.read',
          'courses.read',
          'content.read',
          'achievements.view',
          'training.view',
          'training.complete'
        ]
      }
    ]
  },

  saas: {
    name: 'SaaS Platform',
    isDefault: false,
    description: 'Role set for SaaS product teams',
    roles: [
      {
        name: 'Owner',
        description: 'Full control including billing and organization',
        position: 1,
        permissions: ['*.*']
      },
      {
        name: 'Admin',
        description: 'Manage users, settings, and platform configuration',
        position: 2,
        permissions: [
          'users.*',
          'quizzes.*',
          'courses.*',
          'categories.*',
          'rewards.*',
          'points.*',
          'games.*',
          'reports.*',
          'leaderboard.*',
          'audit.*',
          'settings.*',
          'roles.*',
          'dashboard.admin',
          'dashboard.manager',
          'content.*',
          'achievements.*',
          'training.*'
        ]
      },
      {
        name: 'Power User',
        description: 'Advanced features and content creation',
        position: 3,
        permissions: [
          'users.read',
          'quizzes.*',
          'courses.*',
          'categories.read',
          'rewards.read',
          'rewards.redeem',
          'points.view',
          'points.history',
          'games.*',
          'reports.view',
          'reports.export',
          'leaderboard.view',
          'dashboard.manager',
          'content.*',
          'achievements.view',
          'training.*'
        ]
      },
      {
        name: 'User',
        description: 'Standard platform access',
        position: 4,
        permissions: [
          'quizzes.read',
          'courses.read',
          'categories.read',
          'rewards.read',
          'rewards.redeem',
          'points.view',
          'games.read',
          'games.play',
          'reports.view',
          'leaderboard.view',
          'dashboard.user',
          'content.read',
          'content.create',
          'content.update',
          'achievements.view',
          'training.view',
          'training.complete'
        ]
      },
      {
        name: 'Read-Only',
        description: 'View-only access for stakeholders',
        position: 5,
        permissions: [
          'quizzes.read',
          'courses.read',
          'categories.read',
          'reports.view',
          'leaderboard.view',
          'content.read',
          'achievements.view'
        ]
      }
    ]
  },

  healthcare: {
    name: 'Healthcare',
    isDefault: false,
    description: 'Role set for healthcare training and compliance',
    roles: [
      {
        name: 'Administrator',
        description: 'Full administrative access',
        position: 1,
        permissions: ['*.*']
      },
      {
        name: 'Training Director',
        description: 'Manage all training programs and compliance',
        position: 2,
        permissions: [
          'users.read',
          'users.update',
          'quizzes.*',
          'courses.*',
          'categories.*',
          'rewards.*',
          'points.*',
          'reports.*',
          'leaderboard.*',
          'audit.*',
          'settings.view',
          'roles.read',
          'dashboard.admin',
          'dashboard.manager',
          'content.*',
          'achievements.*',
          'training.*'
        ]
      },
      {
        name: 'Supervisor',
        description: 'Supervise staff training and certifications',
        position: 3,
        permissions: [
          'users.read',
          'quizzes.read',
          'quizzes.assign',
          'courses.read',
          'courses.assign',
          'categories.read',
          'rewards.read',
          'rewards.approve',
          'points.view',
          'points.grant',
          'reports.view',
          'reports.export',
          'leaderboard.view',
          'audit.view',
          'dashboard.manager',
          'content.read',
          'achievements.view',
          'training.view',
          'training.manage'
        ]
      },
      {
        name: 'Staff',
        description: 'Complete required training and certifications',
        position: 4,
        permissions: [
          'quizzes.read',
          'courses.read',
          'categories.read',
          'rewards.read',
          'rewards.redeem',
          'points.view',
          'reports.view',
          'leaderboard.view',
          'dashboard.user',
          'content.read',
          'achievements.view',
          'training.view',
          'training.complete'
        ]
      },
      {
        name: 'Volunteer',
        description: 'Basic training access for volunteers',
        position: 5,
        permissions: [
          'courses.read',
          'content.read',
          'training.view',
          'training.complete'
        ]
      }
    ]
  },

  retail: {
    name: 'Retail',
    isDefault: false,
    description: 'Role set for retail training and operations',
    roles: [
      {
        name: 'Regional Manager',
        description: 'Full access to regional operations',
        position: 1,
        permissions: ['*.*']
      },
      {
        name: 'Store Manager',
        description: 'Manage store training and performance',
        position: 2,
        permissions: [
          'users.read',
          'users.update',
          'quizzes.*',
          'courses.read',
          'courses.assign',
          'categories.read',
          'rewards.*',
          'points.*',
          'reports.view',
          'reports.export',
          'leaderboard.*',
          'audit.view',
          'dashboard.admin',
          'dashboard.manager',
          'content.read',
          'achievements.*',
          'training.*'
        ]
      },
      {
        name: 'Shift Lead',
        description: 'Lead shifts and onboard new staff',
        position: 3,
        permissions: [
          'users.read',
          'quizzes.read',
          'quizzes.assign',
          'courses.read',
          'categories.read',
          'rewards.read',
          'rewards.approve',
          'points.view',
          'points.grant',
          'reports.view',
          'leaderboard.view',
          'dashboard.manager',
          'content.read',
          'achievements.view',
          'training.view'
        ]
      },
      {
        name: 'Sales Associate',
        description: 'Complete training and serve customers',
        position: 4,
        permissions: [
          'quizzes.read',
          'courses.read',
          'categories.read',
          'rewards.read',
          'rewards.redeem',
          'points.view',
          'games.read',
          'games.play',
          'leaderboard.view',
          'dashboard.user',
          'content.read',
          'achievements.view',
          'training.view',
          'training.complete'
        ]
      },
      {
        name: 'New Hire',
        description: 'Onboarding access for new employees',
        position: 5,
        permissions: [
          'quizzes.read',
          'courses.read',
          'content.read',
          'training.view',
          'training.complete'
        ]
      }
    ]
  }
};

/**
 * Helper function to resolve permission patterns
 * Supports wildcards like "*.*" (all) and "category.*" (all in category)
 */
async function resolvePermissionPatterns(patterns, permissionMap) {
  const permissionIds = new Set();
  const allPermissions = Array.from(permissionMap.entries());

  for (const pattern of patterns) {
    if (pattern === '*.*') {
      // All permissions
      allPermissions.forEach(([name, id]) => permissionIds.add(id));
    } else if (pattern.endsWith('.*')) {
      // All permissions in category (e.g., "users.*")
      const prefix = pattern.replace('.*', '.');
      allPermissions
        .filter(([name]) => name.startsWith(prefix))
        .forEach(([name, id]) => permissionIds.add(id));
    } else {
      // Exact match
      const id = permissionMap.get(pattern);
      if (id) {
        permissionIds.add(id);
      } else {
        console.warn(`  ⚠️ Permission not found: ${pattern}`);
      }
    }
  }

  return Array.from(permissionIds);
}

/**
 * Seed permissions into the database
 */
async function seedPermissions() {
  console.log('🔐 Seeding permissions...');
  
  const permissionMap = new Map();
  
  for (const perm of PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {
        displayName: perm.displayName,
        category: perm.category,
        description: perm.description,
        isActive: true,
      },
      create: {
        name: perm.name,
        displayName: perm.displayName,
        category: perm.category,
        description: perm.description,
        isActive: true,
      }
    });
    permissionMap.set(perm.name, permission.id);
  }
  
  console.log(`✅ Seeded ${PERMISSIONS.length} permissions`);
  return permissionMap;
}

/**
 * Seed role templates into the database
 */
async function seedRoleTemplates(permissionMap) {
  console.log('\n📋 Seeding role template sets...');
  
  for (const [setKey, templateSet] of Object.entries(ROLE_TEMPLATE_SETS)) {
    console.log(`\n  Creating template set: ${templateSet.name} (${setKey})`);
    
    for (const role of templateSet.roles) {
      // Check if template already exists
      const existingTemplate = await prisma.roleTemplate.findFirst({
        where: {
          templateSetName: setKey,
          roleName: role.name
        }
      });

      let roleTemplate;
      if (existingTemplate) {
        // Update existing template
        roleTemplate = await prisma.roleTemplate.update({
          where: { id: existingTemplate.id },
          data: {
            description: role.description,
            slotPosition: role.position,
            isDefaultSet: templateSet.isDefault,
          }
        });
      } else {
        // Create new template
        roleTemplate = await prisma.roleTemplate.create({
          data: {
            templateSetName: setKey,
            roleName: role.name,
            description: role.description,
            slotPosition: role.position,
            isDefaultSet: templateSet.isDefault,
          }
        });
      }
      
      // Clear existing template permissions and recreate
      await prisma.roleTemplatePermission.deleteMany({
        where: { roleTemplateId: roleTemplate.id }
      });
      
      // Resolve permission patterns and add to template
      const permissionIds = await resolvePermissionPatterns(role.permissions, permissionMap);
      
      for (const permId of permissionIds) {
        await prisma.roleTemplatePermission.create({
          data: {
            roleTemplateId: roleTemplate.id,
            permissionId: permId
          }
        });
      }
      
      console.log(`    ✓ ${role.name} (${permissionIds.length} permissions)`);
    }
  }
  
  console.log('\n✅ Role template sets seeded successfully');
}

/**
 * Main seed function
 */
async function main() {
  console.log('🚀 Starting permissions and role templates seed...\n');
  console.log('=' .repeat(50));
  
  try {
    // Seed permissions first
    const permissionMap = await seedPermissions();
    
    // Seed role templates with permissions
    await seedRoleTemplates(permissionMap);
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Seed completed successfully!\n');
    
    // Log summary
    const permissionCount = await prisma.permission.count();
    const templateCount = await prisma.roleTemplate.count();
    const templatePermCount = await prisma.roleTemplatePermission.count();
    
    console.log('📊 Summary:');
    console.log(`   - Permissions: ${permissionCount}`);
    console.log(`   - Role Templates: ${templateCount}`);
    console.log(`   - Template Permission Mappings: ${templatePermCount}`);
    console.log(`   - Template Sets: ${Object.keys(ROLE_TEMPLATE_SETS).length}`);
    console.log('');
    console.log('📁 Available Template Sets:');
    for (const [key, set] of Object.entries(ROLE_TEMPLATE_SETS)) {
      console.log(`   - ${key}: ${set.name} ${set.isDefault ? '(default)' : ''}`);
      console.log(`     ${set.description}`);
    }
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    throw error;
  }
}

// Run seed
main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Export for use in other scripts
export { PERMISSIONS, ROLE_TEMPLATE_SETS };
