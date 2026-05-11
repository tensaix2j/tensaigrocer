// app/api/login/route.ts

import clientPromise from "../../lib/mongodb"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { signToken } from "../../lib/jwt"

export async function POST(req: Request) {
    try {
        const client = await clientPromise
        const db = client.db("groceries_db")

        const body = await req.json()
        const { email, password } = body

        // -----------------------------
        // Validation
        // -----------------------------
        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            )
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: "Invalid email format" },
                { status: 400 }
            )
        }

        // -----------------------------
        // Find user
        // -----------------------------
        const user = await db.collection("users").findOne({ email })

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            )
        }

        // -----------------------------
        // Compare password
        // -----------------------------
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        )

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            )
        }


        // -----------------------------
        // CREATE JWT TOKEN
        // -----------------------------
        const token = signToken({
            userId: user._id,
            email: user.email,
        })


        // -----------------------------
        // Success (NEVER return password)
        // -----------------------------
        const response = NextResponse.json(
            {
                message: "Login successful",
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    mobile: user.mobile,
                },
            },
            { status: 200 }
        )
        response.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            //secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        })
        return response

    } catch (error) {
        console.error("Login error:", error)

        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}
