'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Store, 
  UtensilsCrossed, 
  QrCode, 
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
    name: 'Livadya Restaurant',
    slug: 'livadya-restaurant',
    subtitle: 'Lezzet, Manzara ve Huzurun Adresi',
    phone: '0533 866 52 78',
    address: 'Lefke, Kıbrıs',
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Fetch Error:', error);
    } else if (data) {
      setCategories(data);
    }
  };

  const addCategory = async () => {
    if (!newCatName.trim()) {
      alert('Lütfen bir kategori adı girin!');
      return;
    }
    setLoading(true);
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: newCatName.trim() }])
      .select();

    setLoading(false);

    if (error) {
      alert('Ekleme Hatası: ' + error.message);
    } else {
      setNewCatName('');
      fetchCategories();
    }
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      alert('Silme Hatası: ' + error.message);
    } else {
      fetchCategories();
    }
  };

  const liveMenuUrl = `https://qr-menu-app-three-beta.vercel.app/m/${restaurant.slug}`;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sol Sidebar */}
      <aside className="w-64 bg-slate-900/80 backdrop-blur-md border-r border-slate-800/80 flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-black text-white text-lg">
                DN
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white block leading-tight">DN Menu</span>
                <span className="text-[10px] font-semibold text-indigo-400 tracking-wider uppercase">Studio Engine</span>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1.5 text-sm font-medium">
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Kontrol Merkezi</p>

            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60'}`}
            >
              <LayoutDashboard size={18} /> Gösterge Paneli
            </button>

            <button 
              onClick={() => setActiveTab('restaurant')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'restaurant' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60'}`}
            >
              <Store size={18} /> Restoran Bilgileri
            </button>

            <button 
              onClick={() => setActiveTab('menu')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'menu' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60'}`}
            >
              <UtensilsCrossed size={18} /> Menü & Kategoriler
            </button>

            <button 
              onClick={() => setActiveTab('qr')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${activeTab === 'qr' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60'}`}
            >
              <QrCode size={18} /> QR Stüdyo
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/60">
          <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">Özel Sürüm</p>
              <p className="text-[10px] text-slate-500">DOGUKAN01 Custom Tech</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Sağ İçerik Alanı */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* TAB: Menü Yönetimi */}
        {activeTab === 'menu' && (
          <div className="max-w-4xl space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Kategori Yönetimi</h1>
                <p className="text-slate-400 text-sm mt-0.5">Menüdeki kategorileri ekle veya sil.</p>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Kategori Adı..." 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl text-sm outline-none focus:border-indigo-500 transition"
                />
                <button 
                  onClick={addCategory} 
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition"
                >
                  <Plus size={18} /> {loading ? 'Ekleniyor...' : 'Ekle'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {categories.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800/60 p-8 text-center rounded-2xl text-slate-500 text-sm">
                  Henüz kategori eklenmemiş. Yukarıdan yeni kategori ekleyebilirsin.
                </div>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="font-semibold text-slate-200">{cat.name}</span>
                    <button onClick={() => deleteCategory(cat.id)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Diğer Tablar */}
        {activeTab === 'dashboard' && (
          <div className="max-w-5xl space-y-8">
            <h1 className="text-2xl font-bold text-white">Gösterge Paneli</h1>
            <p className="text-slate-400">Aktif Kategori Sayısı: <span className="text-indigo-400 font-bold">{categories.length}</span></p>
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
