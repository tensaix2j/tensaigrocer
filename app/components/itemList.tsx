
'use client'
import React from 'react'
import { decode } from "html-entities";
import { useEffect, useState, useRef } from "react";
import  ItemCard from "./itemCard"


const ItemList = ({initialItems, category}) => {

	const [items, setItems] 	= useState(initialItems);
  	const [loading, setLoading] = useState(false);
	const loaderRef 			= useRef(null);
	const page 		            = useRef(1);
	
    const [hasMore, setHasMore] = useState(true);



	//---------------
	async function loadMore() {
		
        if (loading || !hasMore) return;
        setLoading(true);

        console.log("itemList.tsx", "loadMore", page.current, items.length );

        
        let skip = page.current * 20;
		const res = await fetch(
			`/api/groceries?category=${encodeURIComponent(category)}&skip=${skip}`
		);

		const data = await res.json();

        if ( data.length === 0) {
            setHasMore(false); // 🚨 stop future requests
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
	

	//---------------
	useEffect(() => {

        console.log("itemList.tsx", "useEffect");

		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && !loading && hasMore ) {
                
                console.log("itemList.tsx", "IntersectionObserver", "going to loadMore");
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

	}, [ loading, hasMore ]);
    
    //console.log("itemList.tsx", "init", items.length );

	
	return (
		<>
		{ items.map( ( item,i )=> (
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

export default ItemList