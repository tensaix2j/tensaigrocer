'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { GroceryItem } from '../types';
import ItemCard from './itemCard';

const ItemListRandom = ({}) => {
    
    const [items, setItems] = useState<GroceryItem[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        
        try {
            const res = await fetch(
                `/api/groceries_rnd?limit=24`
            );

            const data = (await res.json()) as GroceryItem[];

            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading( false );
        }
    }

    useEffect(() => {
        console.log('ItemCarousel.tsx useEffect');

        load();
    }, []);

    return (
        <>
            <div className="flex flex-row gap-2 flex-wrap">
            {items.map((item) => (
                <ItemCard item={item} key={item._id} />
            ))}
            </div>
            <div className="w-full flex flex-col items-center">
			    {loading && <div className="text-gray-900 px-2 py-4 rounded-xl">Loading...</div>}
		    </div>
        </>
    );
};

export default ItemListRandom;
