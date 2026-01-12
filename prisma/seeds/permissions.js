import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    category: 'user_management',
    description: 'Permission to create new users in the tenant'
  },
  { 
    name: 'users.read', 
    displayName: 'View Users', 
    category: 'user_management',
    description: 'Permission to view user profiles and information'
  },
  { 
    name: 'users.update', 
    displayName: 'Edit Users', 
    category: 'user_management',
    description: 'Permission to modify user information'
  },
  { 
    name: 'users.delete', 
    displayName: 'Delete Users', 
    category: 'user_management',
    description: 'Permission to remove users from the tenant'
  },
  { 
    name: 'users.import', 
    displayName: 'Import Users', 
    category: 'user_management',
    description: 'Permission to bulk import users'
  },
  { 
    name: 'users.export', 
    displayName: 'Export Users', 
    category: 'user_management',
    description: 'Permission to export user data'
  },

  // ============================================
  // QUIZ MANAGEMENT
  // ============================================
  { 
    name: 'quizzes.create', 
    displayName: 'Create Quizzes', 
    category: 'quiz_management',
    description: 'Permission to create new quizzes'
  },
  { 
    name: 'quizzes.read', 
    displayName: 'View Quizzes', 
    category: 'quiz_management',
    description: 'Permission to view quiz details and questions'
  },
  { 
    name: 'quizzes.update', 
    displayName: 'Edit Quizzes', 
    category: 'quiz_management',
    description: 'Permission to modify existing quizzes'
  },
  { 
    name: 'quizzes.delete', 
    displayName: 'Delete Quizzes', 
    category: 'quiz_management',
    description: 'Permission to remove quizzes'
  },
  { 
    name: 'quizzes.publish', 
    displayName: 'Publish Quizzes', 
    category: 'quiz_management',
    description: 'Permission to publish or unpublish quizzes'
  },
  { 
    name: 'quizzes.assign', 
    displayName: 'Assign Quizzes', 
    category: 'quiz_management',
    description: 'Permission to assign quizzes to users/groups'
  },

  // ============================================
  // COURSE MANAGEMENT
  // ============================================
  { 
    name: 'courses.create', 
    displayName: 'Create Courses', 
    category: 'course_management',
    description: 'Permission to create new courses'
  },
  { 
    name: 'courses.read', 
    displayName: 'View Courses', 
    category: 'course_management',
    description: 'Permission to view course details'
  },
  { 
    name: 'courses.update', 
    displayName: 'Edit Courses', 
    category: 'course_management',
    description: 'Permission to modify existing courses'
  },
  { 
    name: 'courses.delete', 
    displayName: 'Delete Courses', 
    category: 'course_management',
    description: 'Permission to remove courses'
  },
  { 
    name: 'courses.publish', 
    displayName: 'Publish Courses', 
    category: 'course_management',
    description: 'Permission to publish or unpublish courses'
  },

  // ============================================
  // CATEGORY MANAGEMENT
  // ============================================
  { 
    name: 'categories.create', 
    displayName: 'Create Categories', 
    category: 'category_management',
    description: 'Permission to create new categories'
  },
  { 
    name: 'categories.read', 
    displayName: 'View Categories', 
    category: 'category_management',
    description: 'Permission to view categories'
  },
  { 
    name: 'categories.update', 
    displayName: 'Edit Categories', 
    category: 'category_management',
    description: 'Permission to modify existing categories'
  },
  { 
    name: 'categories.delete', 
    displayName: 'Delete Categories', 
    category: 'category_management',
    description: 'Permission to remove categories'
  },

  // ============================================
  // REWARDS MANAGEMENT
  // ============================================
  { 
    name: 'rewards.create', 
    displayName: 'Create Rewards', 
    category: 'rewards_management',
    description: 'Permission to create new rewards'
  },
  { 
    name: 'rewards.read', 
    displayName: 'View Rewards', 
    category: 'rewards_management',
    description: 'Permission to view reward details'
  },
  { 
    name: 'rewards.update', 
    displayName: 'Edit Rewards', 
    category: 'rewards_management',
    description: 'Permission to modify existing rewards'
  },
  { 
    name: 'rewards.delete', 
    displayName: 'Delete Rewards', 
    category: 'rewards_management',
    description: 'Permission to remove rewards'
  },
  { 
    name: 'rewards.approve', 
    displayName: 'Approve Redemptions', 
    category: 'rewards_management',
    description: 'Permission to approve or reject reward redemptions'
  },
  { 
    name: 'rewards.fulfill', 
    displayName: 'Fulfill Rewards', 
    category: 'rewards_management',
    description: 'Permission to mark rewards as fulfilled'
  },

  // ============================================
  // POINTS MANAGEMENT
  // ============================================
  { 
    name: 'points.view', 
    displayName: 'View Points', 
    category: 'points_management',
    description: 'Permission to view user points'
  },
  { 
    name: 'points.grant', 
    displayName: 'Grant Points', 
    category: 'points_management',
    description: 'Permission to manually award points to users'
  },
  { 
    name: 'points.deduct', 
    displayName: 'Deduct Points', 
    category: 'points_management',
    description: 'Permission to deduct points from users'
  },
  { 
    name: 'points.history', 
    displayName: 'View Points History', 
    category: 'points_management',
    description: 'Permission to view points transaction history'
  },

  // ============================================
  // GAMES MANAGEMENT
  // ============================================
  { 
    name: 'games.create', 
    displayName: 'Create Games', 
    category: 'games_management',
    description: 'Permission to create new games'
  },
  { 
    name: 'games.read', 
    displayName: 'View Games', 
    category: 'games_management',
    description: 'Permission to view game details'
  },
  { 
    name: 'games.update', 
    displayName: 'Edit Games', 
    category: 'games_management',
    description: 'Permission to modify existing games'
  },
  { 
    name: 'games.delete', 
    displayName: 'Delete Games', 
    category: 'games_management',
    description: 'Permission to remove games'
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
];

