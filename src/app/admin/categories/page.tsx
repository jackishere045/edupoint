"use client"

import { useEffect, useState } from "react"
import { getAuth, signInWithCustomToken, onAuthStateChanged, signOut, signInAnonymously } from "firebase/auth"
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore"
import { initializeApp } from "firebase/app"

// Inisialisasi Firebase dan Firestore menggunakan variabel global yang disediakan.
// Ini adalah kunci agar koneksi database berfungsi dengan benar di lingkungan ini.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : '';

// Jika firebaseApp sudah diinisialisasi, gunakan yang sudah ada.
let firebaseApp;
if (typeof window !== 'undefined' && !window._firebaseApp) {
  window._firebaseApp = initializeApp(firebaseConfig);
}
firebaseApp = typeof window !== 'undefined' ? window._firebaseApp : null;

const auth = firebaseApp ? getAuth(firebaseApp) : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;

// Komponen Layout yang digabungkan langsung
interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  
  // Karena `next/navigation` tidak tersedia, kita akan mengasumsikan
  // halaman ini adalah yang aktif untuk sorotan navigasi.

  useEffect(() => {
    const authCheck = async () => {
      if (!auth) {
        setIsAuthChecked(true);
        return;
      }
      
      // Masuk dengan token kustom jika ada, atau secara anonim.
      if (initialAuthToken) {
        try {
          await signInWithCustomToken(auth, initialAuthToken);
        } catch (error) {
          console.error("Error signing in with custom token:", error);
        }
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Error signing in anonymously:", error);
        }
      }

      // Atur listener state otentikasi untuk menjaga status login
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          // Arahkan ke login jika tidak terotentikasi setelah pemeriksaan awal
          window.location.href = "/admin/login";
        }
        setIsAuthChecked(true);
      });

      return () => unsubscribe();
    };

    authCheck();
  }, [auth, initialAuthToken]);

  if (!isAuthChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Memeriksa otentikasi...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Komponen tidak dirender saat mengarahkan
  }

  // Fungsi untuk menentukan kelas CSS berdasarkan path, di sini disederhanakan
  const getNavLinkClass = (isCurrent: boolean) => {
    return isCurrent
      ? "block p-2 rounded bg-white text-gray-800"
      : "block p-2 rounded hover:bg-gray-700 text-white";
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Dasbor Admin</h2>
        <nav className="space-y-2">
          <a href="/admin/articles" className={getNavLinkClass(false)}>
            Artikel
          </a>
          <a href="/admin/categories" className={getNavLinkClass(true)}>
            Kategori
          </a>
          <button
            onClick={() => signOut(auth).then(() => {
                window.location.href = "/admin/login";
            })}
            className="block w-full text-left p-2 rounded hover:bg-gray-700"
          >
            Keluar
          </button>
        </nav>
      </div>
      {/* Konten Utama */}
      <main className="flex-1 bg-gray-50 p-8">
        {children}
      </main>
    </div>
  );
}

// Komponen utama halaman Kategori
interface Category {
  id: string
  name: string
  createdAt: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalAction, setModalAction] = useState<(() => Promise<void>) | null>(null);

  // Gunakan useEffect untuk menunggu otentikasi selesai sebelum mengambil data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && db) {
        fetchCategories();
      } else {
        // Jika tidak ada pengguna, hentikan pemuatan
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [db, auth])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const categoriesRef = collection(db, "categories");
      const querySnapshot = await getDocs(categoriesRef);
      const categoriesData: Category[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        categoriesData.push({ 
          id: doc.id, 
          name: data.name, 
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : '' 
        });
      });
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      showCustomModal('Gagal Mengambil Kategori', 'Gagal memuat kategori. Pastikan Anda memiliki izin yang benar.');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = (id: string) => {
    setModalTitle('Konfirmasi Penghapusan');
    setModalMessage('Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat diurungkan.');
    setModalAction(() => async () => {
      try {
        await deleteDoc(doc(db, "categories", id));
        setCategories(categories.filter(category => category.id !== id));
        showCustomModal('Berhasil', 'Kategori berhasil dihapus.', false);
      } catch (err) {
        console.error("Failed to delete category:", err);
        showCustomModal('Gagal', 'Gagal menghapus kategori. Periksa izin Anda.', false);
      }
      setShowModal(false);
    });
    setShowModal(true);
  }

  const showCustomModal = (title: string, message: string, isConfirm: boolean = false) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
    if (!isConfirm) {
      setModalAction(null);
    }
  };

  return (
    <AdminLayout>
      {/* Topbar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Kategori</h1>
        <div className="flex items-center gap-2">
          <a href="/admin/categories/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
            + Tambah Kategori
          </a>
        </div>
      </div>

      {/* Summary + Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm font-medium text-gray-600">
          Total Kategori: <span className="font-semibold">{categories.length}</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Cari berdasarkan nama"
            className="border px-3 py-1 rounded text-sm"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <p className="p-4">Memuat...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3 font-semibold">Nama</th>
                <th className="p-3 font-semibold">Dibuat pada</th>
                <th className="p-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    Tidak ada kategori yang ditemukan.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="border-t">
                    <td className="p-3">{category.name}</td>
                    <td className="p-3">{category.createdAt}</td>
                    <td className="p-3 space-x-2">
                      <a href={`/admin/categories/${category.id}/edit`} className="text-green-500 hover:underline">
                        Edit
                      </a>
                      <button onClick={() => handleDelete(category.id)} className="text-red-500 hover:underline">
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Kustom */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80">
            <h3 className="text-lg font-bold mb-4">{modalTitle}</h3>
            <p className="mb-6">{modalMessage}</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Tutup
              </button>
              {modalAction && (
                <button
                  onClick={modalAction}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Konfirmasi
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
