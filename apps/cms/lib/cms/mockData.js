export const mockTenants = [
  {
    id: 1,
    name: 'Acme University',
    logo: '🎓',
    plan: 'Enterprise',
    users: 1247,
    status: 'Active',
    lastActive: new Date(Date.now() - 300000), // 5 min ago
    mrr: 2499,
  },
  {
    id: 2,
    name: 'TechEd Corp',
    logo: '💻',
    plan: 'Professional',
    users: 856,
    status: 'Active',
    lastActive: new Date(Date.now() - 1800000), // 30 min ago
    mrr: 999,
  },
  {
    id: 3,
    name: 'Digital Learning Institute',
    logo: '📚',
    plan: 'Enterprise',
    users: 2134,
    status: 'Active',
    lastActive: new Date(Date.now() - 600000), // 10 min ago
    mrr: 2499,
  },
  {
    id: 4,
    name: 'Global Training Co',
    logo: '🌍',
    plan: 'Professional',
    users: 643,
    status: 'Trial',
    lastActive: new Date(Date.now() - 3600000), // 1 hour ago
    mrr: 0,
  },
  {
    id: 5,
    name: 'SkillBoost Academy',
    logo: '🚀',
    plan: 'Starter',
    users: 234,
    status: 'Active',
    lastActive: new Date(Date.now() - 7200000), // 2 hours ago
    mrr: 299,
  },
  {
    id: 6,
    name: 'Corporate Learning Hub',
    logo: '🏢',
    plan: 'Enterprise',
    users: 1876,
    status: 'Active',
    lastActive: new Date(Date.now() - 900000), // 15 min ago
    mrr: 2499,
  },
  {
    id: 7,
    name: 'EduTech Solutions',
    logo: '💡',
    plan: 'Professional',
    users: 512,
    status: 'Suspended',
    lastActive: new Date(Date.now() - 172800000), // 2 days ago
    mrr: 999,
  },
  {
    id: 8,
    name: 'Knowledge Network',
    logo: '🔗',
    plan: 'Starter',
    users: 189,
    status: 'Active',
    lastActive: new Date(Date.now() - 1200000), // 20 min ago
    mrr: 299,
  },
  {
    id: 9,
    name: 'Learning Dynamics',
    logo: '⚡',
    plan: 'Professional',
    users: 723,
    status: 'Active',
    lastActive: new Date(Date.now() - 600000), // 10 min ago
    mrr: 999,
  },
  {
    id: 10,
    name: 'Future Skills Institute',
    logo: '🎯',
    plan: 'Trial',
    users: 67,
    status: 'Trial',
    lastActive: new Date(Date.now() - 14400000), // 4 hours ago
    mrr: 0,
  },
]

export const revenueData = [
  { date: 'Jan 1', mrr: 98000, newRevenue: 12000, churned: 2000 },
  { date: 'Jan 3', mrr: 102000, newRevenue: 8000, churned: 1500 },
  { date: 'Jan 5', mrr: 105000, newRevenue: 9000, churned: 1800 },
  { date: 'Jan 7', mrr: 108000, newRevenue: 11000, churned: 2200 },
  { date: 'Jan 9', mrr: 112000, newRevenue: 13000, churned: 1600 },
  { date: 'Jan 11', mrr: 115000, newRevenue: 10000, churned: 1900 },
  { date: 'Jan 13', mrr: 118000, newRevenue: 12000, churned: 2100 },
  { date: 'Jan 15', mrr: 121000, newRevenue: 14000, churned: 1700 },
  { date: 'Jan 17', mrr: 123000, newRevenue: 9000, churned: 2300 },
  { date: 'Jan 19', mrr: 125000, newRevenue: 11000, churned: 1800 },
  { date: 'Jan 21', mrr: 127450, newRevenue: 13500, churned: 2000 },
]

export const systemStatus = [
  { name: 'API Server', status: 'Operational', uptime: 99.98, latency: null },
  { name: 'Database', status: 'Operational', uptime: 99.99, latency: '2ms' },
  { name: 'Storage', status: 'Warning', uptime: 99.95, capacity: 78 },
  { name: 'Email Service', status: 'Operational', uptime: 99.97, latency: null },
  { name: 'Payment Gateway', status: 'Operational', uptime: 99.99, latency: null },
]

export const resourceUsage = [
  { name: 'CPU', percentage: 45, status: 'healthy' },
  { name: 'Memory', percentage: 62, status: 'healthy' },
  { name: 'Disk', percentage: 78, status: 'warning' },
]

export const recentAlerts = [
  { id: 1, type: 'warning', message: 'High disk usage detected', time: new Date(Date.now() - 300000), isNew: true },
  { id: 2, type: 'success', message: 'Backup completed successfully', time: new Date(Date.now() - 3600000), isNew: false },
  { id: 3, type: 'error', message: 'Failed payment for TechEd Corp', time: new Date(Date.now() - 7200000), isNew: true },
  { id: 4, type: 'info', message: 'System update scheduled for tonight', time: new Date(Date.now() - 10800000), isNew: false },
]

export const subscriptionDistribution = [
  { name: 'Enterprise', value: 35, count: 35, color: '#A855F7' },
  { name: 'Professional', value: 105, count: 105, color: '#6366F1' },
  { name: 'Starter', value: 82, count: 82, color: '#10B981' },
  { name: 'Trial', value: 12, count: 12, color: '#F59E0B' },
]

export const heroStats = [
  {
    id: 1,
    title: 'Total Revenue',
    value: '$127,450',
    subtitle: 'MRR',
    trend: 12,
    trendLabel: 'vs last month',
    sparklineData: [98, 102, 105, 108, 112, 115, 118, 121, 123, 125, 127.45],
  },
  {
    id: 2,
    title: 'Active Tenants',
    value: '234',
    subtitle: 'Organizations',
    trend: 8,
    trendLabel: 'vs last month',
    sparklineData: [210, 215, 218, 220, 225, 228, 230, 232, 233, 234],
  },
  {
    id: 3,
    title: 'Total Users',
    value: '12,847',
    subtitle: 'Users',
    trend: 15,
    trendLabel: 'vs last month',
    sparklineData: [10200, 10500, 10800, 11100, 11400, 11700, 12000, 12300, 12600, 12847],
  },
  {
    id: 4,
    title: 'System Uptime',
    value: '99.98%',
    subtitle: 'Last 30 days',
    trend: 0.02,
    trendLabel: 'vs last month',
    status: 'Healthy',
    sparklineData: [99.95, 99.96, 99.97, 99.98, 99.97, 99.98, 99.99, 99.98, 99.98, 99.98],
  },
]