/**
 * Default role templates for tenant onboarding
 * Tenants get these 5 roles by default (can customize later)
 */
const DEFAULT_ROLE_TEMPLATES = [
  {
    templateSetName: 'generic',
    roleName: 'Administrator',
    description: 'Full access to all tenant features and settings',
    slotPosition: 1,
    isDefaultSet: true,
    permissions: [
      // Full admin access
      'users.create', 'users.read', 'users.update', 'users.delete', 'users.import', 'users.export',
      'quizzes.create', 'quizzes.read', 'quizzes.update', 'quizzes.delete', 'quizzes.publish', 'quizzes.assign',
      'courses.create', 'courses.read', 'courses.update', 'courses.delete', 'courses.publish',
      'categories.create', 'categories.read', 'categories.update', 'categories.delete',
      'rewards.create', 'rewards.read', 'rewards.update', 'rewards.delete', 'rewards.approve', 'rewards.fulfill',
      'points.view', 'points.grant', 'points.deduct', 'points.history',
      'games.create', 'games.read', 'games.update', 'games.delete',
      'reports.view', 'reports.export', 'reports.create', 'reports.schedule',
      'leaderboard.view', 'leaderboard.manage',
      'audit.view', 'audit.export',
      'settings.view', 'settings.update',
      'roles.create', 'roles.read', 'roles.update', 'roles.delete', 'roles.assign',
      'billing.view', 'billing.manage',
      'dashboard.admin', 'dashboard.manager'
    ]
  },
  {
    templateSetName: 'generic',
    roleName: 'Manager',
    description: 'Manage users and content, view reports',
    slotPosition: 2,
    isDefaultSet: true,
    permissions: [
      'users.create', 'users.read', 'users.update',
      'quizzes.create', 'quizzes.read', 'quizzes.update', 'quizzes.publish', 'quizzes.assign',
      'courses.create', 'courses.read', 'courses.update', 'courses.publish',
      'categories.read',
      'rewards.read', 'rewards.approve', 'rewards.fulfill',
      'points.view', 'points.grant', 'points.history',
      'games.read',
      'reports.view', 'reports.export',
      'leaderboard.view',
      'audit.view',
      'settings.view',
      'roles.read', 'roles.assign',
      'dashboard.admin', 'dashboard.manager'
    ]
  },
  {
    templateSetName: 'generic',
    roleName: 'Content Creator',
    description: 'Create and manage quizzes and courses',
    slotPosition: 3,
    isDefaultSet: true,
    permissions: [
      'users.read',
      'quizzes.create', 'quizzes.read', 'quizzes.update',
      'courses.create', 'courses.read', 'courses.update',
      'categories.read',
      'rewards.read',
      'games.read',
      'reports.view',
      'leaderboard.view',
      'dashboard.manager'
    ]
  },
  {
    templateSetName: 'generic',
    roleName: 'Team Lead',
    description: 'Lead a team, assign quizzes, manage points',
    slotPosition: 4,
    isDefaultSet: true,
    permissions: [
      'users.read',
      'quizzes.read', 'quizzes.assign',
      'courses.read',
      'categories.read',
      'rewards.read', 'rewards.approve',
      'points.view', 'points.grant', 'points.history',
      'games.read',
      'reports.view',
      'leaderboard.view',
      'dashboard.manager'
    ]
  },
  {
    templateSetName: 'generic',
    roleName: 'Learner',
    description: 'Basic learner access - take quizzes, view courses',
    slotPosition: 5,
    isDefaultSet: true,
    permissions: [
      'quizzes.read',
      'courses.read',
      'categories.read',
      'rewards.read',
      'points.view',
      'games.read',
      'leaderboard.view'
    ]
  }
];

/**
 * Education-focused role templates (alternative set)
 */
