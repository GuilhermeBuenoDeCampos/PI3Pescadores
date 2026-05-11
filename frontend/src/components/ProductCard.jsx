import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';
import semImagem from '../assets/ProdutoSemImagem/semimagem.png';
import { getImageUrl } from '../services/api';
import { formatPrice } from '../utils/productUtils';

// Utility function to generate slug (matches backend implementation)
function generateSlug(nome) {
  return String(nome || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores/hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

function ProductCard({ product }) {
  const [imgSrc, setImgSrc] = useState(product.imagens?.[0]?.url ? getImageUrl(product.imagens[0].url) : semImagem);

  return (
    <Link to={`/produto-nome/${generateSlug(product.nome)}`} className={styles.card}>
      <img 
        src={imgSrc} 
        alt={product.nome} 
        className={styles.image}
        onError={() => setImgSrc(semImagem)}
      />
      <div className={styles.info}>
        <span className={styles.category}>{product.categoria?.nome?.toUpperCase()}</span>
        <h3 className={styles.name}>{product.nome}</h3>
        <p className={styles.price}>R$ {formatPrice(product.preco_venda)}</p>
      </div>
    </Link>
  );
}

export default ProductCard;