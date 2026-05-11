// app/api/signup/route.ts

import clientPromise from "../../lib/mongodb"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const client = await clientPromise
        const db = client.db("groceries_db")

        const body = await req.json()
        const { firstName, lastName, email, mobile, password } = body

        // -----------------------------
        // Validation
        // -----------------------------
        if (!firstName || !lastName || !email || !mobile || !password) {
            return NextResponse.json(
                { message: "All fields are required" },
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

        const mobileRegex = /^[0-9]{8,15}$/
        if (!mobileRegex.test(mobile)) {
            return NextResponse.json(
                { message: "Invalid mobile number" },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        // -----------------------------
        // Check existing user
        // -----------------------------
        const existingUser = await db.collection("users").findOne({ email })

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 409 }
            )
        }

        // -----------------------------
        // Hash password
        // -----------------------------
        const hashedPassword = await bcrypt.hash(password, 10)

        // -----------------------------
        // Create user object
        // -----------------------------
        const newUser = {
            firstName,
            lastName,
            email,
            mobile,
            password: hashedPassword,
            createdAt: new Date(),
        }

        // -----------------------------
        // Insert into MongoDB
        // -----------------------------
        const result = await db.collection("users").insertOne(newUser)

        // -----------------------------
        // Response (NEVER send password back)
        // -----------------------------
        return NextResponse.json(
            {
                message: "User created successfully",
                user: {
                    id: result.insertedId,
                    firstName,
                    lastName,
                    email,
                    mobile,
                },
            },
            { status: 201 }
        )

    } catch (error) {
        console.error("Signup error:", error)

        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        )
    }
}
