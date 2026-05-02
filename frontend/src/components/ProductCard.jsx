import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';
import semImagem from '../assets/ProdutoSemImagem/semimagem.png';
import { getImageUrl } from '../services/api';

function ProductCard({ product }) {
  const [imgSrc, setImgSrc] = useState(product.imagens?.[0]?.url ? getImageUrl(product.imagens[0].url) : semImagem);

  return (
    <Link to={`/produto/${product.id}`} className={styles.card}>
      <img 
        src={imgSrc} 
        alt={product.nome} 
        className={styles.image}
        onError={() => setImgSrc(semImagem)}
      />
      <div className={styles.info}>
        <span className={styles.category}>{product.categoria?.nome?.toUpperCase()}</span>
        <h3 className={styles.name}>{product.nome}</h3>
        <p className={styles.price}>R$ {product.preco_venda?.toFixed(2)}</p>
      </div>
    </Link>
  );
}

export default ProductCard;
