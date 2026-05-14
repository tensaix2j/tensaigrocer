
"use client";

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
} from 'react'
import {
  cartReducer,
  initialState,
  type CartAction,
  type CartState,
} from '../reducer/cartReducer'

/* =========================
   CONTEXT
========================= */

type CartContextType = {
  state: CartState
  dispatch: React.Dispatch<CartAction>
}

const CartContext = createContext<CartContextType | null>(
  null
)

/* =========================
   PROVIDER
========================= */

export function CartProvider({
  children,
}: {
  children: ReactNode
}) {
  const [state, dispatch] = useReducer(
    cartReducer,
    initialState
  )

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}

/* =========================
   CUSTOM HOOK
========================= */

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider'
    )
  }

  return context
}
