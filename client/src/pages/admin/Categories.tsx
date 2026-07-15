import { useEffect, useState } from 'react';
import { Plus, Trash2, Tags, Edit } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import type { Category } from '@/types';

const emptyForm = { name: '', slug: '', description: '', image: '', icon: '' };

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  const load = () => {
    setLoading(true);
    api
      .get<{ categories: Category[] }>('/categories')
      .then(({ categories }) => setCategories(categories))
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/categories/${editingId}`, form);
        notify('Category updated');
      } else {
        await api.post('/categories', form);
        notify('Category created');
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Category) => {
    if (!confirm(`Delete category ${c.name}? This might break products using this category.`)) return;
    try {
      await api.delete(`/categories/${c._id}`);
      setCategories((prev) => prev.filter((x) => x._id !== c._id));
      notify('Category deleted');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  const edit = (c: Category) => {
    setEditingId(c._id);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      image: c.image || '',
      icon: c.icon || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-brown-dark dark:text-beige">Categories</h1>
        <p className="mt-1 text-brown/60 dark:text-beige/60">Manage product categories.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Form */}
        <form onSubmit={submit} className="card-surface h-fit space-y-4 p-6">
          <h2 className="flex items-center gap-2 font-serif text-xl text-brown-dark dark:text-beige">
            <Plus size={18} /> {editingId ? 'Edit Category' : 'New Category'}
          </h2>
          <Field label="Name">
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm({ ...form, name, slug: editingId ? form.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-') });
              }}
            />
          </Field>
          <Field label="Slug (URL-friendly)">
            <input
              className="input"
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })}
            />
          </Field>
          <Field label="Icon Name (e.g., 'Sparkles', 'Droplet')">
            <input
              className="input"
              value={form.icon}
              placeholder="lucide-react icon name"
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
          </Field>
          <Field label="Image URL">
            <input
              className="input"
              value={form.image}
              placeholder="https://..."
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <textarea
              className="input min-h-[80px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <div className="flex gap-3">
            {editingId && (
              <Button type="button" variant="secondary" fullWidth onClick={cancelEdit}>
                Cancel
              </Button>
            )}
            <Button type="submit" fullWidth disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>

        {/* List */}
        <div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="card-surface grid place-items-center py-16 text-center">
              <Tags className="text-brown/40" size={36} />
              <p className="mt-2 text-sm text-brown/50 dark:text-beige/50">No categories found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((c) => (
                <div key={c._id} className="card-surface flex items-center gap-4 p-4">
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <span className="grid h-12 w-12 place-items-center rounded-lg bg-brown/5 text-brown">
                      <Tags size={20} />
                    </span>
                  )}
                  
                  <div className="flex-1">
                    <p className="font-semibold text-brown-dark dark:text-beige">
                      {c.name}
                    </p>
                    <p className="text-xs text-brown/50 dark:text-beige/50 font-mono">
                      /{c.slug}
                    </p>
                  </div>
                  
                  <div className="text-right mr-2 hidden sm:block">
                    <p className="text-xs text-brown/60 dark:text-beige/60">
                      {c.productCount || 0} products
                    </p>
                  </div>

                  <button
                    onClick={() => edit(c)}
                    aria-label="Edit"
                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => remove(c)}
                    aria-label="Delete"
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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
