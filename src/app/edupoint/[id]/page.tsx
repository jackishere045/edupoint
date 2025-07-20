"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import Link from "next/link"

interface Category {
  id: number
  name: string
}

interface User {
  id: string
  username: string
}

interface Article {
  id: number
  title: string
  image: string
  user: string
  content: string
  category: Category
}

export default function ArticleDetailPage() {
  const { id } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [otherArticles, setOtherArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  const fetchArticle = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`https://test-fe.mysellerpintar.com/api/articles/${id}`)
      const data = res.data
      setArticle(data)

      // Fetch other articles in same category
      const otherRes = await axios.get(`https://test-fe.mysellerpintar.com/api/articles?category=${data.category.name}`)
      const allOther = Array.isArray(otherRes.data) ? otherRes.data : otherRes.data.data

      const filteredOthers = allOther.filter((a: Article) => a.id !== data.id).slice(0, 3)
      setOtherArticles(filteredOthers)

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticle()
  }, [id])

  if (loading) return <p className="p-4">Loading...</p>
  if (!article) return <p className="p-4">Article not found</p>

  return (
    <div className="font-poppins max-w-6xl mx-auto px-6">
      {/* Navbar */}
      <nav className="flex justify-between items-center py-4">
        <div className="text-xl font-bold">EduPoint</div>

        <div className="flex space-x-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-12 mt-6">
        <div className="w-full lg:w-3/4 pr-0 lg:pr-8">
          <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
          <p className="text-gray-600 mb-4">By {article.user?.username || "Unknown"}</p>
          <img src={article.imageUrl} alt={article.title} className="w-full max-h-96 object-cover mb-4 rounded" />
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        {/* Other articles */}
        <div className="w-full lg:w-1/4">
          <h2 className="text-xl font-semibold mb-4">Artikel lainnya di {article.category.name}</h2>
          <div className="space-y-4">
            {otherArticles.map((a) => (
              <Link href={`/edupoint/${a.id}`} key={a.id} className="block border rounded overflow-hidden hover:shadow">
                <img src={a.image} alt={a.title} className="w-full h-32 object-cover" />
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
