"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useRouter, useParams } from "next/navigation"
import { db } from "../../../../firebase"
import AdminLayout from "../../../any"

interface Category {
  id: string;
  name: string;
}

interface Article {
  id?: string;
  title: string;
  content: string;
  imageUrl: string;
  category: Category;
  user: {
    id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

const categories: Category[] = [
  { id: 'pendidikan', name: 'Pendidikan' },
  { id: 'teknologi', name: 'Teknologi' },
  { id: 'kesehatan', name: 'Kesehatan' },
  { id: 'bisnis', name: 'Bisnis' },
  { id: 'lifestyle', name: 'Lifestyle' }
];

export default function EditArticlePage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    categoryId: 'pendidikan'
  })
  const [loading, setLoading] = useState(false)
  const [loadingArticle, setLoadingArticle] = useState(true)
  const [error, setError] = useState('')
  const [originalArticle, setOriginalArticle] = useState<Article | null>(null)
  
  const router = useRouter()
  const params = useParams()
  const articleId = params?.id as string

  useEffect(() => {
    if (articleId) {
      fetchArticle()
    }
  }, [articleId])

  const fetchArticle = async () => {
    try {
      const docRef = doc(db, 'articles', articleId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const article = { id: docSnap.id, ...docSnap.data() } as Article
        setOriginalArticle(article)
        
        setFormData({
          title: article.title,
          content: article.content,
          imageUrl: article.imageUrl,
          categoryId: article.category?.id || 'pendidikan'
        })
      } else {
        setError('Artikel tidak ditemukan')
      }
    } catch (error) {
      console.error('Error fetching article:', error)
      setError('Gagal mengambil data artikel')
    } finally {
      setLoadingArticle(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Judul dan konten harus diisi')
      return
    }

    setLoading(true)
    setError('')

    try {
      const selectedCategory = categories.find(cat => cat.id === formData.categoryId)
      
      const updatedData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1506765515384-028b60a970df?w=800',
        category: {
          id: formData.categoryId,
          name: selectedCategory?.name || 'Pendidikan'
        },
        updatedAt: new Date().toISOString()
      }

      await updateDoc(doc(db, 'articles', articleId), updatedData)
      
      window.alert('Artikel berhasil diupdate!')
      router.push('/admin/articles')
      
    } catch (error) {
      console.error('Error updating article:', error)
      setError('Gagal mengupdate artikel. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingArticle) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading article...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error && !originalArticle) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-red-600 text-lg font-semibold mb-4">
            {error}
          </div>
          <button
            onClick={() => router.push('/admin/articles')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Articles
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Article</h1>
            <p className="text-sm text-gray-600 mt-1">Edit artikel: {originalArticle?.title}</p>
          </div>
          <button
            onClick={() => router.push('/admin/articles')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Back to Articles
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Article Info */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Article Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Created:</span> {originalArticle?.createdAt ? new Date(originalArticle.createdAt).toLocaleString('id-ID') : '-'}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {originalArticle?.updatedAt ? new Date(originalArticle.updatedAt).toLocaleString('id-ID') : '-'}
                  </div>
                  <div>
                    <span className="font-medium">Author:</span> {originalArticle?.user?.username || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Article ID:</span> {articleId}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Artikel *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan judul artikel..."
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Gambar
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Konten Artikel *
                </label>
                <textarea
                  id="content"
                  name="content"
                  required
                  rows={12}
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tulis konten artikel di sini..."
                />
              </div>

              {/* Preview */}
              {formData.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview Gambar
                  </label>
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-32 h-24 object-cover rounded-md border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => router.push('/admin/articles')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}