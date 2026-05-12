
import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

export async function GET(req: Request) {
  const client = await clientPromise;
  const db = client.db("groceries_db");

  const { searchParams } = new URL(req.url);
  
  const limit       = Number(searchParams.get("limit") || 20);

  const items = await db
    .collection("Groceries")
    .aggregate([
      { $sample: { size: limit } }
    ])
    .toArray();
  console.log( items.length );
  
  return NextResponse.json(items);
}
