import { redirect } from 'next/navigation'

export default function CMSPage() {
  // Redirect to tenants page by default
  redirect('/cms/tenants')
}
