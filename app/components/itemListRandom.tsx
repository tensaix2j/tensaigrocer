'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { GroceryItem } from '../types';
import ItemCard from './itemCard';

const ItemListRandom = ({}) => {
    
    const [items, setItems] = useState<GroceryItem[]>([]);
    const loading = useRef(false);

    async function load() {
        if (loading.current) return;

        loading.current = true;

        try {
        const res = await fetch(
            `/api/groceries_rnd?limit=20`
        );

        const data = (await res.json()) as GroceryItem[];

        setItems(data);
        } catch (err) {
        console.error(err);
        } finally {
        loading.current = false;
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
        </>
    );
};

export default ItemListRandom;
