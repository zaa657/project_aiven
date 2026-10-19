'use client';

import { useEffect, useState } from 'react';

const emptyForm = { name: '', description: '' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadCategories() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat data');
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function startEdit(category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan data');

      setForm(emptyForm);
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;
    setError('');
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus data');
      await loadCategories();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main>
      <h1>CRUD Kategori</h1>
      <p className="subtitle">Kelola kategori produk di MySQL (Aiven)</p>
      <nav className="page-nav" aria-label="Navigasi utama">
        <a className="nav-link" href="/">Produk</a>
        <a className="nav-link active" href="/categories">Kategori</a>
      </nav>

      {error && <div className="error-box">{error}</div>}

      <section className="card">
        <h3>{editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="name">Nama Kategori</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Misal: Minuman"
              maxLength={255}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="description">Deskripsi</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Deskripsi kategori (opsional)"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelEdit}
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </section>

      <div className="status">
        {loading ? 'Memuat data...' : `${categories.length} kategori ditemukan`}
      </div>

      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Deskripsi</th>
            <th>Dibuat</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>{category.description || '-'}</td>
              <td>
                {category.created_at
                  ? new Date(category.created_at).toLocaleDateString('id-ID')
                  : '-'}
              </td>
              <td>
                <button
                  className="btn-edit"
                  onClick={() => startEdit(category)}
                >
                  Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(category.id)}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && categories.length === 0 && (
        <div className="empty">
          Belum ada kategori. Tambahkan kategori pertama di atas.
        </div>
      )}
    </main>
  );
}
