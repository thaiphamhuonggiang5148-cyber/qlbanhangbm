import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const jsonBase = import.meta.env.BASE_URL || '/';

const emptyForm = () => ({
  id: '',
  name: '',
  imageKey: 'sp1',
  sizeS: 'S',
  sizeM: 'M',
  sizeL: 'L',
  currentPrice: '',
  originalPrice: '',
  discount: '',
  rating: '',
  sold: '',
  categoryid: '',
});

function productToForm(p) {
  return {
    id: String(p.id),
    name: p.name ?? '',
    imageKey: p.imageKey ?? '',
    sizeS: p.sizeS ?? 'S',
    sizeM: p.sizeM ?? 'M',
    sizeL: p.sizeL ?? 'L',
    currentPrice: p.currentPrice ?? '',
    originalPrice: p.originalPrice ?? '',
    discount: p.discount ?? '',
    rating: p.rating ?? '',
    sold: p.sold ?? '',
    categoryid: p.categoryid != null ? String(p.categoryid) : '',
  };
}

function formToProduct(form, nextId) {
  const id = form.id ? Number(form.id) : nextId;
  const o = {
    id,
    name: form.name.trim(),
    imageKey: form.imageKey.trim() || 'sp1',
    sizeS: form.sizeS.trim() || 'S',
    sizeM: form.sizeM.trim() || 'M',
    sizeL: form.sizeL.trim() || 'L',
    currentPrice: form.currentPrice.trim(),
    originalPrice: form.originalPrice.trim(),
    discount: form.discount.trim(),
    rating: form.rating.trim(),
    sold: form.sold.trim(),
  };
  
  if (form.categoryid !== '' && form.categoryid != null) {
    o.categoryid = Number(form.categoryid);
  }
  return o;
}

