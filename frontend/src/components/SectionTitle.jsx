import styles from './SectionTitle.module.css';

function SectionTitle({ title, description }) {
  return (
    <div className={styles.sectionTitle}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export default SectionTitle;
