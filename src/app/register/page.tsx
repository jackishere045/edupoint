"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import api from "@/lib/api"

const schema = z.object({
  username: z.string().min(2, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function RegisterPage() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: { username: string; password: string }) => {
    try {
      const payload = {
        username: data.username,
        password: data.password,
        role: "User", // sesuai request body yang diminta API
      }

      const res = await api.post("/auth/register", payload)
      console.log("Register success:", res.data)

      alert("Register success. You can now login.")
      router.push("/login")
    } catch (err: any) {
      console.error("Register error:", err.response?.data || err.message)
      if (err.response?.status === 400) {
        alert("Register failed. Username might already be taken.")
      } else {
        alert("Register failed. Please try again.")
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-xl font-bold text-center">Register</h1>

        <div>
          <input {...register("username")} placeholder="Username" className="border p-2 rounded w-full" />
          {errors.username && <p className="text-red-500">{errors.username.message}</p>}
        </div>

        <div>
          <input type="password" {...register("password")} placeholder="Password" className="border p-2 rounded w-full" />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>

        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded w-full">Register</button>

        <p className="text-sm mt-2 text-center">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-500 underline">Login disini</a>
        </p>
      </form>
    </div>
  )
}
