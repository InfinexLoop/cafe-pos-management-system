import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Tag,
  UtensilsCrossed,
} from 'lucide-react';

export const MenuPage: React.FC = () => {
  const { db, addProduct, updateProduct, toggleProductAvailable } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    catId: string;
    price: number;
    veg: boolean;
    img: string;
    desc: string;
    available: boolean;
  }>({
    name: '',
    catId: 'c1',
    price: 199,
    veg: true,
    img: '🍕',
    desc: '',
    available: true,
  });

  const filteredProducts = db.products.filter((p) => {
    if (activeCategory !== 'all' && p.catId !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      catId: activeCategory !== 'all' ? activeCategory : 'c1',
      price: 199,
      veg: true,
      img: '🍽️',
      desc: '',
      available: true,
    });
    setShowItemModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      catId: p.catId,
      price: p.price,
      veg: p.veg,
      img: p.img,
      desc: p.desc,
      available: p.available,
    });
    setShowItemModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name.trim(),
        catId: formData.catId,
        price: Number(formData.price),
        veg: formData.veg,
        img: formData.img || '🍽️',
        desc: formData.desc.trim(),
        available: formData.available,
      });
    } else {
      addProduct({
        name: formData.name.trim(),
        catId: formData.catId,
        price: Number(formData.price),
        veg: formData.veg,
        img: formData.img || '🍽️',
        desc: formData.desc.trim(),
        available: formData.available,
        variants: [],
        addons: [],
      });
    }

    setShowItemModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-espresso-100 shadow-soft">
        <div>
          <h2 className="text-xl font-bold font-display text-espresso-950">Menu Management</h2>
          <p className="text-xs text-espresso-500 font-medium">
            {db.products.length} items across {db.categories.length} categories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add item</span>
          </button>
        </div>
      </div>

      {/* Categories Bar & Search Filter */}
      <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-espresso-800 text-white shadow-2xs'
                : 'bg-cream-100 text-espresso-700 hover:bg-cream-200'
            }`}
          >
            All ({db.products.length})
          </button>
          {db.categories.map((cat) => {
            const count = db.products.filter((p) => p.catId === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-espresso-800 text-white shadow-2xs'
                    : 'bg-cream-100 text-espresso-700 hover:bg-cream-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-espresso-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items by name or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream-50 rounded-xl border border-espresso-100 text-xs text-espresso-900 placeholder:text-espresso-400 focus:outline-hidden focus:border-terracotta-500"
          />
        </div>
      </div>

      {/* Menu Table */}
      <div className="bg-white rounded-2xl border border-espresso-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cream-50 border-b border-espresso-100 text-espresso-500 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4">Variants</th>
                <th className="py-3 px-4">Add-ons</th>
                <th className="py-3 px-4 text-center">Available</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso-50">
              {filteredProducts.map((prod) => {
                const cat = db.categories.find((c) => c.id === prod.catId);
                return (
                  <tr key={prod.id} className="hover:bg-cream-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cream-100 flex items-center justify-center text-xl flex-shrink-0">
                          {prod.img}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-espresso-950">
                            {prod.veg ? (
                              <span className="veg-indicator"><span className="dot" /></span>
                            ) : (
                              <span className="nonveg-indicator"><span className="triangle" /></span>
                            )}
                            <span>{prod.name}</span>
                          </div>
                          <div className="text-[11px] text-espresso-500 truncate max-w-xs">{prod.desc}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-espresso-700 whitespace-nowrap">
                      {cat?.icon} {cat?.name}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-espresso-950 whitespace-nowrap">
                      ₹{prod.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-espresso-600 whitespace-nowrap">
                      {prod.variants.length > 0 ? (
                        <span className="text-[11px] bg-cream-100 px-2 py-0.5 rounded-md text-espresso-800">
                          {prod.variants.map((v) => v.name).join(' · ')}
                        </span>
                      ) : (
                        <span className="text-espresso-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-espresso-600 whitespace-nowrap">
                      {prod.addons.length > 0 ? (
                        <span className="text-[11px] text-terracotta-600 font-semibold">
                          {prod.addons.length} add-ons
                        </span>
                      ) : (
                        <span className="text-espresso-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prod.available}
                          onChange={() => toggleProductAvailable(prod.id)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-espresso-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-espresso-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sage-600" />
                      </label>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(prod)}
                        className="px-3 py-1 rounded-lg border border-espresso-200 text-espresso-700 hover:bg-cream-100 font-bold text-xs"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-espresso-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveItem}
            className="bg-white max-w-md w-full rounded-3xl shadow-float border border-espresso-100 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-espresso-100 flex items-center justify-between bg-cream-50">
              <h3 className="font-display font-bold text-base text-espresso-950">
                {editingProduct ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="text-espresso-400 hover:text-espresso-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-espresso-700">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourdough Truffle Pizza"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900 focus:outline-hidden focus:border-terracotta-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-espresso-700">Category</label>
                  <select
                    value={formData.catId}
                    onChange={(e) => setFormData({ ...formData, catId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-espresso-200 bg-white text-espresso-900"
                  >
                    {db.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-espresso-700">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900"
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-espresso-700">Icon / Emoji</label>
                  <input
                    type="text"
                    value={formData.img}
                    onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900 text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-espresso-700">Dietary</label>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, veg: true })}
                      className={`flex-1 py-1.5 rounded-lg border font-bold text-xs flex items-center justify-center gap-1 ${
                        formData.veg
                          ? 'bg-sage-100 border-sage-500 text-sage-900'
                          : 'bg-white border-espresso-200 text-espresso-600'
                      }`}
                    >
                      <span className="veg-indicator"><span className="dot" /></span>
                      <span>Veg</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, veg: false })}
                      className={`flex-1 py-1.5 rounded-lg border font-bold text-xs flex items-center justify-center gap-1 ${
                        !formData.veg
                          ? 'bg-red-100 border-red-500 text-red-900'
                          : 'bg-white border-espresso-200 text-espresso-600'
                      }`}
                    >
                      <span className="nonveg-indicator"><span className="triangle" /></span>
                      <span>Non-Veg</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-espresso-700">Description</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, preparation details, flavor notes"
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900 resize-none"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-4 h-4 rounded text-sage-600"
                />
                <span className="font-semibold text-espresso-800">Available to order</span>
              </label>
            </div>

            <div className="p-4 border-t border-espresso-100 bg-cream-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="px-4 py-2 rounded-xl border border-espresso-200 text-xs font-bold text-espresso-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white text-xs font-bold shadow-2xs"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
