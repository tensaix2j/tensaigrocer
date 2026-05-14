import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { getAuthenticatedUserId } from "../../../lib/auth";

type OrderItemBody = {
    id?: string;
    name?: string;
    price?: number;
    quantity?: number;
    image?: string;
};

type OrderBody = {
    items?: OrderItemBody[];
    subtotal?: number;
    deliveryFee?: number;
    total?: number;
    deliveryAddress?: {
        id?: string;
        recipientName?: string;
        contactNo?: string;
        address?: string;
        additionalDetails?: string;
    };
    deliverySchedule?: {
        dayId?: string;
        dayLabel?: string;
        timeSlot?: string;
    };
    paymentMethod?: {
        id?: string;
        label?: string;
        detail?: string;
        expiry?: string;
    };
};

export async function GET() {
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db("groceries_db");
        const orders = await db
            .collection("orders")
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({
            orders: orders.map((order) => ({
                ...order,
                _id: order._id.toString(),
                userId: userId.toString(),
            })),
        });
    } catch (error) {
        console.error("Order history list error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = (await req.json()) as OrderBody;
        const items = (body.items || []).map((item) => ({
            id: item.id || "",
            name: item.name || "",
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 0,
            image: item.image || "",
        })).filter((item) => item.id && item.name && item.quantity > 0);

        if (items.length === 0) {
            return NextResponse.json({ message: "Order items are required" }, { status: 400 });
        }

        const subtotal = Number(body.subtotal) || items.reduce((total, item) => total + item.price * item.quantity, 0);
        const deliveryFee = Number(body.deliveryFee) || 0;
        const total = Number(body.total) || subtotal + deliveryFee;
        const now = new Date();
        const order = {
            userId,
            orderNo: `TG-${now.getTime()}`,
            status: "Confirmed",
            items,
            subtotal,
            deliveryFee,
            total,
            deliveryAddress: body.deliveryAddress || null,
            deliverySchedule: body.deliverySchedule || null,
            paymentMethod: body.paymentMethod || null,
            createdAt: now,
            updatedAt: now,
        };

        const client = await clientPromise;
        const db = client.db("groceries_db");
        const result = await db.collection("orders").insertOne(order);

        return NextResponse.json({
            message: "Order confirmed",
            order: {
                ...order,
                _id: result.insertedId.toString(),
                userId: userId.toString(),
            },
        }, { status: 201 });
    } catch (error) {
        console.error("Order confirm error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
