'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Phone, MapPin, Clock, Flame, Info, Bell, ChevronDown } from 'lucide-react';

export default function PublicMenu() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // En son eklenen aktif restoranı çek
    const { data: restData } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (restData) {
      setRestaurant(restData);

      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restData.id)
        .order('sort_order', { ascending: true });

      if (catData) setCategories(catData);

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
      <div className="min-h-screen bg-white text-slate-800 flex items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-xs font-semibold">Menü Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
          <Info size={32} />
        </div>
        <h1 className="text-xl font-bold">Restoran Bulunamadı</h1>
      </div>
    );
  }

  const template = restaurant.template || 'modern';

  const filteredProducts = products.filter(p => {
    if (selectedCat !== 'all' && p.category_id !== selectedCat) return false;
    return true;
  });

  // 1. KENDİ MENÜNÜ EKLE (PDF / GÖRSEL)
  if (template === 'pdf_image') {
    return (
      <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center">
        <header className="w-full bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center max-w-md">
          <div className="flex items-center gap-3">
            {/* LOGO EKLENDİ */}
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-slate-700" />
            ) : (
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-orange-500">{restaurant.name[0]}</div>
            )}
            <h1 className="font-bold text-sm">{restaurant.name}</h1>
          </div>
          {restaurant.phone && (
            <a href={`tel:${restaurant.phone}`} className="bg-orange-500 p-2 rounded-xl text-white">
              <Phone size={16} />
            </a>
          )}
        </header>
        <main className="max-w-md w-full p-2 space-y-3">
          {restaurant.custom_menu_image ? (
            <img src={restaurant.custom_menu_image} alt="Menü Broşürü" className="w-full rounded-xl shadow-2xl" />
          ) : (
            <div className="bg-slate-800 p-12 text-center rounded-2xl text-slate-400 text-xs">
              Henüz menü broşür görseli yüklenmedi.
            </div>
          )}
        </main>
      </div>
    );
  }

  // 2. MENÜM ÖZEL TEMASI (KARE KATEGORİ GRID)
  if (template === 'custom_grid') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-12">
        <div className="bg-orange-500 text-white p-3 flex justify-between items-center px-4">
          <Info size={20} />
          <div className="flex gap-2">
            <button className="bg-white/20 p-1.5 rounded-lg"><Bell size={16} /></button>
            <span className="bg-white text-orange-600 px-2 py-0.5 rounded text-xs font-bold">TR</span>
          </div>
        </div>

        {/* KAPAK FOTOĞRAFI EKLENDİ */}
        {restaurant.cover_image && (
          <div 
            className="w-full h-36 bg-cover bg-center" 
            style={{ backgroundImage: `url(${restaurant.cover_image})` }}
          ></div>
        )}

        <div className="bg-white p-5 shadow-sm space-y-2 border-b">
          <div className="flex items-center gap-3">
            {/* LOGO EKLENDİ */}
            {restaurant.logo_url && (
              <img src={restaurant.logo_url} alt="Logo" className="w-14 h-14 rounded-xl object-cover shadow-sm border border-slate-100" />
            )}
            <div>
              <h1 className="text-xl font-extrabold">{restaurant.name}</h1>
              <p className="text-xs text-slate-500 font-medium">{restaurant.subtitle || 'Yemek Bizim İşimiz'}</p>
            </div>
          </div>

          <div className="space-y-1 text-xs text-slate-600 pt-3 border-t mt-3">
            <p className="flex items-center gap-1.5"><Clock size={14} className="text-orange-500" /> {restaurant.working_hours || '08:00 - 24:00'}</p>
            {restaurant.address && <p className="flex items-center gap-1.5"><MapPin size={14} className="text-orange-500" /> {restaurant.address}</p>}
          </div>
        </div>

        {selectedCat === 'all' ? (
          <div className="max-w-md mx-auto p-4 space-y-3">
            <h2 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Kategoriler</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className="h-28 bg-slate-800 rounded-2xl relative overflow-hidden cursor-pointer shadow-md flex items-end p-3 border border-slate-700"
                >
                  <span className="font-extrabold text-sm text-white relative z-20 uppercase">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto p-4 space-y-3">
            <button onClick={() => setSelectedCat('all')} className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1.5 rounded-xl">
              ← Kategorilere Dön
            </button>
            <div className="space-y-3">
              {filteredProducts.map((prod) => (
                <div key={prod.id} className="bg-white p-3 rounded-2xl border shadow-sm flex gap-3">
                  {prod.image_url && <img src={prod.image_url} alt={prod.name} className="w-20 h-20 object-cover rounded-xl" />}
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm text-slate-900">{prod.name}</h3>
                      <span className="font-extrabold text-orange-600 text-sm">₺{prod.price}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{prod.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. KLASİK TEMA (Zaten kapağı vardı, logoyu görselle değiştirdik)
  if (template === 'classic') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
        <div className="h-44 bg-slate-800 relative bg-cover bg-center" style={{ backgroundImage: restaurant.cover_image ? `url(${restaurant.cover_image})` : 'none' }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center font-bold text-orange-600 text-xl">
            {/* LOGO GÖRSELİ EKLENDİ */}
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              restaurant.name[0]
            )}
          </div>
        </div>

        <div className="pt-12 text-center px-4 space-y-1">
          <h1 className="font-extrabold text-xl text-slate-900">{restaurant.name}</h1>
          <p className="text-xs text-slate-500 font-semibold">{restaurant.subtitle}</p>
        </div>

        <main className="max-w-md mx-auto p-4 space-y-3">
          {filteredProducts.map((prod) => (
            <div key={prod.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex gap-3 items-center">
              {prod.image_url && <img src={prod.image_url} alt={prod.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-slate-900">{prod.name}</h3>
                  <span className="font-extrabold text-orange-600 text-sm whitespace-nowrap">₺{prod.price}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{prod.description}</p>
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }

  // 4. MODERN TEMA (VARSAYILAN / ATTIĞIN İLK GÖRSEL)
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
      <header className="bg-orange-500 text-white p-3 px-4 flex justify-between items-center shadow-md">
        <span className="font-extrabold text-sm">≡</span>
        <div className="flex items-center gap-2">
          <button className="bg-white/20 p-1.5 rounded-lg"><Bell size={16} /></button>
          <span className="bg-white text-orange-600 px-2 py-0.5 rounded text-xs font-bold">TR ▾</span>
        </div>
      </header>

      {/* KAPAK FOTOĞRAFI EKLENDİ */}
      {restaurant.cover_image && (
        <div 
          className="w-full h-32 bg-cover bg-center" 
          style={{ backgroundImage: `url(${restaurant.cover_image})` }}
        ></div>
      )}

      <div className="bg-white p-4 shadow-sm border-b space-y-3">
        <div className="flex gap-3 items-center">
          {/* LOGO GÖRSELİ EKLENDİ */}
          {restaurant.logo_url ? (
            <img src={restaurant.logo_url} alt="Logo" className="w-16 h-16 object-cover rounded-xl border border-slate-100 shadow-sm" />
          ) : (
            <div className="w-14 h-14 bg-orange-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center p-1 text-center">
              {restaurant.name[0]}
            </div>
          )}
          
          <div>
            <h1 className="font-extrabold text-lg text-slate-900">{restaurant.name}</h1>
            <p className="text-xs text-slate-400 font-semibold">{restaurant.subtitle || 'Yemek Bizim İşimiz'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-[11px] text-slate-600 pt-2 border-t mt-2">
          <span className="flex items-center gap-1"><Clock size={12} className="text-orange-500" /> {restaurant.working_hours || '08:00 - 24:00'}</span>
          {restaurant.address && <span className="flex items-center gap-1"><MapPin size={12} className="text-orange-500" /> {restaurant.address}</span>}
        </div>
      </div>

      <main className="max-w-md mx-auto p-3 space-y-3">
        {categories.map((cat) => {
          const catProducts = products.filter(p => p.category_id === cat.id);
          if (catProducts.length === 0) return null; // İçi boş kategorileri gizle (İsteğe bağlı)
          
          return (
            <div key={cat.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b flex justify-between items-center font-bold text-sm text-slate-800">
                <span>{cat.name}</span>
                <ChevronDown size={16} className="text-slate-400" />
              </div>

              <div className="p-3 space-y-3 divide-y divide-slate-100">
                {catProducts.map((prod) => (
                  <div key={prod.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                    {prod.image_url && <img src={prod.image_url} alt={prod.name} className="w-20 h-20 object-cover rounded-xl border flex-shrink-0" />}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start gap-1">
                        <h3 className="font-bold text-xs text-slate-900 leading-snug">{prod.name}</h3>
                        <button className="bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-700 text-[10px] font-bold px-2 py-1 rounded border transition flex-shrink-0">
                          EKLE +
                        </button>
                      </div>
                      <p className="font-extrabold text-xs text-slate-900">₺{prod.price}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{prod.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
