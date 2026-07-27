'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Phone, MapPin, Flame, Info } from 'lucide-react';

const ALLERGEN_OPTIONS = [
  { id: 'gluten', label: 'Gluten İçeren Tahıllar', icon: '🌾' },
  { id: 'crustaceans', label: 'Kabuklular', icon: '🦐' },
  { id: 'egg', label: 'Yumurta', icon: '🥚' },
  { id: 'fish', label: 'Balık', icon: '🐟' },
  { id: 'peanuts', label: 'Yer Fıstığı', icon: '🥜' },
  { id: 'soy', label: 'Soya', icon: '🌱' },
  { id: 'milk', label: 'Süt ve Süt Ürünleri', icon: '🥛' },
  { id: 'nuts', label: 'Kabuklu Kuruyemişler', icon: '🌰' },
  { id: 'celery', label: 'Kereviz', icon: '🌿' },
  { id: 'mustard', label: 'Hardal', icon: '🌭' },
  { id: 'sesame', label: 'Susam', icon: '🌾' },
  { id: 'sulfites', label: 'Kükürt Dioksit ve Sülfitler', icon: '🧪' },
  { id: 'lupin', label: 'Acı Bakla (Lupin)', icon: '🌸' },
  { id: 'molluscs', label: 'Yumuşakçalar', icon: '🐙' },
  { id: 'corn', label: 'Mısır', icon: '🌽' },
  { id: 'chocolate', label: 'Çikolata', icon: '🍫' },
  { id: 'legumes', label: 'Kuru Baklagil', icon: '🫘' },
  { id: 'caffeine', label: 'Kafein', icon: '☕' }
];

export default function PublicMenu({ params }: { params: { slug: string } }) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [selectedSubCat, setSelectedSubCat] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.slug]);

  const fetchData = async () => {
    setLoading(true);

    // 1. Restoran Bilgilerini Çek
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
        .eq('restaurant_id', restData.id)
        .order('sort_order', { ascending: true });

      if (catData) setCategories(catData);

      // 3. Alt Kategorileri Çek
      const { data: subData } = await supabase
        .from('subcategories')
        .select('*')
        .eq('restaurant_id', restData.id)
        .order('sort_order', { ascending: true });

      if (subData) setSubcategories(subData);

      // 4. Ürünleri Çek
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restData.id);

      if (prodData) setProducts(prodData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Menü Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mb-4">
          <Info size={32} />
        </div>
        <h1 className="text-xl font-bold">Restoran Bulunamadı</h1>
        <p className="text-slate-400 text-xs mt-1 max-w-xs">
          QR kodun yönlendirdiği restoran adresi geçersiz veya kaldırılmış olabilir.
        </p>
      </div>
    );
  }

  // Seçili Ana Kategoriye göre Alt Kategorileri Filtrele
  const currentSubCategories = subcategories.filter(s => s.category_id === selectedCat);

  // Ürün Filtreleme Mantığı
  const filteredProducts = products.filter(p => {
    if (selectedCat !== 'all' && p.category_id !== selectedCat) return false;
    if (selectedSubCat !== 'all' && p.subcategory_id !== selectedSubCat) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Restoran Üst Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-6 text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 mx-auto flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/20">
          {restaurant.name ? restaurant.name[0] : 'R'}
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">{restaurant.name}</h1>
        {restaurant.subtitle && (
          <p className="text-xs text-slate-400 font-medium">{restaurant.subtitle}</p>
        )}

        <div className="flex justify-center items-center gap-4 text-[11px] text-slate-400 pt-2">
          {restaurant.phone && (
            <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1 hover:text-indigo-400 transition">
              <Phone size={12} /> {restaurant.phone}
            </a>
          )}
          {restaurant.address && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {restaurant.address}
            </span>
          )}
        </div>
      </header>

      {/* Ana Kategoriler (Kaydırılabilir Tablar) */}
      <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-xl mx-auto flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setSelectedCat('all'); setSelectedSubCat('all'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCat === 'all'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            Tüm Menü
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCat(cat.id); setSelectedSubCat('all'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCat === cat.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Alt Kategoriler (Varsa Filtre Olarak Çıkar) */}
        {selectedCat !== 'all' && currentSubCategories.length > 0 && (
          <div className="max-w-xl mx-auto flex gap-1.5 overflow-x-auto no-scrollbar pt-2.5 mt-2 border-t border-slate-800/60">
            <button
              onClick={() => setSelectedSubCat('all')}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                selectedSubCat === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800'
              }`}
            >
              Tümü
            </button>
            {currentSubCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubCat(sub.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                  selectedSubCat === sub.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Müşteri Yemek Listesi */}
      <main className="max-w-xl mx-auto p-4 space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8 text-center text-slate-500 text-xs">
            Bu kategoride henüz sunulan bir lezzet yok.
          </div>
        ) : (
          filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex gap-4 items-start shadow-xl relative overflow-hidden"
            >
              {prod.image_url ? (
                <img
                  src={prod.image_url}
                  alt={prod.name}
                  className="w-24 h-24 object-cover rounded-xl border border-slate-800/80 flex-shrink-0"
                />
              ) : null}

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-white text-sm leading-snug">{prod.name}</h3>
                  <span className="font-extrabold text-indigo-400 text-sm whitespace-nowrap bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                    {prod.price} ₺
                  </span>
                </div>

                {prod.description && (
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {prod.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* Kalori */}
                  {prod.calories > 0 && (
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                      <Flame size={10} /> {prod.calories} kcal
                    </span>
                  )}

                  {/* Alerjen Rozetleri */}
                  {prod.allergens && prod.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {prod.allergens.map((algId: string) => {
                        const alg = ALLERGEN_OPTIONS.find(a => a.id === algId);
                        return alg ? (
                          <span
                            key={algId}
                            className="bg-slate-950 border border-slate-800 text-[10px] px-1.5 py-0.5 rounded text-slate-300 flex items-center gap-1"
                            title={alg.label}
                          >
                            {alg.icon}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
