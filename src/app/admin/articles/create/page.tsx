"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

export default function CreateArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await axios.get("https://test-fe.mysellerpintar.com/api/categories");
        const data = Array.isArray(res.data) ? res.data : res.data.data;
        setCategories(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch categories. Please try again.");
      }
    };
    fetchCategories();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl = null;
      // 1. Upload gambar jika ada
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        const uploadRes = await axios.post("https://test-fe.mysellerpintar.com/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        imageUrl = uploadRes.data.imageUrl;
      }
      
      // 2. Kirim data artikel dalam format JSON
      const articleData = {
        title,
        content,
        categoryId: selectedCategory,
        ...(imageUrl && { imageUrl }), // Tambahkan imageUrl jika ada
      };

      const res = await axios.post("https://test-fe.mysellerpintar.com/api/articles", articleData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      console.log("Article created:", res.data);
      alert("Article created successfully!");
      router.push("/admin/articles");
      
    } catch (err) {
      console.error(err);
      setError("Failed to create article. Please check your data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Create Article</h1>
      {error && <div className="p-2 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 w-full rounded"
          required
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) {
              setImage(e.target.files[0]);
            }
          }}
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}