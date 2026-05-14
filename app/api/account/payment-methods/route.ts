import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { getAuthenticatedUserId } from "../../../lib/auth";

type PaymentBody = {
    _id?: string;
    nameOnCard?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
};

function detectCardBrand(cardNumber: string) {
    if (cardNumber.startsWith("4")) return "Visa";
    if (/^5[1-5]/.test(cardNumber)) return "Mastercard";
    if (/^3[47]/.test(cardNumber)) return "American Express";
    return "Card";
}

function buildPaymentMethod(body: PaymentBody, userId: ObjectId) {
    const cardNumber = (body.cardNumber || "").replace(/\D/g, "");
    const nameOnCard = body.nameOnCard?.trim() || "";
    const expiryDate = body.expiryDate?.trim() || "";
    const cvv = body.cvv?.trim() || "";

    return {
        cardNumber,
        paymentMethod: {
            userId,
            nameOnCard,
            brand: detectCardBrand(cardNumber),
            last4: cardNumber.slice(-4),
            cardNumber,
            cvv,
            expiryDate,
            updatedAt: new Date(),
        },
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
        const paymentMethods = await db
            .collection("paymentMethods")
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({
            paymentMethods: paymentMethods.map((paymentMethod) => ({
                ...paymentMethod,
                _id: paymentMethod._id.toString(),
                userId: userId.toString(),
            })),
        });
    } catch (error) {
        console.error("Payment method list error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = (await req.json()) as PaymentBody;
        const { cardNumber, paymentMethod } = buildPaymentMethod(body, userId);

        if (!paymentMethod.nameOnCard || !cardNumber || !paymentMethod.expiryDate) {
            return NextResponse.json({ message: "Name, card number, and expiry date are required" }, { status: 400 });
        }

        if (cardNumber.length < 12 || cardNumber.length > 19) {
            return NextResponse.json({ message: "Invalid card number" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("groceries_db");
        const result = await db.collection("paymentMethods").insertOne({
            ...paymentMethod,
            createdAt: new Date(),
        });

        return NextResponse.json({
            message: "Payment method saved",
            paymentMethod: {
                ...paymentMethod,
                _id: result.insertedId.toString(),
                userId: userId.toString(),
            },
        }, { status: 201 });
    } catch (error) {
        console.error("Payment method save error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = (await req.json()) as PaymentBody;

        if (!body._id || !ObjectId.isValid(body._id)) {
            return NextResponse.json({ message: "Invalid payment method" }, { status: 400 });
        }

        const { cardNumber, paymentMethod } = buildPaymentMethod(body, userId);

        if (!paymentMethod.nameOnCard || !cardNumber || !paymentMethod.expiryDate) {
            return NextResponse.json({ message: "Name, card number, and expiry date are required" }, { status: 400 });
        }

        if (cardNumber.length < 12 || cardNumber.length > 19) {
            return NextResponse.json({ message: "Invalid card number" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("groceries_db");
        const paymentMethodId = new ObjectId(body._id);
        const result = await db.collection("paymentMethods").findOneAndUpdate(
            { _id: paymentMethodId, userId },
            { $set: paymentMethod },
            { returnDocument: "after" }
        );

        if (!result) {
            return NextResponse.json({ message: "Payment method not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Payment method updated",
            paymentMethod: {
                ...result,
                _id: result._id.toString(),
                userId: userId.toString(),
            },
        });
    } catch (error) {
        console.error("Payment method update error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
