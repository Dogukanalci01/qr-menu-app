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
  Save 
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
  const [newCatName, setNewCatName] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const liveMenuUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/menu/${restaurant.slug}` 
    : `https://example.com/menu/${restaurant.slug}`;

  useEffect(() => {
    fetchRestaurant();
    fetchCategories();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const { data } = await supabase.from('restaurants').select('*').limit(1).maybeSingle();
      if (data) setRestaurant(data);
    } catch (err) {
      console.error('Restaurant fetch error:', err);
    }
  };

  // KATEGORİLERİ ÇEKME (created_at yerine sort_order kullanıldı)
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true }); // created_at hatasını önlemek için sort_order'a geçtik

    if (error) {
      console.error('Fetch Error:', error.message);
    } else if (data) {
      setCategories(data);
    }
  };

  // KATEGORİ EKLEME
  const addCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCatName.trim()) {
      alert('Lütfen bir kategori adı girin!');
      return;
    }

    setLoading(true);

    const insertData: any = {
      name: newCatName.trim(),
      sort_order: categories.length + 1
    };

    if (restaurant?.id) {
      insertData.restaurant_id = restaurant.id;
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([insertData])
      .select();

    setLoading(false);

    if (error) {
      console.error('Supabase Ekleme Hatası:', error);
      alert('Ekleme Hatası: ' + error.message);
    } else {
      setNewCatName('');
      fetchCategories(); // Listeyi yenile
    }
  };

  // KATEGORİ SİLME
  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      alert('Silme Hatası: ' + error.message);
    } else {
      fetchCategories();
    }
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
      {/* Sol Sidebar */}
      <aside className="w-64 bg-slate-900/80 backdrop-blur-md border-r border-slate-800/80 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-black text-white text-lg">
              QR
            </div>
            <div>
              <h2 className="font-bold text-sm text-white leading-tight">QR Menü App</h2>
              <p className="text-[11px] text-slate-400">Yönetim Paneli</p>
            </div>
          </div>

          {/* Navigasyon */}
          <nav className="p-4 space-y-1.5 text-sm font-medium">
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Kontrol Merkezi</p>
            
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60'}`}
            >
              <Sparkles size={18} /> Gösterge Paneli
            </button>

            <button 
              onClick={() => setActiveTab('menu')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'menu' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60'}`}
            >
              <Layers size={18} /> Menü Yönetimi
            </button>

            <button 
              onClick={() => setActiveTab('restaurant')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'restaurant' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60'}`}
            >
              <ChefHat size={18} /> Restoran Bilgileri
            </button>

            <button 
              onClick={() => setActiveTab('qr')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'qr' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60'}`}
            >
              <ExternalLink size={18} /> QR Stüdyo
            </button>
          </nav>
        </div>
      </aside>

      {/* Sağ İçerik Alanı */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* TAB 1: Gösterge Paneli */}
        {activeTab === 'dashboard' && (
          <div className="max-w-5xl space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Gösterge Paneli <Sparkles size={20} className="text-indigo-400" />
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">Dijital QR menü yönetimi ve canlı istatistikler.</p>
              </div>

              <a 
                href={liveMenuUrl} 
                target="_blank" 
                rel="noreferrer"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-lg shadow-indigo-600/20"
              >
                Canlı Menüyü Aç <ExternalLink size={16} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aktif Kategoriler</p>
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                    <Layers size={20} />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-white mt-3">{categories.length}</h3>
                <p className="text-xs text-slate-500 mt-2">Sistemde ekli dinamik başlık</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">İşletme Durumu</p>
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <ChefHat size={20} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-emerald-400 mt-4">Canlı / Aktif</h3>
                <p className="text-xs text-slate-500 mt-1">{restaurant.name}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mimar Altyapı</p>
                  <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                    <ShieldCheck size={20} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-purple-300 mt-4">Supabase DB</h3>
                <p className="text-xs text-slate-500 mt-1">Sıfır abonelik maliyeti</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Restoran Bilgileri */}
        {activeTab === 'restaurant' && (
          <div className="max-w-3xl space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Restoranı Yönet</h1>
                <p className="text-slate-400 text-sm mt-0.5">Menüde görünecek temel işletme bilgileri.</p>
              </div>
              <button 
                onClick={saveRestaurant}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition"
              >
                <Save size={18} /> Kaydet
              </button>
            </div>

            {saveStatus && (
              <p className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">{saveStatus}</p>
            )}

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">Firma Adı</label>
                <input 
                  type="text" 
                  value={restaurant.name} 
                  onChange={(e) => setRestaurant({...restaurant, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none focus:border-indigo-500" 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">Firma Alt Başlığı</label>
                <input 
                  type="text" 
                  value={restaurant.subtitle} 
                  onChange={(e) => setRestaurant({...restaurant, subtitle: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none focus:border-indigo-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">Telefon</label>
                  <input 
                    type="text" 
                    value={restaurant.phone} 
                    onChange={(e) => setRestaurant({...restaurant, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase block mb-1.5">Adres</label>
                  <input 
                    type="text" 
                    value={restaurant.address} 
                    onChange={(e) => setRestaurant({...restaurant, address: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none focus:border-indigo-500" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Menü Yönetimi (Kategori Ekle / Sil) */}
        {activeTab === 'menu' && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Kategori Yönetimi</h1>
              <p className="text-slate-400 text-sm mt-0.5">Menüde görünecek kategorileri ekle veya düzenle.</p>
            </div>

            {/* Kategori Ekleme Alanı */}
            <form onSubmit={addCategory} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex gap-3">
              <input 
                type="text" 
                placeholder="Örn: Sıcak İçecekler" 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none focus:border-indigo-500"
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition whitespace-nowrap"
              >
                <Plus size={18} /> {loading ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </form>

            {/* Kategori Listesi */}
            <div className="space-y-3">
              {categories.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800/60 p-8 text-center rounded-2xl text-slate-500 text-sm">
                  Henüz kategori eklenmemiş. Yukarıdan yeni kategori ekleyebilirsin.
                </div>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="font-semibold text-slate-200">{cat.name}</span>
                    <button 
                      onClick={() => deleteCategory(cat.id)} 
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Sil"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: QR Oluşturucu */}
        {activeTab === 'qr' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">QR Stüdyo</h1>
              <p className="text-slate-400 text-sm mt-0.5">Masa üzeri için üretilen özel dinamik QR kod.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-fit flex flex-col items-center gap-5 shadow-xl">
              <div className="p-4 bg-white rounded-2xl">
                <QRCodeSVG value={liveMenuUrl} size={220} />
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase font-mono tracking-wider">Hedef URL</p>
                <p className="text-sm font-medium text-indigo-400 font-mono mt-0.5">{liveMenuUrl}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
