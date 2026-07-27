'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Phone, MapPin, Clock, Flame, Info, Bell, ChevronDown, Menu as MenuIcon, X, Globe, Layers } from 'lucide-react';

export default function PublicMenu() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // --- MOBİL MENÜ & DİL STATELERİ ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('TR');

  useEffect(() => {
    fetchData();
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: 'tr', includedLanguages: 'tr,en,ru,de,el', autoDisplay: false },
          'google_translate_element'
        );
      };
    }
  }, []);

  const changeGoogleLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsLangOpen(false);

    const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectEl) {
      selectEl.value = langCode.toLowerCase();
      selectEl.dispatchEvent(new Event('change'));
    }
  };

  const fetchData = async () => {
    setLoading(true);

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
          <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
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
  const pColor = restaurant.primary_color || '#f97316';

  const filteredProducts = products.filter(p => {
    if (selectedCat !== 'all' && p.category_id !== selectedCat) return false;
    return true;
  });

  // Ortak Üst Bar
  const renderHeader = () => (
    <header className="text-white p-3 px-4 flex justify-between items-center shadow-md relative" style={{ backgroundColor: pColor }}>
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition cursor-pointer"
          title="Kategoriler ve Bilgiler"
        >
          <MenuIcon size={20} />
        </button>
        <span className="font-extrabold text-sm tracking-wide">{restaurant.name}</span>
      </div>

      <div className="flex items-center gap-2 relative">
        <button 
          onClick={() => alert('Garson çağrı bildirimi gönderildi!')} 
          className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition cursor-pointer"
          title="Garson Çağır"
        >
          <Bell size={16} />
        </button>

        {/* BAYRAKLI VE KODLU DİL SEÇİCİ MENÜSÜ */}
        <div className="relative">
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)} 
            className="bg-white px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            style={{ color: pColor }}
          >
            <Globe size={13} /> <span>{currentLang}</span> <ChevronDown size={12} />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-slate-800 py-1">
              {[
                { code: 'TR', label: 'Türkçe', flag: '🇹🇷' },
                { code: 'EN', label: 'English', flag: '🇬🇧' },
                { code: 'RU', label: 'Русский', flag: '🇷🇺' },
                { code: 'DE', label: 'Deutsch', flag: '🇩🇪' },
                { code: 'EL', label: 'Ελληνικά', flag: '🇬🇷' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => changeGoogleLanguage(lang.code)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-slate-100 transition flex items-center justify-between cursor-pointer ${currentLang === lang.code ? 'text-indigo-600 bg-indigo-50 font-black' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-extrabold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{lang.code}</span>
                    <span>{lang.label}</span>
                  </div>
                  <span className="text-sm">{lang.flag}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );

  // Sol Menü Çekmecesi
  const renderSidebar = () => {
    if (!isSidebarOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsSidebarOpen(false)} />
        <div className="relative w-72 bg-white h-full shadow-2xl z-10 flex flex-col font-sans animate-in slide-in-from-left duration-200">
          <div className="p-4 text-white flex justify-between items-center" style={{ backgroundColor: pColor }}>
            <div className="flex items-center gap-2">
              <Layers size={18} />
              <h2 className="font-black text-sm">Menü İçeriği</h2>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 border-b bg-slate-50 space-y-1">
            <h3 className="font-extrabold text-xs text-slate-900">{restaurant.name}</h3>
            <p className="text-[11px] text-slate-500">{restaurant.subtitle || 'Lezzet Noktası'}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-2 tracking-wider">Kategoriler</p>
            <button 
              onClick={() => { setSelectedCat('all'); setIsSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${selectedCat === 'all' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <span>Tüm Ürünler</span>
              <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full">{products.length}</span>
            </button>

            {categories.map(cat => {
              const count = products.filter(p => p.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCat(cat.id); setIsSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${selectedCat === cat.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t text-[11px] text-slate-500 space-y-1 bg-slate-50">
            {restaurant.working_hours && <p className="flex items-center gap-1.5"><Clock size={12} /> {restaurant.working_hours}</p>}
            {restaurant.phone && <p className="flex items-center gap-1.5"><Phone size={12} /> {restaurant.phone}</p>}
          </div>
        </div>
      </div>
    );
  };

  // 1. PDF / GÖRSEL ŞABLON
  if (template === 'pdf_image') {
    return (
      <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center">
        {renderSidebar()}
        {renderHeader()}
        <main className="max-w-md w-full p-2 space-y-3 mt-4">
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

  // 2. KARE GRID ŞABLON
  if (template === 'custom_grid') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-12">
        {renderSidebar()}
        {renderHeader()}

        {restaurant.cover_image && (
          <div className="w-full h-36 bg-cover bg-center" style={{ backgroundImage: `url(${restaurant.cover_image})` }}></div>
        )}

        <div className="bg-white p-5 shadow-sm space-y-2 border-b">
          <div className="flex items-center gap-3">
            {restaurant.logo_url && (
              <img src={restaurant.logo_url} alt="Logo" className="w-14 h-14 rounded-xl object-cover shadow-sm border border-slate-100" />
            )}
            <div>
              <h1 className="text-xl font-extrabold">{restaurant.name}</h1>
              <p className="text-xs text-slate-500 font-medium">{restaurant.subtitle || 'Yemek Bizim İşimiz'}</p>
            </div>
          </div>

          <div className="space-y-1 text-xs text-slate-600 pt-3 border-t mt-3">
            <p className="flex items-center gap-1.5"><Clock size={14} style={{ color: pColor }} /> {restaurant.working_hours || '08:00 - 24:00'}</p>
            {restaurant.address && <p className="flex items-center gap-1.5"><MapPin size={14} style={{ color: pColor }} /> {restaurant.address}</p>}
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
                  className="h-28 bg-slate-800 rounded-2xl relative overflow-hidden cursor-pointer shadow-md flex items-end p-3 border border-slate-700 bg-cover bg-center"
                  style={{ backgroundImage: cat.image_url ? `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2)), url(${cat.image_url})` : 'none' }}
                >
                  <span className="font-extrabold text-sm text-white relative z-20 uppercase">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto p-4 space-y-3">
            <button 
              onClick={() => setSelectedCat('all')} 
              className="text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
              style={{ color: pColor, backgroundColor: `${pColor}20` }}
            >
              ← Kategorilere Dön
            </button>
            <div className="space-y-3">
              {filteredProducts.map((prod) => (
                <div key={prod.id} className="bg-white p-3 rounded-2xl border shadow-sm flex gap-3">
                  {prod.image_url && <img src={prod.image_url} alt={prod.name} className="w-20 h-20 object-cover rounded-xl" />}
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm text-slate-900">{prod.name}</h3>
                      <span className="font-extrabold text-sm" style={{ color: pColor }}>₺{prod.price}</span>
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

  // 3. KLASİK TEMA
  if (template === 'classic') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
        {renderSidebar()}
        {renderHeader()}

        <div className="h-44 bg-slate-800 relative bg-cover bg-center" style={{ backgroundImage: restaurant.cover_image ? `url(${restaurant.cover_image})` : 'none' }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center font-bold text-xl" style={{ color: pColor }}>
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
                  <span className="font-extrabold text-sm whitespace-nowrap" style={{ color: pColor }}>₺{prod.price}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{prod.description}</p>
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }

  // 4. MODERN BİSTRO (VARSAYILAN)
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
      {renderSidebar()}
      {renderHeader()}

      {restaurant.cover_image && (
        <div className="w-full h-32 bg-cover bg-center" style={{ backgroundImage: `url(${restaurant.cover_image})` }}></div>
      )}

      <div className="bg-white p-4 shadow-sm border-b space-y-3">
        <div className="flex gap-3 items-center">
          {restaurant.logo_url ? (
            <img src={restaurant.logo_url} alt="Logo" className="w-16 h-16 object-cover rounded-xl border border-slate-100 shadow-sm" />
          ) : (
            <div className="w-14 h-14 text-white font-extrabold text-xs rounded-xl flex items-center justify-center p-1 text-center" style={{ backgroundColor: pColor }}>
              {restaurant.name[0]}
            </div>
          )}
          
          <div>
            <h1 className="font-extrabold text-lg text-slate-900">{restaurant.name}</h1>
            <p className="text-xs text-slate-400 font-semibold">{restaurant.subtitle || 'Yemek Bizim İşimiz'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-[11px] text-slate-600 pt-2 border-t mt-2">
          <span className="flex items-center gap-1"><Clock size={12} style={{ color: pColor }} /> {restaurant.working_hours || '08:00 - 24:00'}</span>
          {restaurant.address && <span className="flex items-center gap-1"><MapPin size={12} style={{ color: pColor }} /> {restaurant.address}</span>}
        </div>
      </div>

      <main className="max-w-md mx-auto p-3 space-y-3">
        {categories.map((cat) => {
          const catProducts = products.filter(p => p.category_id === cat.id);
          if (catProducts.length === 0) return null;
          
          return (
            <div key={cat.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b flex justify-between items-center font-bold text-sm text-slate-800">
                <div className="flex items-center gap-2.5">
                  {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-7 h-7 rounded-lg object-cover border" />}
                  <span>{cat.name}</span>
                </div>
                <ChevronDown size={16} className="text-slate-400" />
              </div>

              <div className="p-3 space-y-3 divide-y divide-slate-100">
                {catProducts.map((prod) => (
                  <div key={prod.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                    {prod.image_url && <img src={prod.image_url} alt={prod.name} className="w-20 h-20 object-cover rounded-xl border flex-shrink-0" />}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start gap-1">
                        <h3 className="font-bold text-xs text-slate-900 leading-snug">{prod.name}</h3>
                        <button className="bg-slate-100 text-[10px] font-bold px-2 py-1 rounded border transition flex-shrink-0 cursor-pointer" style={{ color: pColor }}>
                          EKLE +
                        </button>
                      </div>
                      <p className="font-extrabold text-xs" style={{ color: pColor }}>₺{prod.price}</p>
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
