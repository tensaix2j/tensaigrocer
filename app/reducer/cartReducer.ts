/* =========================
   TYPES
========================= */

export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

export type CartState = {
  items: CartItem[]
}

export type CartAction =
  | {
      type: 'SET_ITEMS'
      payload: CartItem[]
    }
  | {
      type: 'ADD_ITEM'
      payload: Omit<CartItem, 'quantity'>
    }
  | {
      type: 'REMOVE_ITEM'
      payload: string // item id
    }
  | {
      type: 'INCREMENT_QTY'
      payload: string
    }
  | {
      type: 'DECREMENT_QTY'
      payload: string
    }
  | {
      type: 'CLEAR_CART'
    }

/* =========================
   INITIAL STATE
========================= */

export const initialState: CartState = {
  items: [],
}

/* =========================
   REDUCER
========================= */

export function cartReducer(
  state: CartState,
  action: CartAction
): CartState {
  switch (action.type) {
    case 'SET_ITEMS': {
      return {
        ...state,
        items: action.payload,
      }
    }

    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        item => item.id === action.payload.id
      )

      // If item already exists → increase quantity
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item
          ),
        }
      }

      // Add new item
      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.payload,
            quantity: 1,
          },
        ],
      }
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(
          item => item.id !== action.payload
        ),
      }
    }

    case 'INCREMENT_QTY': {
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        ),
      }
    }

    case 'DECREMENT_QTY': {
      return {
        ...state,
        items: state.items
          .map(item =>
            item.id === action.payload
              ? {
                  ...item,
                  quantity: item.quantity - 1,
                }
              : item
          )
          // remove item if qty becomes 0
          .filter(item => item.quantity > 0),
      }
    }

    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
      }
    }

    default:
      return state
  }
}
