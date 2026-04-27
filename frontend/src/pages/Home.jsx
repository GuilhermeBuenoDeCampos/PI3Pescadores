import { useMemo, useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import PriceFilter from '../components/PriceFilter';
import SectionTitle from '../components/SectionTitle';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { fetchProducts, fetchCategories } from '../services/api';
import { filterProducts, sortProductsByPrice } from '../utils/productUtils';
import styles from './Home.module.css';

function Home() {
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [sortOrder, setSortOrder] = useState('none'); // 'none', 'asc', 'desc'
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000); // Valor alto suficiente
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);
        
        setProducts(productsData);
        
        // Formata categorias para compatibilidade
        const formattedCategories = categoriesData.map(cat => cat.nome);
        setCategories(['Todos', ...new Set(formattedCategories)]);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = useMemo(
    () => {
      if (!products.length) return [];
      
      let filtered = products;
      
      // Filtro por categoria
      if (activeCategory !== 'Todos') {
        filtered = filtered.filter(p => p.categoria?.nome === activeCategory);
      }
      
      // Filtro por busca
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.nome.toLowerCase().includes(query) ||
          p.descricao?.toLowerCase().includes(query)
        );
      }
      
      // Filtro por preço
      filtered = filtered.filter(p => p.preco_venda >= minPrice && p.preco_venda <= maxPrice);
      
      // Ordenação por preço
      if (sortOrder === 'asc') {
        filtered = sortProductsByPrice(filtered, true);
      } else if (sortOrder === 'desc') {
        filtered = sortProductsByPrice(filtered, false);
      }
      
      return filtered;
    },
    [products, activeCategory, searchQuery, minPrice, maxPrice, sortOrder]
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

            <PriceFilter
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
            />
          </div>

          <SectionTitle
            title="Catálogo de artigos religiosos"
            description="Descubra terços, bíblias e imagens com acabamento elegante e espírito sereno."
          />

          <div className={styles.productGrid}>
            {loading ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Carregando produtos...</p>
            ) : error ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'red' }}>
                Erro ao carregar produtos: {error}
              </p>
            ) : filteredProducts.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                Nenhum produto encontrado
              </p>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
