import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "../../../lib/mongodb";
import { getAuthenticatedUserId } from "../../../lib/auth";

type PasswordBody = {
    currentPassword?: string;
    newPassword?: string;
};

export async function PATCH(req: Request) {
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = (await req.json()) as PasswordBody;
        const currentPassword = body.currentPassword || "";
        const newPassword = body.newPassword || "";

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: "Current and new password are required" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ message: "New password must be at least 6 characters" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("groceries_db");
        const user = await db.collection("users").findOne({ _id: userId });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const passwordValid = await bcrypt.compare(currentPassword, user.password);

        if (!passwordValid) {
            return NextResponse.json({ message: "Current password is incorrect" }, { status: 401 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.collection("users").updateOne(
            { _id: userId },
            {
                $set: {
                    password: hashedPassword,
                    updatedAt: new Date(),
                },
            }
        );

        return NextResponse.json({ message: "Password updated" });
    } catch (error) {
        console.error("Password update error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

