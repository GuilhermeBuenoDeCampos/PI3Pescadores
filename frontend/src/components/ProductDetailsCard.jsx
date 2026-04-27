import styles from './ProductDetailsCard.module.css';

function ProductDetailsCard({ product }) {
  return (
    <section className={styles.detailsCard}>
      <div className={styles.row}>
        <div className={styles.group}>
          <h3>Materiais</h3>
          <ul>
            {product.materials.map((material) => (
              <li key={material}>{material}</li>
            ))}
          </ul>
        </div>
        <div className={styles.group}>
          <h3>Significado</h3>
          <p>{product.meaning}</p>
        </div>
      </div>
      <div className={styles.group}>
        <h3>Presente</h3>
        <p>{product.gift}</p>
      </div>
    </section>
  );
}

export default ProductDetailsCard;
