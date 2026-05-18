import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminProduct from './AdminProduct';
import AdminCategory from './AdminCategory';
import AdminCustomer from './AdminCustomer';
import AdminEmployee from './AdminEmployee';
import AdminBill from './AdminBill';
import AdminInvoiceDetails from './AdminInvoiceDetails';
import './Admin.css';

const jsonBase = import.meta.env.BASE_URL || '/';

const SECTION_LABEL = {
  dashboard: 'Dashboard',
  products: 'Sản phẩm',
  category: 'Danh mục',
  customer: 'Khách hàng',
  employee: 'Nhân viên',
  bill: 'Hóa đơn',
  invoiceDetails: 'Chi tiết hóa đơn',
};

function fmtNumber(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function fmtCurrency(n) {
  return `${fmtNumber(Number(n) || 0)} đ`;
}

// Cập nhật lại MAP trạng thái khớp với tiếng Việt trong file Bill.json của bà
const BILL_STATUS_MAP = {
  'đã thanh toán': { label: 'Đã thanh toán', cls: 'done' },
  'đang xử lý': { label: 'Đang xử lý', cls: 'processing' },
  'đang giao': { label: 'Vận chuyển', cls: 'shipping' },
  'đã hủy': { label: 'Đã hủy', cls: 'pending' },
};

function billStatusFromJson(statusRaw) {
  const key = String(statusRaw || '').trim().toLowerCase();
  if (BILL_STATUS_MAP[key]) return { key, ...BILL_STATUS_MAP[key] };
  return {
    key: 'unknown',
    label: key ? String(statusRaw).trim() : 'Chưa xác định',
    cls: 'unknown',
  };
}

const Admin = () => {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [adminSection, setAdminSection] = useState('dashboard');
  const userMenuRef = useRef(null);

  useEffect(() => {
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
  }, [navigate]);

  useEffect(() => {
    if (!allowed) return;

    const fetchSafeJson = async (url) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.warn(`[Cảnh báo] File ${url} không tồn tại hoặc lỗi định dạng.`);
          return [];
        }
        return await res.json();
      } catch (error) {
        console.error(`Lỗi tải ${url}:`, error);
        return [];
      }
    };

    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {

        const [pdata, cdata, bdata, cudata, edata, idata] = await Promise.all([
          fetchSafeJson(`${jsonBase}products.json`),
          fetchSafeJson(`${jsonBase}category.json`),
          fetchSafeJson(`${jsonBase}bill.json`),
          fetchSafeJson(`${jsonBase}customer.json`),
          fetchSafeJson(`${jsonBase}employee.json`),
          fetchSafeJson(`${jsonBase}invoicedetails.json`),
        ]);

        setProducts(Array.isArray(pdata) ? pdata : []);
        setCategories(Array.isArray(cdata) ? cdata : []);
        setBills(Array.isArray(bdata) ? bdata : []);
        setCustomers(Array.isArray(cudata) ? cudata : []);
        setEmployees(Array.isArray(edata) ? edata : []);
        setInvoiceDetails(Array.isArray(idata) ? idata : []);

      } catch (e) {
        setLoadError(e.message || 'Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [allowed]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const staffInitials = useMemo(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return 'AD';
      const u = JSON.parse(raw);
      const name = String(u.user || u.name || 'Staff').trim();
      const parts = name.split(/\s+/).filter(Boolean);
      if (!parts.length) return 'AD';
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } catch {
      return 'AD';
    }
  }, []);

  const staffDisplayName = useMemo(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return 'Administrator';
      const u = JSON.parse(raw);
      return String(u.user || u.name || 'Staff').trim() || 'Administrator';
    } catch {
      return 'Administrator';
    }
  }, []);

  const stats = useMemo(() => {
    const total = products.length;
    // Lọc bỏ các đơn bị hủy để tính doanh thu thực tế chính xác hơn (tùy ý bà chọn)
    const validBills = bills.filter(b => b.status !== 'Đã hủy');
    const soldSum = invoiceDetails.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const catCount = categories.length;
    const uncategorized = products.filter((p) => p.categoryid == null || p.categoryid === '').length;

    // Giữ nguyên tính tổng dựa trên bill.total từ file Bill.json
    const revenue = validBills.reduce((sum, bill) => sum + Number(bill.total || 0), 0);
    const avgBill = validBills.length ? revenue / validBills.length : 0;
    return { total, soldSum, catCount, uncategorized, revenue, avgBill };
  }, [products, categories, invoiceDetails, bills]);

  const topSoldProducts = useMemo(() => {
    const byProduct = invoiceDetails.reduce((map, item) => {
      // SỬA THÀNH item.productId (Khớp với file Invoicedetails.json)
      const pid = Number(item.productId);
      const quantity = Number(item.quantity || 0);
      if (pid) map.set(pid, (map.get(pid) || 0) + quantity);
      return map;
    }, new Map());

    return [...byProduct.entries()]
      .map(([id, sold]) => {
        const product = products.find((p) => Number(p.id) === id);
        return {
          id,
          sold,
          name: product?.name || `Sản phẩm #${id}`,
        };
      })
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)
      .map((p) => {
        const sold = Number(p.sold || 0);
        const percent = Math.max(0, Math.min(100, Math.round((sold / 800) * 100)));
        return { id: p.id, name: p.name, sold, percent };
      });
  }, [products, invoiceDetails]);

  const revenueByDate = useMemo(() => {
    const grouped = bills.reduce((acc, bill) => {
      const key = String(bill.date || '').slice(0, 10) || 'N/A';
      acc.set(key, (acc.get(key) || 0) + Number(bill.total || 0));
      return acc;
    }, new Map());

    const rows = [...grouped.entries()]
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const maxTotal = rows.reduce((m, row) => Math.max(m, row.total), 0);
    return rows.map((row) => ({
      ...row,
      percent: maxTotal > 0 ? Math.max(8, Math.round((row.total / maxTotal) * 100)) : 0,
    }));
  }, [bills]);

  const billTableRows = useMemo(() => {
    // SỬA THÀNH c.id vì trong Customer.json id là dạng chuỗi như "KH001"
    const customerMap = new Map(customers.map((c) => [String(c.id), c.name]));
    const productMap = new Map(products.map((p) => [Number(p.id), p.name]));

    const detailByBill = invoiceDetails.reduce((map, item) => {
      // SỬA THÀNH item.billId (Khớp với file Invoicedetails.json)
      const key = String(item.billId);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
      return map;
    }, new Map());

    return [...bills]
      // Sắp xếp các hóa đơn mới nhất lên đầu dựa vào chuỗi ID (ví dụ HD0200)
      .sort((a, b) => String(b.id).localeCompare(String(a.id)))
      .slice(0, 6)
      .map((bill) => {
        const details = detailByBill.get(String(bill.id)) || [];
        const firstProduct = details[0];
        // SỬA THÀNH firstProduct.productId 
        const itemName = firstProduct
          ? productMap.get(Number(firstProduct.productId)) || firstProduct.productName || `SP #${firstProduct.productId}`
          : '-';
        return {
          id: bill.id,
          billCode: String(bill.id),
          // SỬA THÀNH bill.customerId
          customerName: customerMap.get(String(bill.customerId)) || `KH #${bill.customerId}`,
          itemName,
          status: billStatusFromJson(bill.status),
        };
      });
  }, [bills, customers, products, invoiceDetails]);

  const vipCustomers = useMemo(() => {
    if (!bills.length) return [];
    const latestDate = bills
      .map((bill) => String(bill.date || ''))
      .sort()
      .slice(-1)[0];
    const targetMonth = latestDate.slice(0, 7);
    const customerMap = new Map(customers.map((c) => [String(c.id), c.name]));

    const grouped = bills.reduce((map, bill) => {
      if (!String(bill.date || '').startsWith(targetMonth)) return map;
      // SỬA THÀNH bill.customerId
      const cid = String(bill.customerId);
      if (!map.has(cid)) {
        map.set(cid, { customerId: cid, total: 0, count: 0 });
      }
      const row = map.get(cid);
      row.total += Number(bill.total || 0);
      row.count += 1;
      return map;
    }, new Map());

    return [...grouped.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((row) => ({
        ...row,
        name: customerMap.get(row.customerId) || `KH #${row.customerId}`,
      }));
  }, [bills, customers]);

  const goHome = () => navigate('/');
  const logout = () => {
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('userUpdated'));
    navigate('/login');
    setLogoutModalOpen(false);
  };

  const closeMobileNav = () => setMobileSidebarOpen(false);

  if (!allowed) {
    return <div className="ruang-boot" aria-hidden />;
  }

  return (
    <div className="ruang-layout">
      <div
        className={`ruang-overlay ${mobileSidebarOpen ? 'is-visible' : ''}`}
        onClick={closeMobileNav}
        aria-hidden={!mobileSidebarOpen}
      />
      <aside className={`ruang-sidebar ${mobileSidebarOpen ? 'is-open' : ''}`}>
        <div className="ruang-sidebar_brand">
          <span className="ruang-sidebar_brand-icon">
            <i className="fa-solid fa-layer-group" aria-hidden />
          </span>
          <span>GalaxyCafe</span>
        </div>
        <hr className="ruang-sidebar_divider" />
        <div className="ruang-sidebar_heading">Tiện ích</div>
        <ul className="ruang-sidebar_nav">
          <li>
            <button
              type="button"
              className={`ruang-sidebar_link ${adminSection === 'dashboard' ? 'is-active' : ''}`}
              onClick={() => {
                setAdminSection('dashboard');
                closeMobileNav();
              }}
            >
              <i className="fa-solid fa-gauge-high" aria-hidden /> Trang chủ
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar_link ${adminSection === 'products' ? 'is-active' : ''}`}
              onClick={() => {
                setAdminSection('products');
                closeMobileNav();
              }}
            >
              <i className="fa-solid fa-box" aria-hidden /> Sản phẩm
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar_link ${adminSection === 'category' ? 'is-active' : ''}`}
              onClick={() => {
                setAdminSection('category');
                closeMobileNav();
              }}
            >
              <i className="fa-solid fa-tags" aria-hidden /> Danh mục
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar_link ${adminSection === 'customer' ? 'is-active' : ''}`}
              onClick={() => {
                setAdminSection('customer');
                closeMobileNav();
              }}
            >
              <i className="fa-solid fa-address-book" aria-hidden /> Khách hàng
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar_link ${adminSection === 'employee' ? 'is-active' : ''}`}
              onClick={() => {
                setAdminSection('employee');
                closeMobileNav();
              }}
            >
              <i className="fa-solid fa-id-card" aria-hidden /> Nhân viên
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar_link ${adminSection === 'bill' ? 'is-active' : ''}`}
              onClick={() => {
                setAdminSection('bill');
                closeMobileNav();
              }}
            >
              <i className="fa-solid fa-file-invoice-dollar" aria-hidden /> Hóa đơn
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`ruang-sidebar_link ${adminSection === 'invoiceDetails' ? 'is-active' : ''}`}
              onClick={() => {
                setAdminSection('invoiceDetails');
                closeMobileNav();
              }}
            >
              <i className="fa-solid fa-file-lines" aria-hidden /> Chi tiết HĐ
            </button>
          </li>
        </ul>
      </aside>

      <div className="ruang-shell">
        <header className="ruang-topbar">
          <button
            type="button"
            className="ruang-topbar_toggle"
            onClick={() => setMobileSidebarOpen((v) => !v)}
            aria-label="Menu"
          >
            <i className="fa-solid fa-bars" />
          </button>
          <div className="ruang-breadcrumb-wrap"></div>
          <div className="ruang-topbar_right">
            <button type="button" className="ruang-notify" aria-label="Tin nhắn">
              <i className="fa-regular fa-comments" />
              <span className="ruang-badge">{Math.min(9, stats.total)}+</span>
            </button>
            <button type="button" className="ruang-notify" aria-label="Thông báo">
              <i className="fa-regular fa-bell" />
              <span className="ruang-badge">3+</span>
            </button>
            <div className="ruang-user" ref={userMenuRef}>
              <button
                type="button"
                className="ruang-user_toggle"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-expanded={userMenuOpen}
              >
                <span className="ruang-user_avatar">{staffInitials}</span>
                <span className="ruang-user_name">{staffDisplayName}</span>
                <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.65rem', opacity: 0.6 }} />
              </button>
              {userMenuOpen && (
                <div className="ruang-user_menu" role="menu">
                  <div className="ruang-user_menu-title">Tài khoản</div>
                  <button type="button" role="menuitem" onClick={goHome}>
                    <i className="fa-solid fa-house" /> Trang chủ
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setLogoutModalOpen(true);
                    }}
                  >
                    <i className="fa-solid fa-right-from-bracket" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="ruang-main">
          {adminSection === 'dashboard' && loadError && (
            <div className="admin-msg admin-msg--error">{loadError}</div>
          )}

          {adminSection === 'products' ? (
            <div className="ruang-loading">Tính năng Sản phẩm đang ẩn...</div>
          ) : adminSection === 'category' ? (
            <div className="ruang-loading">Tính năng Danh mục đang ẩn...</div>
          ) : adminSection === 'customer' ? (
            <div className="ruang-loading">Tính năng Khách hàng đang ẩn...</div>
          ) : adminSection === 'employee' ? (
            <div className="ruang-loading">Tính năng Nhân viên đang ẩn...</div>
          ) : adminSection === 'bill' ? (
            <div className="ruang-loading">Tính năng Hóa đơn đang ẩn...</div>
          ) : adminSection === 'invoiceDetails' ? (
            <div className="ruang-loading">Tính năng Chi tiết HĐ đang ẩn...</div>
          ) : loading ? (
            <div className="ruang-loading">Đang tải dữ liệu...</div>
          ) : (
            <>
              <div className="ruang-cards">
                <div className="ruang-stat-card">
                  <div className="ruang-stat-card_body">
                    <div className="ruang-stat-card_label">Doanh thu</div>
                    <div className="ruang-stat-card_value">{fmtCurrency(stats.revenue)}</div>
                    <div className="ruang-stat-card_badge">{fmtNumber(bills.length)} hóa đơn</div>
                  </div>
                  <div className="ruang-stat-card_icon" aria-hidden>
                    <i className="fa-solid fa-sack-dollar" />
                  </div>
                </div>

                <div className="ruang-stat-card ruang-stat-card--green">
                  <div className="ruang-stat-card_body">
                    <div className="ruang-stat-card_label">Sản phẩm đã bán</div>
                    <div className="ruang-stat-card_value">{fmtNumber(stats.soldSum)}</div>
                    <div className="ruang-stat-card_badge">Từ invoice details</div>
                  </div>
                  <div className="ruang-stat-card_icon" aria-hidden>
                    <i className="fa-solid fa-cart-shopping" />
                  </div>
                </div>

                <div className="ruang-stat-card ruang-stat-card--cyan">
                  <div className="ruang-stat-card_body">
                    <div className="ruang-stat-card_label">Khách hàng</div>
                    <div className="ruang-stat-card_value">{fmtNumber(customers.length)}</div>
                    <div className="ruang-stat-card_badge">{fmtNumber(employees.length)} nhân viên</div>
                  </div>
                  <div className="ruang-stat-card_icon" aria-hidden>
                    <i className="fa-solid fa-users" />
                  </div>
                </div>

                <div className="ruang-stat-card ruang-stat-card--amber">
                  <div className="ruang-stat-card_body">
                    <div className="ruang-stat-card_label">Danh mục / Bill TB</div>
                    <div className="ruang-stat-card_value">
                      {fmtNumber(stats.catCount)} / {fmtCurrency(stats.avgBill)}
                    </div>
                    <div className="ruang-stat-card_badge ruang-stat-card_badge--muted">
                      {stats.uncategorized > 0 ? `${stats.uncategorized} SP chưa gán` : 'Dữ liệu đồng bộ'}
                    </div>
                  </div>
                  <div className="ruang-stat-card_icon" aria-hidden>
                    <i className="fa-solid fa-layer-group" />
                  </div>
                </div>
              </div>

              <div className="ruang-dashboard-grid">
                <div className="ruang-card">
                  <div className="ruang-card_title-bar">
                    <h6>Doanh thu theo ngày</h6>
                  </div>
                  <div className="ruang-revenue-list">
                    {revenueByDate.length === 0 ? (
                      <div style={{ padding: '1rem', opacity: 0.5 }}>Không có dữ liệu doanh thu</div>
                    ) : (
                      revenueByDate.map((row) => (
                        <div className="ruang-revenue-item" key={row.date}>
                          <div className="ruang-revenue-item_head">
                            <span>{row.date}</span>
                            <strong>{fmtCurrency(row.total)}</strong>
                          </div>
                          <div className="ruang-revenue-item_bar">
                            <div className="ruang-revenue-item_fill" style={{ width: `${row.percent}%` }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="ruang-card">
                  <div className="ruang-card_title-bar">
                    <h6>Sản phẩm bán chạy</h6>
                  </div>
                  <div className="ruang-sold-list">
                    {topSoldProducts.length === 0 ? (
                      <div style={{ padding: '1rem', opacity: 0.5 }}>Không có dữ liệu sản phẩm</div>
                    ) : (
                      topSoldProducts.map((item, idx) => (
                        <div className="ruang-sold-item" key={item.id}>
                          <div className="ruang-sold-item_head">
                            <span>{item.name}</span>
                            <strong>{item.sold} món</strong>
                          </div>
                          <div className="ruang-sold-item_bar">
                            <div
                              className={`ruang-sold-item_fill ruang-sold-item_fill--${idx % 4}`}
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="ruang-bottom-grid">
                <div className="ruang-card">
                  <div className="ruang-card_title-bar">
                    <h6>Hóa đơn vừa qua</h6>
                    <button type="button" className="ruang-mini-btn">
                      Xem thêm <i className="fa-solid fa-chevron-right" />
                    </button>
                  </div>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Khách hàng</th>
                          <th>Mục sản phẩm</th>
                          <th>Trạng thái</th>
                          <th>Hoạt động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billTableRows.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', opacity: 0.5 }}>Không có hóa đơn</td>
                          </tr>
                        ) : (
                          billTableRows.map((row) => (
                            <tr key={row.id}>
                              <td>{row.billCode}</td>
                              <td>{row.customerName}</td>
                              <td>{row.itemName}</td>
                              <td>
                                <span className={`ruang-status ruang-status--${row.status.cls}`}>
                                  {row.status.label}
                                </span>
                              </td>
                              <td>
                                <button type="button" className="ruang-detail-btn">
                                  Chi tiết
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="ruang-card">
                  <div className="ruang-vip-title">Khách hàng VIP tháng</div>
                  <div className="ruang-vip-list">
                    {vipCustomers.length === 0 ? (
                      <div style={{ padding: '1rem', opacity: 0.5 }}>Không có khách hàng VIP</div>
                    ) : (
                      vipCustomers.map((vip) => (
                        <div key={vip.customerId} className="ruang-vip-item">
                          <strong>{vip.name}</strong>
                          <small>{vip.count} đơn - Tổng: {fmtCurrency(vip.total)}</small>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        <footer className="ruang-footer">
          copyright Quản lý bán hàng cafe giao diện theo phong cách{' '}
          <a href="https://themewagon.github.io/ruang-admin/index.html" target="_blank" rel="noreferrer">
            GalaxyCafe
          </a>
        </footer>
      </div>

      {logoutModalOpen && (
        <div
          className="ruang-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ruang-logout-title"
        >
          <div className="ruang-modal">
            <div className="ruang-modal_header">
              <h5 id="ruang-logout-title">Ohh No!</h5>
              <button
                type="button"
                className="ruang-modal_close"
                onClick={() => setLogoutModalOpen(false)}
                aria-label="Đóng"
              >
                X
              </button>
            </div>
            <div className="ruang-modal_body">Bạn có chắc muốn đăng xuất?</div>
            <div className="ruang-modal_footer">
              <button type="button" className="ruang-modal_btn" onClick={() => setLogoutModalOpen(false)}>
                Hủy
              </button>
              <button type="button" className="ruang-modal_btn ruang-modal_btn--danger" onClick={logout}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
