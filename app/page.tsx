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
  ShieldCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [restaurant, setRestaurant] = useState<any>({
    name: 'Livadya Restaurant',
    slug: 'livadya-restaurant',
    subtitle: 'Lezzet, Manzara ve Huzurun Adresi',
    phone: '0533 866 52 78',
    whatsapp: '905338665278',
    description: 'Nefis lezzetler ve huzurlu ortam.'
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const addCategory = async () => {
    if (!newCatName) return;
    await supabase.from('categories').insert([{ name: newCatName }]);
    setNewCatName('');
    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  const liveMenuUrl = `https://qr-menu-app-three-beta.vercel.app/m/${restaurant.slug}`;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sol Özel Sidebar */}
      <aside className="w-64 bg-slate-900/80 backdrop-blur-md border-r border-slate-800/80 flex flex-col justify-between">
        <div>
          {/* Kişiselleştirilmiş Logo */}
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

          {/* Navigasyon */}
          <nav className="p-4 space-y-1.5 text-sm font-medium">
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Kontrol Merkezi</p>
            
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <LayoutDashboard size={18} /> Gösterge Paneli
            </button>

            <button 
              onClick={() => setActiveTab('restaurant')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'restaurant' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <Store size={18} /> Restoran Bilgileri
            </button>

            <button 
              onClick={() => setActiveTab('menu')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'menu' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <UtensilsCrossed size={18} /> Menü & Kategoriler
            </button>

            <button 
              onClick={() => setActiveTab('qr')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'qr' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <QrCode size={18} /> QR Stüdyo
            </button>
          </nav>
        </div>

        {/* Alt Bilgi */}
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

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition"></div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aktif Kategoriler</p>
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                    <Layers size={20} />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-white mt-3">{categories.length}</h3>
                <p className="text-xs text-slate-500 mt-2">Sistemde ekli dinamik başlık</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition"></div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">İşletme Durumu</p>
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <ChefHat size={20} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-emerald-400 mt-4">Canlı / Aktif</h3>
                <p className="text-xs text-slate-500 mt-1">{restaurant.name}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition"></div>
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

        {/* TAB 2: Menü Yönetimi */}
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
                  className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
                <button 
                  onClick={addCategory} 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition"
                >
                  <Plus size={18} /> Ekle
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/80 flex justify-between items-center hover:border-slate-700 transition">
                  <span className="font-semibold text-slate-200">{cat.name}</span>
                  <button onClick={() => deleteCategory(cat.id)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: QR Oluşturucu */}
        {activeTab === 'qr' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">QR Stüdyo</h1>
              <p className="text-slate-400 text-sm mt-0.5">Masa üzeri için üretilen özel dinamik QR kod.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-fit flex flex-col items-center gap-5 shadow-xl">
              <div className="p-4 bg-white rounded-2xl shadow-inner">
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
