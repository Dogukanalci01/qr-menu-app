'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Phone, MapPin, Clock, Info, Bell, ChevronDown, Menu as MenuIcon, X, Globe, Layers, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';

// --- ALERJEN LİSTESİ ---
const ALLERGEN_OPTIONS = [
  { id: 'gluten', label: 'Gluten', icon: '🌾' },
  { id: 'crustaceans', label: 'Kabuklular', icon: '🦐' },
  { id: 'egg', label: 'Yumurta', icon: '🥚' },
  { id: 'fish', label: 'Balık', icon: '🐟' },
  { id: 'peanuts', label: 'Yer Fıstığı', icon: '🥜' },
  { id: 'soy', label: 'Soya', icon: '🌱' },
  { id: 'milk', label: 'Süt', icon: '🥛' },
  { id: 'nuts', label: 'Kuruyemiş', icon: '🌰' },
  { id: 'celery', label: 'Kereviz', icon: '🌿' },
  { id: 'mustard', label: 'Hardal', icon: '🌭' },
  { id: 'sesame', label: 'Susam', icon: '🌾' },
  { id: 'sulfites', label: 'Sülfit', icon: '🧪' },
  { id: 'lupin', label: 'Lupin', icon: '🌸' },
  { id: 'molluscs', label: 'Yumuşakçalar', icon: '🐙' },
  { id: 'corn', label: 'Mısır', icon: '🌽' },
  { id: 'chocolate', label: 'Çikolata', icon: '🍫' },
  { id: 'legumes', label: 'Baklagil', icon: '🫘' },
  { id: 'caffeine', label: 'Kafein', icon: '☕' }
];

// --- ÇEVİRİ SÖZLÜĞÜ ---
const translations: any = {
  TR: {
    callWaiter: 'Garson çağrı bildirimi gönderildi!',
    waiterBtn: 'Garson Çağır',
    menuContent: 'Menü İçeriği',
    allProducts: 'Tüm Menü',
    categories: 'Kategoriler',
    addBtn: 'Ekle',
    addToOrder: 'Siparişe Ekle',
    allergens: 'Alerjenler:',
    notFound: 'Restoran Bulunamadı',
    loading: 'Menü Yükleniyor...',
    cartTitle: 'Sepetim',
    emptyCart: 'Sepetiniz şu an boş.',
    total: 'Toplam',
    placeOrder: 'Siparişi Tamamla',
  },
  EN: {
    callWaiter: 'Waiter call notification sent!',
    waiterBtn: 'Call Waiter',
    menuContent: 'Menu Content',
    allProducts: 'All Menu',
    categories: 'Categories',
    addBtn: 'Add',
    addToOrder: 'Add to Order',
    allergens: 'Allergens:',
    notFound: 'Restaurant Not Found',
    loading: 'Loading Menu...',
    cartTitle: 'My Cart',
    emptyCart: 'Your cart is currently empty.',
    total: 'Total',
    placeOrder: 'Place Order',
  },
  RU: {
    callWaiter: 'Уведомление официанту отправлено!',
    waiterBtn: 'Вызвать официанта',
    menuContent: 'Содержание меню',
    allProducts: 'Все меню',
    categories: 'Категории',
    addBtn: 'Добавить',
    addToOrder: 'Добавить к заказу',
    allergens: 'Аллергены:',
    notFound: 'Ресторан не найден',
    loading: 'Загрузка меню...',
    cartTitle: 'Моя корзина',
    emptyCart: 'Ваша корзина пуста.',
    total: 'Итого',
    placeOrder: 'Оформить заказ',
  },
  DE: {
    callWaiter: 'Kellner-Benachrichtigung gesendet!',
    waiterBtn: 'Kellner rufen',
    menuContent: 'Menüinhalte',
    allProducts: 'Alle Menüs',
    categories: 'Kategorien',
    addBtn: 'Hinzufügen',
    addToOrder: 'Zur Bestellung hinzufügen',
    allergens: 'Allergene:',
    notFound: 'Restaurant nicht gefunden',
    loading: 'Menü wird geladen...',
    cartTitle: 'Mein Warenkorb',
    emptyCart: 'Ihr Warenkorb ist derzeit leer.',
    total: 'Gesamt',
    placeOrder: 'Bestellung aufgeben',
  },
  EL: {
    callWaiter: 'Η ειδοποίηση κλήσης σερβιτόρου στάλθηκε!',
    waiterBtn: 'Καλέστε Σερβιτόρο',
    menuContent: 'Περιεχόμενο Μενού',
    allProducts: 'Όλο το Μενού',
    categories: 'Κατηγορίες',
    addBtn: 'Προσθήκη',
    addToOrder: 'Προσθήκη στην Παραγγελία',
    allergens: 'Αλλεργιογόνα:',
    notFound: 'Το Εστιατόριο Δεν Βρέθηκε',
    loading: 'Φόρτωση Μενού...',
    cartTitle: 'Το Καλάθι μου',
    emptyCart: 'Το καλάθι σας είναι άδειο.',
    total: 'Σύνολο',
    placeOrder: 'Ολοκλήρωση Παραγγελίας',
  }
};

