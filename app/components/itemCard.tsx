
import React from 'react'
import { decode } from "html-entities";
import type { GroceryItem } from "../types";

type ItemCardProps = {
  item: GroceryItem;
};

const ItemCard = ({ item }: ItemCardProps) => {
  return (
    <>
        <div className="card min-w-[40vw] md:min-w-[200px] w-48/100 md:w-40 bg-base-100 shadow-xl" key={item._id}>
            <div className="card-body p-2 flex flex-col">
                <div className="min-h-[40px]"><h3 className="card-title text-sm">{ decode( item.name ) }</h3></div>
                <div className="flex-1"><img className="dark:rounded-xl" src={ item.image_url } /></div>
                <div className="text-xs text-green-900 dark:text-green-200">{ item.size }</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">${ item.price }</div>
                <div className="text-[10px] text-blue-900 dark:text-cyan-200">{ item.source }</div>
                
            </div>
        </div>
    </>
  )
}

export default ItemCard
