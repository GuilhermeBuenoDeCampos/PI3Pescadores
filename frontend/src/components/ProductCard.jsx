import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';

function ProductCard({ product }) {
  return (
    <Link to={`/produto/${product.id}`} className={styles.card}>
      <img src={product.images[0]} alt={product.name} className={styles.image} />
      <div className={styles.info}>
        <span className={styles.category}>{product.category.toUpperCase()}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>{product.price}</p>
      </div>
    </Link>
  );
}

export default ProductCard;
