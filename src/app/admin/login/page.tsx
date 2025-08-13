"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import api from "@/lib/api"
import { useState } from "react"
import axios from "axios"

const schema = z.object({
  username: z.string().min(2, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function LoginAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true)
    try {
      // 1. Lakukan login dan dapatkan token
      const loginRes = await api.post("/auth/login", data)
      const { token } = loginRes.data
      localStorage.setItem("token", token)

      // 2. Gunakan token untuk mendapatkan profil pengguna (ID, role, dll.)
      const profileRes = await axios.get("https://test-fe.mysellerpintar.com/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const { id, username } = profileRes.data
      
      // 3. Simpan ID pengguna dan username ke localStorage
      localStorage.setItem("userId", id)
      localStorage.setItem("username", username)
      
      alert("Login successful!")
      router.push("/admin/articles")
      
    } catch (err) {
      console.error("Login Error:", err)
      alert("Login failed. Please check your username and password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h1 className="text-xl font-bold text-center">Login Admin</h1>
          <div>
            <input 
              {...register("username")} 
              placeholder="Username" 
              className="border p-2 rounded w-full" 
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
          </div>
          <div>
            <input 
              type="password" 
              {...register("password")} 
              placeholder="Password" 
              className="border p-2 rounded w-full" 
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded w-full disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="text-sm mt-2 text-center">
            Belum punya akun?{" "}
            <a href="/admin/register" className="text-blue-500 underline">Daftar disini</a>
          </p>
        </form>
      </div>
    </div>
  )
}