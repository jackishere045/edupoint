"use client"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const categorySchema = z.object({
  name: z.string().min(1, "Name is required")
})

type CategoryFormData = z.infer<typeof categorySchema>

export default function CreateCategoryPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema)
  })

  const onSubmit = async (data: CategoryFormData) => {
    console.log(data)
    // implement post API
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-4">
      <div>
        <label>Name</label>
        <input {...register("name")} className="border px-3 py-2 rounded w-full" />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-4">Submit</button>
    </form>
  )
}
