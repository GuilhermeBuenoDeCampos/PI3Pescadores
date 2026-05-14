import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import './cart.css';
import { formatPrice } from '../utils/productUtils';

function CartPage() {
  const { cart, removeFromCart, clearCart, addToCart, decreaseQuantity } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Usar itens do cart
  const displayItems = Array.isArray(cart.items) ? cart.items : [];

  const handleIncrease = (product) => {
    addToCart(product);
  };

  const handleDecrease = (productId) => {
    decreaseQuantity(productId);
  };

  const subtotal = displayItems.reduce((total, item) => {
    const price = Number(item.product.preco_venda ?? item.product.preco ?? 0) || 0;
    return total + price * item.quantity;
  }, 0);

  const shipping = 0; // Frete grátis no momento
  const total = subtotal + shipping - couponDiscount;
  
  const totalItems = displayItems.reduce((total, item) => total + item.quantity, 0);
  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'desc10') {
      setCouponDiscount(subtotal * 0.1);
      alert('Cupom aplicado com 10% de desconto!');
    } else {
      alert('Cupom inválido');
      setCouponDiscount(0);
    }
  };

  return (
    <div>
      <Header />
      <main>
        <div className="cart-container">
          <div className="cart-items">
            <div className="cart-header">
              <h2>Seu Carrinho</h2>
              <div className="cart-header-sub">Resumo dos itens adicionados — revise antes de finalizar.</div>
            </div>

            {displayItems.length === 0 && (
              <div className="cart-empty">
                <p>Seu carrinho está vazio.</p>
                <Link to="/">Voltar ao catálogo</Link>
              </div>
            )}

            {displayItems.map(({ product, quantity }) => (
              <div className="cart-item" key={product.id}>
                <div className="item-img-box">
                  <img
                    src={product.imagens?.[0]?.url ? (product.imagens[0].url.startsWith('http') ? product.imagens[0].url : `/api/images/${product.imagens[0].url}`) : 'https://via.placeholder.com/160'}
                    alt={product.nome}
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/160')}
                  />
                </div>
                <div className="item-info">
                  <div>
                    <Link to={`/produto/${product.id}`} className="item-title">{product.nome}</Link>
                    <div className="item-seller">SKU: {product.id} • {product.categoria?.nome || '—'}</div>
                  </div>
                  <div className="item-actions">
                    <button type="button" className="btn-link" onClick={() => removeFromCart(product.id)}>Remover</button>
                    <button type="button" className="btn-link" onClick={() => { setCouponCode(''); }}>Salvar para depois</button>
                  </div>
                </div>

                <div className="item-qty-selector modern">
                  <button type="button" onClick={() => handleDecrease(product.id)} disabled={quantity <= 1}>−</button>
                  <input type="number" value={quantity} readOnly aria-label={`Quantidade de ${product.nome}`} />
                  <button type="button" onClick={() => handleIncrease(product)}>+</button>
                </div>

                <div className="item-price-box">
                  <span className="current-price">R$ {formatPrice(product.preco_venda ?? product.preco)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3 className="summary-title">Resumo da compra</h3>
            <div className="summary-item">
              <span>Produtos ({totalItems})</span>
              <span>R$ {formatPrice(subtotal)}</span>
            </div>
            <div className="summary-item total">
              <span>Total</span>
              <span>R$ {formatPrice(total)}</span>
            </div>
            <button className="btn-checkout">Continuar compra</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CartPage;
