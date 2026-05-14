import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import './cart.css';
import semImagem from '../assets/ProdutoSemImagem/semimagem.png';
import { getImageUrl } from '../services/api';
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

  const getProductPrice = (product) => Number(product.preco_venda ?? product.preco ?? 0) || 0;

  const getProductImage = (product) => (
    product.imagens?.[0]?.url ? getImageUrl(product.imagens[0].url) : semImagem
  );

  const subtotal = displayItems.reduce((total, item) => {
    const price = getProductPrice(item.product);
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

  const buildWhatsAppMessage = () => {
    const productLines = displayItems.map(({ product, quantity }) => {
      const itemTotal = getProductPrice(product) * quantity;
      return `* ${product.nome} (${quantity}x) - R$ ${formatPrice(itemTotal)}`;
    });

    return [
      'Olá! Gostaria de fazer um pedido:',
      '',
      ...productLines,
      '',
      `Total: R$ ${formatPrice(total)}`,
      '',
      'Meu nome:',
      'Meu telefone:',
    ].join('\n');
  };

  const handleCheckoutWhatsApp = () => {
    if (displayItems.length === 0) return;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(buildWhatsAppMessage())}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      <Header />
      <main>
        <div className="cart-container">
          <div className="cart-items">
            <div className="cart-header">
              <h2>Seu Carrinho</h2>
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
                    src={getProductImage(product)}
                    alt={product.nome}
                    onError={(event) => {
                      event.currentTarget.src = semImagem;
                    }}
                  />
                </div>
                <div className="item-info">
                  <div>
                    <Link to={`/produto/${product.id}`} className="item-title">{product.nome}</Link>
                  </div>
                  <div className="item-actions">
                    <button type="button" onClick={() => removeFromCart(product.id)}>Excluir</button>
                  </div>
                </div>

                <div className="item-qty-selector">
                  <button type="button" onClick={() => handleDecrease(product.id)} disabled={quantity <= 1}>-</button>
                  <input type="number" value={quantity} readOnly />
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
            <button className="btn-checkout" type="button" onClick={handleCheckoutWhatsApp} disabled={displayItems.length === 0}>
              Continuar compra
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CartPage;
