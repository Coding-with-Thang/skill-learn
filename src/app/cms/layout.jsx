import DashboardLayout from '@/components/cms/layout/DashboardLayout'

export const metadata = {
  title: 'Skill-Learn - Super Admin Dashboard',
  description: 'Multi-tenant Learning Management System Super Admin Dashboard',
}

export default function CMSLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
