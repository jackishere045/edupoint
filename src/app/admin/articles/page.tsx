"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"

interface Article {
  id: number
  title: string
  imageUrl: string
  category: {
    name: string
  }
  createdAt: string
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("https://test-fe.mysellerpintar.com/api/articles", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = Array.isArray(res.data) ? res.data : res.data.data
      setArticles(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  return (
    <div className="flex min-h-screen">
      

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-8">
        {/* Topbar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Articles</h1>
          <div className="flex items-center gap-2">
            
          </div>
        </div>

        {/* Summary + Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium text-gray-600">
            Total Articles: <span className="font-semibold">{articles.length}</span>
          </div>
          <div className="flex gap-2">
            <select className="border rounded px-3 py-1 text-sm">
              <option>Category</option>
              <option>Technology</option>
              <option>Design</option>
            </select>
            <input
              type="text"
              placeholder="Search by title"
              className="border px-3 py-1 rounded text-sm"
            />
            <Link href="/admin/articles/create">
            <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm">
                + Add Articles
            </button>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {loading ? (
            <p className="p-4">Loading...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3 font-semibold">Thumbnails</th>
                  <th className="p-3 font-semibold">Title</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Created at</th>
                  <th className="p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-t">
                    <td className="p-3">
                      <img src={article.imageUrl || "/thumbnail.jpg"} className="w-12 h-12 rounded object-cover" />
                    </td>
                    <td className="p-3">{article.title}</td>
                    <td className="p-3">{article.category?.name || "Uncategorized"}</td>
                    <td className="p-3">{new Date(article.createdAt).toLocaleString()}</td>
                    <td className="p-3 space-x-2">
                      <a href="#" className="text-blue-500 hover:underline">Preview</a>
                      <a href="#" className="text-green-500 hover:underline">Edit</a>
                      <a href="#" className="text-red-500 hover:underline">Delete</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-center items-center gap-2 text-sm">
          <button className="px-3 py-1 border rounded">Previous</button>
          <span className="font-semibold">1</span>
          <button className="px-3 py-1 border rounded">2</button>
          <span>…</span>
          <button className="px-3 py-1 border rounded">Next</button>
        </div>
      </main>
    </div>
  )
}
