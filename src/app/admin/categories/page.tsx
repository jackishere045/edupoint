"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

interface Category {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()

  const categoriesPerPage = 10

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await axios.get("https://test-fe.mysellerpintar.com/api/categories")
      const data = Array.isArray(res.data) ? res.data : res.data.data
      setCategories(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  const totalPage = Math.ceil(filteredCategories.length / categoriesPerPage)
  const indexOfLast = currentPage * categoriesPerPage
  const indexOfFirst = indexOfLast - categoriesPerPage
  const currentCategories = filteredCategories.slice(indexOfFirst, indexOfLast)

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPage) setCurrentPage(currentPage + 1)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/admin/login")
  }

  return (
    <div className="flex min-h-screen">
      

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Categories</h1>
          <Link href="/admin/categories/create" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            + Add Category
          </Link>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="text"
            placeholder="Search category..."
            className="border px-3 py-2 rounded w-full"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value)
              setCurrentPage(1)
            }}
          />
          <Search className="ml-2" />
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-3 font-semibold">ID</th>
                    <th className="p-3 font-semibold">Name</th>
                    <th className="p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCategories.map((category) => (
                    <tr key={category.id} className="border-t">
                      <td className="p-3">{category.id}</td>
                      <td className="p-3">{category.name}</td>
                      <td className="p-3 space-x-2">
                        <Link href={`/admin/categories/${category.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                        <button
                          onClick={async () => {
                            if (!confirm("Are you sure you want to delete this category?")) return
                            try {
                              await axios.delete(`https://test-fe.mysellerpintar.com/api/categories/${category.id}`)
                              fetchCategories()
                            } catch (err) {
                              console.error(err)
                              alert("Delete failed")
                            }
                          }}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-4 space-x-4">
              <button onClick={handlePrev} disabled={currentPage === 1} className="border px-3 py-1 rounded disabled:opacity-50">Prev</button>
              <span>Page {currentPage} of {totalPage}</span>
              <button onClick={handleNext} disabled={currentPage === totalPage} className="border px-3 py-1 rounded disabled:opacity-50">Next</button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
