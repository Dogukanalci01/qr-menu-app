'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Layers, 
  ChefHat, 
  ExternalLink, 
  Save,
  Utensils,
  UploadCloud,
  FolderTree,
  Flame,
  Check,
  ChevronDown
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// ALERJEN LİSTESİ VE EMOJİLERİ
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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('menu');
  const [restaurant, setRestaurant] = useState<any>({
    id: null,
    name: 'Livadya Restaurant',
    slug: 'livadya-restaurant',
    subtitle: 'Lezzet, Manzara ve Huzurun Adresi',
    phone: '0533 866 52 78',
    whatsapp: '905338665278',
    address: 'Lefke, Kıbrıs',
    instagram: '',
    description: 'Nefis lezzetler ve huzurlu ortam.'
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [newCatName, setNewCatName] = useState('');
  
  const [subCatForm, setSubCatForm] = useState({
    name: '',
    category_id: ''
  });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    calories: '',
    image_url: '',
    category_id: '',
    subcategory_id: '',
    allergens: [] as string[]
  });

  const [showAllergenDropdown, setShowAllergenDropdown] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [saveStatus, setSaveStatus] = useState('');
  const [loadingCat, setLoadingCat] = useState(false);
  const [loadingSubCat, setLoadingSubCat] = useState(false);
  const [loadingProd, setLoadingProd] = useState(false);

  const liveMenuUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/menu/${restaurant.slug}` 
    : `https://example.com/menu/${restaurant.slug}`;

  useEffect(() => {
    fetchRestaurant();
    fetchCategories();
    fetchSubcategories();
    fetchProducts();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const { data } = await supabase.from('restaurants').select('*').eq('slug', 'livadya-restaurant').maybeSingle();
      if (data) setRestaurant(data);
    } catch (err) {
      console.error('Restaurant fetch error:', err);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (data) {
      setCategories(data);
      if (data.length > 0) {
        setSubCatForm((prev) => prev.category_id ? prev : { ...prev, category_id: data[0].id });
        setProductForm((prev) => prev.category_id ? prev : { ...prev, category_id: data[0].id });
      }
    }
  };

  const fetchSubcategories = async () => {
    const { data } = await supabase
      .from('subcategories')
      .select('*, categories(name)')
      .order('sort_order', { ascending: true });

    if (data) setSubcategories(data);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, categories(name), subcategories(name)')
      .order('id', { ascending: false });

    if (data) setProducts(data);
  };

  // Alerjen Seçimi İşlemi (Çoklu Seçim)
  const toggleAllergen = (allergenId: string) => {
    setProductForm((prev) => {
      const exists = prev.allergens.includes(allergenId);
      const updated = exists 
        ? prev.allergens.filter(id => id !== allergenId)
        : [...prev.allergens, allergenId];
      return { ...prev, allergens: updated };
    });
  };

  const handleImageChange = (file: File) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const uploadImageToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) return imagePreview;

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const addCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCatName.trim()) return;

    setLoadingCat(true);
    const insertData: any = { name: newCatName.trim(), sort_order: categories.length + 1 };
    if (restaurant?.id) insertData.restaurant_id = restaurant.id;

    const { error } = await supabase.from('categories').insert([insertData]);
    setLoadingCat(false);

    if (!error) {
      setNewCatName('');
      fetchCategories();
    }
  };

  const addSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCatForm.name.trim() || !subCatForm.category_id) {
      alert('Lütfen bir alt kategori adı ve bağlı olduğu ana kategoriyi seçin!');
      return;
    }

    setLoadingSubCat(true);
    const insertData: any = {
      name: subCatForm.name.trim(),
      category_id: subCatForm.category_id,
      sort_order: subcategories.length + 1
    };
    if (restaurant?.id) insertData.restaurant_id = restaurant.id;

    const { error } = await supabase.from('subcategories').insert([insertData]);
    setLoadingSubCat(false);

    if (!error) {
      setSubCatForm({ name: '', category_id: categories[0]?.id || '' });
      fetchSubcategories();
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price || !productForm.category_id) {
      alert('Lütfen ürün adı, fiyatı ve ana kategorisini seçin!');
      return;
    }

    setLoadingProd(true);
    let finalImageUrl = productForm.image_url;

    if (imageFile) {
      setUploadingImage(true);
      finalImageUrl = await uploadImageToStorage(imageFile);
      setUploadingImage(false);
    }

    const insertProduct: any = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: parseFloat(productForm.price),
      calories: productForm.calories ? parseInt(productForm.calories) : 0,
      allergens: productForm.allergens,
      image_url: finalImageUrl,
      category_id: productForm.category_id,
      subcategory_id: productForm.subcategory_id || null
    };

    if (restaurant?.id) insertProduct.restaurant_id = restaurant.id;

    const { error } = await supabase.from('products').insert([insertProduct]);
    setLoadingProd(false);

    if (error) {
      alert('Ürün Ekleme Hatası: ' + error.message);
    } else {
      setProductForm({
        name: '',
        description: '',
        price: '',
        calories: '',
        image_url: '',
        category_id: categories[0]?.id || '',
        subcategory_id: '',
        allergens: []
      });
      setImageFile(null);
      setImagePreview('');
      setShowAllergenDropdown(false);
      fetchProducts();
    }
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
    fetchSubcategories();
  };

  const deleteSubcategory = async (id: string) => {
    await supabase.from('subcategories').delete().eq('id', id);
    fetchSubcategories();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  const saveRestaurant = async () => {
    setSaveStatus('Kaydediliyor...');
    const payload = { ...restaurant };
    if (!payload.id) delete payload.id;

    const { data, error } = await supabase
      .from('restaurants')
      .upsert([payload], { onConflict: 'slug' })
      .select();

    if (!error && data) {
      setRestaurant(data[0]);
      setSaveStatus('Başarıyla Kaydedildi! ✓');
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      setSaveStatus('Hata oluştu: ' + (error?.message || 'Bilinmeyen hata'));
    }
  };

  const filteredSubcategories = subcategories.filter(s => s.category_id === productForm.category_id);

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/80 backdrop-blur-md border-r border-slate-800/80 flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center font-black text-white text-lg">
              QR
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">QR Menü App</h2>
              <p className="text-[11px] text-slate-400">Yönetim Paneli</p>
            </div>
          </div>

          <nav className="p-4 space-y-1.5 text-sm font-medium">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60'}`}>
              <Sparkles size={18} /> Gösterge Paneli
            </button>
            <button onClick={() => setActiveTab('menu')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'menu' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60'}`}>
              <Layers size={18} /> Menü Yönetimi
            </button>
            <button onClick={() => setActiveTab('restaurant')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'restaurant' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60'}`}>
              <ChefHat size={18} /> Restoran Bilgileri
            </button>
            <button onClick={() => setActiveTab('qr')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'qr' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60'}`}>
              <ExternalLink size={18} /> QR Stüdyo
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="max-w-5xl space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Gösterge Paneli</h1>
              <a href={liveMenuUrl} target="_blank" rel="noreferrer" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                Canlı Menüyü Aç <ExternalLink size={16} />
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <p className="text-xs text-slate-400 uppercase font-semibold">Ana Kategoriler</p>
                <h3 className="text-3xl font-extrabold text-white mt-2">{categories.length}</h3>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <p className="text-xs text-slate-400 uppercase font-semibold">Alt Kategoriler</p>
                <h3 className="text-3xl font-extrabold text-purple-400 mt-2">{subcategories.length}</h3>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <p className="text-xs text-slate-400 uppercase font-semibold">Toplam Ürün</p>
                <h3 className="text-3xl font-extrabold text-indigo-400 mt-2">{products.length}</h3>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'restaurant' && (
          <div className="max-w-3xl space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Restoran Bilgileri</h1>
              <button onClick={saveRestaurant} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-indigo-500 transition">
                <Save size={18} /> Kaydet
              </button>
            </div>
            {saveStatus && <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">{saveStatus}</p>}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <input type="text" value={restaurant.name} onChange={(e) => setRestaurant({...restaurant, name: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none focus:border-indigo-500" placeholder="Firma Adı" />
              <input type="text" value={restaurant.subtitle} onChange={(e) => setRestaurant({...restaurant, subtitle: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none focus:border-indigo-500" placeholder="Firma Alt Başlığı" />
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="max-w-4xl space-y-8">
            {/* 1. ANA KATEGORİ YÖNETİMİ */}
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-white">1. Ana Kategori Ekle</h1>
              <form onSubmit={addCategory} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex gap-3">
                <input 
                  type="text" 
                  placeholder="Ana Kategori Adı (Örn: Şaraplar, Tatlılar)" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none focus:border-indigo-500"
                />
                <button type="submit" disabled={loadingCat} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1 hover:bg-indigo-500 transition">
                  <Plus size={18} /> Ekle
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
                    <span className="font-semibold text-sm text-slate-200">{cat.name}</span>
                    <button onClick={() => deleteCategory(cat.id)} className="text-rose-400 hover:text-rose-300">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* 2. ALT KATEGORİ YÖNETİMİ */}
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <FolderTree size={20} className="text-purple-400" /> 2. Alt Kategori Ekle
              </h1>

              <form onSubmit={addSubcategory} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
                <select 
                  value={subCatForm.category_id}
                  onChange={(e) => setSubCatForm({...subCatForm, category_id: e.target.value})}
                  className="px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                <input 
                  type="text" 
                  placeholder="Alt Kategori Adı (Örn: Kırmızı Şarap)" 
                  value={subCatForm.name}
                  onChange={(e) => setSubCatForm({...subCatForm, name: e.target.value})}
                  className="px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none focus:border-purple-500"
                />

                <button type="submit" disabled={loadingSubCat} className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 transition">
                  <Plus size={18} /> Alt Kategori Ekle
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {subcategories.map((sub) => (
                  <div key={sub.id} className="bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-purple-500/20 flex items-center gap-2 text-xs">
                    <span className="text-purple-400 font-medium">{sub.categories?.name} &gt;</span>
                    <span className="font-semibold text-slate-200">{sub.name}</span>
                    <button onClick={() => deleteSubcategory(sub.id)} className="text-rose-400 hover:text-rose-300 ml-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* 3. ÜRÜN EKLEME FORMU */}
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Utensils size={20} className="text-indigo-400" /> 3. Ürün Ekle
              </h1>

              <form onSubmit={addProduct} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Ürün Adı</label>
                    <input 
                      type="text" 
                      placeholder="Örn: Yakut Kırmızı Şarap" 
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Ana Kategori</label>
                    <select 
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({...productForm, category_id: e.target.value, subcategory_id: ''})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-purple-300 uppercase font-bold block mb-1">Alt Kategori (Opsiyonel)</label>
                    <select 
                      value={productForm.subcategory_id}
                      onChange={(e) => setProductForm({...productForm, subcategory_id: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-purple-500/30 text-white rounded-xl text-sm outline-none"
                    >
                      <option value="">-- Alt Kategori Yok --</option>
                      {filteredSubcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Fiyat (₺)</label>
                    <input 
                      type="number" 
                      placeholder="850" 
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-amber-400 uppercase font-bold block mb-1 flex items-center gap-1">
                      <Flame size={14} /> Kalori (kcal - Opsiyonel)
                    </label>
                    <input 
                      type="number" 
                      placeholder="Örn: 450" 
                      value={productForm.calories}
                      onChange={(e) => setProductForm({...productForm, calories: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* ÖZEL İKONLU ALERJEN SEÇİMİ DROPDOWN */}
                <div className="relative">
                  <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Alerjenler (İkonlu Seçim)</label>
                  
                  <button 
                    type="button"
                    onClick={() => setShowAllergenDropdown(!showAllergenDropdown)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm flex items-center justify-between text-left focus:border-indigo-500"
                  >
                    <div className="flex flex-wrap gap-1 items-center overflow-hidden">
                      {productForm.allergens.length === 0 ? (
                        <span className="text-slate-500">Alerjen seçilmedi...</span>
                      ) : (
                        productForm.allergens.map(id => {
                          const item = ALLERGEN_OPTIONS.find(a => a.id === id);
                          return (
                            <span key={id} className="bg-slate-800 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                              {item?.icon} {item?.label}
                            </span>
                          );
                        })
                      )}
                    </div>
                    <ChevronDown size={18} className="text-slate-400 flex-shrink-0 ml-2" />
                  </button>

                  {/* Dropdown Menü */}
                  {showAllergenDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2 space-y-1">
                      {ALLERGEN_OPTIONS.map((item) => {
                        const isSelected = productForm.allergens.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleAllergen(item.id)}
                            className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition ${
                              isSelected ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-base">{item.icon}</span> {item.label}
                            </span>
                            {isSelected && <Check size={16} className="text-indigo-400" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Sürükle - Bırak Fotoğraf Alanı */}
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Ürün Fotoğrafı</label>
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition relative group"
                  >
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageChange(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />

                    {imagePreview ? (
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-700">
                        <img src={imagePreview} alt="Önizleme" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs text-white">
                          Değiştir
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                          <UploadCloud size={24} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-slate-300">Fotoğrafı buraya sürükleyin veya tıklayın</p>
                          <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP (Otomatik Boyutlandırılır)</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Açıklama</label>
                  <textarea 
                    rows={2}
                    placeholder="Örn: Öküzgözü & Boğazkere, 75 cl..." 
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loadingProd || uploadingImage}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Plus size={18} /> {loadingProd ? 'Ekleniyor...' : 'Ürünü Menüye Ekle'}
                </button>
              </form>

              {/* Eklenen Ürünler Listesi */}
              <div className="space-y-3 mt-6">
                {products.map((prod) => (
                  <div key={prod.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex gap-4 items-center">
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} className="w-20 h-20 object-cover rounded-xl border border-slate-800" />
                    ) : (
                      <div className="w-20 h-20 bg-slate-950 rounded-xl flex items-center justify-center text-xs text-slate-600">Görsel Yok</div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-white text-base">{prod.name}</h3>
                          <p className="text-[11px] text-purple-400 font-medium">
                            {prod.categories?.name} {prod.subcategories?.name ? `> ${prod.subcategories.name}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-indigo-400 text-base">{prod.price} ₺</span>
                          {prod.calories > 0 && (
                            <p className="text-[11px] text-amber-400 font-semibold flex items-center justify-end gap-0.5">
                              <Flame size={12} /> {prod.calories} kcal
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{prod.description}</p>

                      {/* Alerjen İkonları */}
                      {prod.allergens && prod.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {prod.allergens.map((algId: string) => {
                            const alg = ALLERGEN_OPTIONS.find(a => a.id === algId);
                            return alg ? (
                              <span key={algId} className="bg-slate-950 border border-slate-800 text-[10px] px-2 py-0.5 rounded-md text-slate-300 flex items-center gap-1" title={alg.label}>
                                {alg.icon} {alg.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>

                    <button onClick={() => deleteProduct(prod.id)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="max-w-3xl space-y-6">
            <h1 className="text-2xl font-bold text-white">QR Stüdyo</h1>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-fit flex flex-col items-center gap-5">
              <div className="p-4 bg-white rounded-2xl">
                <QRCodeSVG value={liveMenuUrl} size={220} />
              </div>
              <p className="text-sm text-indigo-400 font-mono">{liveMenuUrl}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
