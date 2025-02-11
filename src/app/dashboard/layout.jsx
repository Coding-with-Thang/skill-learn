export default function DashboardLayout({ children }) {
  return (
    <main className="flex">
      {/* Sidebar */}
      <div className="w-1/6 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
        <ul className="space-y-2">
          <li>
            <a href="/dashboard" className="block text-gray-200 hover:text-blue-400">Dashboard</a>
          </li>
          <li>
            <a href="/dashboard/users" className="block text-gray-200 hover:text-blue-400">Manage Users</a>
          </li>
        </ul>
      </div>
      <div className="flex min-h-screen w-full">
        {children}
      </div>
    </main>
  );
}
