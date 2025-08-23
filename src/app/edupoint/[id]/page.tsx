"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { db } from "@/app/firebase"
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore"

interface Category {
  id: string
  name: string
}

interface User {
  id: string
  username: string
}

interface Article {
  id: string
  title: string
  imageUrl: string
  category: Category
  user: User
  content: string
  createdAt?: string
  tags?: string[]
}

export default function ArticleDetailPage() {
  const { id } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [otherArticles, setOtherArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  // state untuk search
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<Article[]>([])

  // ambil semua artikel untuk search (biar bisa difilter)
  const [allArticles, setAllArticles] = useState<Article[]>([])

  const fetchArticle = async (articleId: string) => {
    setLoading(true)
    try {
      const articleRef = doc(db, "articles", articleId)
      const docSnap = await getDoc(articleRef)

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Article
        setArticle(data)

        if (data.category?.name) {
          const otherArticlesRef = collection(db, "articles")
          const q = query(
            otherArticlesRef,
            where("category.name", "==", data.category.name),
            where("__name__", "!=", data.id),
            limit(3)
          )
          const querySnapshot = await getDocs(q)
          const otherArticlesData: Article[] = []
          querySnapshot.forEach((doc) => {
            otherArticlesData.push({ id: doc.id, ...doc.data() } as Article)
          })
          setOtherArticles(otherArticlesData)
        }
      } else {
        setArticle(null)
      }
    } catch (err) {
      console.error("Error fetching article from Firestore:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllArticles = async () => {
    try {
      const allRef = collection(db, "articles")
      const snap = await getDocs(allRef)
      const all: Article[] = []
      snap.forEach((doc) => {
        all.push({ id: doc.id, ...doc.data() } as Article)
      })
      setAllArticles(all)
    } catch (err) {
      console.error("Error fetching all articles:", err)
    }
  }

  useEffect(() => {
    if (typeof id === "string") {
      fetchArticle(id)
    }
    fetchAllArticles()
  }, [id])

  if (loading) return <p className="p-4">Loading...</p>
  if (!article) return <p className="p-4">Article not found</p>

  // fungsi handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)

    if (value.length > 0) {
      const filtered = allArticles.filter((item) =>
        item.title.toLowerCase().includes(value.toLowerCase())
      )
      setResults(filtered)
    } else {
      setResults([])
    }
  }

  return (
    <div className="font-poppins max-w-6xl mx-auto px-6">
      {/* Navbar */}
      <nav className="flex justify-between items-center py-4 relative">
        <a className="text-xl font-bold">EduPoint</a>
        
        {/* Search bar */}
        <div className="relative w-64">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Cari artikel..."
            className="border-2 border-gray-300 text-black px-3 py-1 rounded-md focus:outline-none focus:border-gray-600"
          />

          {results.length > 0 && (
            <ul className="absolute left-0 mt-1 w-full bg-white border rounded-md shadow text-sm max-h-60 overflow-y-auto z-20">
              {results.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/edupoint/${item.id}`}
                    className="block px-3 py-2 hover:bg-gray-100"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex space-x-6 text-sm font-medium">
          <Link href="/">Home</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:underline">Home</Link> &gt;{" "}
        <span className="text-gray-600">
          {article.category.name}
        </span>{" "}
        &gt; <span className="text-gray-900">{article.title}</span>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-12 mt-6">
        <div className="w-full lg:w-3/4 pr-0 lg:pr-8">
          <h1 className="text-3xl font-bold mb-2">{article.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span>By {article.user?.username || "Unknown"}</span>
            {article.createdAt && <span>{article.createdAt}</span>}
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="flex gap-2 mb-4">
              {article.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full max-h-96 object-cover mb-6 rounded"
          />

          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-1/4">
          <h2 className="text-xl font-semibold mb-4">
            Artikel lainnya di {article.category.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {otherArticles.map((a) => (
              <Link
                href={`/edupoint/${a.id}`}
                key={a.id}
                className="block border rounded overflow-hidden hover:shadow"
              >
                <img
                  src={a.imageUrl}
                  alt={a.title}
                  className="w-full h-32 object-cover"
                />
                <div className="p-2">
                  <h3 className="text-sm font-medium">{a.title}</h3>
                  <p className="text-xs text-gray-500">By {a.user.username}</p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
