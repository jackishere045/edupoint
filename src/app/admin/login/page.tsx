"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../firebase"
import { checkIsAdmin } from "../adminAuth"
import { useRouter } from "next/navigation"

const schema = z.object({
  email: z.string().email("Email tidak valid").min(1),
  password: z.string().min(6, "Password minimal 6 karakter")
})

export default function LoginAdminPage() {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ 
    resolver: zodResolver(schema) 
  })
  const router = useRouter()

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true)
    
    try {
      // 1. Login ke Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
      
      // 2. Cek apakah user adalah admin dari Firestore
      const isAdmin = await checkIsAdmin(data.email)
      
      if (!isAdmin) {
        // Jika bukan admin, logout dan tolak akses
        await auth.signOut()
        throw new Error("Akses ditolak. Anda bukan administrator.")
      }
      
      // 3. Jika admin, redirect ke dashboard
      router.push("/admin/articles")
      
  } catch (err: unknown) {
    console.error(err)
    
    const error = err as { code?: string; message?: string }
    
    if (error.message?.includes("Akses ditolak")) {
      window.alert("Akses ditolak. Anda bukan administrator.")
    } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      window.alert("Email atau kata sandi salah.")
    } else if (error.code === "auth/invalid-email") {
      window.alert("Format email tidak valid.")
    } else if (error.code === "auth/too-many-requests") {
      window.alert("Terlalu banyak percobaan login. Coba lagi nanti.")
    } else {
      window.alert("Login gagal. Silakan cek email dan kata sandi Anda.")
    }
  } finally {
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-sm text-gray-600 mt-2">Masuk ke panel admin EduPoint</p>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Admin
            </label>
            <input 
              {...register("email")} 
              type="email" 
              id="email"
              placeholder="admin@edupoint.com" 
              className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input 
              {...register("password")} 
              type="password" 
              id="password"
              placeholder="••••••••" 
              className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-3 rounded-lg w-full font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" 
            disabled={loading}
          >
            {loading ? "Memvalidasi..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}