import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';
import semImagem from '../../assets/ProdutoSemImagem/semimagem.png';
import { getImageUrl } from '../services/api';
import { formatPrice } from '../utils/productUtils';

// Utility function to generate slug (matches backend implementation)
function generateSlug(nome) {
  if (!nome || typeof nome !== 'string') return '';
  
  return nome
    .toLowerCase()
    .trim()
    .normalize('NFD')                          // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '')           // Remove accent marks
    .replace(/[^a-z0-9\s-]/g, '')              // Remove non-alphanumeric except spaces/hyphens
    .replace(/[\s_-]+/g, '-')                  // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '');                  // Remove leading/trailing hyphens
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