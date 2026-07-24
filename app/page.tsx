'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Store, 
  UtensilsCrossed, 
  ShoppingBag, 
  QrCode, 
  FileSpreadsheet, 
  MessageSquare,
  Plus,
  Trash2,
  ExternalLink
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

  // Sayfa yüklendiğinde kategorileri çek
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

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Sol Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <span className="text-2xl font-black text-orange-500 tracking-tight">menum<span className="text-gray-900">.co</span></span>
          </div>

          {/* Menü Linkleri */}
          <nav className="p-4 space-y-1 text-sm font-medium">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Yönetim</p>
            
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}>
              <LayoutDashboard size={18} /> Gösterge Paneli
            </button>
            <button onClick={() => setActiveTab('restaurant')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'restaurant' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Store size={18} /> Restoran Bilgileri
            </button>
            <button onClick={() => setActiveTab('menu')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'menu' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}>
              <UtensilsCrossed size={18} /> Menü Yönetimi
            </button>
            <button onClick={() => setActiveTab('qr')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${activeTab === 'qr' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}>
              <QrCode size={18} /> QR Oluşturucu
            </button>
          </nav>
        </div>
      </aside>

      {/* Sağ İçerik Alanı */}
      <main className="flex-1 p-8">
        {/* TAB 1: Gösterge Paneli */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Gösterge Paneli</h1>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Bekleyen Siparişler</p>
                  <h3 className="text-3xl font-bold mt-1 text-gray-900">0</h3>
                </div>
                <div className="p-3 bg-pink-50 text-pink-500 rounded-lg"><ShoppingBag /></div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Kategoriler</p>
                  <h3 className="text-3xl font-bold mt-1 text-gray-900">{categories.length}</h3>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-500 rounded-lg"><UtensilsCrossed /></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Menü Yönetimi */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Menüyü Yönet</h1>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Kategori Adı" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm outline-none focus:border-orange-500"
                />
                <button onClick={addCategory} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-orange-600 transition">
                  <Plus size={16} /> Kategori Ekle
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                  <span className="font-semibold text-gray-700">{cat.name}</span>
                  <button onClick={() => deleteCategory(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: QR Oluşturucu */}
        {activeTab === 'qr' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">QR Kodu Oluşturucu</h1>
            <div className="bg-white p-8 rounded-xl border border-gray-200 w-fit flex flex-col items-center gap-4">
              <QRCodeSVG value={`https://qr-menu-app.vercel.app/m/${restaurant.slug}`} size={200} />
              <p className="text-sm text-gray-500 font-mono">/m/{restaurant.slug}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
