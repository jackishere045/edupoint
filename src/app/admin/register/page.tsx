"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useRouter } from "next/navigation"

const schema = z.object({
  username: z.string().min(2, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormData = z.infer<typeof schema>

export default function AdminRegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const router = useRouter()

  const onSubmit = async (data: FormData) => {
    try {
      const res = await axios.post("https://test-fe.mysellerpintar.com/api/auth/register", {
        ...data,
        role: "Admin"
      })
      alert("Admin registered successfully")
      router.push("/admin/login")
    } catch (err) {
      console.error(err)
      alert("Register failed")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h1 className="text-xl font-bold text-center">Register Admin</h1>

          <div>
            <input {...register("username")} placeholder="Username" className="border p-2 rounded w-full" />
            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
          </div>

          <div>
            <input type="password" {...register("password")} placeholder="Password" className="border p-2 rounded w-full" />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">Register</button>

          <p className="text-sm mt-2 text-center">
            Sudah punya akun?{" "}
            <a href="/admin/login" className="text-blue-500 underline">Login disini</a>
          </p>
        </form>
      </div>
    </div>
  )
}
