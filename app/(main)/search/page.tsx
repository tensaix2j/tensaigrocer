import React from 'react'
import ItemListSearch from "../../components/itemListSearch";

type SearchProps = {
    searchParams: Promise<{
        q?: string | string[];
    }>;
};

const Search = async ({ searchParams }: SearchProps) => {
    const params = await searchParams;
    const rawQuery = params.q;
    const query = Array.isArray(rawQuery) ? rawQuery[0] ?? "" : rawQuery ?? "";

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