function AdminProduct({ embedded = false }) {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(embedded);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list');
  const [form, setForm] = useState(emptyForm);
  const [isNew, setIsNew] = useState(false);
  const [searchIdInput, setSearchIdInput] = useState('');
  const [appliedSearchId, setAppliedSearchId] = useState('');

  const displayedProducts = useMemo(() => {
    const q = appliedSearchId.trim();
    if (!q) return products;
    return products.filter((p) => String(p.id) === q);
  }, [products, appliedSearchId]);

  const persistProducts = useCallback(async (nextList) => {
    setSaving(true);
    setSaveError('');
    try {
      await axios.put('/api/products', nextList, {
        headers: { 'Content-Type': 'application/json' },
      });
      setProducts(nextList);
      setView('list');
      setForm(emptyForm());
      setIsNew(false);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.code === 'ERR_NETWORK' || err.response?.status === 404
          ? 'Chỉ lưu được khi chạy npm run dev hoặc npm run preview (API ghi file trên server).'
          : null) ||
        'Không lưu được dữ liệu.';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    if (embedded) {
      setAllowed(true);
      return;
    }
    const raw = localStorage.getItem('currentUser');
    if (!raw) {
      navigate('/login');
      return;
    }
    try {
      const u = JSON.parse(raw);
      if (u.role !== 'staff') {
        navigate('/');
        return;
      }
      setAllowed(true);
    } catch {
      navigate('/login');
    }
  }, [navigate, embedded]);

  useEffect(() => {
    if (!allowed) return;
    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(`${jsonBase}products.json`),
          fetch(`${jsonBase}category.json`),
        ]);
        
        if (!pRes.ok) throw new Error('Không tải được products.json');
        
        const pdata = await pRes.json();
        setProducts(Array.isArray(pdata) ? pdata : []);
        
        if (cRes.ok) {
          const cdata = await cRes.json();
          setCategories(Array.isArray(cdata) ? cdata : []);
        }
      } catch (e) {
        setLoadError(e.message || 'Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [allowed]);

  const goHome = () => navigate('/');
  
  const logout = () => {
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('userUpdated'));
    navigate('/login');
  };

  const openCreate = () => {
    setIsNew(true);
    setForm(emptyForm());
    setView('form');
    setSaveError('');
  };

  const openEdit = (p) => {
    setIsNew(false);
    setForm(productToForm(p));
    setView('form');
    setSaveError('');
  };

  const cancelForm = () => {
    setView('list');
    setForm(emptyForm());
    setIsNew(false);
    setSaveError('');
  };

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setSaveError('Vui lòng nhập tên sản phẩm');
      return;
    }
    
    const nextId = products.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0) + 1;
    const built = formToProduct(form, nextId);
    let nextList;
    
    if (isNew) {
      nextList = [...products, built];
    } else {
      const idx = products.findIndex((p) => String(p.id) === String(form.id));
      if (idx === -1) {
        setSaveError('Không tìm thấy sản phẩm để cập nhật');
        return;
      }
      nextList = products.map((p) => (String(p.id) === String(form.id) ? built : p));
    }
    persistProducts(nextList);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Xóa sản phẩm này?')) return;
    const nextList = products.filter((p) => String(p.id) !== String(id));
    persistProducts(nextList);
  };

  const applyIdSearch = () => {
    setAppliedSearchId(searchIdInput.trim());
  };

  const clearIdSearch = () => {
    setSearchIdInput('');
    setAppliedSearchId('');
  };

  const bodyContent = (
    <>
      {loadError && <div className="admin-msg admin-msg--error">{loadError}</div>}
      {saveError && <div className="admin-msg admin-msg--error">{saveError}</div>}
      
      {loading ? (
        <p>Đang tải...</p>
      ) : view === 'list' ? (
        <>
          <div className="admin-toolbar admin-toolbar--row">
            <button type="button" className="admin-btn" onClick={openCreate} disabled={saving}>
              + Thêm sản phẩm
            </button>
            <div className="admin-toolbar-search">
              <label htmlFor="admin-product-search-id">Tìm kiếm: </label>
              <input
                id="admin-product-search-id"
                type="text"
                inputMode="numeric"
                value={searchIdInput}
                onChange={(e) => setSearchIdInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyIdSearch();
                  }
                }}
              />
              <button type="button" className="admin-btn" onClick={applyIdSearch} disabled={saving}>
                Tìm
              </button>
              {appliedSearchId.trim() !== '' && (
                <button type="button" className="admin-btn admin-btn--ghost" onClick={clearIdSearch} disabled={saving}>
                  Hiện tất cả
                </button>
              )}
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Ảnh (key)</th>
                  <th>Giá</th>
                  <th>Danh mục</th>
                  <th />
                </tr>
              </thead>
              <tbody className="admin-table_empty">
                {displayedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-table_empty">
                      {appliedSearchId.trim()
                        ? `Không có sản phẩm với ID "${appliedSearchId.trim()}".`
                        : 'Chưa có sản phẩm.'}
                    </td>
                  </tr>
                ) : (
                  displayedProducts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>{p.imageKey}</td>
                      <td>{p.currentPrice}</td>
                      <td>
                        {p.categoryid != null
                          ? categories.find((c) => Number(c.id) === Number(p.categoryid))?.name ?? p.categoryid
                          : ''}
                      </td>
                      <td>
                        <div className="admin-table_actions">
                          <button
                            type="button"
                            className="admin-table_link"
                            onClick={() => openEdit(p)}
                            disabled={saving}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="admin-table_link admin-table_link--danger"
                            onClick={() => handleDelete(p.id)}
                            disabled={saving}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <form className="admin-form-card" onSubmit={handleSubmitForm}>
          <h2>{isNew ? 'Thêm sản phẩm' : 'Sửa sản phẩm'}</h2>
          <div className="admin-form-grid">
            {!isNew && (
              <label>
                ID
                <input value={form.id} readOnly />
              </label>
            )}
            <label className="admin-form-grid_full">
              Tên
              <input
                value={form.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </label>
            <label>
              imageKey
              <input
                value={form.imageKey}
                onChange={(e) => handleFormChange('imageKey', e.target.value)}
              />
            </label>
            <label>
              Danh mục
              <select
                value={form.categoryid}
                onChange={(e) => handleFormChange('categoryid', e.target.value)}
              >
                <option value="">- Không -</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              size S
              <input
                value={form.sizeS}
                onChange={(e) => handleFormChange('sizeS', e.target.value)}
              />
            </label>
            <label>
              size M
              <input
                value={form.sizeM}
                onChange={(e) => handleFormChange('sizeM', e.target.value)}
              />
            </label>
            <label>
              size L
              <input
                value={form.sizeL}
                onChange={(e) => handleFormChange('sizeL', e.target.value)}
              />
            </label>
            <label>
              Giá hiện tại
              <input
                value={form.currentPrice}
                onChange={(e) => handleFormChange('currentPrice', e.target.value)}
              />
            </label>
            <label>
              Giá gốc
              <input
                value={form.originalPrice}
                onChange={(e) => handleFormChange('originalPrice', e.target.value)}
              />
            </label>
            <label>
              Giảm giá
              <input
                value={form.discount}
                onChange={(e) => handleFormChange('discount', e.target.value)}
              />
            </label>
            <label>
              Đánh giá
              <input
                value={form.rating}
                onChange={(e) => handleFormChange('rating', e.target.value)}
              />
            </label>
            <label>
              Đã bán
              <input
                value={form.sold}
                onChange={(e) => handleFormChange('sold', e.target.value)}
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={cancelForm} disabled={saving}>
              Hủy
            </button>
          </div>
        </form>
      )}
    </>
  );

  if (embedded) {
    return <div className="admin-product-embed">{bodyContent}</div>;
  }
  
  if (!allowed) {
    return <div className="admin-page" />;
  }
  
  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <h1 className="admin-topbar_title">Quản trị sản phẩm</h1>
        <div className="admin-topbar_actions">
          <button type="button" className="admin-topbar_btn" onClick={goHome}>
            Trang chủ
          </button>
          <button type="button" className="admin-topbar_btn admin-topbar_btn--primary" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </header>
      <div className="admin-body">{bodyContent}</div>
    </div>
  );
}

export default AdminProduct;