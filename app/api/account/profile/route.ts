import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { getAuthenticatedUserId } from "../../../lib/auth";

type ProfileBody = {
    firstName?: string;
    lastName?: string;
    mobile?: string;
    email?: string;
};

export async function PATCH(req: Request) {
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = (await req.json()) as ProfileBody;
        const update: ProfileBody = {};

        if (typeof body.firstName === "string") update.firstName = body.firstName.trim();
        if (typeof body.lastName === "string") update.lastName = body.lastName.trim();
        if (typeof body.mobile === "string") update.mobile = body.mobile.trim();
        if (typeof body.email === "string") update.email = body.email.trim().toLowerCase();

        if (update.firstName !== undefined && update.firstName.length === 0) {
            return NextResponse.json({ message: "First name is required" }, { status: 400 });
        }

        if (update.lastName !== undefined && update.lastName.length === 0) {
            return NextResponse.json({ message: "Last name is required" }, { status: 400 });
        }

        if (update.mobile !== undefined && !/^[0-9]{8,15}$/.test(update.mobile)) {
            return NextResponse.json({ message: "Invalid mobile number" }, { status: 400 });
        }

        if (update.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(update.email)) {
            return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
        }

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("groceries_db");

        if (update.email) {
            const existingUser = await db.collection("users").findOne({
                email: update.email,
                _id: { $ne: userId },
            });

            if (existingUser) {
                return NextResponse.json({ message: "Email already exists" }, { status: 409 });
            }
        }

        await db.collection("users").updateOne(
            { _id: userId },
            {
                $set: {
                    ...update,
                    updatedAt: new Date(),
                },
            }
        );

        return NextResponse.json({ message: "Profile updated" });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

