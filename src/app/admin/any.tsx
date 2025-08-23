"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "../firebase"
import { checkIsAdmin } from "../admin/adminAuth"
import { usePathname, useRouter } from "next/navigation"

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        setUserEmail(user.email)
        
        // Cek status admin dari Firestore
        const adminStatus = await checkIsAdmin(user.email)
        
        if (adminStatus) {
          setIsAuthenticated(true)
          setIsAdmin(true)
        } else {
          // Jika bukan admin, logout
          await signOut(auth)
          setIsAuthenticated(false)
          setIsAdmin(false)
        }
      } else {
        setIsAuthenticated(false)
        setIsAdmin(false)
        setUserEmail(null)
      }
      setIsAuthChecked(true)
    });

    return () => unsubscribe();
  }, [])

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin logout?")
    if (!confirmLogout) return

    setIsLoggingOut(true)
    try {
      await signOut(auth)
      // Reset state
      setIsAuthenticated(false)
      setIsAdmin(false)
      setUserEmail(null)
      
      // Redirect ke login
      router.push("/admin/login")
    } catch (error) {
      console.error("Error signing out:", error)
      window.alert("Gagal logout. Silakan coba lagi.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Loading state
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Memvalidasi akses admin...</p>
          <p className="mt-1 text-sm text-gray-500">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  // Redirect jika tidak authenticated atau bukan admin
  if (!isAuthenticated || !isAdmin) {
    router.push("/admin/login");
    return null;
  }

  // Fungsi untuk menentukan kelas CSS berdasarkan path
  const getNavLinkClass = (path: string) => {
    return pathname.startsWith(path)
      ? "flex items-center px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg"
      : "flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:text-white hover:bg-gray-700 transition-colors";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white shadow-xl">
        {/* Header */}
        <div className="p-6 bg-gray-900">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-bold text-white">Admin Panel</h2>
              <p className="text-xs text-gray-400">EduPoint Dashboard</p>
            </div>
          </div>
        </div>
        
        {/* User Info */}
        <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {userEmail?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-xs text-gray-400">Logged in as:</p>
              <p className="text-sm font-medium text-white truncate" title={userEmail || ''}>
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {/* Dashboard */}
            <a href="/admin/articles" className={getNavLinkClass("/admin/articles")}>
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Articles
            </a>

            {/* Quick Actions */}
            <div className="pt-4">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</p>
              <div className="mt-2 space-y-1">
                <a 
                  href="/admin/articles/create" 
                  className="flex items-center px-4 py-2 text-sm text-gray-300 rounded-lg hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Article
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-64 p-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-300 rounded-lg hover:text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin w-4 h-4 mr-3 border-2 border-red-300 border-t-transparent rounded-full"></div>
                Logging out...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}