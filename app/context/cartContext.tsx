
"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useReducer,
  ReactNode,
} from 'react'
import { useAuth } from './authContext'
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
  hydratePendingCart: () => Promise<boolean>
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
  const { user } = useAuth()
  const [state, dispatch] = useReducer(
    cartReducer,
    initialState
  )

  const hydratePendingCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart/pending', {
        cache: 'no-store',
      })

      if (res.status === 401 || res.status === 404) {
        return false
      }

      const data = await res.json()

      if (!res.ok || !Array.isArray(data.items)) {
        return false
      }

      dispatch({
        type: 'SET_ITEMS',
        payload: data.items,
      })
      return data.items.length > 0
    } catch (error) {
      console.error('Pending cart hydration failed:', error)
      return false
    }
  }, [])

  useEffect(() => {
    if (!user) {
      dispatch({ type: 'CLEAR_CART' })
      return
    }

    hydratePendingCart()
  }, [hydratePendingCart, user])

  return (
    <CartContext.Provider value={{ state, dispatch, hydratePendingCart }}>
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
