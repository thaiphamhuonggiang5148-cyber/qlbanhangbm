import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { imageMap } from '../../utils/productImages';
const DetailProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(location.state?.product || null);
  const [isLoading, setIsLoading] = useState(!location.state?.product);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product) return;

    const fetchProduct = async () => {
      try {
        const response = await fetch('/products.json');
        if (!response.ok) {
          throw new Error('Không thể tải thông tin sản phẩm');
        }

        const data = await response.json();
        const found = data.find((item) =>
          String(item.id) === String(id)
        );
        if (!found) {
          throw new Error('Sản phẩm không tồn tại');
        }

        setProduct({
          ...found,
          image: imageMap[found.imageKey] || found.image
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, product]);

  if (isLoading) {
    return <div className="detail-container">Đang tải chi tiết sản phẩm...</div>;
  }

  if (error) {
    return <div className="detail-container">Lỗi: {error}</div>;
  }

  if (!product) {
    return null;
  }

  return (
    <div className="detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>

      <div className="detail-card">
        <div className="detail-image">
          <img
            src={product.image || 'https://via.placeholder.com/500x350'}
            alt={product.name}
          />
        </div>

        <div className="detail-info">
          <h2>{product.name}</h2>
          <p className="detail-price">
            <span className="current-price">{product.currentPrice}</span>
            {product.originalPrice && (
              <span className="original-price">{product.originalPrice}</span>
            )}
            {product.discount && <span className="discount">{product.discount}</span>}
          </p>

          <div className="detail-sizes">
            <button className="ram-ssd-tag">{product.sizeS}</button>
            <button className="ram-ssd-tag">{product.sizeM}</button>
            <button className="ram-ssd-tag">{product.sizeL}</button>
          </div>

          <div className="detail-meta">
            {product.rating && <span>⭐ {product.rating}</span>}
            {product.sold && <span>Đã bán {product.sold}</span>}
          </div>

          <button className="buy-now-button" onClick={() => {
            // Lấy giỏ hàng hiện tại từ localStorage
            const savedCart = localStorage.getItem('cart');
            const cart = savedCart ? JSON.parse(savedCart) : [];

            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
            const existingItemIndex = cart.findIndex(item => item.id === product.id);

            if (existingItemIndex >= 0) {
              // Nếu đã có, tăng số lượng
              cart[existingItemIndex].quantity += 1;
            } else {
              // Nếu chưa có, thêm mới với quantity = 1
              cart.push({
                ...product,
                quantity: 1
              });
            }

            // Lưu lại vào localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            // Thông báo cho Header (và các component khác) cập nhật số lượng giỏ hàng
            window.dispatchEvent(new Event('cartUpdated'));

            // Chuyển đến trang giỏ hàng
            navigate('/cart');
          }}>
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailProduct;
