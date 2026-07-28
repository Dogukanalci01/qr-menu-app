'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
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
    allProducts: 'Tüm Ürünler',
    categories: 'Kategoriler',
    categoriesTitle: 'KATEGORİLER',
    backToCategories: '← Kategorilere Dön',
    addBtn: 'Ekle',
    addToOrder: 'Siparişe Ekle',
    allergens: 'Alerjenler:',
    noBrochure: 'Henüz menü broşür görseli yüklenmedi.',
    notFound: 'Restoran Bulunamadı',
    loading: 'Menü Yükleniyor...',
    workingHours: 'Çalışma Saatleri',
    defaultSubtitle: 'Yemek Bizim İşimiz',
    cartTitle: 'Sepetim',
    emptyCart: 'Sepetiniz şu an boş.',
    total: 'Toplam',
    placeOrder: 'Siparişi Tamamla',
  },
  EN: {
    callWaiter: 'Waiter call notification sent!',
    waiterBtn: 'Call Waiter',
    menuContent: 'Menu Content',
    allProducts: 'All Products',
    categories: 'Categories',
    categoriesTitle: 'CATEGORIES',
    backToCategories: '← Back to Categories',
    addBtn: 'Add',
    addToOrder: 'Add to Order',
    allergens: 'Allergens:',
    noBrochure: 'Menu brochure image has not been uploaded yet.',
    notFound: 'Restaurant Not Found',
    loading: 'Loading Menu...',
    workingHours: 'Working Hours',
    defaultSubtitle: 'Food is Our Business',
    cartTitle: 'My Cart',
    emptyCart: 'Your cart is currently empty.',
    total: 'Total',
    placeOrder: 'Place Order',
  },
  RU: {
    callWaiter: 'Уведомление официанту отправлено!',
    waiterBtn: 'Вызвать официанта',
    menuContent: 'Содержание меню',
    allProducts: 'Все продукты',
    categories: 'Категории',
    categoriesTitle: 'КАТЕГОРИИ',
    backToCategories: '← Назад к категориям',
    addBtn: 'Добавить',
    addToOrder: 'Добавить к заказу',
    allergens: 'Аллергены:',
    noBrochure: 'Изображение брошюры меню еще не загружено.',
    notFound: 'Ресторан не найден',
    loading: 'Загрузка меню...',
    workingHours: 'Часы работы',
    defaultSubtitle: 'Еда - это наш бизнес',
    cartTitle: 'Моя корзина',
    emptyCart: 'Ваша корзина пуста.',
    total: 'Итого',
    placeOrder: 'Оформить заказ',
  },
  DE: {
    callWaiter: 'Kellner-Benachrichtigung gesendet!',
    waiterBtn: 'Kellner rufen',
    menuContent: 'Menüinhalte',
    allProducts: 'Alle Produkte',
    categories: 'Kategorien',
    categoriesTitle: 'KATEGORIEN',
    backToCategories: '← Zurück zu Kategorien',
    addBtn: 'Hinzufügen',
    addToOrder: 'Zur Bestellung hinzufügen',
    allergens: 'Allergene:',
    noBrochure: 'Menü-Broschürenbild wurde noch nicht hochgeladen.',
    notFound: 'Restaurant nicht gefunden',
    loading: 'Menü wird geladen...',
    workingHours: 'Öffnungszeiten',
    defaultSubtitle: 'Essen ist unser Geschäft',
    cartTitle: 'Mein Warenkorb',
    emptyCart: 'Ihr Warenkorb ist derzeit leer.',
    total: 'Gesamt',
    placeOrder: 'Bestellung aufgeben',
  },
  EL: {
    callWaiter: 'Η ειδοποίηση κλήσης σερβιτόρου στάλθηκε!',
    waiterBtn: 'Καλέστε Σερβιτόρο',
    menuContent: 'Περιεχόμενο Μενού',
    allProducts: 'Όλα τα Προϊόντα',
    categories: 'Κατηγορίες',
    categoriesTitle: 'ΚΑΤΗΓΟΡΙΕΣ',
    backToCategories: '← Πίσω στις Κατηγορίες',
    addBtn: 'Προσθήκη',
    addToOrder: 'Προσθήκη στην Παραγγελία',
    allergens: 'Αλλεργιογόνα:',
    noBrochure: 'Η εικόνα του φυλλαδίου μενού δεν έχει μεταφορτωθεί ακόμα.',
    notFound: 'Το Εστιατόριο Δεν Βρέθηκε',
    loading: 'Φόρtωση...',
    workingHours: 'Ώρες Λειτουργίας',
    defaultSubtitle: 'Το Φαγητό Είναι η Δουλειά Μας',
    cartTitle: 'Το Καλάθι μου',
    emptyCart: 'Το καλάθι σας είναι άδειο.',
    total: 'Σύνολο',
    placeOrder: 'Παραγγελία',
  }
};

