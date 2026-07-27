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
  Image as ImageIcon,
  FileText,
  QrCode,
  User,
  Settings,
  LogOut,
  CreditCard,
  Lock,
  Mail,
  Activity,
  History
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
  // --- AUTH STATES ---
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  // --- SETTINGS STATES ---
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);

  // --- ACTIVITY LOGS STATE ---
  const [activities, setActivities] = useState<any[]>([]);

  // --- DASHBOARD STATES ---
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
    primary_color: '#4f46e5',
    description: '',
    instagram: '',
    facebook: '',
    website: '',
    youtube: '',
    template: 'bistro',
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
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

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

  // --- LOG ADDER HELPER ---
  const logActivity = (title: string, description: string) => {
    const newLog = {
      id: Date.now(),
      title,
      description,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('tr-TR')
    };
    setActivities(prev => [newLog, ...prev]);
  };

  // --- AUTH CHECK & LISTENER ---
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSessionUser(user);
      if (user?.email) setNewEmail(user.email);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
      if (session?.user?.email) setNewEmail(session.user.email);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- FETCH DATA IF LOGGED IN ---
  useEffect(() => {
    if (sessionUser) {
      fetchAllRestaurants();
    }
  }, [sessionUser]);

  useEffect(() => {
    if (selectedRestaurantId && sessionUser) {
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
      if (error) {
        setAuthMessage('Hata: ' + error.message);
      } else {
        setAuthMessage('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        setIsSignUp(false);
        logActivity('Yeni Hesap', `${authEmail} adresli hesap oluşturuldu.`);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) {
        setAuthMessage('Hata: ' + error.message);
      } else {
        setAuthMessage('Giriş başarılı!');
        logActivity('Oturum Açıldı', `${authEmail} sisteme giriş yaptı.`);
      }
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    logActivity('Oturum Kapatıldı', 'Hesaptan çıkış yapıldı.');
    await supabase.auth.signOut();
  };

  // --- UPDATE EMAIL & PASSWORD ---
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMessage('');

    let updateData: any = {};
    if (newEmail && newEmail !== sessionUser.email) {
      updateData.email = newEmail;
    }
    if (newPassword) {
      updateData.password = newPassword;
    }

    if (Object.keys(updateData).length === 0) {
      setSettingsMessage('Değiştirilecek yeni bir e-posta veya şifre girmediniz.');
      setSettingsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser(updateData);
    setSettingsLoading(false);

    if (error) {
      setSettingsMessage('Güncelleme Hatası: ' + error.message);
    } else {
      setSettingsMessage('Hesap ayarlarınız başarıyla güncellendi! ✓');
      logActivity('Hesap Güncellendi', 'Kullanıcı e-posta veya şifre bilgilerini değiştirdi.');
      setNewPassword('');
    }
  };

  const fetchAllRestaurants = async () => {
    const { data, error } = await supabase.from('restaurants').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      setRestaurantsList(data);
      if (!selectedRestaurantId) {
        setSelectedRestaurantId(data[0].id);
        setRestaurant(data[0]);
        setLogoPreview(data[0].logo_url || '');
        setCoverPreview(data[0].cover_image || '');
      }
    } else {
      const { data: newRest } = await supabase.from('restaurants').insert([{
        name: 'Livadya Restaurant',
        slug: 'livadya-restaurant',
        subtitle: 'Lezzet, Manzara ve Huzurun Adresi',
        primary_color: '#4f46e5',
        template: 'bistro'
      }]).select();
      if (newRest) {
        setRestaurantsList(newRest);
        setSelectedRestaurantId(newRest[0].id);
        setRestaurant(newRest[0]);
        logActivity('Restoran Oluşturuldu', 'Varsayılan Livadya Restaurant sisteme tanımlandı.');
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

  const uploadToStorage = async (file: File, folder: string): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}_${Date.now()}_${Math.random().toString(36.substring(2, 7))}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage Upload Error:', uploadError.message);
        return '';
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.error('Upload Exception:', err);
      return '';
    }
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
      primary_color: '#4f46e5',
      template: 'bistro'
    }]).select();

    if (error) {
      alert('Restoran Oluşturma Hatası: ' + error.message);
    } else if (data) {
      setRestaurantsList([data[0], ...restaurantsList]);
      setSelectedRestaurantId(data[0].id);
      setRestaurant(data[0]);
      setNewRestForm({ name: '', slug: '' });
      setShowNewRestModal(false);
      logActivity('Yeni Restoran', `${data[0].name} başarıyla eklendi.`);
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
        logActivity('QR İndirildi', `${restaurant.name} için masa QR kodu indirildi.`);
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
      setLogoPreview(data[0].logo_url || '');
      setCoverPreview(data[0].cover_image || '');
      setSaveStatus('Başarıyla Kaydedildi! ✓');
      setLogoFile(null);
      setCoverFile(null);
      fetchAllRestaurants();
      logActivity('Restoran Güncellendi', `${restaurant.name} bilgileri ve teması kaydedildi.`);
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
      logActivity('Kategori Eklendi', `"${newCatName.trim()}" ana kategorisi eklendi.`);
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
      logActivity('Alt Kategori Eklendi', `"${subCatForm.name.trim()}" alt kategorisi eklendi.`);
      setSubCatForm({ name: '', category_id: categories[0]?.id || '' });
      fetchSubcategories(selectedRestaurantId);
    }
  };

  // --- ÜRÜN EKLEME FONKSİYONU GÜNCELLENDİ (RESİM YÜKLEME GARANTİLİ) ---
  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price || !productForm.category_id || !selectedRestaurantId) {
      alert('Lütfen ürün adı, fiyatı ve ana kategorisini seçin!');
      return;
    }

    setLoadingProd(true);
    setUploadingImage(true);
    let finalImageUrl = productForm.image_url;

    // Eğer bir resim dosyası seçildiyse storage'a yükle
    if (imageFile) {
      const uploadedUrl = await uploadToStorage(imageFile, 'products');
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      }
    }
    setUploadingImage(false);

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
      logActivity('Ürün Eklendi', `"${productForm.name.trim()}" menüye (₺${productForm.price}) eklendi.`);
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
    logActivity('Kategori Silindi', 'Bir ana kategori kaldırıldı.');
    fetchCategories(selectedRestaurantId);
    fetchSubcategories(selectedRestaurantId);
  };

  const deleteSubcategory = async (id: string) => {
    await supabase.from('subcategories').delete().eq('id', id);
    logActivity('Alt Kategori Silindi', 'Bir alt kategori kaldırıldı.');
    fetchSubcategories(selectedRestaurantId);
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    logActivity('Ürün Silindi', 'Menüden bir ürün kaldırıldı.');
    fetchProducts(selectedRestaurantId);
  };

  const filteredSubcategories = subcategories.filter(s => s.category_id === productForm.category_id);

  // --- KULLANICI GİRİŞ YAPMADIYSA GÖSTERİLECEK AUTH EKRANI ---
  if (!sessionUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 font-sans text-slate-800">
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="flex items-center justify-center gap-2 font-black text-2xl tracking-tight text-slate-900 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-md shadow-indigo-500/20">
              QR
            </div>
            <span>QR</span>
            <span className="text-indigo-600">Menu</span>
          </div>

          <h2 className="text-lg font-extrabold text-slate-900 text-center mb-6">
            {isSignUp ? 'Yeni Hesap Oluştur' : 'Panele Giriş Yap'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold block mb-1">E-posta</label>
              <input
                type="email"
                placeholder="ornek@email.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Şifre</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {authLoading ? 'İşleniyor...' : (isSignUp ? 'Kayıt Ol' : 'Giriş Yap')}
            </button>
          </form>

          {authMessage && (
            <p className={`mt-4 text-xs text-center font-bold p-3 rounded-xl ${authMessage.includes('Hata') ? 'text-rose-600 bg-rose-50 border border-rose-200' : 'text-emerald-600 bg-emerald-50 border border-emerald-200'}`}>
              {authMessage}
            </p>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthMessage('');
              }}
              className="text-xs font-bold text-indigo-600 hover:underline bg-transparent border-none cursor-pointer"
            >
              {isSignUp ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Kendi hesabınızı oluşturun'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- KULLANICI GİRİŞ YAPTIYSA GÖSTERİLECEK ANA DASHBOARD ---
  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* ÜST HEADER NAVBAR */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight text-slate-900">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-indigo-500/20">
              QR
            </div>
            <span className="font-extrabold tracking-tight text-slate-900">QR</span>
            <span className="text-indigo-600 font-extrabold">Menu</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a 
            href={liveMenuUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm shadow-indigo-600/20"
          >
            Canlı Önizleme <ExternalLink size={14} />
          </a>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
            <User size={16} className="text-indigo-600" />
            <span className="max-w-[150px] truncate">{sessionUser.email}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition"
            title="Çıkış Yap"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SOL SIDEBAR */}
        <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between p-4 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 block tracking-wider">Aktif Restoran</label>
              <div className="flex gap-2">
                <select
                  value={selectedRestaurantId}
                  onChange={(e) => setSelectedRestaurantId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-indigo-500 font-bold"
                >
                  {restaurantsList.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setShowNewRestModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition flex-shrink-0 shadow-xs"
                  title="Yeni Restoran Ekle"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-400 px-3 tracking-wider">Yönetim</p>
               
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600 font-extrabold border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles size={16} /> Gösterge Paneli
              </button>

              <button 
                onClick={() => setActiveTab('restaurant')} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'restaurant' ? 'bg-indigo-50 text-indigo-600 font-extrabold border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ChefHat size={16} /> Restoran Bilgileri
              </button>

              <button 
                onClick={() => setActiveTab('menu')} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'menu' ? 'bg-indigo-50 text-indigo-600 font-extrabold border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Layers size={16} /> Menü Ekle
              </button>

              <button 
                onClick={() => setActiveTab('qr')} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'qr' ? 'bg-indigo-50 text-indigo-600 font-extrabold border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode size={16} /> QR Oluşturucu
              </button>
            </div>

            <div className="space-y-1 border-t border-slate-100 pt-4">
              <p className="text-[10px] font-bold uppercase text-slate-400 px-3 tracking-wider">Hesap</p>
               
              <button 
                onClick={() => setActiveTab('logs')} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'logs' ? 'bg-indigo-50 text-indigo-600 font-extrabold border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard size={16} /> İşlemler
              </button>

              <button 
                onClick={() => setActiveTab('settings')} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600 font-extrabold border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Settings size={16} /> Hesap Ayarları
              </button>

              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition">
                <LogOut size={16} /> Çıkış Yap
              </button>
            </div>
          </div>
        </aside>

        {/* SAĞ İÇERİK ALANI */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
          {showNewRestModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 size={20} className="text-indigo-600" /> Yeni Restoran Tanımla
                </h2>
                <form onSubmit={handleCreateRestaurant} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Restoran Adı</label>
                    <input 
                      type="text" 
                      placeholder="Örn: Deniz Balık Restoran" 
                      value={newRestForm.name}
                      onChange={(e) => setNewRestForm({...newRestForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Özel URL (Slug)</label>
                    <input 
                      type="text" 
                      placeholder="deniz-balik-restoran" 
                      value={newRestForm.slug}
                      onChange={(e) => setNewRestForm({...newRestForm, slug: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-sm outline-none font-mono"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowNewRestModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">İptal</button>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs">Oluştur</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* İŞLEMLER / GEÇMİŞ AKTİVİTELER */}
          {activeTab === 'logs' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <History className="text-indigo-600" size={24} /> Geçmiş İşlemler & Aktiviteler
                </h1>
                <p className="text-slate-500 text-xs font-medium mt-0.5">Sistemde ve restoran menüsünde gerçekleştirdiğiniz son işlemlerin dökümü.</p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                {activities.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                    Henüz kayıtlı bir işlem bulunmuyor. Menüye ürün ekledikçe veya değişiklik yaptıkça burada listelenecektir.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <Activity size={18} />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-xs">{item.title}</h3>
                            <p className="text-slate-500 text-[11px] font-medium mt-0.5">{item.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono font-bold text-slate-400 block">{item.time}</span>
                          <span className="text-[10px] font-bold text-indigo-600">{item.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HESAP AYARLARI (E-POSTA VE ŞİFRE DEĞİŞTİRME) */}
          {activeTab === 'settings' && (
            <div className="max-w-xl space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Hesap Ayarları</h1>
                <p className="text-slate-500 text-xs font-medium mt-0.5">Oturum açma bilgilerinizi güncelleyin.</p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-xs">
                <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Settings size={18} className="text-indigo-600" /> Profil ve Güvenlik Bilgileri
                </h2>

                <form onSubmit={handleUpdateSettings} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1 flex items-center gap-1.5">
                      <Mail size={14} className="text-indigo-600" /> E-posta Adresi
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                      placeholder="E-posta adresiniz"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1 flex items-center gap-1.5">
                      <Lock size={14} className="text-indigo-600" /> Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <Save size={16} /> {settingsLoading ? 'Güncelleniyor...' : 'Bilgileri Güncelle'}
                  </button>
                </form>

                {settingsMessage && (
                  <p className={`text-xs font-bold p-3 rounded-xl ${settingsMessage.includes('Hata') ? 'text-rose-600 bg-rose-50 border border-rose-200' : 'text-emerald-600 bg-emerald-50 border border-emerald-200'}`}>
                    {settingsMessage}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="max-w-5xl space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900">{restaurant?.name} Gösterge Paneli</h1>
                <p className="text-slate-500 text-xs font-medium mt-0.5">Seçili restorana ait canlı durum özeti.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Ana Kategoriler</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-2">{categories.length}</h3>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Alt Kategoriler</p>
                  <h3 className="text-3xl font-black text-indigo-600 mt-2">{subcategories.length}</h3>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Toplam Ürün</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-2">{products.length}</h3>
                </div>
              </div>
            </div>
          )}

          {/* RESTORAN BİLGİLERİ & SENKRONİZE RENK SEÇİCİ */}
          {activeTab === 'restaurant' && (
            <div className="max-w-5xl space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-slate-900">Restoran Bilgileri & Renk Paleti</h1>
                <div className="flex gap-2">
                  <a href={liveMenuUrl} target="_blank" rel="noreferrer" className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
                    Canlı Menüyü Test Et <ExternalLink size={14} />
                  </a>
                  <button onClick={saveRestaurant} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs">
                    <Save size={16} /> Değişiklikleri Kaydet
                  </button>
                </div>
              </div>
              {saveStatus && <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-bold">{saveStatus}</p>}
               
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <h2 className="font-extrabold text-slate-900 text-sm">Firma Adı ve Teması</h2>
                 
                {/* RENK SEÇİCİ VE FİRMA ADI YANYANA (SENKRONİZE EDİLDİ) */}
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold block mb-1">
                    *Firma Adı ve Rengi Seçin
                  </label>
                  <div className="flex items-center gap-3">
                    {/* Tıklanabilir Renk Seçici Kutusu */}
                    <div className="relative flex items-center justify-center w-11 h-11 rounded-xl border border-slate-300 shadow-2xs overflow-hidden cursor-pointer flex-shrink-0" style={{ backgroundColor: restaurant?.primary_color || '#4f46e5' }}>
                      <input 
                        type="color" 
                        value={restaurant?.primary_color || '#4f46e5'} 
                        onChange={(e) => setRestaurant({...restaurant, primary_color: e.target.value})}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="Renk Seçmek İçin Tıklayın"
                      />
                    </div>

                    {/* Firma Adı Input Alanı */}
                    <input 
                      type="text" 
                      value={restaurant?.name || ''} 
                      onChange={(e) => setRestaurant({...restaurant, name: e.target.value})} 
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500" 
                      placeholder="Livadya Restaurant" 
                    />
                  </div>

                  {/* SENKRONİZE HEX KOD GİRİŞİ */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-bold">Özel HEX Renk Kodu:</span>
                    <input 
                      type="text" 
                      value={restaurant?.primary_color || '#4f46e5'} 
                      onChange={(e) => setRestaurant({...restaurant, primary_color: e.target.value})} 
                      className="w-28 p-1.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-xs font-mono font-bold outline-none focus:border-indigo-500 uppercase" 
                      placeholder="#4f46e5" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Firma Bağlantısı (Slug)</label>
                    <input type="text" value={restaurant?.slug || ''} onChange={(e) => setRestaurant({...restaurant, slug: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 text-indigo-600 font-mono font-bold rounded-xl text-xs outline-none" placeholder="livadya-restaurant" />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Firma Alt Başlığı</label>
                    <input type="text" value={restaurant?.subtitle || ''} onChange={(e) => setRestaurant({...restaurant, subtitle: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500" placeholder="Lezzet, Manzara ve Huzurun Adresi" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1 flex items-center gap-1"><Clock size={12} /> Çalışma Zaman Aralığı</label>
                    <input type="text" value={restaurant?.working_hours || ''} onChange={(e) => setRestaurant({...restaurant, working_hours: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500" placeholder="08:00 - 24:00" />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1 flex items-center gap-1"><MapPin size={12} /> Adresiniz</label>
                    <input type="text" value={restaurant?.address || ''} onChange={(e) => setRestaurant({...restaurant, address: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500" placeholder="Livadya Restaurant, Gaziveren, Lefke" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Firma Açıklaması</label>
                  <textarea 
                    rows={3}
                    value={restaurant?.description || ''} 
                    onChange={(e) => setRestaurant({...restaurant, description: e.target.value})} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-medium outline-none focus:border-indigo-500 leading-relaxed" 
                    placeholder="Lefke Gaziveren'in eşsiz sahilinde..."
                  />
                </div>
              </div>

              {/* GÖRSEL YÖNETİMİ */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <h2 className="font-extrabold text-slate-900 text-sm">Görsel Yönetimi</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-bold block">Logonuz</label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 relative min-h-[150px] transition">
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
                        <div className="relative w-full h-28 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-slate-200 p-2">
                          <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <UploadCloud size={20} />
                          </div>
                          <p className="text-xs font-bold text-slate-600 text-center">Logo Yüklemek İçin Tıklayın veya Sürükleyin</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-bold block">Firma Kapak Resmi</label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 relative min-h-[150px] transition">
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
                        <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-200">
                          <img src={coverPreview} alt="Kapak" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <ImageIcon size={20} />
                          </div>
                          <p className="text-xs font-bold text-slate-600 text-center">Kapak Yüklemek İçin Tıklayın veya Sürükleyin</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* İLETİŞİM & SOSYAL MEDYA */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <h2 className="font-extrabold text-slate-900 text-sm">İletişim & Sosyal Medya Linkleri</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1 flex items-center gap-1.5"><Instagram size={14} className="text-pink-500" /> Instagram</label>
                    <input type="text" value={restaurant?.instagram || ''} onChange={(e) => setRestaurant({...restaurant, instagram: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500" placeholder="https://www.instagram.com/..." />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1 flex items-center gap-1.5"><Facebook size={14} className="text-blue-600" /> Facebook</label>
                    <input type="text" value={restaurant?.facebook || ''} onChange={(e) => setRestaurant({...restaurant, facebook: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500" placeholder="https://www.facebook.com/..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1 flex items-center gap-1.5"><Phone size={14} className="text-emerald-600" /> WhatsApp Numarası</label>
                    <input type="text" value={restaurant?.whatsapp || ''} onChange={(e) => setRestaurant({...restaurant, whatsapp: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500" placeholder="05338665278" />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1 flex items-center gap-1.5"><Globe size={14} className="text-slate-600" /> İnternet Sitesi</label>
                    <input type="text" value={restaurant?.website || ''} onChange={(e) => setRestaurant({...restaurant, website: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500" placeholder="https://..." />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold block mb-1 flex items-center gap-1.5"><Youtube size={14} className="text-red-600" /> Youtube Sayfa Linkiniz</label>
                  <input type="text" value={restaurant?.youtube || ''} onChange={(e) => setRestaurant({...restaurant, youtube: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500" placeholder="https://www.youtube.com/..." />
                </div>
              </div>

              {/* MENÜ ŞABLONU SEÇİMİ */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <LayoutTemplate size={18} className="text-indigo-600" /> Menü Şablonu Seçin
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  {/* 1. Bistro & Cafe */}
                  <div 
                    onClick={() => {
                      setRestaurant({...restaurant, template: 'bistro'});
                      logActivity('Şablon Değiştirildi', 'Bistro & Cafe şablonu seçildi.');
                    }}
                    className={`border-2 rounded-2xl p-3 cursor-pointer transition flex flex-col justify-between relative overflow-hidden bg-slate-50 ${
                      (restaurant?.template || 'bistro') === 'bistro'
                        ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/30'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="h-44 bg-white rounded-xl p-2 flex flex-col gap-1.5 overflow-hidden text-slate-800 border border-slate-200 shadow-2xs pointer-events-none">
                      <div className="bg-indigo-600 text-white p-1.5 rounded-lg text-[9px] font-extrabold flex justify-between items-center">
                        <span>≡ RESTORAN</span>
                        <span className="text-[7px] bg-white text-indigo-600 px-1 py-0.5 rounded font-bold">TR</span>
                      </div>
                      <div className="h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-[8px] font-black">
                        [Kapak Görseli]
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg border text-[7px] flex justify-between items-center">
                        <div>
                          <p className="font-bold">Serpme Kahvaltı</p>
                          <p className="text-indigo-600 font-extrabold">₺150.00</p>
                        </div>
                        <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[6px] font-bold">EKLE +</span>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <h3 className="font-bold text-xs text-slate-900">Bistro & Cafe</h3>
                    </div>
                    {(restaurant?.template || 'bistro') === 'bistro' && (
                      <span className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-md">
                        <Check size={12} />
                      </span>
                    )}
                  </div>

                  {/* 2. DN Özel Teması */}
                  <div 
                    onClick={() => {
                      setRestaurant({...restaurant, template: 'custom_grid'});
                      logActivity('Şablon Değiştirildi', 'DN Özel Teması seçildi.');
                    }}
                    className={`border-2 rounded-2xl p-3 cursor-pointer transition flex flex-col justify-between relative overflow-hidden bg-slate-50 ${
                      restaurant?.template === 'custom_grid'
                        ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/30'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="h-44 bg-white rounded-xl p-2 flex flex-col gap-1.5 overflow-hidden text-slate-800 border border-slate-200 shadow-2xs pointer-events-none">
                      <div className="bg-indigo-600 text-white p-1 rounded-lg text-[8px] text-center font-extrabold">DN Özel Teması</div>
                      <div className="grid grid-cols-2 gap-1 mt-0.5">
                        <div className="h-10 bg-slate-800 rounded-lg text-white text-[7px] flex items-center justify-center font-bold">KAMPANYALAR</div>
                        <div className="h-10 bg-slate-800 rounded-lg text-white text-[7px] flex items-center justify-center font-bold">KAHVALTILIKLAR</div>
                        <div className="h-10 bg-slate-800 rounded-lg text-white text-[7px] flex items-center justify-center font-bold">GÖZLEMELER</div>
                        <div className="h-10 bg-slate-800 rounded-lg text-white text-[7px] flex items-center justify-center font-bold">İÇECEKLER</div>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <h3 className="font-bold text-xs text-slate-900">DN Özel Teması</h3>
                    </div>
                    {restaurant?.template === 'custom_grid' && (
                      <span className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-md">
                        <Check size={12} />
                      </span>
                    )}
                  </div>

                  {/* 3. PDF / Broşür Menü */}
                  <div 
                    onClick={() => {
                      setRestaurant({...restaurant, template: 'pdf_image'});
                      logActivity('Şablon Değiştirildi', 'PDF / Broşür Menü şablonu seçildi.');
                    }}
                    className={`border-2 rounded-2xl p-3 cursor-pointer transition flex flex-col justify-between relative overflow-hidden bg-slate-50 ${
                      restaurant?.template === 'pdf_image'
                        ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/30'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="h-44 bg-white rounded-xl p-2 flex flex-col items-center justify-center gap-2 border border-slate-200 shadow-2xs text-center pointer-events-none">
                      <div className="w-12 h-16 bg-indigo-50 border-2 border-dashed border-indigo-400 rounded-lg flex flex-col items-center justify-center text-indigo-600">
                        <FileText size={18} />
                      </div>
                      <p className="text-[8px] font-bold text-slate-600">PDF / Broşür Menü</p>
                    </div>
                    <div className="mt-3 text-center">
                      <h3 className="font-bold text-xs text-slate-900">PDF / Broşür Menü</h3>
                    </div>
                    {restaurant?.template === 'pdf_image' && (
                      <span className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-md">
                        <Check size={12} />
                      </span>
                    )}
                  </div>

                  {/* 4. Gourmet & Dining */}
                  <div 
                    onClick={() => {
                      setRestaurant({...restaurant, template: 'classic'});
                      logActivity('Şablon Değiştirildi', 'Gourmet & Dining şablonu seçildi.');
                    }}
                    className={`border-2 rounded-2xl p-3 cursor-pointer transition flex flex-col justify-between relative overflow-hidden bg-slate-50 ${
                      restaurant?.template === 'classic'
                        ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/30'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="h-44 bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xs flex flex-col pointer-events-none">
                      <div className="h-16 bg-slate-800 relative flex items-end justify-center pb-1">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-300 absolute -bottom-3 flex items-center justify-center text-[7px] font-bold text-indigo-600">
                          LOGO
                        </div>
                      </div>
                      <div className="pt-4 p-2 text-center text-slate-800 space-y-1">
                        <p className="text-[8px] font-bold">Gourmet & Dining</p>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <h3 className="font-bold text-xs text-slate-900">Gourmet & Dining</h3>
                    </div>
                    {restaurant?.template === 'classic' && (
                      <span className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-md">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MENÜ YÖNETİMİ */}
          {activeTab === 'menu' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Menü Yönetimi</h1>
                <p className="text-slate-500 text-xs font-medium mt-0.5">Kategori, alt kategori ve lezzetlerinizi tanımlayın.</p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <h2 className="font-extrabold text-slate-900 text-sm">1. Ana Kategori Ekle</h2>
                <form onSubmit={addCategory} className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Ana Kategori Adı (Örn: Kahvaltılıklar, Çorbalar)" 
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                  />
                  <button type="submit" disabled={loadingCat} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-xs">
                    <Plus size={16} /> Ekle
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 flex items-center gap-3">
                      <span className="font-bold text-xs text-slate-700">{cat.name}</span>
                      <button onClick={() => deleteCategory(cat.id)} className="text-rose-500 hover:text-rose-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <FolderTree size={16} className="text-indigo-600" /> 2. Alt Kategori Ekle
                </h2>

                <form onSubmit={addSubcategory} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select 
                    value={subCatForm.category_id}
                    onChange={(e) => setSubCatForm({...subCatForm, category_id: e.target.value})}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none"
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
                    className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                  />

                  <button type="submit" disabled={loadingSubCat} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition shadow-xs">
                    <Plus size={16} /> Alt Kategori Ekle
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-2">
                  {subcategories.map((sub) => (
                    <div key={sub.id} className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2 text-xs">
                      <span className="text-indigo-600 font-bold">{sub.categories?.name} &gt;</span>
                      <span className="font-bold text-slate-700">{sub.name}</span>
                      <button onClick={() => deleteSubcategory(sub.id)} className="text-rose-500 hover:text-rose-600 ml-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Utensils size={16} className="text-indigo-600" /> 3. Ürün Ekle
                </h2>

                <form onSubmit={addProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Ürün Adı</label>
                      <input 
                        type="text" 
                        placeholder="Örn: Serpme Kahvaltılık" 
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Ana Kategori</label>
                      <select 
                        value={productForm.category_id}
                        onChange={(e) => setProductForm({...productForm, category_id: e.target.value, subcategory_id: ''})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Alt Kategori (Opsiyonel)</label>
                      <select 
                        value={productForm.subcategory_id}
                        onChange={(e) => setProductForm({...productForm, subcategory_id: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none"
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
                      <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Fiyat (₺)</label>
                      <input 
                        type="number" 
                        placeholder="150" 
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-amber-600 uppercase font-bold block mb-1 flex items-center gap-1">
                        <Flame size={14} /> Kalori (kcal)
                      </label>
                      <input 
                        type="number" 
                        placeholder="Örn: 450" 
                        value={productForm.calories}
                        onChange={(e) => setProductForm({...productForm, calories: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Alerjenler</label>
                    <button 
                      type="button"
                      onClick={() => setShowAllergenDropdown(!showAllergenDropdown)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs flex items-center justify-between text-left focus:border-indigo-500 font-semibold"
                    >
                      <div className="flex flex-wrap gap-1 items-center overflow-hidden">
                        {productForm.allergens.length === 0 ? (
                          <span className="text-slate-400">Alerjen seçilmedi...</span>
                        ) : (
                          productForm.allergens.map(id => {
                            const item = ALLERGEN_OPTIONS.find(a => a.id === id);
                            return (
                              <span key={id} className="bg-white border text-xs px-2 py-0.5 rounded flex items-center gap-1">
                                {item?.icon} {item?.label}
                              </span>
                            );
                          })
                        )}
                      </div>
                      <ChevronDown size={16} className="text-slate-400" />
                    </button>

                    {showAllergenDropdown && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto p-2 space-y-1">
                        {ALLERGEN_OPTIONS.map((item) => {
                          const isSelected = productForm.allergens.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => toggleAllergen(item.id)}
                              className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs transition ${
                                isSelected ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span>{item.icon}</span> {item.label}
                              </span>
                              {isSelected && <Check size={14} className="text-indigo-600" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Ürün Fotoğrafı</label>
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
                      className="border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition relative"
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
                        <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-slate-200">
                          <img src={imagePreview} alt="Önizleme" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <UploadCloud size={20} />
                          </div>
                          <p className="text-xs font-bold text-slate-600">Fotoğraf Yüklemek İçin Tıklayın veya Sürükleyin</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Açıklama</label>
                    <textarea 
                      rows={2}
                      placeholder="Örn: Beyaz peynir, kaşar peynir, tel peynir, bal, tereyağı..." 
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loadingProd || uploadingImage}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <Plus size={16} /> {loadingProd || uploadingImage ? 'Yükleniyor & Ekleniyor...' : 'Ürünü Menüye Ekle'}
                  </button>
                </form>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  {products.map((prod) => (
                    <div key={prod.id} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex gap-3 items-center">
                      {prod.image_url ? (
                        <img src={prod.image_url} alt={prod.name} className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
                      ) : (
                        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-[10px] text-slate-400 font-bold border border-slate-200">Görsel Yok</div>
                      )}
                       
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">{prod.name}</h3>
                            <p className="text-[10px] text-indigo-600 font-bold">
                              {prod.categories?.name} {prod.subcategories?.name ? `> ${prod.subcategories.name}` : ''}
                            </p>
                          </div>
                          <span className="font-black text-slate-900 text-sm">₺{prod.price}</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{prod.description}</p>
                      </div>

                      <button onClick={() => deleteProduct(prod.id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-xl transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* QR OLUŞTURUCU */}
          {activeTab === 'qr' && (
            <div className="max-w-5xl space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900">QR Oluşturucu</h1>
                <p className="text-slate-500 text-xs font-medium mt-0.5">Restoranınız için özelleştirilebilir dinamik QR kod stüdyosu.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col items-center gap-6 shadow-xs">
                  <h2 className="font-extrabold text-slate-900 text-sm self-start flex items-center gap-2">
                    <QrCode size={18} className="text-indigo-600" /> QR Kodunuz
                  </h2>

                  <div ref={qrRef} className="p-5 bg-white border-2 border-slate-100 rounded-2xl shadow-sm flex flex-col items-center">
                    <QRCodeSVG value={liveMenuUrl} size={220} />
                    <p className="mt-3 font-extrabold text-slate-800 text-sm tracking-tight">{restaurant?.name}</p>
                  </div>

                  <div className="w-full space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center">Hedef URL</p>
                    <p className="text-xs font-mono text-center font-bold text-indigo-600 bg-slate-50 p-2 rounded-xl border border-slate-200 select-all">{liveMenuUrl}</p>
                  </div>

                  <button
                    onClick={downloadQR}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <Download size={16} /> Resmi İndir (PNG)
                  </button>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
                  <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <LayoutTemplate size={18} className="text-indigo-600" /> Masa QR Şablonu
                  </h2>

                  <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-2xl text-white flex flex-col items-center text-center gap-4 relative overflow-hidden shadow-lg border border-slate-800">
                    <div className="space-y-1">
                      <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Masa 1</span>
                      <h3 className="font-black text-sm tracking-tight pt-1">QR KODU OKUTUN HEMEN SİPARİŞ VERİN</h3>
                    </div>

                    <div className="p-3 bg-white rounded-xl shadow-2xl">
                      <QRCodeSVG value={liveMenuUrl} size={140} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-full pt-2 text-[9px] text-slate-300 font-bold border-t border-slate-800/80">
                      <div>1. Kamerayı Açın</div>
                      <div>2. QR Kodunu Okutun</div>
                      <div>3. Menünüz Açılsın</div>
                    </div>

                    <div className="w-full bg-indigo-600 py-1.5 rounded-lg text-white font-extrabold text-xs flex items-center justify-center gap-1">
                      <span>QR</span><span className="text-indigo-200">Menu</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
