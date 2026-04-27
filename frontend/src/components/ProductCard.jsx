import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';

function ProductCard({ product }) {
  return (
    <Link to={`/produto/${product.id}`} className={styles.card}>
      <img 
        src={product.imagens?.[0]?.url || 'https://via.placeholder.com/300'} 
        alt={product.nome} 
        className={styles.image} 
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
