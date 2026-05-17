



import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from 'mongodb'
import path from "path";

import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;

const projectDir = path.resolve(process.cwd(), "..");

loadEnvConfig(projectDir);

console.log( process.env.MONGODB_URI );
const MONGODB_URI = process.env.MONGODB_URI



//--------------------------------
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient( MONGODB_URI, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	}
});


async function run() {
	try {
	
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		
		const db = client.db("groceries_db"); 
		const results = await db.collection("orders").find(
			{}
		).toArray();
        
		console.log( results , results.length );
		
		
	} finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	}
}


//--------------------------------
run().catch(console.dir);

