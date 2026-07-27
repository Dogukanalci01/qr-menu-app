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
  History,
  Pencil
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
  
  // --- KATEGORİ FORM STATELERİ (Resim Yükleme Eklendi) ---
  const [newCatName, setNewCatName] = useState('');
  const [catImageFile, setCatImageFile] = useState<File | null>(null);
  const [catImagePreview, setCatImagePreview] = useState<string>('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [subCatForm, setSubCatForm] = useState({ name: '', category_id: '' });
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);

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
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

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

  useEffect(() => {
    const savedEmail = localStorage.getItem('qr_menu_saved_email');
    if (savedEmail) {
      setAuthEmail(savedEmail);
    }

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

  useEffect(() => {
    if (sessionUser) fetchAllRestaurants();
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
      
      cancelEditCategory();
      cancelEditSubcategory();
      cancelEditProduct();
    }
  }, [selectedRestaurantId]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
      if (error) setAuthMessage('Hata: ' + error.message);
      else {
        setAuthMessage('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        setIsSignUp(false);
        localStorage.setItem('qr_menu_saved_email', authEmail);
        logActivity('Yeni Hesap', `${authEmail} adresli hesap oluşturuldu.`);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) setAuthMessage('Hata: ' + error.message);
      else {
        setAuthMessage('Giriş başarılı!');
        localStorage.setItem('qr_menu_saved_email', authEmail);
        logActivity('Oturum Açıldı', `${authEmail} sisteme giriş yaptı.`);
      }
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    logActivity('Oturum Kapatıldı', 'Hesaptan çıkış yapıldı.');
    await supabase.auth.signOut();
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMessage('');

    let updateData: any = {};
    if (newEmail && newEmail !== sessionUser.email) updateData.email = newEmail;
    if (newPassword) updateData.password = newPassword;

    if (Object.keys(updateData).length === 0) {
      setSettingsMessage('Değiştirilecek yeni bir e-posta veya şifre girmediniz.');
      setSettingsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser(updateData);
    setSettingsLoading(false);

    if (error) setSettingsMessage('Güncelleme Hatası: ' + error.message);
    else {
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
    const { data } = await supabase.from('categories').select('*').eq('restaurant_id', restId).order('sort_order', { ascending: true });
    if (data) {
      setCategories(data);
      if (data.length > 0 && !editingProductId) {
        setSubCatForm((prev) => ({ ...prev, category_id: prev.category_id || data[0].id }));
        setProductForm((prev) => ({ ...prev, category_id: prev.category_id || data[0].id }));
      }
    }
  };

  const fetchSubcategories = async (restId: string) => {
    const { data } = await supabase.from('subcategories').select('*, categories(name)').eq('restaurant_id', restId).order('sort_order', { ascending: true });
    if (data) setSubcategories(data);
  };

  const fetchProducts = async (restId: string) => {
    const { data } = await supabase.from('products').select('*, categories(name), subcategories(name)').eq('restaurant_id', restId).order('id', { ascending: false });
    if (data) setProducts(data);
  };

  const uploadToStorage = async (file: File, folder: string): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
      if (uploadError) return '';
      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      return '';
    }
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestForm.name.trim() || !newRestForm.slug.trim()) return alert('Lütfen restoran adı ve URL (slug) girin!');
    const formattedSlug = newRestForm.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    const { data, error } = await supabase.from('restaurants').insert([{
      name: newRestForm.name.trim(), slug: formattedSlug, subtitle: 'Yemek Bizim İşimiz', primary_color: '#4f46e5', template: 'bistro'
    }]).select();

    if (error) alert('Restoran Oluşturma Hatası: ' + error.message);
    else if (data) {
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
      canvas.width = img.width + 40; canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${restaurant.slug}-qr-menu.png`; downloadLink.href = `${pngFile}`; downloadLink.click();
        logActivity('QR İndirildi', `${restaurant.name} için masa QR kodu indirildi.`);
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const toggleAllergen = (allergenId: string) => {
    setProductForm((prev) => {
      const exists = prev.allergens.includes(allergenId);
      const updated = exists ? prev.allergens.filter(id => id !== allergenId) : [...prev.allergens, allergenId];
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

    const payload = { ...restaurant, logo_url: updatedLogoUrl, cover_image: updatedCoverUrl };
    const { data, error } = await supabase.from('restaurants').upsert([payload], { onConflict: 'id' }).select();

    if (!error && data) {
      setRestaurant(data[0]);
      setLogoPreview(data[0].logo_url || '');
      setCoverPreview(data[0].cover_image || '');
      setSaveStatus('Başarıyla Kaydedildi! ✓');
      setLogoFile(null); setCoverFile(null);
      fetchAllRestaurants();
      logActivity('Restoran Güncellendi', `${restaurant.name} bilgileri ve teması kaydedildi.`);
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      setSaveStatus('Hata oluştu: ' + (error?.message || 'Bilinmeyen hata'));
    }
  };

  // --- KATEGORİ YÖNETİMİ (RESİMLİ) ---
  const addCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCatName.trim() || !selectedRestaurantId) return;

    setLoadingCat(true);
    let finalImageUrl = catImagePreview && !catImageFile ? catImagePreview : '';

    if (catImageFile) {
      const uploadedUrl = await uploadToStorage(catImageFile, 'categories');
      if (uploadedUrl) finalImageUrl = uploadedUrl;
    }
    
    if (editingCategoryId) {
      const { data, error } = await supabase.from('categories').update({ 
        name: newCatName.trim(),
        image_url: finalImageUrl 
      }).eq('id', editingCategoryId).select();
      
      if (error) {
        alert('Hata: ' + error.message);
      } else if (data && data.length === 0) {
        alert('Güncelleme başarısız! Supabase panelinde "categories" tablosu için UPDATE izni tanımlı değil.');
      } else {
        logActivity('Kategori Güncellendi', `Kategori "${newCatName.trim()}" olarak güncellendi.`);
        cancelEditCategory();
        fetchCategories(selectedRestaurantId);
      }
    } else {
      const insertData = { 
        name: newCatName.trim(), 
        sort_order: categories.length + 1, 
        restaurant_id: selectedRestaurantId,
        image_url: finalImageUrl
      };
      const { error } = await supabase.from('categories').insert([insertData]);
      if (!error) {
        logActivity('Kategori Eklendi', `"${newCatName.trim()}" ana kategorisi eklendi.`);
        cancelEditCategory();
        fetchCategories(selectedRestaurantId);
      }
    }
    setLoadingCat(false);
  };

  const handleEditCategory = (cat: any) => { 
    setEditingCategoryId(cat.id); 
    setNewCatName(cat.name); 
    setCatImagePreview(cat.image_url || '');
    setCatImageFile(null);
  };
  
  const cancelEditCategory = () => { 
    setEditingCategoryId(null); 
    setNewCatName(''); 
    setCatImagePreview('');
    setCatImageFile(null);
  };

  const deleteCategory = async (id: string) => {
    if(!confirm('Bu kategoriyi silmek istediğinize emin misiniz? Altındaki ürünler boşa çıkabilir.')) return;
    await supabase.from('categories').delete().eq('id', id);
    logActivity('Kategori Silindi', 'Bir ana kategori kaldırıldı.');
    fetchCategories(selectedRestaurantId);
    fetchSubcategories(selectedRestaurantId);
  };

  // --- ALT KATEGORİ YÖNETİMİ ---
  const addSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCatForm.name.trim() || !subCatForm.category_id || !selectedRestaurantId) return alert('Kategori adı ve ana kategori seçin!');

    setLoadingSubCat(true);

    if (editingSubcategoryId) {
      const { data, error } = await supabase.from('subcategories').update({
        name: subCatForm.name.trim(), category_id: subCatForm.category_id
      }).eq('id', editingSubcategoryId).select();

      if (error) {
        alert('Hata: ' + error.message);
      } else if (data && data.length === 0) {
        alert('Güncelleme başarısız! Supabase panelinde "subcategories" tablosu için UPDATE izni eksik.');
      } else {
        logActivity('Alt Kategori Güncellendi', `Alt kategori "${subCatForm.name.trim()}" olarak güncellendi.`);
        cancelEditSubcategory();
        fetchSubcategories(selectedRestaurantId);
      }
    } else {
      const insertData = { name: subCatForm.name.trim(), category_id: subCatForm.category_id, restaurant_id: selectedRestaurantId, sort_order: subcategories.length + 1 };
      const { error } = await supabase.from('subcategories').insert([insertData]);
      if (!error) {
        logActivity('Alt Kategori Eklendi', `"${subCatForm.name.trim()}" alt kategorisi eklendi.`);
        setSubCatForm({ name: '', category_id: categories[0]?.id || '' });
        fetchSubcategories(selectedRestaurantId);
      }
    }
    setLoadingSubCat(false);
  };

  const handleEditSubcategory = (sub: any) => { setEditingSubcategoryId(sub.id); setSubCatForm({ name: sub.name, category_id: sub.category_id }); };
  const cancelEditSubcategory = () => { setEditingSubcategoryId(null); setSubCatForm({ name: '', category_id: categories[0]?.id || '' }); };

  const deleteSubcategory = async (id: string) => {
    if(!confirm('Bu alt kategoriyi silmek istediğinize emin misiniz?')) return;
    await supabase.from('subcategories').delete().eq('id', id);
    logActivity('Alt Kategori Silindi', 'Bir alt kategori kaldırıldı.');
    fetchSubcategories(selectedRestaurantId);
  };

  // --- ÜRÜN YÖNETİMİ ---
  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price || !productForm.category_id || !selectedRestaurantId) {
      alert('Lütfen ürün adı, fiyatı ve ana kategorisini seçin!');
      return;
    }

    setLoadingProd(true);
    setUploadingImage(true);
    let finalImageUrl = productForm.image_url;

    if (imageFile) {
      const uploadedUrl = await uploadToStorage(imageFile, 'products');
      if (uploadedUrl) finalImageUrl = uploadedUrl;
    }
    setUploadingImage(false);

    const payload: any = {
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

    if (editingProductId) {
      const { data, error } = await supabase.from('products').update(payload).eq('id', editingProductId).select();
      setLoadingProd(false);

      if (error) {
        alert('Ürün Güncelleme Hatası: ' + error.message);
      } else if (data && data.length === 0) {
        alert('Ürün güncellenemedi! Lütfen Supabase panelinden "products" tablosu için UPDATE (Güncelleme) izninin açık olduğundan emin olun.');
      } else {
        logActivity('Ürün Güncellendi', `"${productForm.name.trim()}" bilgileri güncellendi.`);
        cancelEditProduct();
        fetchProducts(selectedRestaurantId);
      }
    } else {
      const { error } = await supabase.from('products').insert([payload]);
      setLoadingProd(false);

      if (error) {
        alert('Ürün Ekleme Hatası: ' + error.message);
      } else {
        logActivity('Ürün Eklendi', `"${productForm.name.trim()}" menüye (₺${productForm.price}) eklendi.`);
        cancelEditProduct();
        fetchProducts(selectedRestaurantId);
      }
    }
  };

  const handleEditProduct = (prod: any) => {
    setEditingProductId(prod.id);
    setProductForm({
      name: prod.name,
      description: prod.description || '',
      price: prod.price ? prod.price.toString() : '',
      calories: prod.calories ? prod.calories.toString() : '',
      image_url: prod.image_url || '',
      category_id: prod.category_id,
      subcategory_id: prod.subcategory_id || '',
      allergens: prod.allergens || []
    });
    setImagePreview(prod.image_url || '');
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '', description: '', price: '', calories: '', image_url: '',
      category_id: categories[0]?.id || '', subcategory_id: '', allergens: []
    });
    setImageFile(null); setImagePreview(''); setShowAllergenDropdown(false);
  };

  const deleteProduct = async (id: string) => {
    if(!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    await supabase.from('products').delete().eq('id', id);
    logActivity('Ürün Silindi', 'Menüden bir ürün kaldırıldı.');
    fetchProducts(selectedRestaurantId);
  };

  const filteredSubcategories = subcategories.filter(s => s.category_id === productForm.category_id);

  // --- KULLANICI GİRİŞ YAPMADIYSA ---
  if (!sessionUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 font-sans text-slate-800">
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="flex items-center justify-center gap-2 font-black text-2xl tracking-tight text-slate-900 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-md shadow-indigo-500/20">QR</div>
            <span>QR</span><span className="text-indigo-600">Menu</span>
          </div>

          <h2 className="text-lg font-extrabold text-slate-900 text-center mb-6">{isSignUp ? 'Yeni Hesap Oluştur' : 'Panele Giriş Yap'}</h2>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold block mb-1">E-posta</label>
              <input type="email" placeholder="ornek@email.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Şifre</label>
              <input type="password" placeholder="••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500" />
            </div>
            <button type="submit" disabled={authLoading} className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs disabled:opacity-50">
              {authLoading ? 'İşleniyor...' : (isSignUp ? 'Kayıt Ol' : 'Giriş Yap')}
            </button>
          </form>

          {authMessage && <p className={`mt-4 text-xs text-center font-bold p-3 rounded-xl ${authMessage.includes('Hata') ? 'text-rose-600 bg-rose-50 border border-rose-200' : 'text-emerald-600 bg-emerald-50 border border-emerald-200'}`}>{authMessage}</p>}
          <div className="mt-6 text-center">
            <button onClick={() => { setIsSignUp(!isSignUp); setAuthMessage(''); }} className="text-xs font-bold text-indigo-600 hover:underline bg-transparent border-none cursor-pointer">
              {isSignUp ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Kendi hesabınızı oluşturun'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- ANA DASHBOARD ---
  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight text-slate-900">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-indigo-500/20">QR</div>
            <span className="font-extrabold tracking-tight text-slate-900">QR</span><span className="text-indigo-600 font-extrabold">Menu</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href={liveMenuUrl} target="_blank" rel="noreferrer" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm shadow-indigo-600/20">
            Canlı Önizleme <ExternalLink size={14} />
          </a>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
            <User size={16} className="text-indigo-600" />
            <span className="max-w-[150px] truncate">{sessionUser.email}</span>
          </div>
          <button onClick={handleLogout} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition" title="Çıkış Yap"><LogOut size={16} /></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between p-4 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 block tracking-wider">Aktif Restoran</label>
              <div className="flex gap-2">
                <select value={selectedRestaurantId} onChange={(e) => setSelectedRestaurantId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-indigo-500 font-bold">
                  {restaurantsList.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <button onClick={() => setShowNewRestModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition flex-shrink-0 shadow-xs"><Plus size={16} /></button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-400 px-3 tracking-wider">Yönetim</p>
              <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600 font-extrabold border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}><Sparkles size={16} /> Gösterge Paneli</button>
              <button onClick={() => setActiveTab('restaurant')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'restaurant' ? 'bg-indigo-50 text-indigo-600 font-extrabold border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}><ChefHat size={16} /> Restoran Bilgileri</button>
              <button onClick={() => setActiveTab('menu')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'menu' ? 'bg-indigo-50 text-indigo-600 font-extrabold border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}><Layers size={16} /> Menü Ekle</button>
              <button onClick={() => setActiveTab('qr')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'qr' ? 'bg-indigo-50 text-indigo-600 font-extrabold border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}><QrCode size={16} /> QR Oluşturucu</button>
            </div>

            <div className="space-y-1 border-t border-slate-100 pt-4">
              <p className="text-[10px] font-bold uppercase text-slate-400 px-3 tracking-wider">Hesap</p>
              <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'logs' ? 'bg-indigo-50 text-indigo-600 font-extrabold border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}><CreditCard size={16} /> İşlemler</button>
              <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600 font-extrabold border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}><Settings size={16} /> Hesap Ayarları</button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"><LogOut size={16} /> Çıkış Yap</button>
            </div>
          </div>
        </aside>

        {/* İÇERİK */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
          {showNewRestModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2"><Building2 size={20} className="text-indigo-600" /> Yeni Restoran Tanımla</h2>
                <form onSubmit={handleCreateRestaurant} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Restoran Adı</label>
                    <input type="text" placeholder="Örn: Deniz Balık Restoran" value={newRestForm.name} onChange={(e) => setNewRestForm({...newRestForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Özel URL (Slug)</label>
                    <input type="text" placeholder="deniz-balik-restoran" value={newRestForm.slug} onChange={(e) => setNewRestForm({...newRestForm, slug: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-mono" />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowNewRestModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">İptal</button>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs">Oluştur</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="max-w-3xl space-y-6">
              <div><h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><History className="text-indigo-600" size={24} /> Geçmiş İşlemler & Aktiviteler</h1></div>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                {activities.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-semibold">Henüz kayıtlı bir işlem bulunmuyor.</div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold"><Activity size={18} /></div>
                          <div><h3 className="font-extrabold text-slate-900 text-xs">{item.title}</h3><p className="text-slate-500 text-[11px] font-medium mt-0.5">{item.description}</p></div>
                        </div>
                        <div className="text-right"><span className="text-[10px] font-mono font-bold text-slate-400 block">{item.time}</span><span className="text-[10px] font-bold text-indigo-600">{item.date}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl space-y-6">
              <div><h1 className="text-2xl font-black text-slate-900">Hesap Ayarları</h1></div>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-xs">
                <form onSubmit={handleUpdateSettings} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1 flex items-center gap-1.5"><Mail size={14} className="text-indigo-600" /> E-posta Adresi</label>
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1 flex items-center gap-1.5"><Lock size={14} className="text-indigo-600" /> Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none" />
                  </div>
                  <button type="submit" disabled={settingsLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"><Save size={16} /> Güncelle</button>
                </form>
                {settingsMessage && <p className="text-xs font-bold p-3 rounded-xl bg-emerald-50 text-emerald-600">{settingsMessage}</p>}
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="max-w-5xl space-y-6">
              <div><h1 className="text-2xl font-black text-slate-900">{restaurant?.name} Gösterge Paneli</h1></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs"><p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Ana Kategoriler</p><h3 className="text-3xl font-black text-slate-900 mt-2">{categories.length}</h3></div>
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs"><p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Alt Kategoriler</p><h3 className="text-3xl font-black text-indigo-600 mt-2">{subcategories.length}</h3></div>
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs"><p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Toplam Ürün</p><h3 className="text-3xl font-black text-slate-900 mt-2">{products.length}</h3></div>
              </div>
            </div>
          )}

          {activeTab === 'restaurant' && (
            <div className="max-w-5xl space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-slate-900">Restoran Bilgileri & Renk Paleti</h1>
                <div className="flex gap-2">
                  <button onClick={saveRestaurant} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"><Save size={16} /> Değişiklikleri Kaydet</button>
                </div>
              </div>
              {saveStatus && <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-bold">{saveStatus}</p>}
              
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <h2 className="font-extrabold text-slate-900 text-sm">Firma Adı ve Teması</h2>
                <div>
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-11 h-11 rounded-xl border border-slate-300 overflow-hidden cursor-pointer" style={{ backgroundColor: restaurant?.primary_color || '#4f46e5' }}>
                      <input type="color" value={restaurant?.primary_color || '#4f46e5'} onChange={(e) => setRestaurant({...restaurant, primary_color: e.target.value})} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    </div>
                    <input type="text" value={restaurant?.name || ''} onChange={(e) => setRestaurant({...restaurant, name: e.target.value})} className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={restaurant?.slug || ''} onChange={(e) => setRestaurant({...restaurant, slug: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" placeholder="Slug" />
                  <input type="text" value={restaurant?.subtitle || ''} onChange={(e) => setRestaurant({...restaurant, subtitle: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" placeholder="Alt Başlık" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={restaurant?.working_hours || ''} onChange={(e) => setRestaurant({...restaurant, working_hours: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" placeholder="Çalışma Saatleri" />
                  <input type="text" value={restaurant?.address || ''} onChange={(e) => setRestaurant({...restaurant, address: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" placeholder="Adres" />
                </div>
                <textarea rows={3} value={restaurant?.description || ''} onChange={(e) => setRestaurant({...restaurant, description: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" placeholder="Açıklama" />
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <h2 className="font-extrabold text-slate-900 text-sm">Görsel Yönetimi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-bold block">Logonuz</label>
                    <div className="border-2 border-dashed border-slate-200 bg-slate-50 p-4 rounded-2xl flex flex-col items-center relative min-h-[150px]">
                      <input type="file" accept="image/*" onChange={(e) => { if (e.target.files) { setLogoFile(e.target.files[0]); const reader = new FileReader(); reader.onloadend = () => setLogoPreview(reader.result as string); reader.readAsDataURL(e.target.files[0]); } }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {logoPreview ? <img src={logoPreview} className="max-h-full max-w-full object-contain" /> : <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center"><UploadCloud size={20} /></div>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-bold block">Firma Kapak Resmi</label>
                    <div className="border-2 border-dashed border-slate-200 bg-slate-50 p-4 rounded-2xl flex flex-col items-center relative min-h-[150px]">
                      <input type="file" accept="image/*" onChange={(e) => { if (e.target.files) { setCoverFile(e.target.files[0]); const reader = new FileReader(); reader.onloadend = () => setCoverPreview(reader.result as string); reader.readAsDataURL(e.target.files[0]); } }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {coverPreview ? <img src={coverPreview} className="w-full h-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center"><ImageIcon size={20} /></div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <h2 className="font-extrabold text-slate-900 text-sm">Menü Şablonu Seçin</h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {['bistro', 'custom_grid', 'pdf_image', 'classic'].map(tmp => (
                    <div key={tmp} onClick={() => setRestaurant({...restaurant, template: tmp})} className={`border-2 rounded-2xl p-3 cursor-pointer ${restaurant?.template === tmp ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200'}`}>
                      <h3 className="font-bold text-xs text-center">{tmp.toUpperCase()}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Menü Yönetimi</h1>
                <p className="text-slate-500 text-xs font-medium mt-0.5">Kategori, alt kategori ve lezzetlerinizi ekleyin veya düzenleyin.</p>
              </div>

              {/* --- 1. ANA KATEGORİ YÖNETİMİ --- */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <h2 className={`font-extrabold text-sm ${editingCategoryId ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {editingCategoryId ? '1. Ana Kategoriyi Düzenle' : '1. Ana Kategori Ekle'}
                </h2>
                
                <form onSubmit={addCategory} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  
                  {/* Fotoğraf Yükleme Alanı */}
                  <div className={`relative w-14 h-14 rounded-xl border-2 border-dashed ${editingCategoryId && catImagePreview ? 'border-emerald-200' : 'border-slate-300'} flex items-center justify-center bg-slate-50 hover:border-indigo-500 transition overflow-hidden shrink-0 group`}>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCatImageFile(e.target.files[0]);
                          const reader = new FileReader();
                          reader.onloadend = () => setCatImagePreview(reader.result as string);
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      title="Kategori Görseli Ekle"
                    />
                    {catImagePreview ? (
                      <img src={catImagePreview} className="w-full h-full object-cover" alt="Kategori Önizleme" />
                    ) : (
                      <div className="text-slate-400 group-hover:text-indigo-500 transition flex flex-col items-center">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </div>

                  {/* İsim ve Butonlar */}
                  <div className="flex-1 flex gap-3 w-full">
                    <input 
                      type="text" 
                      placeholder="Ana Kategori Adı (Örn: Kahvaltılıklar)" 
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 h-12"
                    />
                    {editingCategoryId && (
                      <button type="button" onClick={cancelEditCategory} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition h-12">
                        İptal
                      </button>
                    )}
                    <button type="submit" disabled={loadingCat} className={`${editingCategoryId ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-xs h-12`}>
                      {editingCategoryId ? <Save size={16} /> : <Plus size={16} />} 
                      {loadingCat ? '...' : (editingCategoryId ? 'Güncelle' : 'Ekle')}
                    </button>
                  </div>
                </form>

                {/* Eklenen Kategoriler Listesi */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="bg-slate-50 pr-3.5 pl-2 py-1.5 rounded-xl border border-slate-200 flex items-center gap-3">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">{cat.name[0]}</div>
                      )}
                      
                      <span className="font-bold text-xs text-slate-700">{cat.name}</span>
                      
                      <div className="flex items-center gap-1.5 ml-2 border-l border-slate-300 pl-3">
                        <button onClick={() => handleEditCategory(cat)} className="text-indigo-500 hover:text-indigo-600" title="Düzenle">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteCategory(cat.id)} className="text-rose-500 hover:text-rose-600" title="Sil">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- 2. ALT KATEGORİ YÖNETİMİ --- */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <h2 className={`font-extrabold text-sm flex items-center gap-2 ${editingSubcategoryId ? 'text-emerald-600' : 'text-slate-900'}`}>
                  <FolderTree size={16} className={editingSubcategoryId ? 'text-emerald-600' : 'text-indigo-600'} /> 
                  {editingSubcategoryId ? '2. Alt Kategoriyi Düzenle' : '2. Alt Kategori Ekle'}
                </h2>
                <form onSubmit={addSubcategory} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select value={subCatForm.category_id} onChange={(e) => setSubCatForm({...subCatForm, category_id: e.target.value})} className="col-span-1 px-3 py-2 bg-slate-50 border rounded-xl text-xs">
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  <input type="text" placeholder="Alt Kategori Adı" value={subCatForm.name} onChange={(e) => setSubCatForm({...subCatForm, name: e.target.value})} className="col-span-1 md:col-span-2 px-3 py-2 bg-slate-50 border rounded-xl text-xs" />
                  <div className="col-span-1 flex gap-2">
                    {editingSubcategoryId && <button type="button" onClick={cancelEditSubcategory} className="bg-slate-200 px-3 py-2 rounded-xl text-xs font-bold flex-1">İptal</button>}
                    <button type="submit" disabled={loadingSubCat} className={`${editingSubcategoryId ? 'bg-emerald-600' : 'bg-slate-900'} text-white px-3 py-2 rounded-xl text-xs font-bold flex flex-1 justify-center items-center gap-1`}>
                      {editingSubcategoryId ? <Save size={16} /> : <Plus size={16} />} {editingSubcategoryId ? 'Güncelle' : 'Ekle'}
                    </button>
                  </div>
                </form>

                <div className="flex flex-wrap gap-2 pt-2">
                  {subcategories.map((sub) => (
                    <div key={sub.id} className="bg-slate-50 px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs">
                      <span className="text-indigo-600 font-bold">{sub.categories?.name} &gt;</span>
                      <span className="font-bold text-slate-700">{sub.name}</span>
                      <div className="flex items-center gap-1.5 ml-1 border-l pl-2">
                        <button onClick={() => handleEditSubcategory(sub)} className="text-indigo-500"><Pencil size={14} /></button>
                        <button onClick={() => deleteSubcategory(sub.id)} className="text-rose-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- 3. ÜRÜN YÖNETİMİ --- */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <h2 className={`font-extrabold text-sm flex items-center gap-2 ${editingProductId ? 'text-emerald-600' : 'text-slate-900'}`}>
                  <Utensils size={16} className={editingProductId ? 'text-emerald-600' : 'text-indigo-600'} /> {editingProductId ? '3. Ürünü Düzenle' : '3. Ürün Ekle'}
                </h2>
                <form onSubmit={addProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Ürün Adı</label>
                      <input type="text" placeholder="Ürün Adı" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Ana Kategori</label>
                      <select value={productForm.category_id} onChange={(e) => setProductForm({...productForm, category_id: e.target.value, subcategory_id: ''})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs">
                        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Alt Kategori (Opsiyonel)</label>
                      <select value={productForm.subcategory_id} onChange={(e) => setProductForm({...productForm, subcategory_id: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs">
                        <option value="">-- Alt Kategori Yok --</option>
                        {filteredSubcategories.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Fiyat (₺)</label>
                      <input type="number" placeholder="150" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-amber-600 uppercase font-bold block mb-1 flex items-center gap-1"><Flame size={14} /> Kalori (kcal)</label>
                      <input type="number" placeholder="Örn: 450" value={productForm.calories} onChange={(e) => setProductForm({...productForm, calories: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Alerjenler</label>
                    <button type="button" onClick={() => setShowAllergenDropdown(!showAllergenDropdown)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs flex justify-between">
                      <div className="flex gap-1">{productForm.allergens.length === 0 ? <span className="text-slate-400">Seçilmedi...</span> : productForm.allergens.map(id => { const item = ALLERGEN_OPTIONS.find(a => a.id === id); return <span key={id} className="bg-white border px-1 rounded">{item?.icon} {item?.label}</span> })}</div>
                      <ChevronDown size={16} className="text-slate-400" />
                    </button>
                    {showAllergenDropdown && (
                      <div className="absolute z-50 mt-1 w-full bg-white border shadow-xl max-h-56 overflow-y-auto p-2">
                        {ALLERGEN_OPTIONS.map((item) => {
                          const isSelected = productForm.allergens.includes(item.id);
                          return (
                            <div key={item.id} onClick={() => toggleAllergen(item.id)} className={`flex justify-between p-2 cursor-pointer text-xs ${isSelected ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50'}`}>
                              <span>{item.icon} {item.label}</span>{isSelected && <Check size={14} />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Ürün Fotoğrafı</label>
                    <div className="border-2 border-dashed bg-slate-50 p-6 rounded-2xl flex flex-col items-center relative">
                      <input type="file" accept="image/*" onChange={(e) => { if (e.target.files) { setImageFile(e.target.files[0]); const reader = new FileReader(); reader.onloadend = () => setImagePreview(reader.result as string); reader.readAsDataURL(e.target.files[0]); } }} className="absolute inset-0 opacity-0 cursor-pointer" />
                      {imagePreview ? <img src={imagePreview} className="w-28 h-28 object-cover rounded-xl" /> : <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center"><UploadCloud size={20} /></div>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Açıklama</label>
                    <textarea rows={2} placeholder="Açıklama" value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
                  </div>

                  <div className="flex gap-3">
                    {editingProductId && <button type="button" onClick={cancelEditProduct} className="bg-slate-200 px-6 py-3 rounded-xl text-xs font-bold">İptal</button>}
                    <button type="submit" disabled={loadingProd || uploadingImage} className={`flex-1 ${editingProductId ? 'bg-emerald-600' : 'bg-indigo-600'} text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2`}>
                      {editingProductId ? <Save size={16} /> : <Plus size={16} />} {loadingProd ? 'İşleniyor...' : (editingProductId ? 'Ürünü Güncelle' : 'Ürünü Menüye Ekle')}
                    </button>
                  </div>
                </form>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  {products.map((prod) => (
                    <div key={prod.id} className="bg-slate-50 border p-3 rounded-2xl flex gap-3 items-center">
                      {prod.image_url ? <img src={prod.image_url} className="w-16 h-16 object-cover rounded-xl border" /> : <div className="w-16 h-16 bg-white border rounded-xl flex items-center justify-center text-[10px]">Yok</div>}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div><h3 className="font-bold text-slate-900 text-sm">{prod.name}</h3><p className="text-[10px] text-indigo-600 font-bold">{prod.categories?.name}</p></div>
                          <span className="font-black text-sm">₺{prod.price}</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{prod.description}</p>
                      </div>
                      <div className="flex flex-col gap-1 border-l pl-3 ml-1">
                        <button onClick={() => handleEditProduct(prod)} className="p-2 text-indigo-500"><Pencil size={16} /></button>
                        <button onClick={() => deleteProduct(prod.id)} className="p-2 text-rose-500"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="max-w-5xl space-y-6">
              <h1 className="text-2xl font-black text-slate-900">QR Oluşturucu</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col items-center gap-6 shadow-xs">
                  <div ref={qrRef} className="p-5 bg-white border-2 border-slate-100 rounded-2xl shadow-sm flex flex-col items-center">
                    <QRCodeSVG value={liveMenuUrl} size={220} />
                    <p className="mt-3 font-extrabold text-slate-800 text-sm tracking-tight">{restaurant?.name}</p>
                  </div>
                  <button onClick={downloadQR} className="w-full bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold flex justify-center gap-2"><Download size={16} /> Resmi İndir (PNG)</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
