"use client";

import React from 'react'
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { useCart } from "../context/cartContext";

type CartDrawerProps = {
    onCheckout: () => void;
};

const CartDrawer = ({ onCheckout }: CartDrawerProps) => {
    const { state, dispatch } = useCart();
    const subtotal = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    return (
    <div className="flex h-full flex-col p-3">
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Cart</h2>
                {state.items.length > 0 && (
                    <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => dispatch({ type: "CLEAR_CART" })}
                    >
                        Clear
                    </button>
                )}
            </div>

            {state.items.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-center text-sm text-gray-500 dark:text-gray-300">
                    Your cart is empty.
                </div>
            ) : (
                state.items.map((item) => (
                    <div
                        key={item.id}
                        className="flex gap-3 rounded-md bg-white p-2 shadow-sm dark:bg-zinc-900"
                    >
                        {item.image && (
                            <img
                                src={item.image}
                                alt={item.name}
                                className="h-16 w-16 rounded object-cover"
                            />
                        )}

                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">{item.name}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">
                                ${item.price.toFixed(2)}
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                                <button
                                    className="btn btn-square btn-xs"
                                    onClick={() =>
                                        dispatch({
                                            type: "DECREMENT_QTY",
                                            payload: item.id,
                                        })
                                    }
                                    aria-label={`Decrease ${item.name} quantity`}
                                >
                                    <FaMinus size={10} />
                                </button>
                                <span className="w-6 text-center text-sm">{item.quantity}</span>
                                <button
                                    className="btn btn-square btn-xs"
                                    onClick={() =>
                                        dispatch({
                                            type: "INCREMENT_QTY",
                                            payload: item.id,
                                        })
                                    }
                                    aria-label={`Increase ${item.name} quantity`}
                                >
                                    <FaPlus size={10} />
                                </button>
                                <button
                                    className="btn btn-square btn-ghost btn-xs ml-auto"
                                    onClick={() =>
                                        dispatch({
                                            type: "REMOVE_ITEM",
                                            payload: item.id,
                                        })
                                    }
                                    aria-label={`Remove ${item.name} from cart`}
                                >
                                    <FaTrash size={11} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
        <div className="h-[1px] w-full bg-gray-400 my-2"></div>
            
        <div className="flex flex-row gap-4 items-center justify-between mb-10">
            <div>
                Sub Total ${subtotal.toFixed(2)}
            </div>
            <div>
                <button
                    className="btn btn-primary"
                    onClick={onCheckout}
                    disabled={state.items.length === 0}
                >
                    Check Out
                </button>
                
            </div>
        </div>
    </div>
  )
}

export default CartDrawer
