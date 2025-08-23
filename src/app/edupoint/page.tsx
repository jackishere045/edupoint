"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Sun, Moon } from "lucide-react";
import KategoriFilter from "@/components/ui/KategoriFilter";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

interface Category {
  id: string;
  name: string;
}

interface User {
  id: string;
  username: string;
}

interface Article {
  id: string;
  title: string;
  imageUrl: string;
  category: Category;
  user: User;
  content: string;
  author: string;
}

export default function EdupointPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<
    { id: string; name: string }[]
  >([]);

  const articlesPerPage = 9;

  // Efek untuk mode gelap
  useEffect(() => {
    const savedMode = localStorage.getItem("isDarkMode");
    if (savedMode) {
      setIsDarkMode(JSON.parse(savedMode));
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // Mengambil SEMUA artikel dan membuat daftar kategori unik
  const fetchAllArticles = async () => {
    setLoading(true);
    try {
      const articlesCollection = collection(db, "articles");
      const querySnapshot = await getDocs(articlesCollection);
      
      const fetchedArticles: Article[] = [];
      const uniqueCategoriesMap = new Map();

      querySnapshot.forEach((doc) => {
        const articleData = { id: doc.id, ...doc.data() } as Article;
        fetchedArticles.push(articleData);

        if (articleData.category && typeof articleData.category === "object") {
          uniqueCategoriesMap.set(articleData.category.id, articleData.category.name);
        }
      });
      
      setAllArticles(fetchedArticles);
      
      const uniqueCategories = Array.from(uniqueCategoriesMap, ([id, name]) => ({ id, name }));
      setCategories(uniqueCategories);
      
    } catch (err) {
      console.error("Error fetching articles from Firestore:", err);
    } finally {
      setLoading(false);
    }
  };

  // Panggil fetchAllArticles HANYA SEKALI saat komponen dimuat
  useEffect(() => {
    fetchAllArticles();
  }, []);

  // Efek untuk MENGAPLIKASIKAN filter ketika state berubah
  useEffect(() => {
    let filtered = [...allArticles];

    // 1. Filter berdasarkan kategori yang dipilih
    if (selectedCategory) {
      filtered = filtered.filter(article => 
        article.category?.name === selectedCategory
      );
    }

    // 2. Filter berdasarkan keyword pencarian
    if (searchKeyword) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }
    
    setArticles(filtered);
    setCurrentPage(1);
  }, [selectedCategory, searchKeyword, allArticles]);

  const totalPage = Math.ceil(articles.length / articlesPerPage);
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(
    indexOfFirstArticle,
    indexOfLastArticle
  );

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () =>
    currentPage < totalPage && setCurrentPage(currentPage + 1);

  return (
    <div className="font-poppins bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      {/* Navbar */}
      <div className="absolute top-4 left-6 right-6 flex justify-between items-center text-sm z-10">
        <a className="text-xl font-bold text-white">EduPoint</a>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="text-white hover:text-gray-300"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[300px] sm:h-[380px] md:h-[420px] overflow-hidden text-white z-0">
        <img
          src="/bg.jpg"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-blue-600/70 z-0" />
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <p className="text-xs sm:text-sm md:text-base">Edupoint Blog</p>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold mb-2">
            Education Articles, Trends,
            <br /> and Academic Insights
          </h1>
          <p className="text-xs sm:text-sm md:text-base">
            Your Daily Dose of Knowledge
          </p>

        </div>
      </div>

      {/* Search & Filter */}
      <div className="relative z-20 -mt-18 max-w-4xl mx-auto px-4">
        <div className="flex flex-row justify-center items-center gap-2">
          <KategoriFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(kategori) => setSelectedCategory(kategori)}
          />

          <div className="flex items-center border rounded-full px-3 py-1 w-full sm:w-64 bg-gray-100 dark:bg-gray-700">
            <input
              type="text"
              placeholder="Search"
              className="outline-none text-xs sm:text-sm w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {currentArticles.map((article) => (
              <Link
                key={article.id}
                href={`/edupoint/${article.id}`}
                className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden hover:scale-[1.02] transition-transform"
              >
                <img
                  src={article.imageUrl || "https://via.placeholder.com/300x200"}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleDateString()}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {article.user?.username}
                    {" "}
                    {typeof article.category === "object" ? (
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full">
                        {article.category.name}
                      </span>
                    ) : (
                      <span className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        {article.category || "Uncategorized"}
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex justify-center items-center space-x-2 mt-10">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 border-gray-300 dark:border-gray-600"
          >
            Prev
          </button>
          <span className="text-sm">
            Page <strong>{currentPage}</strong> of {totalPage}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPage}
            className="px-3 py-1 border rounded disabled:opacity-50 border-gray-300 dark:border-gray-600"
          >
            Next
          </button>
        </div>
      </div>

      <footer className="text-center text-sm py-6 border-t mt-10 bg-blue-500 text-white">
        © 2025 Edupoint. All rights reserved.
      </footer>
    </div>
  );
}