
import React, { useState } from 'react';
import styles from './CartItem.module.css';
import semImagem from '../assets/ProdutoSemImagem/semimagem.png';
import { getImageUrl } from '../services/api';

const CartItem = ({ product, quantity, onIncrease, onDecrease, onRemove }) => {
  const [imgSrc, setImgSrc] = useState(
    product.imagens?.[0]?.url 
      ? getImageUrl(product.imagens[0].url) 
      : semImagem
  );

  const handleImageError = () => {
    setImgSrc(semImagem);
  };

  const categoryDisplay = product.categoria?.nome || product.descricao_curta || 'Produto';
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img
          src={imgSrc}
          alt={product.nome}
          className={styles.img}
          onError={handleImageError}
        />
      </div>
      <div className={styles.itemInfo}>
        <div className={styles.topSection}>
          <span className={styles.name}>{product.nome}</span>
          <button className={styles.removeBtn} onClick={onRemove} aria-label={`Remover ${product.nome}`}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="11" fill="transparent"/>
              <path d="M7.5 7.5L14.5 14.5" stroke="#B0B0B0" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14.5 7.5L7.5 14.5" stroke="#B0B0B0" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className={styles.middleSection}>
          <span className={styles.category}>{categoryDisplay}</span>
        </div>
        <div className={styles.bottomSection}>
          <div className={styles.priceArea}>
            <span className={styles.price}>R$ {Number(product.preco_venda).toFixed(2)}</span>
            <span className={styles.installments}>ou 3x de R$ {(Number(product.preco_venda * quantity / 3).toFixed(2))}</span>
          </div>
          <div className={styles.quantityArea}>
            <button className={styles.qtyBtn} onClick={onDecrease} disabled={quantity <= 1} aria-label="Diminuir quantidade">-</button>
            <span className={styles.qty}>{quantity}</span>
            <button className={styles.qtyBtn} onClick={onIncrease} aria-label="Aumentar quantidade">+</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
