'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AddCategory from '@/components/AddCategory';

// Supabase'deki 'categories' tablosunun tip tanımı
interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Test için sabit bir restoran ID'si (Kendi veritabanındaki geçerli bir UUID ile değiştirebilirsin)
  const restaurantId = "123e4567-e89b-12d3-a456-426614174000"; 

  // Kategorileri Supabase'den Çekme Fonksiyonu
  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Kategoriler çekilirken hata oluştu:', error.message);
    } else if (data) {
      setCategories(data);
    }
    setLoading(false);
  };

  // Sayfa yüklendiğinde kategorileri getir
  useEffect(() => {
    fetchCategories();
  }, []);

  // Yeni kategori eklendiğinde state'e ekleyip anında ekranda gösterme
  const handleCategoryAdded = (newCategory: Category) => {
    setCategories((prevCategories) => [...prevCategories, newCategory]);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          QR Menü - Kategori Yönetimi
        </h1>

        {/* 1. KATEGORİ EKLEME FORMU */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-2">Yeni Kategori Ekle</h2>
          <AddCategory 
            restaurantId={restaurantId} 
            onCategoryAdded={handleCategoryAdded} 
          />
        </div>

        <hr className="my-6 border-gray-200" />

        {/* 2. KATEGORİ LİSTESİ */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3">Mevcut Kategoriler</h2>
          
          {loading ? (
            <p className="text-gray-500 text-sm">Kategoriler yükleniyor...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-400 text-sm">Henüz hiç kategori eklenmemiş.</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((category) => (
                <li 
                  key={category.id} 
                  className="flex items-center justify-between p-3 bg-gray-100 rounded border border-gray-200 text-gray-800 font-medium"
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-400">ID: {category.id.slice(0, 8)}...</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
