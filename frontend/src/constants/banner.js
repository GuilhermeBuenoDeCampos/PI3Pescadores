/**
 * Banner Images Constants
 * 
 * Mantém todas as imagens do banner carousel em um único lugar
 * Facilita manutenção, atualização e escalabilidade
 * 
 * Convenção:
 * - Usar nomes em português que descrevam o conteúdo
 * - Arquivos devem estar em backend/uploads/Banner/
 * - Usar apenas caminho relativo (/uploads/Banner/nome.jpg)
 * - Nunca hardcoded localhost ou domínios
 */

export const BANNER_IMAGES = [
  {
    id: 'aparecida',
    filename: 'Aparecida.jpg',
    url: 'https://pi3pescadores.onrender.com/uploads/Banner/Aparecida.jpg',
    alt: 'Nossa Senhora Aparecida - Imagem do banner',
    title: 'Nossa Senhora Aparecida'
  },
  {
    id: 'crucifixo',
    filename: 'crucifixo.jpg',
    url: 'https://pi3pescadores.onrender.com/uploads/Banner/crucifixo.jpg',
    alt: 'Crucifixo - Imagem do banner',
    title: 'Crucifixo'
  },
  {
    id: 'barco',
    filename: 'barco.jpg',
    url: 'https://pi3pescadores.onrender.com/uploads/Banner/barco.jpg',
    alt: 'Barco dos Pescadores - Imagem do banner',
    title: 'Barco dos Pescadores'
  },
  {
    id: 'oratoria',
    filename: 'oratoria.jpg',
    url: 'https://pi3pescadores.onrender.com/uploads/Banner/oratoria.jpg',
    alt: 'Oratória - Imagem do banner',
    title: 'Oratória'
  },
  {
    id: 'rosario',
    filename: 'rosario.jpg',
    url: 'https://pi3pescadores.onrender.com/uploads/Banner/rosario.jpg',
    alt: 'Rosário - Imagem do banner',
    title: 'Rosário'
  },
  {
    id: 'kitoracao',
    filename: 'kitoracao.jpg',
    url: 'https://pi3pescadores.onrender.com/uploads/Banner/kitoracao.jpg',
    alt: 'Kit Oração - Imagem do banner',
    title: 'Kit Oração'
  }
];

/**
 * Get banner image URL
 * Construtor seguro de URLs para imagens do banner
 * 
 * @param {string} filename - Nome do arquivo
 * @returns {string} - Caminho relativo da imagem
 */
export const getBannerImagePath = (filename) => `/uploads/Banner/${filename}`;

export default BANNER_IMAGES;
