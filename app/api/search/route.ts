

import clientPromise from "../../lib/mongodb";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url)
	
	const skip	= Number(searchParams.get("skip") || 0);
	const limit	= Number(searchParams.get("limit") || 20);
	const query = searchParams.get("q") || ""

	const client = await clientPromise
	const db = client.db("groceries_db");

	const results = await db.collection("Groceries").aggregate([
        {
            $search: {
                index: "groceries_index",
                text: {
                    query,
                    path: ["name","category"]
                }
            }
        },{
            $skip: skip
        },{
            $limit: limit
        }
    ]).toArray()

    console.log("Results count", results.length );
    
    return Response.json(results)
}
