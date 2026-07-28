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
    categoriesTitle: 'Kategoriler',
    backToCategories: '← Kategorilere Dön',
    addBtn: 'Ekle',
    addToOrder: 'Siparişe Ekle',
    allergens: 'Alerjenler:',
    noBrochure: 'Henüz menü broşür görseli yüklenmedi.',
    notFound: 'Restoran Bulunamadı',
    loading: 'Menü Yükleniyor...',
    workingHours: 'Çalışma Saatleri',
    defaultSubtitle: 'Lezzet, Manzara ve Huzurun Adresi',
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
    categoriesTitle: 'Categories',
    backToCategories: '← Back to Categories',
    addBtn: 'Add',
    addToOrder: 'Add to Order',
    allergens: 'Allergens:',
    noBrochure: 'Menu brochure image has not been uploaded yet.',
    notFound: 'Restaurant Not Found',
    loading: 'Loading Menu...',
    workingHours: 'Working Hours',
    defaultSubtitle: 'Address of Taste, Scenery and Peace',
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
    categoriesTitle: 'Категории',
    backToCategories: '← Назад к категориям',
    addBtn: 'Добавить',
    addToOrder: 'Добавить к заказу',
    allergens: 'Аллергены:',
    noBrochure: 'Изображение брошюры меню еще не загружено.',
    notFound: 'Ресторан не найден',
    loading: 'Загрузка меню...',
    workingHours: 'Часы работы',
    defaultSubtitle: 'Адрес вкуса, пейзажа и покоя',
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
    categoriesTitle: 'Kategorien',
    backToCategories: '← Zurück zu Kategorien',
    addBtn: 'Hinzufügen',
    addToOrder: 'Zur Bestellung hinzufügen',
    allergens: 'Allergene:',
    noBrochure: 'Menü-Broschürenbild wurde noch nicht hochgeladen.',
    notFound: 'Restaurant nicht gefunden',
    loading: 'Menü wird geladen...',
    workingHours: 'Öffnungszeiten',
    defaultSubtitle: 'Adresse von Geschmack, Landschaft und Frieden',
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
    categoriesTitle: 'Κατηγορίες',
    backToCategories: '← Πίσω στις Κατηγορίες',
    addBtn: 'Προσθήκη',
    addToOrder: 'Προσθήκη στην Παραγγελία',
    allergens: 'Αλλεργιογόνα:',
    noBrochure: 'Η εικόνα του φυλλαδίου μενού δεν έχει μεταφορτωθεί ακόμα.',
    notFound: 'Το Εστιατόριο Δεν Βρέθηκε',
    loading: 'Φόρτωση Μενού...',
    workingHours: 'Ώρες Λειτουργίας',
    defaultSubtitle: 'Διεύθυνση Γεύσης, Τοπίου και Ειρήνης',
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

  // GOOGLE TRANSLATE ENTEGRASYONU (TIKLAMALARI BOZMAYAN SÜRÜM)
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
  const addToCart = (product: any, e?: any) => {
    if(e) e.stopPropagation(); // Tıklamanın ebeveyne gitmesini engeller
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
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
          <p className="text-slate-300 text-xs font-semibold"><span className="notranslate">{t.loading}</span></p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
          <Info size={32} />
        </div>
        <h1 className="text-xl font-bold"><span className="notranslate">{t.notFound}</span></h1>
      </div>
    );
  }

  const pColor = restaurant.primary_color || '#4f46e5';
  const template = restaurant.template || 'bistro';

  const filteredProducts = products.filter(p => {
    if (selectedCat !== 'all' && p.category_id !== selectedCat) return false;
    return true;
  });

  // ==========================================================
  // ORTAK BİLEŞENLER (TÜM ŞABLONLAR İÇİN)
  // ==========================================================
  
  const renderCartDrawer = (isDark: boolean = false) => {
    if (!isCartOpen) return null;
    return (
      <div className="fixed inset-0 z-[120] flex justify-end">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
        <div className={`relative w-full max-w-sm h-[100dvh] shadow-2xl flex flex-col font-sans animate-in slide-in-from-right duration-300 ${isDark ? 'bg-[#0B1120] border-l border-[#1E293B]' : 'bg-white'}`}>
          <div className="p-5 flex justify-between items-center border-b border-white/10" style={{ backgroundColor: pColor }}>
            <div className="flex items-center gap-2 text-white">
              <ShoppingBag size={20} />
              <h2 className="font-black text-lg"><span className="notranslate">{t.cartTitle}</span></h2>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-white/20 rounded-full text-white transition cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <div className={`flex-1 overflow-y-auto p-5 ${isDark ? 'bg-[#0B1120]' : 'bg-slate-50'}`}>
            {cart.length === 0 ? (
              <div className={`h-full flex flex-col items-center justify-center gap-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <ShoppingBag size={48} className="opacity-20" />
                <p className="text-sm font-bold"><span className="notranslate">{t.emptyCart}</span></p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className={`p-3 rounded-2xl flex gap-3 items-center border ${isDark ? 'bg-[#151D2C] border-[#1E293B]' : 'bg-white border-slate-100 shadow-sm'}`}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                    ) : (
                      <div className={`w-16 h-16 rounded-xl flex-shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm truncate pr-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><span className="notranslate">{item.name}</span></h4>
                      <p className="font-extrabold text-sm" style={{ color: pColor }}>₺{item.price * item.quantity}</p>
                    </div>
                    <div className={`flex items-center gap-3 rounded-xl px-2 py-1 border ${isDark ? 'bg-black/30 border-[#1E293B]' : 'bg-slate-50 border-slate-200'}`}>
                      <button onClick={() => updateCartQuantity(item.id, -1)} className={`p-1 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                        {item.quantity === 1 ? <Trash2 size={14} className="text-rose-500" /> : <Minus size={14} />}
                      </button>
                      <span className={`font-black text-sm w-4 text-center ${isDark ? 'text-white' : 'text-slate-800'}`}><span className="notranslate">{item.quantity}</span></span>
                      <button onClick={() => updateCartQuantity(item.id, 1)} className={`p-1 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className={`p-5 space-y-4 pb-safe border-t ${isDark ? 'bg-[#151D2C] border-[#1E293B] shadow-[0_-10px_20px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]'}`}>
              <div className={`flex justify-between items-center text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <span className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}><span className="notranslate">{t.total}</span>:</span>
                <span className="font-black text-2xl">₺<span className="notranslate">{cartTotal}</span></span>
              </div>
              <button onClick={handlePlaceOrder} className="w-full py-4 rounded-2xl text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition active:scale-95 cursor-pointer" style={{ backgroundColor: pColor }}>
                <span className="notranslate">{t.placeOrder}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProductModal = (isDark: boolean = false) => {
    if (!selectedProduct) return null;
    return (
      <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center p-0 sm:p-4">
        <div className={`absolute inset-0 backdrop-blur-sm transition-opacity cursor-pointer ${isDark ? 'bg-black/80' : 'bg-black/60'}`} onClick={() => setSelectedProduct(null)} />
        <div className={`relative w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90dvh] flex flex-col ${isDark ? 'bg-[#151D2C] border border-[#1E293B]' : 'bg-white'}`}>
          <button onClick={() => setSelectedProduct(null)} className={`absolute top-4 right-4 p-2 rounded-full shadow-lg z-20 transition cursor-pointer ${isDark ? 'bg-black/50 backdrop-blur text-white hover:bg-black/70 border border-white/10' : 'bg-white/90 backdrop-blur text-slate-800 hover:bg-white'}`}>
            <X size={20} />
          </button>
          
          <div className="overflow-y-auto pb-safe">
            {selectedProduct.image_url ? (
              <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-64 sm:h-72 object-cover" />
            ) : (
              <div className={`w-full h-28 flex items-center justify-center font-bold text-xs ${isDark ? 'bg-[#0B1120] text-slate-600' : 'bg-slate-100 text-slate-400'}`}><span className="notranslate">Görsel Yok</span></div>
            )}
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h2 className={`text-xl sm:text-2xl font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}><span className="notranslate">{selectedProduct.name}</span></h2>
                <p className="text-xl sm:text-2xl font-extrabold whitespace-nowrap" style={{ color: pColor }}>₺<span className="notranslate">{selectedProduct.price}</span></p>
              </div>
              
              {selectedProduct.description && (
                <p className={`text-xs sm:text-sm leading-relaxed font-medium p-4 rounded-2xl border ${isDark ? 'text-slate-300 bg-[#0B1120] border-[#1E293B]' : 'text-slate-600 bg-slate-50 border-slate-100'}`}>
                  <span className="notranslate">{selectedProduct.description}</span>
                </p>
              )}

              {selectedProduct.allergens && selectedProduct.allergens.length > 0 && (
                <div className="pt-2">
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}><span className="notranslate">{t.allergens}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.allergens.map((algId: string) => {
                      const alg = ALLERGEN_OPTIONS.find(a => a.id === algId);
                      if(!alg) return null;
                      return (
                        <div key={algId} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isDark ? 'bg-[#0B1120] border-[#1E293B]' : 'bg-slate-100 border-slate-200'}`}>
                          <span className="text-base notranslate">{alg.icon}</span>
                          <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}><span className="notranslate">{alg.label}</span></span>
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
                <ShoppingBag size={18} /> <span className="notranslate">{t.addToOrder}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHeader = (isDark: boolean = false) => (
    <header className={`p-3 px-4 flex justify-between items-center shadow-md relative z-40 sticky top-0 ${isDark ? 'bg-[#0F172A] border-b border-[#1E293B] text-white' : 'bg-[#0F172A] text-white'}`} style={isDark ? {} : { backgroundColor: pColor }}>
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      <div className="flex items-center gap-3">
        <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition cursor-pointer" title={t.menuContent}>
          <MenuIcon size={20} />
        </button>
        <span className="font-extrabold text-sm tracking-wide line-clamp-1"><span className="notranslate">{restaurant.name}</span></span>
      </div>

      <div className="flex items-center gap-2 relative">
        <button onClick={() => alert(t.callWaiter)} className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition cursor-pointer flex-shrink-0" title={t.waiterBtn}>
          <Bell size={16} />
        </button>

        <div className="relative">
          <button onClick={() => setIsLangOpen(!isLangOpen)} className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${isDark ? 'bg-[#1E293B] text-white hover:bg-[#334155]' : 'bg-white text-slate-800 shadow-sm'}`}>
            <Globe size={13} style={{ color: isDark ? '#fff' : pColor }} /> <span className="notranslate">{currentLang}</span> <ChevronDown size={12} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
          </button>

          {isLangOpen && (
            <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl z-50 overflow-hidden py-1 notranslate ${isDark ? 'bg-[#1E293B] border border-[#334155] text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
              {[
                { code: 'tr', display: 'TR', label: 'Türkçe', flag: '🇹🇷', rightTag: 'TR' },
                { code: 'en', display: 'EN', label: 'English', flag: '🇬🇧', rightTag: 'GB' },
                { code: 'ru', display: 'RU', label: 'Русский', flag: '🇷🇺', rightTag: 'RU' },
                { code: 'de', display: 'DE', label: 'Deutsch', flag: '🇩🇪', rightTag: 'DE' },
                { code: 'el', display: 'EL', label: 'Ελληνικά', flag: '🇬🇷', rightTag: 'GR' }
              ].map(lang => (
                <button key={lang.code} onClick={() => changeGoogleLanguage(lang.code, lang.display)} className={`w-full text-left px-3.5 py-2.5 text-xs font-bold transition flex items-center justify-between cursor-pointer ${currentLang === lang.display ? (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'text-indigo-600 bg-indigo-50 font-black') : (isDark ? 'hover:bg-[#334155]' : 'hover:bg-slate-100')}`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded border ${isDark ? 'text-slate-400 bg-black/30 border-white/10' : 'text-slate-500 bg-slate-100 border-slate-200'}`}>{lang.rightTag}</span>
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

  const renderSidebar = (isDark: boolean = false) => {
    if (!isSidebarOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        <div className={`fixed inset-0 backdrop-blur-xs transition-opacity ${isDark ? 'bg-black/60' : 'bg-black/50'}`} onClick={() => setIsSidebarOpen(false)} />
        <div className={`relative w-72 h-[100dvh] shadow-2xl z-10 flex flex-col font-sans animate-in slide-in-from-left duration-200 ${isDark ? 'bg-[#0F172A]' : 'bg-white'}`}>
          <div className="p-4 flex justify-between items-center text-white" style={{ backgroundColor: isDark ? '#0F172A' : pColor }}>
            <div className="flex items-center gap-2">
              <Layers size={18} />
              <h2 className="font-black text-sm"><span className="notranslate">{t.menuContent}</span></h2>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer">
              <X size={18} />
            </button>
          </div>

          <div className={`p-4 border-b space-y-1 ${isDark ? 'bg-[#1E293B] border-[#334155]' : 'bg-slate-50 border-slate-100'}`}>
            <h3 className={`font-extrabold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}><span className="notranslate">{restaurant.name}</span></h3>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}><span className="notranslate">{restaurant.subtitle || t.defaultSubtitle}</span></p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <p className={`text-[10px] font-bold uppercase px-2 mb-2 tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}><span className="notranslate">{t.categories}</span></p>
            <button onClick={() => { setSelectedCat('all'); setIsSidebarOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${selectedCat === 'all' ? (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (isDark ? 'text-slate-300 hover:bg-[#1E293B]' : 'text-slate-700 hover:bg-slate-100')}`}>
              <span className="notranslate">{t.allProducts}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? 'bg-[#334155] text-white' : 'bg-slate-200'}`}><span className="notranslate">{products.length}</span></span>
            </button>

            {categories.map(cat => {
              const count = products.filter(p => p.category_id === cat.id).length;
              return (
                <button key={cat.id} onClick={() => { setSelectedCat(cat.id); setIsSidebarOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${selectedCat === cat.id ? (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (isDark ? 'text-slate-300 hover:bg-[#1E293B]' : 'text-slate-700 hover:bg-slate-100')}`}>
                  <span className="truncate"><span className="notranslate">{cat.name}</span></span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? 'bg-[#334155] text-white' : 'bg-slate-200'}`}><span className="notranslate">{count}</span></span>
                </button>
              );
            })}
          </div>

          <div className={`p-4 border-t space-y-1 pb-safe ${isDark ? 'bg-[#1E293B] border-[#334155] text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
            {restaurant.working_hours && <p className="flex items-center gap-1.5 text-[11px]"><Clock size={12} /> <span className="notranslate">{restaurant.working_hours}</span></p>}
            {restaurant.phone && <p className="flex items-center gap-1.5 text-[11px]"><Phone size={12} /> <span className="notranslate">{restaurant.phone}</span></p>}
          </div>
        </div>
      </div>
    );
  };

  const renderFloatingCartButton = (isDark: boolean = false) => {
    if (cartItemCount === 0) return null;
    return (
      <button onClick={() => setIsCartOpen(true)} className={`fixed bottom-8 right-6 p-4 rounded-full shadow-2xl text-white z-[90] flex items-center justify-center animate-bounce duration-1000 cursor-pointer border-2 ${isDark ? 'border-white/20' : 'border-white'}`} style={{ backgroundColor: pColor }}>
        <div className="relative">
          <ShoppingBag size={24} />
          <span className="absolute -top-3 -right-3 bg-rose-500 text-white text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-sm">
            <span className="notranslate">{cartItemCount}</span>
          </span>
        </div>
      </button>
    );
  };

  // ============================================================================
  // ŞABLON 1: BİSTRO / AKORDEONLU TEMA (AÇIK TEMA)
  // ============================================================================
  if (template === 'bistro') {
    return (
      <div className="min-h-[100dvh] bg-slate-100 text-slate-900 font-sans pb-28 relative overflow-x-hidden">
        {renderCartDrawer(false)}
        {renderProductModal(false)}
        {renderSidebar(false)}
        {renderHeader(false)}
        {renderFloatingCartButton(false)}

        {restaurant.cover_image && (
          <div className="w-full h-32 bg-cover bg-center" style={{ backgroundImage: `url(${restaurant.cover_image})` }}></div>
        )}

        <div className="bg-white p-4 shadow-sm border-b space-y-3">
          <div className="flex gap-3 items-center">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt="Logo" className="w-16 h-16 object-cover rounded-xl border border-slate-100 shadow-sm" />
            ) : (
              <div className="w-14 h-14 text-white font-extrabold text-xs rounded-xl flex items-center justify-center p-1 text-center" style={{ backgroundColor: pColor }}><span className="notranslate">{restaurant.name[0]}</span></div>
            )}
            <div>
              <h1 className="font-extrabold text-lg text-slate-900"><span className="notranslate">{restaurant.name}</span></h1>
              <p className="text-xs text-slate-400 font-semibold"><span className="notranslate">{restaurant.subtitle || t.defaultSubtitle}</span></p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-600 pt-2 border-t mt-2">
            <span className="flex items-center gap-1"><Clock size={12} style={{ color: pColor }} /> <span className="notranslate">{restaurant.working_hours || '08:00 - 24:00'}</span></span>
            {restaurant.address && <span className="flex items-center gap-1"><MapPin size={12} style={{ color: pColor }} /> <span className="notranslate">{restaurant.address}</span></span>}
          </div>
        </div>

        <main className="max-w-md mx-auto p-3 space-y-3">
          {categories.map((cat) => {
            const catProducts = products.filter(p => p.category_id === cat.id);
            if (catProducts.length === 0) return null;
            
            return (
              <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center font-bold text-sm text-slate-800">
                  <div className="flex items-center gap-2.5">
                    {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-7 h-7 rounded-lg object-cover border border-slate-200" />}
                    <span className="notranslate">{cat.name}</span>
                  </div>
                  <ChevronDown size={16} className="text-slate-400" />
                </div>

                <div className="p-3 space-y-3 divide-y divide-slate-100">
                  {catProducts.map((prod) => (
                    <div key={prod.id} onClick={() => setSelectedProduct(prod)} className="pt-3 first:pt-0 flex gap-3 items-center cursor-pointer hover:bg-slate-50 transition -mx-3 px-3 rounded-lg">
                      {prod.image_url && <img src={prod.image_url} alt={prod.name} className="w-20 h-20 object-cover rounded-xl border border-slate-100 flex-shrink-0" />}
                      <div className="flex-1 min-w-0 space-y-1 py-1">
                        <div className="flex justify-between items-start gap-1">
                          <h3 className="font-bold text-xs text-slate-900 leading-snug"><span className="notranslate">{prod.name}</span></h3>
                          <button onClick={(e) => addToCart(prod, e)} className="bg-slate-100 text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition flex-shrink-0 hover:bg-slate-200" style={{ color: pColor }}>
                            <span className="notranslate">{t.addBtn}</span>
                          </button>
                        </div>
                        <p className="font-extrabold text-sm" style={{ color: pColor }}>₺<span className="notranslate">{prod.price}</span></p>
                        <p className="text-[10px] text-slate-400 line-clamp-2 pr-2 leading-relaxed"><span className="notranslate">{prod.description}</span></p>
                        
                        {prod.allergens && prod.allergens.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1.5">
                            <span className="text-[9px] font-bold text-slate-400"><span className="notranslate">{t.allergens}</span></span>
                            {prod.allergens.map((algId: string) => {
                              const alg = ALLERGEN_OPTIONS.find(a => a.id === algId);
                              return alg ? <span key={algId} className="text-xs grayscale opacity-70 notranslate" title={alg.label}>{alg.icon}</span> : null;
                            })}
                          </div>
                        )}
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

  // ============================================================================
  // ŞABLON 2: KLASİK TEMA (AÇIK RENK, YUVARLAK LOGO)
  // ============================================================================
  if (template === 'classic') {
    return (
      <div className="min-h-[100dvh] bg-slate-100 text-slate-900 font-sans pb-28 relative overflow-x-hidden">
        {renderCartDrawer(false)}
        {renderProductModal(false)}
        {renderSidebar(false)}
        {renderHeader(false)}
        {renderFloatingCartButton(false)}

        <div className="h-44 bg-slate-800 relative bg-cover bg-center" style={{ backgroundImage: restaurant.cover_image ? `url(${restaurant.cover_image})` : 'none' }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center font-bold text-xl" style={{ color: pColor }}>
            {restaurant.logo_url ? <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <span className="notranslate">{restaurant.name[0]}</span>}
          </div>
        </div>

        <div className="pt-12 text-center px-4 space-y-1">
          <h1 className="font-extrabold text-xl text-slate-900"><span className="notranslate">{restaurant.name}</span></h1>
          <p className="text-xs text-slate-500 font-semibold"><span className="notranslate">{restaurant.subtitle}</span></p>
        </div>

        <main className="max-w-md mx-auto p-4 space-y-3 mt-4">
          {filteredProducts.map((prod) => (
            <div key={prod.id} onClick={() => setSelectedProduct(prod)} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex gap-3 items-center cursor-pointer hover:border-slate-300 transition">
              {prod.image_url && <img src={prod.image_url} alt={prod.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-slate-900 pr-2"><span className="notranslate">{prod.name}</span></h3>
                  <span className="font-extrabold text-sm whitespace-nowrap" style={{ color: pColor }}>₺<span className="notranslate">{prod.price}</span></span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2"><span className="notranslate">{prod.description}</span></p>
                {prod.allergens && prod.allergens.length > 0 && (
                  <div className="flex items-center gap-1 pt-0.5">
                    <span className="text-[9px] font-bold text-slate-400"><span className="notranslate">{t.allergens}</span></span>
                    {prod.allergens.map((algId: string) => {
                      const alg = ALLERGEN_OPTIONS.find(a => a.id === algId);
                      return alg ? <span key={algId} className="text-[11px] notranslate" title={alg.label}>{alg.icon}</span> : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }

  // ============================================================================
  // ŞABLON 3: PDF / BROŞÜR MENÜ
  // ============================================================================
  if (template === 'pdf_image') {
    return (
      <div className="min-h-[100dvh] bg-slate-900 text-white font-sans flex flex-col items-center">
        {renderSidebar(true)}
        {renderHeader(true)}
        <main className="max-w-md w-full p-2 space-y-3 mt-4">
          {restaurant.custom_menu_image ? (
            <img src={restaurant.custom_menu_image} alt="Menü Broşürü" className="w-full rounded-xl shadow-2xl" />
          ) : (
            <div className="bg-slate-800 p-12 text-center rounded-2xl text-slate-400 text-xs">
              <span className="notranslate">{t.noBrochure}</span>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ============================================================================
  // ŞABLON 4: DN ÖZEL TEMASI (SİYAH LACİVERT YATAY KAYDIRMALI TEMA - SENİN İSTEDİĞİN GİBİ)
  // ============================================================================
  return (
    <div className="min-h-[100dvh] bg-[#0A0F1C] text-white font-sans pb-28 relative overflow-x-hidden">
      {renderCartDrawer(true)}
      {renderProductModal(true)}
      {renderSidebar(true)}
      {renderHeader(true)}
      {renderFloatingCartButton(true)}

      {/* RESTORAN BİLGİ ALANI */}
      <div className="flex flex-col items-center justify-center pt-6 pb-4 px-4 space-y-2 text-center">
        <p className="text-sm font-medium text-slate-300"><span className="notranslate">{restaurant.subtitle || t.defaultSubtitle}</span></p>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          {restaurant.phone && <span className="flex items-center gap-1"><Phone size={12} /> <span className="notranslate">{restaurant.phone}</span></span>}
          {restaurant.address && <span className="flex items-center gap-1"><MapPin size={12} /> <span className="notranslate">{restaurant.address}</span></span>}
        </div>
      </div>

      {/* YATAY KAYDIRILABİLİR KATEGORİ SEKMELERİ */}
      <div className="sticky top-[60px] z-30 bg-[#0A0F1C] border-b border-[#1E293B]">
        <div className="max-w-4xl mx-auto overflow-x-auto whitespace-nowrap flex gap-2 p-3 px-4 scrollbar-hide">
          <button 
            onClick={() => setSelectedCat('all')} 
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer border border-[#1E293B] ${selectedCat === 'all' ? 'text-white' : 'bg-[#151D2C] text-slate-400 hover:bg-[#1E293B]'}`}
            style={selectedCat === 'all' ? { backgroundColor: pColor } : {}}
          >
            <span className="notranslate">{t.allProducts}</span>
          </button>

          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setSelectedCat(cat.id)} 
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer border border-[#1E293B] ${selectedCat === cat.id ? 'text-white' : 'bg-[#151D2C] text-slate-400 hover:bg-[#1E293B]'}`}
              style={selectedCat === cat.id ? { backgroundColor: pColor } : {}}
            >
              <span className="notranslate">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ÜRÜN LİSTESİ KARTLARI */}
      <main className="max-w-4xl mx-auto p-4 space-y-4 mt-2">
        {filteredProducts.map((prod) => (
          <div 
            key={prod.id} 
            onClick={() => setSelectedProduct(prod)} // POPUP AÇAR
            className="bg-[#151D2C] border border-[#1E293B] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 cursor-pointer hover:border-slate-600 transition"
          >
            {/* Fotoğraf */}
            {prod.image_url ? (
              <img src={prod.image_url} alt={prod.name} className="w-full sm:w-36 h-48 sm:h-36 object-cover rounded-xl flex-shrink-0 bg-[#0B1120]" />
            ) : (
              <div className="w-full sm:w-36 h-36 bg-[#0B1120] rounded-xl flex-shrink-0 flex items-center justify-center border border-[#1E293B]"><span className="text-[10px] text-slate-600 notranslate">Yok</span></div>
            )}
            
            {/* Ürün Detayları */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-extrabold text-base text-white leading-snug"><span className="notranslate">{prod.name}</span></h3>
                  <span className="font-black text-sm px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                    <span className="notranslate">{prod.price}</span> ₺
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-3 mt-2 leading-relaxed"><span className="notranslate">{prod.description}</span></p>
              </div>

              {/* Alerjen İkonları */}
              {prod.allergens && prod.allergens.length > 0 && (
                <div className="flex items-center gap-1.5 pt-3">
                  {prod.allergens.map((algId: string) => {
                    const alg = ALLERGEN_OPTIONS.find(a => a.id === algId);
                    return alg ? <span key={algId} className="bg-[#0B1120] p-1.5 rounded border border-[#1E293B] text-xs grayscale opacity-80 notranslate" title={alg.label}>{alg.icon}</span> : null;
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-xs">
            <span className="notranslate">Bu kategoride ürün bulunamadı.</span>
          </div>
        )}
      </main>
    </div>
  );
}
