import styles from './ProductDetailsCard.module.css';

function ProductDetailsCard({ product }) {
  return (
    <section className={styles.detailsCard}>
      <div className={styles.row}>
        {/* Dimensões do produto */}
        {(product.altura || product.largura || product.profundidade || product.peso) && (
          <div className={styles.group}>
            <h3>Dimensões</h3>
            <ul>
              {product.altura && <li>Altura: {product.altura} cm</li>}
              {product.largura && <li>Largura: {product.largura} cm</li>}
              {product.profundidade && <li>Profundidade: {product.profundidade} cm</li>}
              {product.peso && <li>Peso: {product.peso} kg</li>}
            </ul>
          </div>
        )}
        
        {/* Estoque */}
        {product.estoque_atual !== undefined && (
          <div className={styles.group}>
            <h3>Disponibilidade</h3>
            <p>
              {product.estoque_atual > 0 
                ? `${product.estoque_atual} em estoque` 
                : 'Fora de estoque'}
            </p>
          </div>
        )}
      </div>

      {/* Materiais (se existir) */}
      {product.materials && (
        <div className={styles.group}>
          <h3>Materiais</h3>
          <ul>
            {product.materials.map((material) => (
              <li key={material}>{material}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Significado (se existir) */}
      {product.meaning && (
        <div className={styles.group}>
          <h3>Significado</h3>
          <p>{product.meaning}</p>
        </div>
      )}

      {/* Informação de presente (se existir) */}
      {product.gift && (
        <div className={styles.group}>
          <h3>Presente</h3>
          <p>{product.gift}</p>
        </div>
      )}
    </section>
  );
}

export default ProductDetailsCard;
