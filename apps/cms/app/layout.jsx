import { ClerkProvider } from "@clerk/nextjs";
import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Skill-Learn - Super Admin Dashboard',
  description: 'Multi-tenant Learning Management System Super Admin Dashboard',
}

export default function CMSLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
