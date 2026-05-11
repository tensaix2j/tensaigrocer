'use client'

import React from 'react'
import clientPromise from "../../lib/mongodb";
import { decode } from "html-entities";
import ItemListSearch from "../../components/itemListSearch";
import { useSearchParams } from "next/navigation";

const Search = () => {
    
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    console.log("/search/page.tsx");

    return (
        <div>
            <div className="p-2 font-bold">Searched: { query }</div>
            <hr className="mb-2 -ml-2 w-full text-gray-400" />
            <div className="flex flex-wrap gap-2">
                
                <ItemListSearch query={query} />
            </div>

        
        </div>
    )
}

export default Search