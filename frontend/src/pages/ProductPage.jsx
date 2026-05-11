import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById, fetchProducts, getImageUrl } from '../services/api';

import Header from '../components/Header';
import ProductDetailsCard from '../components/ProductDetailsCard';
import RelatedProducts from '../components/RelatedProducts';
import Footer from '../components/Footer';
import styles from './ProductPage.module.css';
import semImagem from '../assets/ProdutoSemImagem/semimagem.png';
import { useCart } from '../context/CartContext';
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

function ProductPage() {
  const { addToCart } = useCart ? useCart() : { addToCart: () => {} };
  const { id, nome } = useParams();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [mainImgSrc, setMainImgSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        let productData;

        if (nome) {
          // Load by product name (slug)
          const response = await fetch(`http://localhost:3000/api/produtos/nome/${encodeURIComponent(nome)}`);
          if (!response.ok) throw new Error('Produto não encontrado');
          const result = await response.json();
          productData = result.data;
        } else {
          // Load by product ID
          productData = await fetchProductById(id);
        }

        setProduct(productData);
        setActiveImage(productData.imagens?.[0]?.url ? getImageUrl(productData.imagens[0].url) : semImagem);
        setMainImgSrc(productData.imagens?.[0]?.url ? getImageUrl(productData.imagens[0].url) : semImagem);
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, nome]);

  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const productsData = await fetchProducts();
        setAllProducts(productsData);
      } catch (err) {
        console.error('Erro ao carregar produtos relacionados:', err);
      }
    };

    loadAllProducts();
  }, []);

  useEffect(() => {
    setMainImgSrc(activeImage);
  }, [activeImage]);

  useEffect(() => {
    if (product) {
      document.title = `${product.nome} | Tres Pescadores`;
    }
  }, [product]);

  if (loading) {
    return (
      <div className={styles.notFound}>
        <Header />
        <main className={styles.productMain}>
          <p>Carregando produto...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.notFound}>
        <Header />
        <main className={styles.productMain}>
          <p>{error ? `Erro: ${error}` : 'Produto não encontrado.'}</p>
          <Link to="/">Voltar ao início</Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Busca produtos relacionados da mesma categoria
  const relatedProducts = allProducts.filter(
    p => p.id !== product.id && p.categoria?.id === product.categoria?.id
  ).slice(0, 3);

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
              <img src={mainImgSrc} alt={product.nome} onError={() => setMainImgSrc(semImagem)} />
            </div>

            <div className={styles.thumbnailRow}>
              {product.imagens?.map((imagem) => (
                <button
                  key={imagem.id}
                  type="button"
                  className={`${styles.thumbnailButton} ${activeImage === getImageUrl(imagem.url) ? styles.active : ''}`}
                  onClick={() => {
                    const imgUrl = getImageUrl(imagem.url);
                    setActiveImage(imgUrl);
                    setMainImgSrc(imgUrl);
                  }}
                >
                  <img src={getImageUrl(imagem.url)} alt={product.nome} />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.detailsColumn}>
            <span className={styles.productCategory}>{product.categoria?.nome}</span>
            <h1>{product.nome}</h1>
            <p className={styles.productPrice}>R$ {formatPrice(product.preco_venda)}</p>
            <p className={styles.productDescription}>{product.descricao}</p>
            <button className={styles.addToCartBtn} onClick={() => addToCart(product)}>
              Adicionar ao carrinho
            </button>
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
