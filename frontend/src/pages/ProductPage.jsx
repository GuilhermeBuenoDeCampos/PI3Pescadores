import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById, fetchProductByName, fetchProducts, getImageUrl } from '../services/api';

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

function ProductPage() {
<<<<<<< HEAD
  const { addToCart } = useCart ? useCart() : { addToCart: () => {} };
  const { id, nome } = useParams();
=======
  const { addToCart = () => {} } = useCart() || {};
  const { id } = useParams();
>>>>>>> 8d241cc (Atualização frontend)
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
<<<<<<< HEAD
        let productData;

        if (nome) {
          // Load by product name (slug)
          productData = await fetchProductByName(nome);
        } else {
          // Load by product ID
          productData = await fetchProductById(id);
        }

=======
        const productData = await fetchProductById(id);
        if (!productData) {
          throw new Error('Produto não encontrado');
        }
>>>>>>> 8d241cc (Atualização frontend)
        setProduct(productData);
        setActiveImage(productData.imagens?.[0]?.url ? getImageUrl(productData.imagens[0].url) : semImagem);
        setMainImgSrc(productData.imagens?.[0]?.url ? getImageUrl(productData.imagens[0].url) : semImagem);
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
        setError(err?.message || 'Falha ao carregar o produto');
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

  const productPrice = Number(product?.preco_venda ?? 0).toFixed(2);

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
          <Link to="/">← Voltar ao catálogo</Link>
        </div>

        <section className={styles.productHero}>
          <div className={styles.imageColumn}>
            <div className={styles.imageCard}>
              <img src={mainImgSrc} alt={product.nome} onError={() => setMainImgSrc(semImagem)} />
            </div>

            <div className={styles.thumbnailList}>
              {product.imagens?.map((imagem) => {
                const imgUrl = getImageUrl(imagem.url);
                return (
                  <button
                    key={imagem.id}
                    type="button"
                    className={`${styles.thumbnailButton} ${activeImage === imgUrl ? styles.active : ''}`}
                    onClick={() => {
                      setActiveImage(imgUrl);
                      setMainImgSrc(imgUrl);
                    }}
                  >
                    <img src={imgUrl} alt={`Miniatura de ${product.nome}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <aside className={styles.summaryCard}>
            <div className={styles.topMeta}>
              <span className={styles.productCategory}>{product.categoria?.nome}</span>
              <span className={styles.skuLabel}>SKU {product.id}</span>
            </div>

            <h1>{product.nome}</h1>
<<<<<<< HEAD
            <p className={styles.productPrice}>R$ {formatPrice(product.preco_venda)}</p>
            <p className={styles.productDescription}>{product.descricao}</p>
            <button className={styles.addToCartBtn} onClick={() => addToCart(product)}>
              Adicionar ao carrinho
            </button>
            <ProductDetailsCard product={product} />
=======

            <div className={styles.priceBlock}>
              <p className={styles.productPrice}>R$ {productPrice}</p>
              <span className={`${styles.stockPill} ${Number(product.estoque_atual) > 0 ? styles.stockIn : styles.stockOut}`}>
                {product.estoque_atual > 0 ? `${product.estoque_atual} em estoque` : 'Fora de estoque'}
              </span>
            </div>

            <p className={styles.shortDescription}>{product.descricao}</p>

            <div className={styles.productFacts}>
              <div className={styles.factItem}>
                <span>Categoria</span>
                <strong>{product.categoria?.nome || '—'}</strong>
              </div>
              <div className={styles.factItem}>
                <span>Disponibilidade</span>
                <strong>{product.estoque_atual > 0 ? 'Pronto para envio' : 'Sem estoque'}</strong>
              </div>
              {product.peso && (
                <div className={styles.factItem}>
                  <span>Peso</span>
                  <strong>{product.peso} kg</strong>
                </div>
              )}
            </div>

            {product.variacoes?.length > 0 && (
              <div className={styles.variationBlock}>
                <span className={styles.variationLabel}>Variações</span>
                <div className={styles.variationOptions}>
                  {product.variacoes.map((variation) => (
                    <button key={variation} type="button" className={styles.variationOption}>
                      {variation}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.actionGroup}>
              <button className={`${styles.btn} ${styles.primaryButton}`} onClick={() => addToCart(product)}>
                Adicionar ao carrinho
              </button>
              <Link
                to="/carrinho"
                className={`${styles.btn} ${styles.secondaryButton}`}
                onClick={() => addToCart(product)}
              >
                Comprar agora
              </Link>
            </div>

            <div className={styles.badgeGroup}>
              <span className={styles.badge}>Frete rápido</span>
              <span className={styles.badge}>Garantia de qualidade</span>
            </div>
          </aside>
        </section>

        <section className={styles.productDetailsSection}>
          <div className={styles.descriptionSection}>
            <h2>Descrição do produto</h2>
            <p>{product.descricao}</p>
>>>>>>> 8d241cc (Atualização frontend)
          </div>
          <aside className={styles.detailsSidebar}>
            <ProductDetailsCard product={product} />
          </aside>
        </section>

        <RelatedProducts products={relatedProducts} />
      </main>

      <Footer />
    </div>
  );
}

export default ProductPage;
