"use client"

import { usePathname } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Pengecekan apakah path-nya login atau register
  const isAuthPage = pathname.includes("/login") || pathname.includes("/register")

  if (isAuthPage) {
    return <>{children}</> // Hanya tampilkan konten untuk login dan register tanpa sidebar
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-600 text-white flex flex-col p-6">
        <div className="text-2xl font-bold mb-10">EduPoint Admin</div>
        <nav className="space-y-4">
          <a href="/admin/articles" className="flex items-center gap-2 text-white font-medium">📄 Articles</a>
          <a href="/admin/categories" className="flex items-center gap-2 text-white/80 hover:text-white">📂 Categories</a>
          <a href="/admin/logout" className="flex items-center gap-2 text-white/80 hover:text-white mt-auto">🔓 Logout</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-8">
        {children}
      </main>
    </div>
  )
}
