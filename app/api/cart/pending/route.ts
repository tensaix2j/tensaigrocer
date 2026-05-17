import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { getAuthenticatedUserId } from "../../../lib/auth";

type PendingOrderItem = {
    id?: unknown;
    name?: unknown;
    price?: unknown;
    quantity?: unknown;
    image?: unknown;
};

export async function GET() {
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return NextResponse.json({ items: [] }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db("groceries_db");

        const pendingOrder = await db.collection("pendingOrders").findOne(
            {
                userId,
                status: "pending",
            },
            {
                projection: {
                    _id: 0,
                    items: 1,
                    orderNo: 1,
                    updatedAt: 1,
                },
                sort: {
                    updatedAt: -1,
                    createdAt: -1,
                },
            }
        );

        if (!pendingOrder) {
            return NextResponse.json({ items: [] }, { status: 404 });
        }

        const items = Array.isArray(pendingOrder.items)
            ? pendingOrder.items
                .map((item: PendingOrderItem) => ({
                    id: typeof item.id === "string" ? item.id : "",
                    name: typeof item.name === "string" ? item.name : "",
                    price: Number(item.price) || 0,
                    quantity: Number(item.quantity) || 0,
                    image: typeof item.image === "string" ? item.image : "",
                }))
                .filter((item) => item.id && item.name && item.quantity > 0)
            : [];

        return NextResponse.json({
            items,
            orderNo: pendingOrder.orderNo,
        });
    } catch (error) {
        console.error("Pending cart fetch error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
