'use client';

import { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  Building2,
  Download,
  LayoutTemplate,
  Clock,
  Instagram,
  Facebook,
  Globe,
  Youtube,
  Phone,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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

const MAIN_DOMAIN = 'https://qr-menu-app-three-beta.vercel.app';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('menu');
  
  const [restaurantsList, setRestaurantsList] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [restaurant, setRestaurant] = useState<any>({
    name: 'Livadya Restaurant',
    slug: 'livadya-restaurant',
    subtitle: 'Lezzet, Manzara ve Huzurun Adresi',
    phone: '0533 866 52 78',
    whatsapp: '905338665278',
    address: 'Livadya Restaurant, Gaziveren, Lefke',
    working_hours: '08:00 - 24:00',
    description: '',
    instagram: '',
    facebook: '',
    website: '',
    youtube: '',
    template: 'modern',
    cover_image: '',
    logo_url: '',
    custom_menu_image: ''
  });

  const [newRestForm, setNewRestForm] = useState({ name: '', slug: '' });
  const [showNewRestModal, setShowNewRestModal] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [newCatName, setNewCatName] = useState('');
  
  const [subCatForm, setSubCatForm] = useState({ name: '', category_id: '' });

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
  
  // Ürün Fotoğrafı State'leri
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Restoran Logo ve Kapak Yükleme State'leri
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [loadingCat, setLoadingCat] = useState(false);
  const [loadingSubCat, setLoadingSubCat] = useState(false);
  const [loadingProd, setLoadingProd] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);

  const liveMenuUrl = `${MAIN_DOMAIN}/menu`;

  useEffect(() => {
    fetchAllRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      const active = restaurantsList.find(r => r.id === selectedRestaurantId);
      if (active) {
        setRestaurant(active);
        setLogoPreview(active.logo_url || '');
        setCoverPreview(active.cover_image || '');
      }

      fetchCategories(selectedRestaurantId);
      fetchSubcategories(selectedRestaurantId);
      fetchProducts(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  const fetchAllRestaurants = async () => {
    const { data, error } = await supabase.from('restaurants').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      setRestaurantsList(data);
      setSelectedRestaurantId(data[0].id);
      setRestaurant(data[0]);
      setLogoPreview(data[0].logo_url || '');
      setCoverPreview(data[0].cover_image || '');
    } else {
      const { data: newRest } = await supabase.from('restaurants').insert([{
        name: 'Livadya Restaurant',
        slug: 'livadya-restaurant',
        subtitle: 'Lezzet, Manzara ve Huzurun Adresi',
        template: 'modern'
      }]).select();
      if (newRest) {
        setRestaurantsList(newRest);
        setSelectedRestaurantId(newRest[0].id);
        setRestaurant(newRest[0]);
      }
    }
  };

  const fetchCategories = async (restId: string) => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restId)
      .order('sort_order', { ascending: true });

    if (data) {
      setCategories(data);
      if (data.length > 0) {
        setSubCatForm((prev) => ({ ...prev, category_id: data[0].id }));
        setProductForm((prev) => ({ ...prev, category_id: data[0].id }));
      }
    }
  };

  const fetchSubcategories = async (restId: string) => {
    const { data } = await supabase
      .from('subcategories')
      .select('*, categories(name)')
      .eq('restaurant_id', restId)
      .order('sort_order', { ascending: true });

    if (data) setSubcategories(data);
  };

  const fetchProducts = async (restId: string) => {
    const { data } = await supabase
      .from('products')
      .select('*, categories(name), subcategories(name)')
      .eq('restaurant_id', restId)
      .order('id', { ascending: false });

    if (data) setProducts(data);
  };

  // Supabase Storage Yükleme Fonksiyonu
  const uploadToStorage = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) return '';

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestForm.name.trim() || !newRestForm.slug.trim()) {
      alert('Lütfen restoran adı ve URL (slug) girin!');
      return;
    }

    const formattedSlug = newRestForm.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

    const { data, error } = await supabase.from('restaurants').insert([{
      name: newRestForm.name.trim(),
      slug: formattedSlug,
      subtitle: 'Yemek Bizim İşimiz',
      template: 'modern'
    }]).select();

    if (error) {
      alert('Restoran Oluşturma Hatası: ' + error.message);
    } else if (data) {
      setRestaurantsList([data[0], ...restaurantsList]);
      setSelectedRestaurantId(data[0].id);
      setRestaurant(data[0]);
      setNewRestForm({ name: '', slug: '' });
      setShowNewRestModal(false);
    }
  };

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${restaurant.slug}-qr-menu.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const toggleAllergen = (allergenId: string) => {
    setProductForm((prev) => {
      const exists = prev.allergens.includes(allergenId);
      const updated = exists 
        ? prev.allergens.filter(id => id !== allergenId)
        : [...prev.allergens, allergenId];
      return { ...prev, allergens: updated };
    });
  };

  // Restoran Bilgilerini Kaydetme (Logo ve Kapak Yüklemeli)
  const saveRestaurant = async () => {
    setSaveStatus('Kaydediliyor...');
    let updatedLogoUrl = restaurant.logo_url;
    let updatedCoverUrl = restaurant.cover_image;

    if (logoFile) {
      const uploadedUrl = await uploadToStorage(logoFile, 'logos');
      if (uploadedUrl) updatedLogoUrl = uploadedUrl;
    }

    if (coverFile) {
      const uploadedUrl = await uploadToStorage(coverFile, 'covers');
      if (uploadedUrl) updatedCoverUrl = uploadedUrl;
    }

    const payload = { 
      ...restaurant,
      logo_url: updatedLogoUrl,
      cover_image: updatedCoverUrl
    };

    const { data, error } = await supabase
      .from('restaurants')
      .upsert([payload], { onConflict: 'id' })
      .select();

    if (!error && data) {
      setRestaurant(data[0]);
      setSaveStatus('Başarıyla Kaydedildi! ✓');
      setLogoFile(null);
      setCoverFile(null);
      fetchAllRestaurants();
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      setSaveStatus('Hata oluştu: ' + (error?.message || 'Bilinmeyen hata'));
    }
  };

  const addCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCatName.trim() || !selectedRestaurantId) return;

    setLoadingCat(true);
    const insertData: any = { 
      name: newCatName.trim(), 
      sort_order: categories.length + 1,
      restaurant_id: selectedRestaurantId
    };

    const { error } = await supabase.from('categories').insert([insertData]);
    setLoadingCat(false);

    if (!error) {
      setNewCatName('');
      fetchCategories(selectedRestaurantId);
    }
  };

  const addSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCatForm.name.trim() || !subCatForm.category_id || !selectedRestaurantId) {
      alert('Lütfen bir alt kategori adı ve bağlı olduğu ana kategoriyi seçin!');
      return;
    }

    setLoadingSubCat(true);
    const insertData: any = {
      name: subCatForm.name.trim(),
      category_id: subCatForm.category_id,
      restaurant_id: selectedRestaurantId,
      sort_order: subcategories.length + 1
    };

    const { error } = await supabase.from('subcategories').insert([insertData]);
    setLoadingSubCat(false);

    if (!error) {
      setSubCatForm({ name: '', category_id: categories[0]?.id || '' });
      fetchSubcategories(selectedRestaurantId);
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price || !productForm.category_id || !selectedRestaurantId) {
      alert('Lütfen ürün adı, fiyatı ve ana kategorisini seçin!');
      return;
    }

    setLoadingProd(true);
    let finalImageUrl = productForm.image_url;

    if (imageFile) {
      setUploadingImage(true);
      finalImageUrl = await uploadToStorage(imageFile, 'products');
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
      subcategory_id: productForm.subcategory_id || null,
      restaurant_id: selectedRestaurantId
    };

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
      fetchProducts(selectedRestaurantId);
    }
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories(selectedRestaurantId);
    fetchSubcategories(selectedRestaurantId);
  };

  const deleteSubcategory = async (id: string) => {
    await supabase.from('subcategories').delete().eq('id', id);
    fetchSubcategories(selectedRestaurantId);
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    fetchProducts(selectedRestaurantId);
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

          <div className="p-4 border-b border-slate-800/60">
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 block">Aktif Restoran</label>
            <div className="flex gap-2">
              <select
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 font-semibold"
              >
                {restaurantsList.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <button 
                onClick={() => setShowNewRestModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition flex-shrink-0"
                title="Yeni Restoran Ekle"
              >
                <Plus size={16} />
              </button>
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
              <ChefHat size={18} /> Restoran Bilgileri & Şablon
            </button>
            <button onClick={() => setActiveTab('qr')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'qr' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60'}`}>
              <ExternalLink size={18} /> QR Stüdyo
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {showNewRestModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 size={20} className="text-indigo-400" /> Yeni Restoran Tanımla
              </h2>
              <form onSubmit={handleCreateRestaurant} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Restoran Adı</label>
                  <input 
                    type="text" 
                    placeholder="Örn: Deniz Balık Restoran" 
                    value={newRestForm.name}
                    onChange={(e) => setNewRestForm({...newRestForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Özel URL (Slug)</label>
                  <input 
                    type="text" 
                    placeholder="deniz-balik-restoran" 
                    value={newRestForm.slug}
                    onChange={(e) => setNewRestForm({...newRestForm, slug: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowNewRestModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800">İptal</button>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-semibold">Oluştur</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="max-w-5xl space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">{restaurant?.name} Gösterge Paneli</h1>
                <p className="text-slate-400 text-sm mt-0.5">Seçili restorana ait istatistikler.</p>
              </div>
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

        {/* RESTORAN BİLGİLERİ VE DETAYLI YÖNETİM */}
        {activeTab === 'restaurant' && (
          <div className="max-w-5xl space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Restoranı Yönet</h1>
              <button onClick={saveRestaurant} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-indigo-500 transition">
                <Save size={18} /> Kaydet
              </button>
            </div>
            {saveStatus && <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">{saveStatus}</p>}
            
            {/* FİRMA BİLGİLERİ */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="font-bold text-white text-base">Firma Bilgileri</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Firma Adı</label>
                  <input type="text" value={restaurant?.name || ''} onChange={(e) => setRestaurant({...restaurant, name: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none" placeholder="Livadya Restaurant" />
                </div>

                <div>
                  <label className="text-xs text-indigo-400 uppercase font-bold block mb-1">Firma Bağlantısı (Slug)</label>
                  <input type="text" value={restaurant?.slug || ''} onChange={(e) => setRestaurant({...restaurant, slug: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-indigo-300 font-mono rounded-xl text-sm outline-none" placeholder="livadya-restaurant" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Firma Alt Başlığı</label>
                  <input type="text" value={restaurant?.subtitle || ''} onChange={(e) => setRestaurant({...restaurant, subtitle: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none" placeholder="Lezzet, Manzara ve Huzurun Adresi" />
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold block mb-1 flex items-center gap-1"><Clock size={12} /> Çalışma Zaman Aralığı</label>
                  <input type="text" value={restaurant?.working_hours || ''} onChange={(e) => setRestaurant({...restaurant, working_hours: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none" placeholder="Pazartesi: Kapalı, Salı-Pazar: 11:00 - 00:30" />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Firma Açıklaması</label>
                <textarea 
                  rows={3}
                  value={restaurant?.description || ''} 
                  onChange={(e) => setRestaurant({...restaurant, description: e.target.value})} 
                  className="w-full p-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none leading-relaxed" 
                  placeholder="Lefke Gaziveren'in eşsiz sahilinde yer alan Livadya Restaurant, doğayla iç içe..."
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase font-bold block mb-1 flex items-center gap-1"><MapPin size={12} /> Adresiniz</label>
                <input type="text" value={restaurant?.address || ''} onChange={(e) => setRestaurant({...restaurant, address: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none" placeholder="Livadya Restaurant, Gaziveren, Lefke" />
              </div>
            </div>

            {/* SÜRÜKLE - BIRAK / FOTOĞRAF YÜKLEME ALANLARI (LOGO & KAPAK) */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="font-bold text-white text-base">Görsel Yönetimi</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. LOGO YÜKLEME */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 uppercase font-bold block">Logonuz</label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 relative min-h-[160px]">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setLogoFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setLogoPreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />

                    {logoPreview ? (
                      <div className="relative w-full h-28 rounded-xl overflow-hidden flex items-center justify-center bg-white/5 border border-slate-800 p-2">
                        <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                          <UploadCloud size={20} />
                        </div>
                        <p className="text-xs font-semibold text-slate-400 text-center">Logo Yüklemek İçin Tıklayın veya Sürükleyin</p>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. KAPAK RESMİ YÜKLEME */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 uppercase font-bold block">Firma Kapak Resmi</label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 relative min-h-[160px]">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setCoverFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setCoverPreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />

                    {coverPreview ? (
                      <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-800">
                        <img src={coverPreview} alt="Kapak" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-orange-600/10 text-orange-400 flex items-center justify-center">
                          <ImageIcon size={20} />
                        </div>
                        <p className="text-xs font-semibold text-slate-400 text-center">Kapak Yüklemek İçin Tıklayın veya Sürükleyin</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* İLETİŞİM & SOSYAL MEDYA LİNKLERİ */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="font-bold text-white text-base">İletişim & Sosyal Medya Linkleri</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold block mb-1 flex items-center gap-1.5"><Instagram size={14} className="text-pink-500" /> Instagram</label>
                  <input type="text" value={restaurant?.instagram || ''} onChange={(e) => setRestaurant({...restaurant, instagram: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none" placeholder="https://www.instagram.com/livadya_restoran/" />
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold block mb-1 flex items-center gap-1.5"><Facebook size={14} className="text-blue-500" /> Facebook</label>
                  <input type="text" value={restaurant?.facebook || ''} onChange={(e) => setRestaurant({...restaurant, facebook: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none" placeholder="https://www.facebook.com/p/Livadya-Restaurant..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold block mb-1 flex items-center gap-1.5"><Phone size={14} className="text-emerald-500" /> WhatsApp Numarası</label>
                  <input type="text" value={restaurant?.whatsapp || ''} onChange={(e) => setRestaurant({...restaurant, whatsapp: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none" placeholder="05338665278" />
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold block mb-1 flex items-center gap-1.5"><Globe size={14} className="text-indigo-400" /> İnternet Sitesi</label>
                  <input type="text" value={restaurant?.website || ''} onChange={(e) => setRestaurant({...restaurant, website: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none" placeholder="https://..." />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase font-bold block mb-1 flex items-center gap-1.5"><Youtube size={14} className="text-red-500" /> Youtube Sayfa Linkiniz</label>
                <input type="text" value={restaurant?.youtube || ''} onChange={(e) => setRestaurant({...restaurant, youtube: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none" placeholder="https://www.youtube.com/..." />
              </div>
            </div>

            {/* MENÜ ŞABLONU SEÇİMİ */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="font-bold text-white text-base flex items-center gap-2">
                <LayoutTemplate size={20} className="text-orange-400" /> Menü Şablonu Seçin
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {/* 1. Modern Tema */}
                <div 
                  onClick={() => setRestaurant({...restaurant, template: 'modern'})}
                  className={`border-2 rounded-2xl p-3 cursor-pointer transition flex flex-col justify-between relative overflow-hidden bg-slate-950 ${
                    (restaurant?.template || 'modern') === 'modern'
                      ? 'border-orange-500 ring-2 ring-orange-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="h-44 bg-slate-100 rounded-xl p-2 flex flex-col gap-2 overflow-hidden text-slate-800 border border-slate-300">
                    <div className="bg-orange-500 text-white p-1.5 rounded text-[9px] font-bold flex justify-between items-center">
                      <span>≡</span>
                      <span>TEST RESTORAN</span>
                      <span className="text-[7px] bg-white text-orange-600 px-1 rounded">TR</span>
                    </div>
                    <div className="h-10 bg-slate-300 rounded overflow-hidden relative flex items-center justify-center text-[8px] font-bold text-slate-500">
                      [Kapak Görseli]
                    </div>
                    <div className="space-y-1">
                      <div className="bg-white p-1 rounded border text-[7px] flex justify-between">
                        <div>
                          <p className="font-bold">Serpme Kahvaltı</p>
                          <p className="text-orange-600 font-bold">₺150.00</p>
                        </div>
                        <span className="bg-orange-100 text-orange-600 px-1 py-0.5 rounded text-[6px] h-fit">EKLE +</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <h3 className="font-bold text-xs text-orange-400">Modern Tema</h3>
                  </div>
                  {(restaurant?.template || 'modern') === 'modern' && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white p-1 rounded-full">
                      <Check size={12} />
                    </span>
                  )}
                </div>

                {/* 2. Menüm Özel Teması */}
                <div 
                  onClick={() => setRestaurant({...restaurant, template: 'custom_grid'})}
                  className={`border-2 rounded-2xl p-3 cursor-pointer transition flex flex-col justify-between relative overflow-hidden bg-slate-950 ${
                    restaurant?.template === 'custom_grid'
                      ? 'border-orange-500 ring-2 ring-orange-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="h-44 bg-slate-100 rounded-xl p-2 flex flex-col gap-2 overflow-hidden text-slate-800 border border-slate-300">
                    <div className="bg-orange-500 text-white p-1 rounded text-[8px] text-center font-bold">Menüm Özel Teması</div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <div className="h-10 bg-slate-800 rounded text-white text-[7px] flex items-center justify-center font-bold">KAMPANYALAR</div>
                      <div className="h-10 bg-slate-800 rounded text-white text-[7px] flex items-center justify-center font-bold">Kahvaltılıklar</div>
                      <div className="h-10 bg-slate-800 rounded text-white text-[7px] flex items-center justify-center font-bold">Gözlemeler</div>
                      <div className="h-10 bg-slate-800 rounded text-white text-[7px] flex items-center justify-center font-bold">İçecekler</div>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <h3 className="font-bold text-xs text-orange-400">Menüm Özel Teması</h3>
                  </div>
                  {restaurant?.template === 'custom_grid' && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white p-1 rounded-full">
                      <Check size={12} />
                    </span>
                  )}
                </div>

                {/* 3. Kendi Menünü Ekle */}
                <div 
                  onClick={() => setRestaurant({...restaurant, template: 'pdf_image'})}
                  className={`border-2 rounded-2xl p-3 cursor-pointer transition flex flex-col justify-between relative overflow-hidden bg-slate-950 ${
                    restaurant?.template === 'pdf_image'
                      ? 'border-orange-500 ring-2 ring-orange-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="h-44 bg-slate-100 rounded-xl p-2 flex flex-col items-center justify-center gap-2 border border-slate-300 text-slate-700 text-center">
                    <div className="w-12 h-16 bg-orange-100 border border-orange-300 rounded flex items-center justify-center text-[8px] font-bold text-orange-600">
                      PDF / Görsel
                    </div>
                    <p className="text-[8px] font-semibold text-slate-500">Var olan broşür/görsel menünüzü gösterir</p>
                  </div>
                  <div className="mt-3 text-center">
                    <h3 className="font-bold text-xs text-orange-400">Kendi Menünü Ekle</h3>
                  </div>
                  {restaurant?.template === 'pdf_image' && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white p-1 rounded-full">
                      <Check size={12} />
                    </span>
                  )}
                </div>

                {/* 4. Klasik Tema */}
                <div 
                  onClick={() => setRestaurant({...restaurant, template: 'classic'})}
                  className={`border-2 rounded-2xl p-3 cursor-pointer transition flex flex-col justify-between relative overflow-hidden bg-slate-950 ${
                    restaurant?.template === 'classic'
                      ? 'border-orange-500 ring-2 ring-orange-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="h-44 bg-slate-100 rounded-xl overflow-hidden border border-slate-300 flex flex-col">
                    <div className="h-16 bg-slate-700 relative flex items-end justify-center pb-1">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-300 absolute -bottom-3 flex items-center justify-center text-[7px] font-bold">LOGO</div>
                    </div>
                    <div className="pt-4 p-2 text-center text-slate-800 space-y-1">
                      <p className="text-[8px] font-bold">Klasik Tema</p>
                      <div className="flex gap-1 justify-center text-[6px]">
                        <span className="bg-orange-500 text-white px-1 py-0.5 rounded-full">Tüm Kategoriler</span>
                        <span className="bg-slate-200 text-slate-600 px-1 py-0.5 rounded-full">Çorbalar</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <h3 className="font-bold text-xs text-orange-400">Klasik Tema</h3>
                  </div>
                  {restaurant?.template === 'classic' && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white p-1 rounded-full">
                      <Check size={12} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="max-w-4xl space-y-8">
            <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl flex justify-between items-center">
              <p className="text-xs text-indigo-300 font-medium">Şu an <strong>{restaurant?.name}</strong> için menü düzenliyorsun.</p>
              <a href={liveMenuUrl} target="_blank" rel="noreferrer" className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                Canlı Önizleme <ExternalLink size={14} />
              </a>
            </div>

            {/* 1. ANA KATEGORİ YÖNETİMİ */}
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-white">1. Ana Kategori Ekle</h1>
              <form onSubmit={addCategory} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex gap-3">
                <input 
                  type="text" 
                  placeholder="Ana Kategori Adı (Örn: Kahvaltılıklar, Çorbalar)" 
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
                  placeholder="Alt Kategori Adı (Örn: Omletler)" 
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
                      placeholder="Örn: Serpme Kahvaltılık Çeşitleri" 
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
                      placeholder="150" 
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

                {/* ALERJEN DROPDOWN */}
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

                {/* Sürükle - Bırak Fotoğraf */}
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Ürün Fotoğrafı</label>
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0];
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setImagePreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition relative group"
                  >
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setImageFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setImagePreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
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
                    placeholder="Örn: Beyaz peynir, kaşar peynir, tel peynir, bal, tereyağı..." 
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

                      {prod.allergens && prod.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {prod.allergens.map((algId: string) => {
                            const alg = ALLERGEN_OPTIONS.find(a => a.id === algId);
                            return alg ? (
                              <span key={algId} className="bg-slate-950 border border-slate-800 text-[10px] px-2 py-0.5 rounded-md text-slate-300 flex items-center gap-1">
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

        {/* QR STÜDYO */}
        {activeTab === 'qr' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{restaurant?.name} Özel QR Kodu</h1>
              <p className="text-slate-400 text-sm mt-0.5">Bu QR kod doğrudan <strong>{restaurant?.name}</strong> menüsüne yönlendirir.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-fit flex flex-col items-center gap-5 shadow-xl">
              <div ref={qrRef} className="p-4 bg-white rounded-2xl shadow-inner">
                <QRCodeSVG value={liveMenuUrl} size={220} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-500 uppercase font-mono tracking-wider">Hedef URL</p>
                <p className="text-sm font-medium text-indigo-400 font-mono select-all bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">{liveMenuUrl}</p>
              </div>

              <button
                onClick={downloadQR}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-lg shadow-indigo-600/20"
              >
                <Download size={18} /> QR Kodu İndir (PNG)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
