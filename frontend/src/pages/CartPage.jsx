import { useCart } from '../context/CartContext';
import styles from './CartPage.module.css';

function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();

  return (
    <div className={styles.cartPage}>
      <h2>Carrinho de Compras</h2>
      {cart.items.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <>
          <ul className={styles.cartList}>
            {cart.items.map(({ product, quantity }) => (
              <li key={product.id} className={styles.cartItem}>
                <span>{product.nome}</span>
                <span>Qtd: {quantity}</span>
                <span>R$ {Number(product.preco_venda).toFixed(2)}</span>
                <button onClick={() => removeFromCart(product.id)}>Remover</button>
              </li>
            ))}
          </ul>
          <button className={styles.clearBtn} onClick={clearCart}>Limpar Carrinho</button>
        </>
      )}
    </div>
  );
}

export default CartPage;
