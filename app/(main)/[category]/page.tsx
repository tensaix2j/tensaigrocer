
import React from 'react'
import clientPromise from "../../lib/mongodb";
import { decode } from "html-entities";
import ItemList from "../../components/itemList";

const Category = async ({ params }) => {
    
    const category = ( await params ).category;
    const page = 1;
    const limit = 20;

    const client = await clientPromise;
    const db = client.db("groceries_db");
    const items = await db
                    .collection("Groceries")
                    .find({ category: decodeURIComponent( category ) })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .toArray();

    const safeItems = items.map((item) => ({
        ...item,
        _id: item._id.toString(), // convert ObjectId → string
    }));                
                        
    return (
        <div>
            <div className="p-2 font-bold">{ decode( decodeURIComponent( category )) }</div>
            <hr className="mb-2 -ml-2 w-full text-gray-400" />
            <div className="flex flex-wrap gap-2">
                
                <ItemList initialItems={safeItems} category={category} />
            </div>

        
        </div>
    )
}

export default Category