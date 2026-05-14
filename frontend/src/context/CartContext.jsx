import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'tp_cart_v1';

const initialState = {
  items: [],
};

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items)) return parsed;
    return initialState;
  } catch (err) {
    console.error('Failed to load cart from storage', err);
    return initialState;
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.items.find(item => item.product.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(item =>
            item.product.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: 1 }],
      };
    }
    case 'DECREASE_QUANTITY': {
      return {
        ...state,
        items: state.items
          .map(item =>
            item.product.id === action.productId
              ? { ...item, quantity: Math.max(0, item.quantity - 1) }
              : item
          )
          .filter(item => item.quantity > 0),
      };
    }
    case 'REMOVE_FROM_CART': {
      return {
        ...state,
        items: state.items.filter(item => item.product.id !== action.productId),
      };
    }
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, () => loadInitialState());

  // Carrinho é local ao navegador; não há reserva de estoque até o pedido ser enviado.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save cart to storage', err);
    }
  }, [state]);

  const addToCart = product => dispatch({ type: 'ADD_TO_CART', product });
  const decreaseQuantity = productId => dispatch({ type: 'DECREASE_QUANTITY', productId });
  const removeFromCart = productId => dispatch({ type: 'REMOVE_FROM_CART', productId });

  return (
    <CartContext.Provider value={{ cart: state, addToCart, decreaseQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
