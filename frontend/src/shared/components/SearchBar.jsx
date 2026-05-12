import styles from './SearchBar.module.css';

function SearchBar({ value, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className={styles.searchForm} noValidate>
      <label htmlFor="search-input" className={styles.visuallyHidden}>
        Buscar produtos
      </label>
      <input
        id="search-input"
        type="search"
        placeholder="Buscar produtos..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={styles.searchInput}
      />
      <button type="submit" className={styles.filterButton}>
        Filtrar
      </button>
    </form>
  );
}

export default SearchBar;
