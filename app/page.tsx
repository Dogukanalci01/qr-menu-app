'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // lib/supabase.ts dosyasını import eder

// Kategori Arayüz Tipi
interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Kendi restoran UUID değerini veya test için bir string yazabilirsin
  const restaurantId = "123e4567-e89b-12d3-a456-426614174000"; 

  // 1. Kategorileri Supabase'den Çek
  const fetchCategories = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Hata:', error.message);
    } else if (data) {
      setCategories(data);
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Yeni Kategori Ekleme İşlemi
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('categories')
      .insert([
        { 
          name: categoryName, 
          restaurant_id: restaurantId,
          sort_order: categories.length + 1 
        }
      ])
      .select();

    setLoading(false);

    if (error) {
      alert('Kategori eklenirken hata oluştu: ' + error.message);
    } else if (data) {
      setCategoryName('');
      setCategories((prev) => [...prev, data[0]]); // Ekranı anında güncelle
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          QR Menü - Kategori Yönetimi
        </h1>

        {/* Ekleme Formu */}
        <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Kategori Adı (Örn: İçecekler)"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 font-medium whitespace-nowrap"
          >
            {loading ? 'Ekleniyor...' : 'Kategori Ekle'}
          </button>
        </form>

        <hr className="my-6 border-gray-200" />

        {/* Kategori Listesi */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">Mevcut Kategoriler</h2>
          
          {fetching ? (
            <p className="text-gray-500 text-sm">Yükleniyor...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-400 text-sm">Henüz eklenmiş bir kategori yok.</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li 
                  key={cat.id} 
                  className="flex items-center justify-between p-3 bg-gray-100 rounded border border-gray-200 text-gray-800 font-medium"
                >
                  <span>{cat.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
