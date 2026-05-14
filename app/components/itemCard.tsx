
import React from 'react'
import { decode } from "html-entities";
import type { GroceryItem } from "../types";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/cartContext";

type ItemCardProps = {
  item: GroceryItem;
};

const ItemCard = ({ item }: ItemCardProps) => {
  const { dispatch } = useCart();
  const price = Number(item.price) || 0;

  const handleAddToCart = () => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: item._id,
        name: decode(item.name),
        price,
        image: item.image_url,
      },
    });
  };

  return (
    <>
        <div className="card min-w-[40vw] md:min-w-[200px] w-48/100 md:w-40 bg-base-100 shadow-xl" key={item._id}>
            <div className="card-body p-2 flex flex-col">
                <div className="min-h-[40px]"><h3 className="card-title text-sm">{ decode( item.name ) }</h3></div>
                <div className="flex-1"><img className="dark:rounded-xl" src={ item.image_url } alt={decode(item.name)} /></div>
                <div className="text-xs text-green-900 dark:text-green-200">{ item.size }</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">${ price.toFixed(2) }</div>
                <div className="text-[10px] text-blue-900 dark:text-cyan-200">{ item.source }</div>
                
                <div><button className="btn w-full" onClick={handleAddToCart}><FaShoppingCart size={14} />Add to Cart</button></div>
                
            </div>
        </div>
    </>
  )
}

export default ItemCard