const EDUCATION_ROLE_TEMPLATES = [
  {
    templateSetName: 'education',
    roleName: 'School Admin',
    description: 'Full access to school/institution features',
    slotPosition: 1,
    isDefaultSet: false,
    permissions: [
      'users.create', 'users.read', 'users.update', 'users.delete', 'users.import', 'users.export',
      'quizzes.create', 'quizzes.read', 'quizzes.update', 'quizzes.delete', 'quizzes.publish', 'quizzes.assign',
      'courses.create', 'courses.read', 'courses.update', 'courses.delete', 'courses.publish',
      'categories.create', 'categories.read', 'categories.update', 'categories.delete',
      'rewards.create', 'rewards.read', 'rewards.update', 'rewards.delete', 'rewards.approve', 'rewards.fulfill',
      'points.view', 'points.grant', 'points.deduct', 'points.history',
      'reports.view', 'reports.export', 'reports.create', 'reports.schedule',
      'leaderboard.view', 'leaderboard.manage',
      'audit.view', 'audit.export',
      'settings.view', 'settings.update',
      'roles.create', 'roles.read', 'roles.update', 'roles.delete', 'roles.assign',
      'billing.view', 'billing.manage',
      'dashboard.admin', 'dashboard.manager'
    ]
  },
  {
    templateSetName: 'education',
    roleName: 'Teacher',
    description: 'Create and manage course content, grade students',
    slotPosition: 2,
    isDefaultSet: false,
    permissions: [
      'users.read',
      'quizzes.create', 'quizzes.read', 'quizzes.update', 'quizzes.publish', 'quizzes.assign',
      'courses.create', 'courses.read', 'courses.update', 'courses.publish',
      'categories.read',
      'rewards.read',
      'points.view', 'points.grant', 'points.history',
      'reports.view', 'reports.export',
      'leaderboard.view',
      'dashboard.manager'
    ]
  },
  {
    templateSetName: 'education',
    roleName: 'Teaching Assistant',
    description: 'Assist teachers, manage student progress',
    slotPosition: 3,
    isDefaultSet: false,
    permissions: [
      'users.read',
      'quizzes.read', 'quizzes.assign',
      'courses.read',
      'categories.read',
      'rewards.read',
      'points.view', 'points.grant',
      'reports.view',
      'leaderboard.view',
      'dashboard.manager'
    ]
  },
  {
    templateSetName: 'education',
    roleName: 'Student',
    description: 'Take courses and quizzes, earn rewards',
    slotPosition: 4,
    isDefaultSet: false,
    permissions: [
      'quizzes.read',
      'courses.read',
      'categories.read',
      'rewards.read',
      'points.view',
      'leaderboard.view'
    ]
  },
  {
    templateSetName: 'education',
    roleName: 'Parent',
    description: 'View student progress and reports',
    slotPosition: 5,
    isDefaultSet: false,
    permissions: [
      'reports.view',
      'leaderboard.view'
    ]
  }
];

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
  console.log('📋 Seeding role templates...');
  
  const allTemplates = [...DEFAULT_ROLE_TEMPLATES, ...EDUCATION_ROLE_TEMPLATES];
  
  for (const template of allTemplates) {
    // Create or update the role template
    const existingTemplate = await prisma.roleTemplate.findFirst({
      where: {
        templateSetName: template.templateSetName,
        roleName: template.roleName
      }
    });

    let roleTemplate;
    if (existingTemplate) {
      roleTemplate = await prisma.roleTemplate.update({
        where: { id: existingTemplate.id },
        data: {
          description: template.description,
          slotPosition: template.slotPosition,
          isDefaultSet: template.isDefaultSet,
        }
      });
    } else {
      roleTemplate = await prisma.roleTemplate.create({
        data: {
          templateSetName: template.templateSetName,
          roleName: template.roleName,
          description: template.description,
          slotPosition: template.slotPosition,
          isDefaultSet: template.isDefaultSet,
        }
      });
    }
    
    // Clear existing template permissions and recreate
    await prisma.roleTemplatePermission.deleteMany({
      where: { roleTemplateId: roleTemplate.id }
    });
    
    // Add permissions to template
    for (const permName of template.permissions) {
      const permissionId = permissionMap.get(permName);
      if (permissionId) {
        await prisma.roleTemplatePermission.create({
          data: {
            roleTemplateId: roleTemplate.id,
            permissionId: permissionId
          }
        });
      } else {
        console.warn(`⚠️ Permission not found: ${permName}`);
      }
    }
    
    console.log(`  ✓ ${template.templateSetName}/${template.roleName} (${template.permissions.length} permissions)`);
  }
  
  console.log(`✅ Seeded ${allTemplates.length} role templates`);
}

/**
 * Main seed function
 */
async function main() {
  console.log('🚀 Starting permissions seed...\n');
  
  try {
    // Seed permissions first
    const permissionMap = await seedPermissions();
    console.log('');
    
    // Seed role templates with permissions
    await seedRoleTemplates(permissionMap);
    console.log('');
    
    console.log('🎉 Permissions seed completed successfully!\n');
    
    // Log summary
    const permissionCount = await prisma.permission.count();
    const templateCount = await prisma.roleTemplate.count();
    const templatePermCount = await prisma.roleTemplatePermission.count();
    
    console.log('📊 Summary:');
    console.log(`   - Permissions: ${permissionCount}`);
    console.log(`   - Role Templates: ${templateCount}`);
    console.log(`   - Template Permission Mappings: ${templatePermCount}`);
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
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
export { PERMISSIONS, DEFAULT_ROLE_TEMPLATES, EDUCATION_ROLE_TEMPLATES };
