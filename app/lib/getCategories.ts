import { cache } from "react"
import clientPromise from "./mongodb";

export const getCategories = cache(async () => {
    
    const client = await clientPromise;
    const db = client.db("groceries_db");
    const categories = await db.collection("Groceries").distinct("category");
    
    return categories ;

})

