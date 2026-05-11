import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const skip        = Number(searchParams.get("skip") || 0);
  const limit       = Number(searchParams.get("limit") || 20);
  const category    = decodeURIComponent( searchParams.get("category") ) ;

  let condition = {};
  if ( category != null ) {
    condition["category"] = category 
  }
  
  const client = await clientPromise;
  const db = client.db("groceries_db");

  const items = await db
    .collection("Groceries")
    .find( condition )
    .skip(skip)
    .limit(limit)
    .toArray();

  return NextResponse.json(items);
}
