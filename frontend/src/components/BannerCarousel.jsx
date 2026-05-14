import { useState, useEffect, useCallback } from 'react';
import { getImageUrl } from '../services/api';
import { BANNER_IMAGES, getBannerImagePath } from '../constants/banner';
import styles from './BannerCarousel.module.css';

/**
 * BannerCarousel Component
 * 
 * Componente de carrossel automático com:
 * - Auto-play a cada 5 segundos
 * - Controles manuais (anterior/próximo)
 * - Indicadores de página interativos
 * - Tratamento robusto de erros de carregamento
 * - Responsivo para mobile e desktop
 * - Acessibilidade ARIA
 * 
 * @component
 * @returns {React.ReactElement} Banner carousel com múltiplas imagens
 */
function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const totalImages = BANNER_IMAGES.length;
  
  /**
   * Navega para a próxima imagem
   * Usa useCallback para evitar recriação a cada render
   */
  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
    setIsAutoPlay(false); // Pausar autoplay quando usuário interage
  }, [totalImages]);

  /**
   * Navega para a imagem anterior
   */
  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
    setIsAutoPlay(false);
  }, [totalImages]);

  /**
   * Salta diretamente para uma imagem específica
   */
  const handleDotClick = useCallback((index) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  }, []);

  /**
   * Auto-play: muda imagem a cada 5 segundos quando ativado
   * Pausa quando usuário interage ou ao detectar erro
   */
  useEffect(() => {
    if (!isAutoPlay || totalImages === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, totalImages]);

  /**
   * Retoma auto-play após 10 segundos de inatividade
   * Melhora UX permitindo volta ao modo automático
   */
  useEffect(() => {
    if (isAutoPlay) return;

    const timeout = setTimeout(() => {
      setIsAutoPlay(true);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isAutoPlay]);

  /**
   * Trata erro ao carregar imagem
   * Pula para próxima imagem válida se houver
   */
  const handleImageError = useCallback((index) => {
    handleNext();
  }, [handleNext]);

  const currentImage = BANNER_IMAGES[currentIndex];
  const imagePath = getBannerImagePath(currentImage.filename);
  const imageUrl = getImageUrl(imagePath);

  // Guard clause: protege contra array vazio
  if (totalImages === 0) {
    return (
      <div className={styles.carousel} aria-label="Carrossel de banner">
        <div className={styles.emptyState}>
          <p>Nenhuma imagem de banner disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={styles.carousel}
      aria-label="Carrossel de banner de produtos"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
      role="region"
    >
      {/* Container da imagem com fade transition */}
      <div className={styles.imageContainer}>
        <img
          key={currentIndex}
          src={imageUrl}
          alt={currentImage.alt}
          title={currentImage.title}
          className={styles.image}
          onError={() => handleImageError(currentIndex)}
          loading="lazy"
        />
      </div>

      {/* Botão Anterior - Navegação manual */}
      <button
        className={`${styles.navButton} ${styles.prevButton}`}
        onClick={handlePrev}
        aria-label="Imagem anterior"
        type="button"
      >
        <span>❮</span>
      </button>

      {/* Botão Próximo - Navegação manual */}
      <button
        className={`${styles.navButton} ${styles.nextButton}`}
        onClick={handleNext}
        aria-label="Próxima imagem"
        type="button"
      >
        <span>❯</span>
      </button>

      {/* Indicadores de página - Dots interativos */}
      <div className={styles.dotsContainer} role="tablist" aria-label="Seletores de página">
        {BANNER_IMAGES.map((image, index) => (
          <button
            key={image.id}
            className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Ir para ${image.title}`}
            aria-selected={index === currentIndex}
            role="tab"
            type="button"
          />
        ))}
      </div>

      {/* Informações da imagem - Acessibilidade visual */}
      <div className={styles.imageInfo} aria-live="polite">
        <span className={styles.counter}>{currentIndex + 1} / {totalImages}</span>
      </div>
    </div>
  );
}

export default BannerCarousel;
