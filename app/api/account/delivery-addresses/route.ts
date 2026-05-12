import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { getAuthenticatedUserId } from "../../../lib/auth";

type AddressBody = {
    _id?: string;
    recipientName?: string;
    contactNo?: string;
    postalCode?: string;
    streetName?: string;
    level?: string;
    unit?: string;
    additionalDetails?: string;
};

function buildAddress(body: AddressBody, userId: ObjectId) {
    return {
        userId,
        recipientName: body.recipientName?.trim() || "",
        contactNo: body.contactNo?.trim() || "",
        postalCode: body.postalCode?.trim() || "",
        streetName: body.streetName?.trim() || "",
        level: body.level?.trim() || "",
        unit: body.unit?.trim() || "",
        additionalDetails: body.additionalDetails?.trim() || "",
        updatedAt: new Date(),
    };
}

export async function GET() {
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db("groceries_db");
        const addresses = await db
            .collection("deliveryAddresses")
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({
            addresses: addresses.map((address) => ({
                ...address,
                _id: address._id.toString(),
                userId: userId.toString(),
            })),
        });
    } catch (error) {
        console.error("Address list error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = (await req.json()) as AddressBody;
        const address = {
            ...buildAddress(body, userId),
            createdAt: new Date(),
        };

        if (!address.recipientName || !address.contactNo || !address.postalCode || !address.streetName) {
            return NextResponse.json({ message: "Recipient, contact, postal code, and street name are required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("groceries_db");
        const result = await db.collection("deliveryAddresses").insertOne(address);

        return NextResponse.json({
            message: "Address saved",
            address: {
                ...address,
                _id: result.insertedId.toString(),
                userId: userId.toString(),
            },
        }, { status: 201 });
    } catch (error) {
        console.error("Address save error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = (await req.json()) as AddressBody;

        if (!body._id || !ObjectId.isValid(body._id)) {
            return NextResponse.json({ message: "Invalid address" }, { status: 400 });
        }

        const address = buildAddress(body, userId);

        if (!address.recipientName || !address.contactNo || !address.postalCode || !address.streetName) {
            return NextResponse.json({ message: "Recipient, contact, postal code, and street name are required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("groceries_db");
        const addressId = new ObjectId(body._id);
        const result = await db.collection("deliveryAddresses").findOneAndUpdate(
            { _id: addressId, userId },
            { $set: address },
            { returnDocument: "after" }
        );

        if (!result) {
            return NextResponse.json({ message: "Address not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Address updated",
            address: {
                ...result,
                _id: result._id.toString(),
                userId: userId.toString(),
            },
        });
    } catch (error) {
        console.error("Address update error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
