import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Package } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice, finalPrice, cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import type { Product, Badge, Category } from '@/types';

const ALL_BADGES: Badge[] = ['New', 'Sale', 'Limited', 'Handmade'];

interface FormState {
  name: string;
  category: string;
  price: string;
  discount: string;
  stock: string;
  material: string;
  dimensions: string;
  color: string;
  description: string;
  image: string;
  badges: Badge[];
  featured: boolean;
}

const emptyForm: FormState = {
  name: '',
  category: '',
  price: '',
  discount: '0',
  stock: '0',
  material: '',
  dimensions: '',
  color: '',
  description: '',
  image: '',
  badges: ['Handmade'],
  featured: false,
};

export default function Products() {
  const { categories } = useCategories();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { notify } = useToast();

  const load = () => {
    setLoading(true);
    api
      .get<{ products: Product[] }>('/products?limit=48')
      .then(({ products }) => setProducts(products))
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setShowForm(true);
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      setProducts((prev) => prev.filter((x) => x._id !== p._id));
      notify('Product deleted');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Delete failed', 'error');
    }
  };

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-brown-dark dark:text-beige">Products</h1>
          <p className="mt-1 text-brown/60 dark:text-beige/60">
            {loading ? 'Loading…' : `${products.length} products`}
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus size={18} /> Add Product
        </Button>
      </header>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card-surface grid place-items-center py-20 text-center">
          <Package className="text-brown/40" size={40} />
          <p className="mt-3 font-serif text-xl text-brown-dark dark:text-beige">No products</p>
          <Button className="mt-4" onClick={openNew}>
            Add your first product
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p._id} className="card-surface flex items-center gap-4 p-3">
              <img
                src={p.images[0]}
                alt={p.name}
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-brown-dark dark:text-beige">{p.name}</p>
                <p className="text-xs text-brown/50 dark:text-beige/50">
                  {typeof p.category === 'object' ? p.category.name : ''} ·{' '}
                  {formatPrice(finalPrice(p))}
                  {p.discount > 0 && <span className="text-forest"> (-{p.discount}%)</span>}
                </p>
              </div>
              <span
                className={cn(
                  'hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline',
                  p.stock === 0
                    ? 'bg-red-100 text-red-600'
                    : p.stock <= 5
                      ? 'bg-gold/20 text-brown-dark'
                      : 'bg-forest/15 text-forest'
                )}
              >
                {p.stock} in stock
              </span>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => openEdit(p)}
                  aria-label="Edit"
                  className="rounded-lg p-2 text-brown hover:bg-beige/50 dark:hover:bg-beige/10"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => remove(p)}
                  aria-label="Delete"
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { notify } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<FormState>(() =>
    product
      ? {
          name: product.name,
          category:
            typeof product.category === 'object' ? product.category._id : product.category,
          price: String(product.price),
          discount: String(product.discount),
          stock: String(product.stock),
          material: product.material || '',
          dimensions: product.dimensions || '',
          color: product.color || '',
          description: product.description,
          image: product.images[0] || '',
          badges: product.badges || [],
          featured: !!product.featured,
        }
      : emptyForm
  );

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { url } = await api.upload<{ url: string }>('/admin/upload', fd);
      set('image', url);
      notify('Image uploaded');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) return notify('Please choose a category', 'error');
    if (!form.image) return notify('Please add a product image', 'error');
    setSaving(true);
    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      discount: Number(form.discount),
      stock: Number(form.stock),
      material: form.material,
      dimensions: form.dimensions,
      color: form.color,
      description: form.description,
      images: [form.image],
      badges: form.badges,
      featured: form.featured,
    };
    try {
      if (product) await api.patch(`/products/${product._id}`, payload);
      else await api.post('/products', payload);
      notify(product ? 'Product updated' : 'Product created');
      onSaved();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-brown-dark/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-2xl rounded-2xl bg-cream p-6 shadow-lift dark:bg-[#1c1712]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-brown-dark dark:text-beige">
            {product ? 'Edit Product' : 'New Product'}
          </h2>
          <button onClick={onClose} aria-label="Close">
            <X className="text-brown-dark dark:text-beige" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Image */}
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-beige/40">
              {form.image ? (
                <img src={form.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-brown/30">
                  <Package size={28} />
                </div>
              )}
            </div>
            <div>
              <label className="btn cursor-pointer border border-brown/30 px-4 py-2 text-sm text-brown hover:bg-brown/10">
                <Upload size={15} /> {uploading ? 'Uploading…' : 'Upload image'}
                <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              </label>
              <p className="mt-1.5 text-xs text-brown/50 dark:text-beige/50">
                JPG, PNG or WEBP, up to 5MB.
              </p>
            </div>
          </div>

          <Field label="Name">
            <input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">Select…</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Color">
              <input className="input" value={form.color} onChange={(e) => set('color', e.target.value)} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (₹)">
              <input type="number" min="0" className="input" required value={form.price} onChange={(e) => set('price', e.target.value)} />
            </Field>
            <Field label="Discount (%)">
              <input type="number" min="0" max="100" className="input" value={form.discount} onChange={(e) => set('discount', e.target.value)} />
            </Field>
            <Field label="Stock">
              <input type="number" min="0" className="input" value={form.stock} onChange={(e) => set('stock', e.target.value)} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Material">
              <input className="input" value={form.material} onChange={(e) => set('material', e.target.value)} />
            </Field>
            <Field label="Dimensions">
              <input className="input" value={form.dimensions} onChange={(e) => set('dimensions', e.target.value)} />
            </Field>
          </div>

          <Field label="Description">
            <textarea rows={3} className="input resize-none" required value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-brown-dark dark:text-beige">
              Badges
            </span>
            <div className="flex flex-wrap gap-2">
              {ALL_BADGES.map((b) => {
                const active = form.badges.includes(b);
                return (
                  <button
                    type="button"
                    key={b}
                    onClick={() =>
                      set('badges', active ? form.badges.filter((x) => x !== b) : [...form.badges, b])
                    }
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs transition-colors',
                      active ? 'border-brown bg-brown text-cream' : 'border-brown/25 text-brown'
                    )}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-brown-dark dark:text-beige">
            <input type="checkbox" className="h-4 w-4 accent-brown" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
            Show in Featured Products
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? 'Saving…' : product ? 'Save changes' : 'Create product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-brown-dark dark:text-beige">
        {label}
      </span>
      {children}
    </label>
  );
}