export default function PublicMenu({ params }: { params: { slug?: string } }) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('TR');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const t = translations[currentLang] || translations.TR;

  useEffect(() => {
    fetchData();
  }, [params]);

  const changeLanguage = (displayCode: string) => {
    setCurrentLang(displayCode);
    setIsLangOpen(false);
  };

  const fetchData = async () => {
    setLoading(true);
    let restQuery = supabase.from('restaurants').select('*');
    if (params?.slug) {
      restQuery = restQuery.eq('slug', params.slug);
    }
    const { data: restData } = await restQuery.order('created_at', { ascending: false }).limit(1).maybeSingle();

    if (restData) {
      setRestaurant(restData);
      const { data: catData } = await supabase.from('categories').select('*').eq('restaurant_id', restData.id).order('sort_order', { ascending: true });
      if (catData) setCategories(catData);
      const { data: subData } = await supabase.from('subcategories').select('*').eq('restaurant_id', restData.id).order('sort_order', { ascending: true });
      if (subData) setSubcategories(subData);
      const { data: prodData } = await supabase.from('products').select('*').eq('restaurant_id', restData.id);
      if (prodData) setProducts(prodData);
    }
    setLoading(false);
  };

  const addToCart = (product: any, e?: any) => {
    if(e) e.stopPropagation();
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
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
    setCart([]);
    setIsCartOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-white text-slate-800 flex items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
          <p className="text-slate-500 text-xs font-semibold"><span>{t.loading}</span></p>
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
        <h1 className="text-xl font-bold"><span>{t.notFound}</span></h1>
      </div>
    );
  }

  const template = restaurant.template || 'custom_grid';
  const pColor = restaurant.primary_color || '#1e3a8a';

  const filteredProducts = products.filter(p => {
    if (selectedCat !== 'all' && p.category_id !== selectedCat) return false;
    return true;
  });

  const renderCartDrawer = () => {
    if (!isCartOpen) return null;
    return (
      <div className="fixed inset-0 z-[120] flex justify-end">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
        <div className="relative w-full max-w-sm bg-white h-[100dvh] shadow-2xl flex flex-col font-sans animate-in slide-in-from-right duration-300">
          <div className="p-5 flex justify-between items-center border-b border-slate-100" style={{ backgroundColor: pColor }}>
            <div className="flex items-center gap-2 text-white">
              <ShoppingBag size={20} />
              <h2 className="font-black text-lg"><span>{t.cartTitle}</span></h2>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-white/20 rounded-full text-white transition cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <ShoppingBag size={48} className="opacity-20" />
                <p className="text-sm font-bold"><span>{t.emptyCart}</span></p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex gap-3 items-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-100 rounded-xl flex-shrink-0"></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate pr-2"><span>{item.name}</span></h4>
                      <p className="font-extrabold text-sm" style={{ color: pColor }}>₺<span>{item.price * item.quantity}</span></p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                      <button onClick={() => updateCartQuantity(item.id, -1)} className="text-slate-500 hover:text-slate-800 p-1">
                        {item.quantity === 1 ? <Trash2 size={14} className="text-rose-500" /> : <Minus size={14} />}
                      </button>
                      <span className="font-black text-sm w-4 text-center"><span>{item.quantity}</span></span>
                      <button onClick={() => updateCartQuantity(item.id, 1)} className="text-slate-500 hover:text-slate-800 p-1">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-5 bg-white border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] space-y-4 pb-safe">
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold text-slate-500"><span>{t.total}</span>:</span>
                <span className="font-black text-slate-900 text-2xl">₺<span>{cartTotal}</span></span>
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

  const renderProductModal = () => {
    if (!selectedProduct) return null;
    return (
      <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center p-0 sm:p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer" onClick={() => setSelectedProduct(null)} />
        <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90dvh] flex flex-col">
          <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 bg-white/90 text-slate-800 p-2 rounded-full shadow-md z-20 hover:bg-white transition cursor-pointer">
            <X size={20} />
          </button>
          
          <div className="overflow-y-auto pb-safe">
            {selectedProduct.image_url ? (
              <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-64 sm:h-72 object-cover sm:rounded-t-3xl" />
            ) : (
              <div className="w-full h-24 bg-slate-100 sm:rounded-t-3xl flex items-center justify-center text-slate-400 font-bold text-xs"><span>Görsel Yok</span></div>
            )}
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h2 className="text-2xl font-black text-slate-900 leading-tight"><span>{selectedProduct.name}</span></h2>
                <p className="text-2xl font-extrabold whitespace-nowrap" style={{ color: pColor }}>₺<span>{selectedProduct.price}</span></p>
              </div>
              
              {selectedProduct.description && (
                <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl">
                  <span>{selectedProduct.description}</span>
                </p>
              )}

              {selectedProduct.allergens && selectedProduct.allergens.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"><span>{t.allergens}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.allergens.map((algId: string) => {
                      const alg = ALLERGEN_OPTIONS.find(a => a.id === algId);
                      return alg ? <span key={algId} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold"><span className="text-base">{alg.icon}</span> <span>{alg.label}</span></span> : null;
                    })}
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                className="w-full py-4 rounded-2xl text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer" 
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

  const renderHeader = () => (
    <header className="text-white p-3 px-4 flex justify-between items-center shadow-md relative z-40 sticky top-0" style={{ backgroundColor: pColor }}>
      <div className="flex items-center gap-3">
        <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition cursor-pointer" title={t.menuContent}>
          <MenuIcon size={20} />
        </button>
        <span className="font-extrabold text-sm tracking-wide line-clamp-1"><span>{restaurant.name}</span></span>
      </div>

      <div className="flex items-center gap-2 relative">
        <button onClick={() => alert(t.callWaiter)} className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition cursor-pointer flex-shrink-0" title={t.waiterBtn}>
          <Bell size={16} />
        </button>

        <div className="relative">
          <button onClick={() => setIsLangOpen(!isLangOpen)} className="bg-white px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition cursor-pointer text-slate-800">
            <Globe size={13} style={{ color: pColor }} /> <span>{currentLang}</span> <ChevronDown size={12} className="text-slate-400" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-slate-800 py-1">
              {[
                { display: 'TR', label: 'Türkçe', flag: '🇹🇷', rightTag: 'TR' },
                { display: 'EN', label: 'English', flag: '🇬🇧', rightTag: 'GB' },
                { display: 'RU', label: 'Русский', flag: '🇷🇺', rightTag: 'RU' },
                { display: 'DE', label: 'Deutsch', flag: '🇩🇪', rightTag: 'DE' },
                { display: 'EL', label: 'Ελληνικά', flag: '🇬🇷', rightTag: 'GR' }
              ].map(lang => (
                <button key={lang.display} onClick={() => changeLanguage(lang.display)} className={`w-full text-left px-3.5 py-2.5 text-xs font-bold hover:bg-slate-100 transition flex items-center justify-between cursor-pointer ${currentLang === lang.display ? 'text-indigo-600 bg-indigo-50 font-black' : ''}`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{lang.rightTag}</span>
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

  const renderSidebar = () => {
    if (!isSidebarOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={() => setIsSidebarOpen(false)} />
        <div className="relative w-72 bg-white h-[100dvh] shadow-2xl z-10 flex flex-col font-sans animate-in slide-in-from-left duration-200">
          <div className="p-4 text-white flex justify-between items-center" style={{ backgroundColor: pColor }}>
            <div className="flex items-center gap-2">
              <Layers size={18} />
              <h2 className="font-black text-sm"><span>{t.menuContent}</span></h2>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 border-b bg-slate-50 space-y-1">
            <h3 className="font-extrabold text-xs text-slate-900"><span>{restaurant.name}</span></h3>
            <p className="text-[11px] text-slate-500"><span>{restaurant.subtitle || t.defaultSubtitle}</span></p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-2 tracking-wider"><span>{t.categories}</span></p>
            <button onClick={() => { setSelectedCat('all'); setIsSidebarOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${selectedCat === 'all' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-100'}`}>
              <span>{t.allProducts}</span>
              <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full"><span>{products.length}</span></span>
            </button>

            {categories.map(cat => {
              const count = products.filter(p => p.category_id === cat.id).length;
              return (
                <button key={cat.id} onClick={() => { setSelectedCat(cat.id); setIsSidebarOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${selectedCat === cat.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-100'}`}>
                  <span className="truncate"><span>{cat.name}</span></span>
                  <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full"><span>{count}</span></span>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t text-[11px] text-slate-500 space-y-1 bg-slate-50 pb-safe">
            {restaurant.working_hours && <p className="flex items-center gap-1.5"><Clock size={12} /> <span>{restaurant.working_hours}</span></p>}
            {restaurant.phone && <p className="flex items-center gap-1.5"><Phone size={12} /> <span>{restaurant.phone}</span></p>}
          </div>
        </div>
      </div>
    );
  };

  const renderFloatingCartButton = () => {
    if (cartItemCount === 0) return null;
    return (
      <button onClick={() => setIsCartOpen(true)} className="fixed bottom-8 right-6 p-4 rounded-full shadow-2xl text-white z-[90] flex items-center justify-center animate-bounce duration-1000 cursor-pointer border-2 border-white" style={{ backgroundColor: pColor }}>
        <div className="relative">
          <ShoppingBag size={24} />
          <span className="absolute -top-3 -right-3 bg-rose-500 text-white text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-sm">
            <span>{cartItemCount}</span>
          </span>
        </div>
      </button>
    );
  };

  // 1. PDF / GÖRSEL ŞABLON
  if (template === 'pdf_image') {
    return (
      <div className="min-h-[100dvh] bg-slate-900 text-white font-sans flex flex-col items-center">
        {renderSidebar()}
        {renderHeader()}
        <main className="max-w-md w-full p-2 space-y-3 mt-4">
          {restaurant.custom_menu_image ? (
            <img src={restaurant.custom_menu_image} alt="Menü Broşürü" className="w-full rounded-xl shadow-2xl" />
          ) : (
            <div className="bg-slate-800 p-12 text-center rounded-2xl text-slate-400 text-xs">
              <span>{t.noBrochure}</span>
            </div>
          )}
        </main>
      </div>
    );
  }

  // 2. KARE GRID ŞABLON (DN ÖZEL TEMA - ANA VE ALT KATEGORİ AÇIKLAMALARI EKLENDİ)
  if (template === 'custom_grid') {
    const activeCategory = categories.find(c => c.id === selectedCat);
    const catSubcategories = subcategories.filter(s => s.category_id === selectedCat);

    return (
      <div className="min-h-[100dvh] bg-slate-100 text-slate-900 font-sans pb-28 relative overflow-x-hidden">
        {renderCartDrawer()}
        {renderProductModal()}
        {renderSidebar()}
        {renderHeader()}
        {renderFloatingCartButton()}

        {selectedCat === 'all' ? (
          <>
            {restaurant.cover_image && (
              <div className="w-full h-40 bg-cover bg-center" style={{ backgroundImage: `url(${restaurant.cover_image})` }}></div>
            )}
            <div className="bg-white p-5 shadow-sm space-y-2 border-b">
              <div className="flex items-center gap-3">
                {restaurant.logo_url && (
                  <img src={restaurant.logo_url} alt="Logo" className="w-14 h-14 rounded-xl object-cover shadow-sm border border-slate-100" />
                )}
                <div>
                  <h1 className="text-xl font-extrabold"><span>{restaurant.name}</span></h1>
                  <p className="text-xs text-slate-500 font-medium"><span>{restaurant.subtitle || t.defaultSubtitle}</span></p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-slate-600 pt-3 border-t mt-3">
                <p className="flex items-center gap-1.5"><Clock size={14} style={{ color: pColor }} /> <span>{restaurant.working_hours || '08:00 - 24:00'}</span></p>
                {restaurant.address && <p className="flex items-center gap-1.5"><MapPin size={14} style={{ color: pColor }} /> <span>{restaurant.address}</span></p>}
              </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-4">
              <h2 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider text-center sm:text-left"><span>{t.categoriesTitle}</span></h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} onClick={() => setSelectedCat(cat.id)} className="h-32 sm:h-36 rounded-2xl relative overflow-hidden cursor-pointer shadow-md flex flex-col justify-end p-4 border border-slate-200 bg-cover bg-center hover:shadow-lg transition-transform hover:-translate-y-1" style={{ backgroundImage: cat.image_url ? `linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.1)), url(${cat.image_url})` : 'none', backgroundColor: '#1e293b' }}>
                    <span className="font-black text-sm text-white relative z-20 uppercase"><span>{cat.name}</span></span>
                    {cat.description && <span className="text-[10px] text-slate-300 relative z-20 line-clamp-1 mt-0.5"><span>{cat.description}</span></span>}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full">
            <div className="bg-white shadow-sm sticky top-[60px] z-30 border-b border-slate-200">
              <div className="max-w-4xl mx-auto overflow-x-auto whitespace-nowrap flex gap-2 p-3 px-4 scrollbar-hide items-center">
                 <button onClick={() => setSelectedCat('all')} className="px-4 py-2 rounded-full text-xs font-bold transition border border-slate-200 text-slate-600 hover:bg-slate-50">
                   <span>{t.allProducts}</span>
                 </button>
                 {categories.map(cat => (
                   <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-4 py-2 rounded-full text-xs font-bold transition border ${selectedCat === cat.id ? 'text-white border-transparent shadow-md' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`} style={selectedCat === cat.id ? { backgroundColor: pColor } : {}}>
                     <span>{cat.name}</span>
                   </button>
                 ))}
              </div>
            </div>

            {/* SEÇİLEN KATEGORİ AÇIKLAMASI BANNERI */}
            {activeCategory?.description && (
              <div className="max-w-3xl mx-auto px-4 pt-4">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
                  <h3 className="font-black text-sm uppercase" style={{ color: pColor }}><span>{activeCategory.name}</span></h3>
                  <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed"><span>{activeCategory.description}</span></p>
                </div>
              </div>
            )}

            <main className="max-w-3xl mx-auto p-4 space-y-4 mt-2">
              {/* ALT KATEGORİLER VARSA GRUPLU VEYA LİSTE HALİNDE GÖSTERİM */}
              {catSubcategories.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {catSubcategories.map(sub => (
                    <div key={sub.id} className="bg-white border border-slate-200 px-3 py-2 rounded-xl flex-shrink-0 text-xs shadow-2xs">
                      <span className="font-bold text-slate-800">{sub.name}</span>
                      {sub.description && <span className="text-[10px] text-slate-400 block">{sub.description}</span>}
                    </div>
                  ))}
                </div>
              )}

              {filteredProducts.map((prod) => (
                <div key={prod.id} onClick={() => setSelectedProduct(prod)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 cursor-pointer hover:shadow-md transition">
                  {prod.image_url && <img src={prod.image_url} alt={prod.name} className="w-full sm:w-32 h-40 sm:h-32 object-cover rounded-xl flex-shrink-0" />}
                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-extrabold text-base text-slate-900 leading-snug uppercase"><span>{prod.name}</span></h3>
                        <span className="font-black text-sm px-3 py-1 rounded-lg text-white whitespace-nowrap" style={{ backgroundColor: pColor }}>₺<span>{prod.price}</span></span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed"><span>{prod.description}</span></p>
                    </div>
                    {prod.allergens && prod.allergens.length > 0 && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                        {prod.allergens.map((algId: string) => {
                          const alg = ALLERGEN_OPTIONS.find(a => a.id === algId);
                          return alg ? <span key={algId} className="text-sm grayscale opacity-70" title={alg.label}>{alg.icon}</span> : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-xs font-semibold">
                  <span>Bu kategoride ürün bulunamadı.</span>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    );
  }

  // 3. KLASİK TEMA
  if (template === 'classic') {
    return (
      <div className="min-h-[100dvh] bg-slate-100 text-slate-900 font-sans pb-28 relative overflow-x-hidden">
        {renderCartDrawer()}
        {renderProductModal()}
        {renderSidebar()}
        {renderHeader()}
        {renderFloatingCartButton()}

        <div className="h-44 bg-slate-800 relative bg-cover bg-center" style={{ backgroundImage: restaurant.cover_image ? `url(${restaurant.cover_image})` : 'none' }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center font-bold text-xl" style={{ color: pColor }}>
            {restaurant.logo_url ? <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <span>{restaurant.name[0]}</span>}
          </div>
        </div>

        <div className="pt-12 text-center px-4 space-y-1">
          <h1 className="font-extrabold text-xl text-slate-900"><span>{restaurant.name}</span></h1>
          <p className="text-xs text-slate-500 font-semibold"><span>{restaurant.subtitle}</span></p>
        </div>

        <main className="max-w-md mx-auto p-4 space-y-3 mt-4">
          {filteredProducts.map((prod) => (
            <div key={prod.id} onClick={() => setSelectedProduct(prod)} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex gap-3 items-center cursor-pointer hover:border-slate-300 transition">
              {prod.image_url && <img src={prod.image_url} alt={prod.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-slate-900 pr-2"><span>{prod.name}</span></h3>
                  <span className="font-extrabold text-sm whitespace-nowrap" style={{ color: pColor }}>₺<span>{prod.price}</span></span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2"><span>{prod.description}</span></p>
                {prod.allergens && prod.allergens.length > 0 && (
                  <div className="flex items-center gap-1 pt-0.5">
                    <span className="text-[9px] font-bold text-slate-400"><span>{t.allergens}</span></span>
                    {prod.allergens.map((algId: string) => {
                      const alg = ALLERGEN_OPTIONS.find(a => a.id === algId);
                      return alg ? <span key={algId} className="text-[11px]" title={alg.label}>{alg.icon}</span> : null;
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

  // 4. BİSTRO TEMA
  return (
    <div className="min-h-[100dvh] bg-slate-100 text-slate-900 font-sans pb-28 relative overflow-x-hidden">
      {renderCartDrawer()}
      {renderProductModal()}
      {renderSidebar()}
      {renderHeader()}
      {renderFloatingCartButton()}

      {restaurant.cover_image && (
        <div className="w-full h-32 bg-cover bg-center" style={{ backgroundImage: `url(${restaurant.cover_image})` }}></div>
      )}

      <div className="bg-white p-4 shadow-sm border-b space-y-3">
        <div className="flex gap-3 items-center">
          {restaurant.logo_url ? (
            <img src={restaurant.logo_url} alt="Logo" className="w-16 h-16 object-cover rounded-xl border border-slate-100 shadow-sm" />
          ) : (
            <div className="w-14 h-14 text-white font-extrabold text-xs rounded-xl flex items-center justify-center p-1 text-center" style={{ backgroundColor: pColor }}><span>{restaurant.name[0]}</span></div>
          )}
          <div>
            <h1 className="font-extrabold text-lg text-slate-900"><span>{restaurant.name}</span></h1>
            <p className="text-xs text-slate-400 font-semibold"><span>{restaurant.subtitle || t.defaultSubtitle}</span></p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] text-slate-600 pt-2 border-t mt-2">
          <span className="flex items-center gap-1"><Clock size={12} style={{ color: pColor }} /> <span>{restaurant.working_hours || '08:00 - 24:00'}</span></span>
          {restaurant.address && <span className="flex items-center gap-1"><MapPin size={12} style={{ color: pColor }} /> <span>{restaurant.address}</span></span>}
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
                  <div>
                    <span>{cat.name}</span>
                    {cat.description && <p className="text-[10px] text-slate-400 font-normal">{cat.description}</p>}
                  </div>
                </div>
                <ChevronDown size={16} className="text-slate-400" />
              </div>

              <div className="p-3 space-y-3 divide-y divide-slate-100">
                {catProducts.map((prod) => (
                  <div key={prod.id} onClick={() => setSelectedProduct(prod)} className="pt-3 first:pt-0 flex gap-3 items-center cursor-pointer hover:bg-slate-50 transition -mx-3 px-3 rounded-lg">
                    {prod.image_url && <img src={prod.image_url} alt={prod.name} className="w-20 h-20 object-cover rounded-xl border border-slate-100 flex-shrink-0" />}
                    <div className="flex-1 min-w-0 space-y-1 py-1">
                      <div className="flex justify-between items-start gap-1">
                        <h3 className="font-bold text-xs text-slate-900 leading-snug"><span>{prod.name}</span></h3>
                        <button onClick={(e) => { e.stopPropagation(); addToCart(prod); }} className="bg-slate-100 text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition flex-shrink-0 hover:bg-slate-200" style={{ color: pColor }}>
                          <span>{t.addBtn}</span>
                        </button>
                      </div>
                      <p className="font-extrabold text-sm" style={{ color: pColor }}>₺<span>{prod.price}</span></p>
                      <p className="text-[10px] text-slate-400 line-clamp-2 pr-2 leading-relaxed"><span>{prod.description}</span></p>
                      
                      {prod.allergens && prod.allergens.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1.5">
                          <span className="text-[9px] font-bold text-slate-400"><span>{t.allergens}</span></span>
                          {prod.allergens.map((algId: string) => {
                            const alg = ALLERGEN_OPTIONS.find(a => a.id === algId);
                            return alg ? <span key={algId} className="text-xs grayscale opacity-70" title={alg.label}>{alg.icon}</span> : null;
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
