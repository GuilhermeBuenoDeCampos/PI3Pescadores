import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const initialState = {
  items: [], // { product, quantity }
};

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
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = product => dispatch({ type: 'ADD_TO_CART', product });
  const decreaseQuantity = productId => dispatch({ type: 'DECREASE_QUANTITY', productId });
  const removeFromCart = productId => dispatch({ type: 'REMOVE_FROM_CART', productId });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ cart: state, addToCart, decreaseQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
