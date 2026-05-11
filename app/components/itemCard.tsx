
import React from 'react'
import { decode } from "html-entities";

const ItemCard = ( {item} ) => {
  return (
    <>
        <div className="card min-w-[200px] w-48/100 md:w-40 bg-base-100 shadow-xl" key={item._id}>
            <div className="card-body p-2 flex flex-col">
                <div><h3 className="card-title text-sm">{ decode( item.name ) }</h3></div>
                <div className="flex-1"><img src={ item.image_url } /></div>
                <div className="text-xs text-green-900">{ item.size }</div>
                <div className="text-sm text-gray-500">${ item.price }</div>
                <div className="text-[10px] text-blue-900">{ item.source }</div>
                
            </div>
        </div>
    </>
  )
}

export default ItemCard