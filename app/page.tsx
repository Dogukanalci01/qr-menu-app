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
  ShieldCheck, 
  Save,
  Utensils,
  UploadCloud,
  Image as ImageIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
  const [products, setProducts] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState('');
  
  // Ürün Formu
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [saveStatus, setSaveStatus] = useState('');
  const [loadingCat, setLoadingCat] = useState(false);
  const [loadingProd, setLoadingProd] = useState(false);

  const liveMenuUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/menu/${restaurant.slug}` 
    : `https://example.com/menu/${restaurant.slug}`;

  useEffect(() => {
    fetchRestaurant();
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const { data } = await supabase.from('restaurants').select('*').eq('slug', 'livadya-restaurant').maybeSingle();
      if (data) {
        setRestaurant(data);
      } else {
        // Veritabanında yoksa otomatik ilk kaydı oluşturalım
        await supabase.from('restaurants').upsert([restaurant], { onConflict: 'slug' });
      }
    } catch (err) {
      console.error('Restaurant fetch error:', err);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setCategories(data);
      if (data.length > 0 && !productForm.category_id) {
        setProductForm((prev) => ({ ...prev, category_id: data[0].id }));
      }
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('id', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
  };

  // Görsel Sürükle-Bırak / Seçim İşlemi
  const handleImageChange = (file: File) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  // Görseli Supabase Storage'a Yükleme
  const uploadImageToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      // Storage yoksa Base64 fallback
      return imagePreview;
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Kategori Ekleme
  const addCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCatName.trim()) return;

    setLoadingCat(true);
    const insertData: any = {
      name: newCatName.trim(),
      sort_order: categories.length + 1
    };

    if (restaurant?.id) insertData.restaurant_id = restaurant.id;

    const { error } = await supabase.from('categories').insert([insertData]);
    setLoadingCat(false);

    if (!error) {
      setNewCatName('');
      fetchCategories();
    }
  };

  // Ürün Ekleme
  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price || !productForm.category_id) {
      alert('Lütfen ürün adı, fiyatı ve kategorisini seçin!');
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
      image_url: finalImageUrl,
      category_id: productForm.category_id
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
        image_url: '',
        category_id: categories[0]?.id || ''
      });
      setImageFile(null);
      setImagePreview('');
      fetchProducts();
    }
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  const saveRestaurant = async () => {
    setSaveStatus('Kaydediliyor...');
    const { error } = await supabase.from('restaurants').upsert([restaurant], { onConflict: 'slug' });
    if (!error) {
      setSaveStatus('Başarıyla Kaydedildi! ✓');
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      setSaveStatus('Hata oluştu: ' + error.message);
    }
  };

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
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400'}`}>
              <Sparkles size={18} /> Gösterge Paneli
            </button>
            <button onClick={() => setActiveTab('menu')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'menu' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400'}`}>
              <Layers size={18} /> Menü Yönetimi
            </button>
            <button onClick={() => setActiveTab('restaurant')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'restaurant' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400'}`}>
              <ChefHat size={18} /> Restoran Bilgileri
            </button>
            <button onClick={() => setActiveTab('qr')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'qr' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400'}`}>
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
                <p className="text-xs text-slate-400 uppercase">Kategoriler</p>
                <h3 className="text-3xl font-extrabold text-white mt-2">{categories.length}</h3>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <p className="text-xs text-slate-400 uppercase">Ürünler</p>
                <h3 className="text-3xl font-extrabold text-indigo-400 mt-2">{products.length}</h3>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'restaurant' && (
          <div className="max-w-3xl space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Restoran Bilgileri</h1>
              <button onClick={saveRestaurant} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                <Save size={18} /> Kaydet
              </button>
            </div>
            {saveStatus && <p className="text-sm text-emerald-400 bg-emerald-500/10 p-3 rounded-xl">{saveStatus}</p>}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <input type="text" value={restaurant.name} onChange={(e) => setRestaurant({...restaurant, name: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm" placeholder="Firma Adı" />
              <input type="text" value={restaurant.subtitle} onChange={(e) => setRestaurant({...restaurant, subtitle: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm" placeholder="Firma Alt Başlığı" />
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="max-w-4xl space-y-8">
            {/* Kategori Ekleme */}
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-white">1. Kategori Ekle</h1>
              <form onSubmit={addCategory} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex gap-3">
                <input 
                  type="text" 
                  placeholder="Kategori Adı (Örn: Tatlılar)" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none"
                />
                <button type="submit" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1">
                  <Plus size={18} /> Ekle
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
                    <span className="font-semibold text-sm text-slate-200">{cat.name}</span>
                    <button onClick={() => deleteCategory(cat.id)} className="text-rose-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Ürün Ekleme (Sürükle - Bırak Fotoğraf Alanı) */}
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Utensils size={20} className="text-indigo-400" /> 2. Ürün Ekle
              </h1>

              <form onSubmit={addProduct} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Ürün Adı</label>
                    <input 
                      type="text" 
                      placeholder="Örn: Künefe" 
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Kategori</label>
                    <select 
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Fiyat (₺)</label>
                  <input 
                    type="number" 
                    placeholder="250" 
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none"
                  />
                </div>

                {/* SÜRÜKLE - BIRAK FOTOĞRAF YÜKLEME ALANI */}
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
                    placeholder="Ürün içeriği..." 
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none"
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
                        <h3 className="font-bold text-white text-base">{prod.name}</h3>
                        <span className="font-extrabold text-indigo-400 text-base">{prod.price} ₺</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{prod.description}</p>
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
