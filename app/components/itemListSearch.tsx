
'use client'
import React from 'react'
import { useEffect, useState, useRef } from "react";
import  ItemCard from "./itemCard"
import type { GroceryItem } from "../types";

type ItemListSearchProps = {
  query: string;
};

const ItemListSearch = ({ query }: ItemListSearchProps) => {

	const [items, setItems] 	= useState<GroceryItem[]>([]);
  	const [loading, setLoading] = useState(false);
	const loaderRef 			= useRef<HTMLDivElement | null>(null);
	const [hasMore, setHasMore] = useState(true);
    const page 		            = useRef(1);
	
	//---------------
	async function loadMore() {
		
        if (loading || !hasMore) return;
        setLoading(true);

        console.log("itemListSearch.tsx", "loadMore", page.current, items.length , query );

        let skip = page.current * 20;
		const res = await fetch(
			`/api/search?q=${ query }&skip=${skip}`
		);

		const data = (await res.json()) as GroceryItem[];
        
        if ( data.length === 0) {
            setHasMore(false); // 
            setLoading(false);
            return;
        }
        if ( data.length < 20 ) {
            setHasMore(false);
        }

		setItems((prev) => [...prev, ...data]);
		page.current += 1;
        setLoading(false);
	}
	
    //------------------
    useEffect(() => {

        console.log("itemListSearch.tsx", "query: ", query, "triggers useState" );
        setItems([]);
        page.current = 0;
        setHasMore(true);
        setLoading( false);

    }, [ query ] );
    
	//---------------
	useEffect(() => {

        console.log("itemListSearch.tsx", "useEffect");

		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && !loading && hasMore ) {
                console.log("itemListSearch.tsx", "IntersectionObserver", "going to loadMore", "current query", query );
				loadMore();
			}
		},
        {
            root: null,
            rootMargin: "300px",
            threshold: 0,
        });

		if (loaderRef.current) observer.observe(loaderRef.current);

		return () => observer.disconnect();

	}, [ hasMore, query ]);

    
	
    //console.log( "itemListSearch.tsx", items.length );


	return (
		<>
		{ items.map( ( item )=> (
			<ItemCard item={item} key={ item._id } />
		))}
        { hasMore && (
            <>
		    <div ref={loaderRef} className="h-10" />
            <div className="w-full flex flex-col items-center">
			    {loading && <div className="text-gray-900 px-2 py-4 rounded-xl">Loading...</div>}
		    </div>
            </>
        )}

		{!hasMore && (
            <div className="w-full flex text-gray-500 flex-col items-center">
                --- End of List ---
            </div>
        )}

		</>
	)
}

export default ItemListSearch
