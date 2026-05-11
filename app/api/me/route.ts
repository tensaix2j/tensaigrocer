


import { cookies } from "next/headers"

import { NextResponse } from "next/server"
import { verifyToken } from "../../lib/jwt"
import clientPromise from "../../lib/mongodb"
import { ObjectId } from "mongodb"
export async function GET() {
    try {
        const token = (await cookies()).get("token")?.value

        if (!token) {
            return NextResponse.json({ user: null }, { status: 401 })
        }

        const decoded: any = verifyToken(token)

        const client = await clientPromise
        const db = client.db("groceries_db")

        const user = await db.collection("users").findOne({
            _id: new ObjectId( decoded.userId ),
        })

        console.log( "Logged in user" , token, decoded.userId, user );

        return NextResponse.json({
            user: {
                id: user?._id,
                email: user?.email,
                firstName: user?.firstName,
            },
        })

    } catch (err) {
        return NextResponse.json(
            { user: null },
            { status: 401 }
        )
    }
}