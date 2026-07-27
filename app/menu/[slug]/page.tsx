'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Phone, MapPin, Instagram, Globe } from 'lucide-react';

export default function PublicMenu({ params }: { params: { slug: string } }) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuData();
  }, [params.slug]);

  const fetchMenuData = async () => {
    setLoading(true);

    // 1. Restoran Bilgisini Çek
    const { data: restData } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', params.slug)
      .maybeSingle();

    if (restData) {
      setRestaurant(restData);

      // 2. Kategorileri Çek
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (catData) setCategories(catData);

      // 3. Ürünleri Çek
      const { data: prodData } = await supabase
        .from('products')
        .select('*');

      if (prodData) setProducts(prodData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <p className="text-slate-400 font-medium">Menü Yükleniyor...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <p className="text-rose-400 font-medium">Restoran bulunamadı.</p>
      </div>
    );
  }

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category_id === activeCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12 font-sans">
      {/* Restoran Başlık / Hero Alanı */}
      <header className="bg-slate-900 border-b border-slate-800 p-6 text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 mx-auto flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/20">
          {restaurant.name ? restaurant.name[0] : 'R'}
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-white">{restaurant.name}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{restaurant.subtitle}</p>
        </div>

        {/* İletişim Butonları */}
        <div className="flex justify-center items-center gap-4 text-xs text-slate-400 pt-2">
          {restaurant.phone && (
            <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1.5 hover:text-indigo-400">
              <Phone size={14} /> {restaurant.phone}
            </a>
          )}
          {restaurant.address && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} /> {restaurant.address}
            </span>
          )}
        </div>
      </header>

      {/* Kategori Tabları (Yatay Kaydırılabilir) */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            Tüm Menü
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Ürün Listesi */}
      <main className="max-w-3xl mx-auto p-4 space-y-4 mt-2">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            Bu kategoride henüz ürün bulunmuyor.
          </div>
        ) : (
          filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex gap-4 items-center shadow-lg"
            >
              {prod.image_url && (
                <img
                  src={prod.image_url}
                  alt={prod.name}
                  className="w-24 h-24 object-cover rounded-xl border border-slate-800 flex-shrink-0"
                />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-white text-base truncate">{prod.name}</h3>
                  <span className="font-extrabold text-indigo-400 text-base whitespace-nowrap">
                    {prod.price} ₺
                  </span>
                </div>
                {prod.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