export default function PublicMenu() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // --- STATELER ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('TR');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const t = translations[currentLang] || translations.TR;

  // GOOGLE TRANSLATE ENTEGRASYONU
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

  const changeGoogleLanguage = (langCode: string, displayCode: string) => {
    setCurrentLang(displayCode);
    setIsLangOpen(false);

    const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectEl) {
      selectEl.value = langCode.toLowerCase();
      selectEl.dispatchEvent(new Event('change'));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: restData } = await supabase.from('restaurants').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (restData) {
      setRestaurant(restData);
      const { data: catData } = await supabase.from('categories').select('*').eq('restaurant_id', restData.id).order('sort_order', { ascending: true });
      if (catData) setCategories(catData);
      const { data: prodData } = await supabase.from('products').select('*').eq('restaurant_id', restData.id);
      if (prodData) setProducts(prodData);
    }
    setLoading(false);
  };

  // --- SEPET İŞLEMLERİ ---
  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, quantity: Math.max(0, item.quantity + delta) };
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    let message = `🔔 *YENİ SİPARİŞ*\n\n`;
    cart.forEach((item) => { message += `▪️ ${item.quantity}x ${item.name} - ₺${item.price * item.quantity}\n`; });
    message += `\n💰 *TOPLAM: ₺${cartTotal}*\n\nNot: Masa numaramı veya adresimi hemen iletiyorum.`;
    const waNumber = restaurant?.whatsapp || "905338665278"; 
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    setCart([]);
    setIsCartOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0F1C] text-white flex items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-300 text-xs font-semibold"><span>{t.loading}</span></p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0F1C] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
          <Info size={32} />
        </div>
        <h1 className="text-xl font-bold"><span>{t.notFound}</span></h1>
      </div>
    );
  }

  const pColor = restaurant.primary_color || '#4f46e5';

  const filteredProducts = products.filter(p => {
    if (selectedCat !== 'all' && p.category_id !== selectedCat) return false;
    return true;
  });

  // --- ÜST BAR (HEADER) ---
  const renderHeader = () => (
    <header className="bg-[#0A0F1C] border-b border-[#1E293B] text-white p-3 px-4 flex justify-between items-center sticky top-0 z-40">
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      <div className="flex items-center gap-3">
        <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition cursor-pointer" title={t.menuContent}>
          <MenuIcon size={20} />
        </button>
        <span className="font-black text-sm tracking-wide line-clamp-1">{restaurant.name}</span>
      </div>

      <div className="flex items-center gap-2 relative">
        <button onClick={() => alert(t.callWaiter)} className="bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition cursor-pointer flex-shrink-0" title={t.waiterBtn}>
          <Bell size={16} />
        </button>

        {/* DİL SEÇİCİ */}
        <div className="relative">
          <button onClick={() => setIsLangOpen(!isLangOpen)} className="bg-white/10 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer text-white">
            <Globe size={13} style={{ color: pColor }} /> <span className="notranslate">{currentLang}</span> <ChevronDown size={12} className="text-slate-400" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#151D2C] border border-[#1E293B] rounded-2xl shadow-xl z-50 overflow-hidden text-white py-1 notranslate">
              {[
                { code: 'tr', display: 'TR', label: 'Türkçe', flag: '🇹🇷', rightTag: 'TR' },
                { code: 'en', display: 'EN', label: 'English', flag: '🇬🇧', rightTag: 'GB' },
                { code: 'ru', display: 'RU', label: 'Русский', flag: '🇷🇺', rightTag: 'RU' },
                { code: 'de', display: 'DE', label: 'Deutsch', flag: '🇩🇪', rightTag: 'DE' },
                { code: 'el', display: 'EL', label: 'Ελληνικά', flag: '🇬🇷', rightTag: 'GR' }
              ].map(lang => (
                <button key={lang.code} onClick={() => changeGoogleLanguage(lang.code, lang.display)} className={`w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-white/5 transition flex items-center justify-between cursor-pointer ${currentLang === lang.display ? 'bg-indigo-500/20 text-indigo-400' : ''}`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono font-extrabold text-slate-400 bg-black/30 px-1.5 py-0.5 rounded border border-white/10">{lang.rightTag}</span>
                    <span className="flex items-center gap-1.5"><span className="text-sm">{lang.flag}</span> <span>{lang.label}</span></span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );

  // --- SEPET ÇEKMECESİ (DRAWER) ---
  const renderCartDrawer = () => {
    if (!isCartOpen) return null;
    return (
      <div className="fixed inset-0 z-[120] flex justify-end">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
        <div className="relative w-full max-w-sm bg-[#0B1120] h-[100dvh] shadow-2xl flex flex-col font-sans animate-in slide-in-from-right duration-300 border-l border-[#1E293B]">
          <div className="p-5 flex justify-between items-center border-b border-[#1E293B]" style={{ backgroundColor: pColor }}>
            <div className="flex items-center gap-2 text-white">
              <ShoppingBag size={20} />
              <h2 className="font-black text-lg"><span>{t.cartTitle}</span></h2>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-white/20 rounded-full text-white transition cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 bg-[#0B1120]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                <ShoppingBag size={48} className="opacity-20" />
                <p className="text-sm font-bold"><span>{t.emptyCart}</span></p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-[#151D2C] p-3 rounded-2xl border border-[#1E293B] flex gap-3 items-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-800 rounded-xl flex-shrink-0"></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-white truncate pr-2"><span>{item.name}</span></h4>
                      <p className="font-extrabold text-sm text-indigo-400">₺{item.price * item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-black/30 border border-[#1E293B] rounded-xl px-2 py-1">
                      <button onClick={() => updateCartQuantity(item.id, -1)} className="text-slate-400 hover:text-white p-1">
                        {item.quantity === 1 ? <Trash2 size={14} className="text-rose-500" /> : <Minus size={14} />}
                      </button>
                      <span className="font-black text-sm w-4 text-center text-white">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.id, 1)} className="text-slate-400 hover:text-white p-1">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-5 bg-[#151D2C] border-t border-[#1E293B] shadow-[0_-10px_20px_rgba(0,0,0,0.5)] space-y-4 pb-safe">
              <div className="flex justify-between items-center text-lg text-white">
                <span className="font-bold text-slate-400"><span>{t.total}</span>:</span>
                <span className="font-black text-2xl">₺{cartTotal}</span>
              </div>
              <button onClick={handlePlaceOrder} className="w-full py-4 rounded-2xl text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition active:scale-95 cursor-pointer" style={{ backgroundColor: pColor }}>
                <span>{t.placeOrder}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- ÜRÜN DETAY MODALI (ÜRÜNE TIKLAYINCA AÇILAN POPUP) ---
  const renderProductModal = () => {
    if (!selectedProduct) return null;
    return (
      <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center p-0 sm:p-4">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity cursor-pointer" onClick={() => setSelectedProduct(null)} />
        <div className="relative w-full max-w-md bg-[#151D2C] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90dvh] flex flex-col border border-[#1E293B]">
          <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 bg-black/50 backdrop-blur text-white p-2 rounded-full shadow-lg z-20 hover:bg-black/70 transition cursor-pointer border border-white/10">
            <X size={20} />
          </button>
          
          <div className="overflow-y-auto pb-safe">
            {selectedProduct.image_url ? (
              <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-64 sm:h-72 object-cover" />
            ) : (
              <div className="w-full h-28 bg-[#0B1120] flex items-center justify-center text-slate-600 font-bold text-xs">Görsel Yok</div>
            )}
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight"><span>{selectedProduct.name}</span></h2>
                <p className="text-xl sm:text-2xl font-extrabold whitespace-nowrap text-indigo-400">₺{selectedProduct.price}</p>
              </div>
              
              {selectedProduct.description && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium bg-[#0B1120] p-4 rounded-2xl border border-[#1E293B]">
                  <span>{selectedProduct.description}</span>
                </p>
              )}

              {selectedProduct.allergens && selectedProduct.allergens.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5"><span>{t.allergens}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.allergens.map((algId: string) => {
                      const alg = ALLERGEN_OPTIONS.find(a => a.id === algId);
                      if(!alg) return null;
                      return (
                        <div key={algId} className="flex items-center gap-2 bg-[#0B1120] border border-[#1E293B] px-3 py-1.5 rounded-xl">
                          <span className="text-base notranslate">{alg.icon}</span>
                          <span className="text-xs font-bold text-slate-300"><span>{alg.label}</span></span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                className="w-full py-4 mt-4 rounded-2xl text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition active:scale-95 cursor-pointer" 
                style={{ backgroundColor: pColor }}
              >
                <ShoppingBag size={18} /> <span>{t.addToOrder}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFloatingCartButton = () => {
    if (cartItemCount === 0) return null;
    return (
      <button onClick={() => setIsCartOpen(true)} className="fixed bottom-8 right-6 p-4 rounded-full shadow-2xl text-white z-[90] flex items-center justify-center animate-bounce duration-1000 cursor-pointer border-2 border-white/20" style={{ backgroundColor: pColor }}>
        <div className="relative">
          <ShoppingBag size={24} />
          <span className="absolute -top-3 -right-3 bg-rose-500 text-white text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-sm">
            {cartItemCount}
          </span>
        </div>
      </button>
    );
  };

  // --- KARANLIK TEMA (DARK MODE) ANA GÖRÜNÜMÜ ---
  return (
    <div className="min-h-[100dvh] bg-[#0A0F1C] text-white font-sans pb-28 relative overflow-x-hidden">
      {renderCartDrawer()}
      {renderProductModal()}
      {renderHeader()}
      {renderFloatingCartButton()}

      {/* RESTORAN BİLGİ ALANI */}
      <div className="flex flex-col items-center justify-center py-6 px-4 space-y-2 text-center">
        <p className="text-sm font-medium text-slate-300"><span>{restaurant.subtitle || t.defaultSubtitle}</span></p>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          {restaurant.phone && <span className="flex items-center gap-1"><Phone size={12} /> <span className="notranslate">{restaurant.phone}</span></span>}
          {restaurant.address && <span className="flex items-center gap-1"><MapPin size={12} /> <span>{restaurant.address}</span></span>}
        </div>
      </div>

      {/* YATAY KAYDIRILABİLİR KATEGORİ SEKMELERİ ("ŞABLONLAR" DEDİĞİN KISIM) */}
      <div className="sticky top-[60px] z-30 bg-[#0A0F1C] border-b border-[#1E293B]">
        <div className="max-w-3xl mx-auto overflow-x-auto whitespace-nowrap flex gap-2 p-3 px-4 scrollbar-hide">
          <button 
            onClick={() => setSelectedCat('all')} 
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer border border-[#1E293B] ${selectedCat === 'all' ? 'text-white' : 'bg-[#151D2C] text-slate-400 hover:bg-[#1E293B]'}`}
            style={selectedCat === 'all' ? { backgroundColor: pColor } : {}}
          >
            <span>{t.allProducts}</span>
          </button>

          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setSelectedCat(cat.id)} 
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer border border-[#1E293B] ${selectedCat === cat.id ? 'text-white' : 'bg-[#151D2C] text-slate-400 hover:bg-[#1E293B]'}`}
              style={selectedCat === cat.id ? { backgroundColor: pColor } : {}}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ÜRÜN LİSTESİ KARTLARI */}
      <main className="max-w-3xl mx-auto p-4 space-y-4 mt-2">
        {filteredProducts.map((prod) => (
          <div 
            key={prod.id} 
            onClick={() => setSelectedProduct(prod)} // TIKLAYINCA POPUP AÇAR
            className="bg-[#151D2C] border border-[#1E293B] rounded-2xl p-4 flex gap-4 cursor-pointer hover:border-slate-600 transition"
          >
            {/* Fotoğraf */}
            {prod.image_url ? (
              <img src={prod.image_url} alt={prod.name} className="w-24 h-24 object-cover rounded-xl flex-shrink-0 bg-[#0B1120]" />
            ) : (
              <div className="w-24 h-24 bg-[#0B1120] rounded-xl flex-shrink-0 flex items-center justify-center border border-[#1E293B]"><span className="text-[10px] text-slate-600">Yok</span></div>
            )}
            
            {/* Ürün Detayları */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-sm text-white leading-snug"><span>{prod.name}</span></h3>
                  <span className="font-black text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                    {prod.price} ₺
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed"><span>{prod.description}</span></p>
              </div>

              {/* Alerjen İkonları */}
              {prod.allergens && prod.allergens.length > 0 && (
                <div className="flex items-center gap-1.5 pt-2">
                  {prod.allergens.map((algId: string) => {
                    const alg = ALLERGEN_OPTIONS.find(a => a.id === algId);
                    return alg ? <span key={algId} className="bg-[#0B1120] p-1 rounded border border-[#1E293B] text-[10px] grayscale opacity-80" title={alg.label}>{alg.icon}</span> : null;
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-xs">
            <span>Bu kategoride ürün bulunamadı.</span>
          </div>
        )}
      </main>
    </div>
  );
}
