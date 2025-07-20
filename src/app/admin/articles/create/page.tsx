"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Category {
  id: number;
  name: string;
}

export default function CreateArticlePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // ✅ Fetch categories when page loads
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("https://test-fe.mysellerpintar.com/api/categories");
        const data = Array.isArray(res.data) ? res.data : res.data.data;
        setCategories(data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("image", image);
    formData.append("userId", "id-user-yang-login"); // ganti dengan userId dari auth state jika ada
    formData.append("categoryId", selectedCategory);

    try {
      const res = await axios.post("https://your-api/articles", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Article created:", res.data);
      alert("Article created successfully");
      // Optionally redirect or reset form here
      setTitle("");
      setContent("");
      setImage(null);
      setSelectedCategory("");
    } catch (err) {
      console.error(err);
      alert("Failed to create article");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Create Article</h1>
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

        {/* ✅ Category Dropdown */}
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
          required
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Create
        </button>
      </form>
    </div>
  );
}
