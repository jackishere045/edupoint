"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Search } from "lucide-react"
import KategoriFilter from "@/components/ui/KategoriFilter"

interface Category {
  id: number
  name: string
  userId: number
  createdAt: string
  updatedAt: string
}

interface User {
  id: number
  username: string
}

interface Article {
  id: number
  title: string
  imageUrl: string
  category: Category
  user: User
  content: string
}


export default function EdupointPage() {
  const [username, setUsername] = useState("")
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  const articlesPerPage = 10

  useEffect(() => {
  const storedUsername = localStorage.getItem("username")
  const token = localStorage.getItem("token")

  if (!token) {
    // Jika tidak ada token, redirect ke login
    window.location.href = "/login"
    return
  }

  if (storedUsername) {
    setUsername(storedUsername)
  }
}, [])


  const fetchArticles = async (category = "") => {
    setLoading(true)
    try {
      let url = "https://test-fe.mysellerpintar.com/api/articles?limit=10"
      if (category) url += `&category=${category}`

      const res = await axios.get(url)
      const data = Array.isArray(res.data) ? res.data : res.data.data
      setArticles(data)
      setCurrentPage(1)

      const uniqueCategoriesMap = new Map()
      data.forEach((article: Article) => {
        if (typeof article.category === "object") {
          uniqueCategoriesMap.set(article.category.id, article.category.name)
        }
      })
      const uniqueCategories = Array.from(uniqueCategoriesMap, ([id, name]) => ({ id, name }))
      setCategories(uniqueCategories)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
  fetchArticles()
}, [])


  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  const totalPage = Math.ceil(filteredArticles.length / articlesPerPage)
  const indexOfLastArticle = currentPage * articlesPerPage
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle)

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1)
  const handleNext = () => currentPage < totalPage && setCurrentPage(currentPage + 1)

  return (
    <div className="font-poppins">

      {/* Navbar */}
      {/* Top bar (logo & username) */}
    <div className="absolute top-4 left-6 right-6 flex justify-between items-center text-sm z-10">
      <div className="font-bold text-white text-lg">EduPoint</div>
      <button
  onClick={() => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    window.location.href = "/login" // redirect ke halaman login
  }}
  className="text-sm text-white hover:underline"
>
  Logout
</button>

    </div>


      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[420px] overflow-hidden text-white z-0">
        <img src="/bg.jpg" alt="Hero" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="absolute inset-0 bg-blue-600/70 z-0" />
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <p className="text-sm md:text-base">Blog Genzet</p>
          <h1 className="text-3xl md:text-5xl font-semibold mb-2">
            The Journal : Design Resources,<br /> Interviews, and Industry News
          </h1>
          <p className="text-sm md:text-base">Your daily dose of design inspiration</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="relative z-20 -mt-28 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 bg-white shadow-md p-4 rounded-lg">
          <KategoriFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(kategori) => {
              setSelectedCategory(kategori)
              fetchArticles(kategori)
            }}
          />

          <div className="flex items-center border rounded-full px-4 py-2 w-full md:w-64">
            <input
              type="text"
              placeholder="Search"
              className="outline-none text-sm w-full"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value)
                setCurrentPage(1)
              }}
            />
            <Search className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-6xl mx-auto px-4 mt-12">
        <h2 className="text-xl font-semibold mb-4">Latest stories</h2>
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : currentArticles.length === 0 ? (
          <p className="p-4">No articles found.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {currentArticles.map((article) => (
              <Link
                key={article.id}
                href={`/edupoint/${article.id}`}
                className="bg-white shadow-md rounded-lg overflow-hidden hover:scale-[1.02] transition-transform"
              >
                <img
                  src={article.imageUrl || "https://via.placeholder.com/300x200"}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 space-y-1">
                  <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                  <h3 className="text-lg font-semibold text-gray-800">{article.title}</h3>
                  <p className="text-sm text-gray-500">
                    {article.author} {" "}
                    {typeof article.category === "object" ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {article.category.name}
                      </span>
                    ) : (
                      <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                        {article.category || "Uncategorized"}
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-2 mt-10">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">
            Page <strong>{currentPage}</strong> of {totalPage}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPage}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-6 border-t mt-10 bg-blue-500 text-white">
        © 2025 Edupoint. All rights reserved.
      </footer>
    </div>
  )
}
