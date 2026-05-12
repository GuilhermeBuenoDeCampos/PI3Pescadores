import styles from './CategoryFilter.module.css';

function CategoryFilter({ categories, activeCategory, onChange }) {
  return (
    <div className={styles.filterBar}>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          aria-pressed={activeCategory === category}
          className={`${styles.filterButton} ${activeCategory === category ? styles.active : ''}`}
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
