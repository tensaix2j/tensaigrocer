import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";
import { getAuthenticatedUserId } from "../../../lib/auth";

import bip39 from 'bip39';
import hdkey from 'hdkey';
import Wallet from 'ethereumjs-wallet';
import crypto from "crypto";

// Type declarations for missing types
declare module 'hdkey' {
    interface HDNode {
        privateKey: Buffer;
        publicKey: Buffer;
        derive(path: string): HDNode;
    }
    function fromMasterSeed(seed: Buffer): HDNode;
}

type OrderItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
};

type DeliveryAddress = {
    id: string;
    recipientName: string;
    contactNo: string;
    address: string;
    additionalDetails?: string;
};

type DeliverySchedule = {
    dayId: string;
    dayLabel: string;
    timeSlot: string;
};

export async function POST(req: Request) {
    try {
        const userId = await getAuthenticatedUserId();
        
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { 
            items, 
            subtotal, 
            deliveryFee, 
            total, 
            deliveryAddress, 
            deliverySchedule,
            amount, 
            currency, 
            network 
        } = body;

        if (!amount || !currency) {
            return NextResponse.json({ message: "Amount and currency are required" }, { status: 400 });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ message: "Order items are required" }, { status: 400 });
        }

        if (!deliveryAddress) {
            return NextResponse.json({ message: "Delivery address is required" }, { status: 400 });
        }

        if (!deliverySchedule) {
            return NextResponse.json({ message: "Delivery schedule is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("groceries_db");

        // Generate unique order ID
        const countOrders = await db.collection("pendingOrders").countDocuments({
            userId: userId,
            status: "confirmed"
        });
        
        const idStr = userId.toHexString();
        const nonce = countOrders;
        const orderNo = `crypto-${idStr}-${nonce}`;
        
        // Check if user already has a pending order
        const existingPending = await db.collection("pendingOrders").findOne({ 
            userId: userId,
            status: "pending"
        });

        // Calculate new order data
        const now = new Date();
        const newItems = items.map((item: OrderItem) => ({
            id: item.id || "",
            name: item.name || "",
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 0,
            image: item.image || "",
        })).filter((item: OrderItem) => item.id && item.name && item.quantity > 0);
        
        const newSubtotal = Number(subtotal) || newItems.reduce((sum: number, item: OrderItem) => sum + (item.price * item.quantity), 0);
        const newDeliveryFee = Number(deliveryFee) || 0;
        const newTotal = Number(total) || newSubtotal + newDeliveryFee;

        if (existingPending) {
            
            // Check if order details have changed
            const itemsChanged = JSON.stringify(existingPending.items) !== JSON.stringify(newItems);
            const totalChanged = existingPending.total !== newTotal;
            const addressChanged = JSON.stringify(existingPending.deliveryAddress) !== JSON.stringify({
                id: deliveryAddress.id || "",
                recipientName: deliveryAddress.recipientName || "",
                contactNo: deliveryAddress.contactNo || "",
                address: deliveryAddress.address || "",
                additionalDetails: deliveryAddress.additionalDetails || "",
            });
            const scheduleChanged = JSON.stringify(existingPending.deliverySchedule) !== JSON.stringify({
                dayId: deliverySchedule.dayId || "",
                dayLabel: deliverySchedule.dayLabel || "",
                timeSlot: deliverySchedule.timeSlot || "",
            });

            if (itemsChanged || totalChanged || addressChanged || scheduleChanged) {
                // Update the pending order with new details
                await db.collection("pendingOrders").updateOne(
                    { orderNo: existingPending.orderNo },
                    { 
                        $set: {
                            items: newItems,
                            subtotal: newSubtotal,
                            deliveryFee: newDeliveryFee,
                            total: newTotal,
                            deliveryAddress: {
                                id: deliveryAddress.id || "",
                                recipientName: deliveryAddress.recipientName || "",
                                contactNo: deliveryAddress.contactNo || "",
                                address: deliveryAddress.address || "",
                                additionalDetails: deliveryAddress.additionalDetails || "",
                            },
                            deliverySchedule: {
                                dayId: deliverySchedule.dayId || "",
                                dayLabel: deliverySchedule.dayLabel || "",
                                timeSlot: deliverySchedule.timeSlot || "",
                            },
                            cryptoAmount: newTotal,
                            updatedAt: now,
                        }
                    }
                );
            }

            // Return existing pending order without changes
            const qrData = `ethereum:${existingPending.cryptoAddress}?amount=${existingPending.cryptoAmount}&token=USDT`;
            const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

            return NextResponse.json({
                orderNo: existingPending.orderNo,
                address: existingPending.cryptoAddress,
                amount: newTotal,
                currency: existingPending.cryptoCurrency,
                network: existingPending.cryptoNetwork,
                qrCode: qrCode,
                status: "pending",
            });
        }

        


        // Generate Ethereum address from mnemonic
        const mnemonic = process.env.MNEMONIC;
        if (!mnemonic) {
            return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
        }
        
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const root = hdkey.fromMasterSeed(seed);
        const id_index = parseInt(idStr.slice(-4), 16);
        const path = `m/44'/60'/0'/${id_index}/${nonce}`;
        const addrNode = root.derive(path);
        const privateKey = addrNode.privateKey;
        const wallet = Wallet.fromPrivateKey(privateKey);
        const cryptoAddress = wallet.getAddressString();
        
        if (!cryptoAddress || cryptoAddress.length === 0) {
            console.error("Failed to generate crypto address");
            return NextResponse.json({ message: "Failed to generate payment address" }, { status: 500 });
        }

        // Store complete pending order in database
        const pendingOrder = {
            userId: userId,
            orderNo: orderNo,
            status: "pending",
            items: items.map((item: OrderItem) => ({
                id: item.id || "",
                name: item.name || "",
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 0,
                image: item.image || "",
            })).filter((item: OrderItem) => item.id && item.name && item.quantity > 0),
            subtotal: Number(subtotal) || items.reduce((sum: number, item: OrderItem) => sum + (item.price * item.quantity), 0),
            deliveryFee: Number(deliveryFee) || 0,
            total: Number(total) || 0,
            deliveryAddress: {
                id: deliveryAddress.id || "",
                recipientName: deliveryAddress.recipientName || "",
                contactNo: deliveryAddress.contactNo || "",
                address: deliveryAddress.address || "",
                additionalDetails: deliveryAddress.additionalDetails || "",
            },
            deliverySchedule: {
                dayId: deliverySchedule.dayId || "",
                dayLabel: deliverySchedule.dayLabel || "",
                timeSlot: deliverySchedule.timeSlot || "",
            },
            cryptoAddress,
            cryptoAmount: amount,
            cryptoCurrency: currency,
            cryptoNetwork: network || "ethereum",
            createdAt: now,
            updatedAt: now,
        };

        await db.collection("pendingOrders").insertOne(pendingOrder);

        // Generate QR code URL
        const qrData = `ethereum:${cryptoAddress}?amount=${amount}&token=USDT`;
        const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
        
        return NextResponse.json({
            orderNo: orderNo,
            address: cryptoAddress,
            amount: amount,
            currency: currency,
            network: network || "ethereum",
            qrCode: qrCode,
            status: "pending",
            existing: false,
        });
    } catch (error) {
        console.error("Crypto payment generation error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const orderNo = searchParams.get("orderNo");

        if (!orderNo) {
            return NextResponse.json({ message: "OrderNo required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("groceries_db");
        const payment = await db.collection("pendingOrders").findOne({ orderNo });

        if (!payment) {
            return NextResponse.json({ message: "Payment not found" }, { status: 404 });
        }

        return NextResponse.json({
            orderNo,
            status: payment.status,
            address: payment.cryptoAddress,
            amount: payment.cryptoAmount,
        });
    } catch (error) {
        console.error("Crypto payment status error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// Webhook endpoint for Alchemy notifications
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        
        // Verify webhook signature (in production)
        // const signature = req.headers.get("x-alchemy-signature");
        // if (!verifyWebhookSignature(body, signature, ALCHEMY_WEBHOOK_SECRET)) {
        //     return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
        // }

        const { orderNo, status, txHash } = body;

        if (!orderNo || !status) {
            return NextResponse.json({ message: "Invalid webhook data" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("groceries_db");
        
        const pendingOrder = await db.collection("pendingOrders").findOne({ orderNo });

        if (!pendingOrder) {
            return NextResponse.json({ message: "Payment not found" }, { status: 404 });
        }

        // Update payment status
        if (status === "confirmed" || status === "success") {
            const now = new Date();
            
            // Move pending order to confirmed orders
            const confirmedOrder = {
                userId: pendingOrder.userId,
                orderNo: pendingOrder.orderNo,
                status: "Confirmed",
                items: pendingOrder.items,
                subtotal: pendingOrder.subtotal,
                deliveryFee: pendingOrder.deliveryFee,
                total: pendingOrder.total,
                deliveryAddress: pendingOrder.deliveryAddress,
                deliverySchedule: pendingOrder.deliverySchedule,
                paymentMethod: {
                    id: "crypto-usdt",
                    label: "USDT (Crypto)",
                    detail: `Paid ${pendingOrder.cryptoAmount} USDT`,
                },
                cryptoPayment: {
                    orderNo: pendingOrder.orderNo,
                    address: pendingOrder.cryptoAddress,
                    amount: pendingOrder.cryptoAmount,
                    network: pendingOrder.cryptoNetwork,
                    txHash: txHash || null,
                },
                createdAt: pendingOrder.createdAt,
                updatedAt: now,
                confirmedAt: now,
            };

            // Insert into orders collection
            // Update pending order status
            await db.collection("orders").insertOne( confirmedOrder );
            await db.collection("pendingOrders").updateOne(
                { orderNo: orderNo },
                { $set: { status: "confirmed", confirmedAt: now, txHash: txHash || null } }
            );

        }

        return NextResponse.json({ message: `Webhook processed ${ orderNo }`  });
    } catch (error) {
        console.error("Crypto payment webhook error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// Helper function to verify webhook signature
function verifyWebhookSignature(payload: any, signature: string | null, secret: string | undefined): boolean {
    if (!signature || !secret) return false;
    
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(JSON.stringify(payload));
    const expectedSignature = hmac.digest("hex");
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}
