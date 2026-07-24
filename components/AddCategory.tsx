'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase'; // '../lib/supabase' olarak güncellendi

interface AddCategoryProps {
  restaurantId: string;
  onCategoryAdded?: (newCategory: any) => void;
}

export default function AddCategory({ restaurantId, onCategoryAdded }: AddCategoryProps) {
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);

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
          sort_order: 0 
        }
      ])
      .select();

    setLoading(false);

    if (error) {
      alert('Kategori eklenirken hata oluştu: ' + error.message);
    } else {
      setCategoryName('');
      if (onCategoryAdded && data) {
        onCategoryAdded(data[0]);
      }
    }
  };

  return (
    <form onSubmit={handleAddCategory} className="flex gap-2 my-4">
      <input
        type="text"
        placeholder="Yeni Kategori Adı"
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
  );
}
