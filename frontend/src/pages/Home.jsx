import { useMemo, useState } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import SectionTitle from '../components/SectionTitle';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { PRODUCTS } from '../data/products';
import { filterProducts, getProductCategories } from '../utils/productUtils';
import styles from './Home.module.css';

function Home() {
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const categories = useMemo(() => getProductCategories(PRODUCTS), []);

  const filteredProducts = useMemo(
    () => filterProducts(PRODUCTS, activeCategory, searchQuery),
    [activeCategory, searchQuery]
  );

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearchQuery(searchText);
  }

  return (
    <div>
      <Header />

      <main className={styles.homeMain}>
        <section className={styles.heroSection}>
          <div className={styles.heroText}>
            <span className={styles.heroBadge}>Linha especial</span>
            <h1>Artigos religiosos para fé e devoção</h1>
            <p>
              Produtos selecionados com cuidado, inspirados no clássico, para enriquecer o seu altar
              e seus momentos espirituais.
            </p>
          </div>

          <div className={styles.heroImageWrapper}>
            <img
              src="https://images.unsplash.com/photo-1521863453002-3ea1347aa3c0?auto=format&fit=crop&w=900&q=80"
              alt="Banner principal de artigos religiosos"
            />
          </div>
        </section>

        <section id="catalog" className={styles.catalogSection}>
          <div className={styles.controls}>
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              onSubmit={handleSearchSubmit}
            />

            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onChange={setActiveCategory}
            />
          </div>

          <SectionTitle
            title="Catálogo de artigos religiosos"
            description="Descubra terços, bíblias e imagens com acabamento elegante e espírito sereno."
          />

          <div className={styles.productGrid}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
