import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const jsonBase = import.meta.env.BASE_URL || '/';

const emptyForm = () => ({
  id: '',
  bill_id: '',
  product_id: '',
  quantity: '',
  unit_price: '',
  price: '',
});

function rowToForm(r) {
  return {
    id: String(r.id),
    bill_id: r.bill_id != null ? String(r.bill_id) : '',
    product_id: r.product_id != null ? String(r.product_id) : '',
    quantity: r.quantity != null ? String(r.quantity) : '',
    unit_price: r.unit_price != null ? String(r.unit_price) : '',
    price: r.price != null ? String(r.price) : '',
  };
}

function formToRow(form, nextId) {
  return {
    id: form.id ? Number(form.id) : nextId,
    bill_id: Number(form.bill_id),
    product_id: Number(form.product_id),
    quantity: Number(form.quantity),
    unit_price: Number(form.unit_price),
    price: Number(form.price),
  };
}

function validateNums(built) {
  const keys = ['bill_id', 'product_id', 'quantity', 'unit_price', 'price'];
  for (const k of keys) {
    if (!Number.isFinite(built[k])) {
      return `Trường ${k} phải là số hợp lệ`;
    }
  }
  return null;
}

function AdminInvoiceDetails({ embedded = false }) {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(embedded);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list');
  const [form, setForm] = useState(emptyForm);
  const [isNew, setIsNew] = useState(false);
  const [searchIdInput, setSearchIdInput] = useState('');
  const [appliedSearchId, setAppliedSearchId] = useState('');

  const displayedRows = useMemo(() => {
    const q = appliedSearchId.trim();
    if (!q) return rows;
    return rows.filter((r) => String(r.id) === q);
  }, [rows, appliedSearchId]);

  const persist = useCallback(async (nextList) => {
    setSaving(true);
    setSaveError('');
    try {
      await axios.put('/api/invoicedetails', nextList, {
        headers: { 'Content-Type': 'application/json' },
      });
      setRows(nextList);
      setView('list');
      setForm(emptyForm());
      setIsNew(false);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.code === 'ERR_NETWORK' || err.response?.status === 404
          ? 'Chỉ lưu được khi chạy npm run dev hoặc npm run preview (API Vite).'
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
        const res = await fetch(`${jsonBase}invoicedetails.json`);
        if (!res.ok) throw new Error('Không tải được invoicedetails.json');
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
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

  const openEdit = (r) => {
    setIsNew(false);
    setForm(rowToForm(r));
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
    const nextId = rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1;
    const built = formToRow(form, nextId);
    const invalid = validateNums(built);
    
    if (invalid) {
      setSaveError(invalid);
      return;
    }
    
    let nextList;
    if (isNew) {
      nextList = [...rows, built];
    } else {
      const idx = rows.findIndex((r) => String(r.id) === String(form.id));
      if (idx === -1) {
        setSaveError('Không tìm thấy bản ghi để cập nhật');
        return;
      }
      nextList = rows.map((r) => (String(r.id) === String(form.id) ? built : r));
    }
    persist(nextList);
  };

  const handleDelete = (id) => {
    if (window.confirm('Xóa dòng chi tiết này?')) return;
    persist(rows.filter((r) => String(r.id) !== String(id)));
  };

  const applyIdSearch = () => setAppliedSearchId(searchIdInput.trim());
  
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
              + Thêm dòng
            </button>
            <div className="admin-toolbar-search">
              <label htmlFor="admin-invoicedetails-search-id">Tìm kiếm: </label>
              <input
                id="admin-invoicedetails-search-id"
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
                  <th>Bill</th>
                  <th>SP</th>
                  <th>SL</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                  <th />
                </tr>
              </thead>
              <tbody className="admin-table_empty">
                {displayedRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-table_empty">
                      {appliedSearchId.trim()
                        ? `Không có dòng chi tiết với ID "${appliedSearchId.trim()}".`
                        : 'Chưa có dòng chi tiết.'}
                    </td>
                  </tr>
                ) : (
                  displayedRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.bill_id}</td>
                      <td>{r.product_id}</td>
                      <td>{r.quantity}</td>
                      <td>{r.unit_price}</td>
                      <td>{r.price}</td>
                      <td>
                        <div className="admin-table_actions">
                          <button
                            type="button"
                            className="admin-table_link"
                            onClick={() => openEdit(r)}
                            disabled={saving}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="admin-table_link admin-table_link--danger"
                            onClick={() => handleDelete(r.id)}
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
        <form className="admin-form-card admin-form-card--wide" onSubmit={handleSubmitForm}>
          <h2>{isNew ? 'Thêm chi tiết hóa đơn' : 'Sửa chi tiết hóa đơn'}</h2>
          <div className="admin-form-grid">
            {!isNew && (
              <label>
                ID
                <input value={form.id} readOnly />
              </label>
            )}
            <label>
              Mã hóa đơn (bill_id)
              <input
                type="number"
                value={form.bill_id}
                onChange={(e) => handleFormChange('bill_id', e.target.value)}
                required
              />
            </label>
            <label>
              Mã sản phẩm (product_id)
              <input
                type="number"
                value={form.product_id}
                onChange={(e) => handleFormChange('product_id', e.target.value)}
                required
              />
            </label>
            <label>
              Số lượng
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => handleFormChange('quantity', e.target.value)}
                required
              />
            </label>
            <label>
              Đơn giá
              <input
                type="number"
                min="0"
                value={form.unit_price}
                onChange={(e) => handleFormChange('unit_price', e.target.value)}
                required
              />
            </label>
            <label>
              Thành tiền (price)
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => handleFormChange('price', e.target.value)}
                required
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

  if (embedded) return <div className="admin-product-embed">{bodyContent}</div>;
  if (!allowed) return <div className="admin-page" />;

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <h1 className="admin-topbar_title">Quản trị chi tiết hóa đơn</h1>
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

export default AdminInvoiceDetails;