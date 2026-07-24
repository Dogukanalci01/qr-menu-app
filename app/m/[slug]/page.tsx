'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { ShoppingBag, Utensils, Phone, MapPin } from 'lucide-react';

export default function MobileMenu({ params }: { params: { slug: string } }) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Restoran Bilgisi
    const { data: restData } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (restData) setRestaurant(restData);

    // Kategoriler
    const { data: catData } = await supabase.from('categories').select('*');
    if (catData) setCategories(catData);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12 font-sans">
      {/* Kapak & Restoran Başlığı */}
      <div className="bg-orange-500 text-white p-6 rounded-b-3xl shadow-lg text-center">
        <h1 className="text-2xl font-bold">{restaurant?.name || 'Livadya Restaurant'}</h1>
        <p className="text-orange-100 text-sm mt-1">{restaurant?.subtitle || 'Lezzet, Manzara ve Huzurun Adresi'}</p>
        
        <div className="flex justify-center gap-4 mt-4 text-xs">
          <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
            <MapPin size={14} /> Lefke, Kıbrıs
          </span>
          <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
            <Phone size={14} /> 0533 866 52 78
          </span>
        </div>
      </div>

      {/* Kategoriler ve Menü */}
      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Utensils className="mx-auto mb-2 text-gray-400" size={32} />
            <p>Henüz kategori eklenmedi.</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 text-lg border-b pb-2 mb-3 flex items-center justify-between">
                <span>{cat.name}</span>
                <span className="text-xs font-normal text-orange-500">Özel Tarifler</span>
              </h2>
              <p className="text-sm text-gray-500 italic">Bu kategoride henüz ürün yok.</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
