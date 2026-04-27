import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { getProductById, getRelatedProducts } from '../utils/productUtils';
import Header from '../components/Header';
import ProductDetailsCard from '../components/ProductDetailsCard';
import RelatedProducts from '../components/RelatedProducts';
import Footer from '../components/Footer';
import styles from './ProductPage.module.css';

function ProductPage() {
  const { id } = useParams();
  const product = useMemo(() => getProductById(PRODUCTS, id), [id]);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    setActiveImage(product?.images?.[0] ?? '');
  }, [product]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Tres Pescadores`;
    }
  }, [product]);

  if (!product) {
    return (
      <div className={styles.notFound}>
        <Header />
        <main className={styles.productMain}>
          <p>Produto não encontrado.</p>
          <Link to="/">Voltar ao início</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedProducts = useMemo(() => getRelatedProducts(PRODUCTS, product), [product]);

  return (
    <div>
      <Header />

      <main className={styles.productMain}>
        <div className={styles.backLink}>
          <Link to="/">← Voltar</Link>
        </div>

        <section className={styles.productLayout}>
          <div className={styles.imageColumn}>
            <div className={styles.mainImage}>
              <img src={activeImage} alt={product.name} />
            </div>

            <div className={styles.thumbnailRow}>
              {product.images.map((image) => (
                <button
                  key={image}
                  type="button"
                  className={`${styles.thumbnailButton} ${activeImage === image ? styles.active : ''}`}
                  onClick={() => setActiveImage(image)}
                >
                  <img src={image} alt={product.name} />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.detailsColumn}>
            <span className={styles.productCategory}>{product.category}</span>
            <h1>{product.name}</h1>
            <p className={styles.productPrice}>{product.price}</p>
            <p className={styles.productDescription}>{product.description}</p>
            <ProductDetailsCard product={product} />
          </div>
        </section>

        <RelatedProducts products={relatedProducts} />
      </main>

      <Footer />
    </div>
  );
}

export default ProductPage;
