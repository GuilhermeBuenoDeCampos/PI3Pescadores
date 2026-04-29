import { useState, useEffect } from 'react';
import styles from './BannerCarousel.module.css';

const bannerImages = [
  'http://localhost:3000/uploads/Banner/Castical-Flor-Dourado-NSA.png',
  'http://localhost:3000/uploads/Banner/Crucifixo-Coracao-de-Jesus.png',
  'http://localhost:3000/uploads/Banner/Escultura-Tres-Pescadores.png',
  'http://localhost:3000/uploads/Banner/Mini-Oratorio-Branco-NSA.png',
  'http://localhost:3000/uploads/Banner/Mini-Oratorio-Dourado-NSA.png',
  'http://localhost:3000/uploads/Banner/NSA-Manto-Azul.png'
];

function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.carousel}>
      <img 
        src={bannerImages[currentIndex]} 
        alt="Banner" 
        className={styles.image}
        onError={(e) => {
          // If image fails to load, skip to next
          setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
        }}
      />
    </div>
  );
}

export default BannerCarousel;