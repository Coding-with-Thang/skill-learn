import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <main className="flex">
      {/* Sidebar */}
      <div className="w-1/6 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard" className="block text-gray-200 hover:text-blue-400">Dashboard</Link>
          </li>
          <li>
            <Link href="/dashboard/users" className="block text-gray-200 hover:text-blue-400">Manage Users</Link>
          </li>
          <li>
            <Link href="/dashboard/quiz/quiz-manager" className="block text-gray-200 hover:text-blue-400">Manage Quizzes</Link>
          </li>
        </ul>
      </div>
      <div className="min-h-screen w-full">
        {children}
      </div>
    </main>
  );
}
