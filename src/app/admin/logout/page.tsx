"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Hapus token atau data login dari localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("username") // jika kamu simpan username juga

    // Redirect ke login admin
    router.push("/admin/login")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Logging out...</p>
    </div>
  )
}
