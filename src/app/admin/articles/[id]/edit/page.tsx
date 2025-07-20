"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useRouter, useParams } from "next/navigation"

const schema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  author: z.string().min(1),
  image: z.string().url("Must be a valid URL")
})

type FormData = z.infer<typeof schema>

export default function EditArticlePage() {
  const { id } = useParams()
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })
  const router = useRouter()

  const fetchArticle = async () => {
    try {
      const res = await axios.get(`https://test-fe.mysellerpintar.com/api/articles/${id}`)
      reset(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchArticle()
  }, [])

  const onSubmit = async (data: FormData) => {
    try {
      await axios.put(`https://test-fe.mysellerpintar.com/api/articles/${id}`, data)
      router.push("/admin/articles")
    } catch (err) {
      console.error(err)
      alert("Update failed")
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Edit Article</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input {...register("title")} placeholder="Title" className="border px-3 py-2 w-full rounded" />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>
        <div>
          <input {...register("author")} placeholder="Author" className="border px-3 py-2 w-full rounded" />
          {errors.author && <p className="text-red-500 text-sm">{errors.author.message}</p>}
        </div>
        <div>
          <input {...register("image")} placeholder="Image URL" className="border px-3 py-2 w-full rounded" />
          {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
        </div>
        <div>
          <textarea {...register("content")} placeholder="Content" className="border px-3 py-2 w-full rounded" />
          {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
        </div>

        {/* Preview */}
        <div>
          <h2 className="font-semibold mb-2">Preview</h2>
          <h3>{watch("title")}</h3>
          <p>{watch("content")}</p>
          <img src={watch("image")} alt="" className="max-h-48" />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
      </form>
    </div>
  )
}
