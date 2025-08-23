"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore"
import { db } from "../../firebase"

// Import AdminLayout di sini. Asumsikan file ini berada di luar folder 'articles'.
// Misalnya, di direktori root /app/layout.js.
// Jika lokasinya berbeda, sesuaikan jalur impor.
import AdminLayout from "../any"



interface Article {
  id: string
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

  useEffect(() => {
    fetchArticles();
  }, [])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const articlesRef = collection(db, "articles");
      const querySnapshot = await getDocs(articlesRef);
      const articlesData: Article[] = [];
      querySnapshot.forEach((doc) => {
        articlesData.push({ id: doc.id, ...doc.data() } as Article);
      });
      setArticles(articlesData);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus artikel ini?")) {
      try {
        await deleteDoc(doc(db, "articles", id));
        setArticles(articles.filter(article => article.id !== id));
        window.alert("Artikel berhasil dihapus.");
      } catch (err) {
        console.error("Failed to delete article:", err);
        window.alert("Gagal menghapus artikel.");
      }
    }
  }

  return (
    <AdminLayout>
      {/* Topbar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <div className="flex items-center gap-2">
          <a href="/admin/articles/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
            + Add Articles
          </a>
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
          </select>
          <input
            type="text"
            placeholder="Search by title"
            className="border px-3 py-1 rounded text-sm"
          />
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
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No articles found.
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="border-t">
                    <td className="p-3">
                      <img 
                        src={article.imageUrl || "https://placehold.co/100x100"} 
                        alt={article.title}
                        className="w-12 h-12 rounded object-cover" 
                      />
                    </td>
                    <td className="p-3">{article.title}</td>
                    <td className="p-3">{article.category?.name || "Uncategorized"}</td>
                    <td className="p-3">{new Date(article.createdAt).toLocaleString()}</td>
                    <td className="p-3 space-x-2">
                      <a href={`/admin/articles/${article.id}/edit`} className="text-green-500 hover:underline">
                        Edit
                      </a>
                      <button onClick={() => handleDelete(article.id)} className="text-red-500 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
