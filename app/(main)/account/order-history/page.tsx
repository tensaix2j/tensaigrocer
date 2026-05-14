"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa";
import { toast } from "react-toastify";

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

type SavedOrder = {
    _id: string;
    orderNo: string;
    status: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    deliveryAddress: DeliveryAddress | null;
    createdAt: string;
};

export default function OrderHistory() {
    const [orders, setOrders] = useState<SavedOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("/api/account/order-history");
                const data = (await res.json()) as { orders?: SavedOrder[]; message?: string };

                if (!res.ok) {
                    toast.error(data.message || "Unable to load order history");
                    return;
                }

                setOrders(data.orders || []);
            } catch (error) {
                console.error(error);
                toast.error("Network error");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="mx-auto max-w-5xl p-4 text-black dark:text-white">
            <div className="mb-6 flex items-center gap-3">
                <Link
                    href="/account"
                    aria-label="Back to account"
                    title="Back to account"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-black transition hover:border-orange-600 hover:text-orange-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:border-amber-200 dark:hover:text-amber-200"
                >
                    <FaChevronLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold">Order History</h1>
            </div>

            {loading ? (
                <div className="rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300">
                    Loading orders...
                </div>
            ) : orders.length === 0 ? (
                <div className="rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300">
                    No orders yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                        >
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <h2 className="font-bold">{order.orderNo}</h2>
                                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-900 dark:bg-zinc-800 dark:text-amber-200">
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(order.createdAt).toLocaleString("en-SG", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                })}
                            </p>

                            <div className="mt-4 flex flex-col gap-2">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                                        <span className="min-w-0 flex-1 truncate">
                                            {item.name} x {item.quantity}
                                        </span>
                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {order.deliveryAddress && (
                                <div className="mt-4 border-t border-gray-200 pt-3 text-sm dark:border-zinc-700">
                                    <p className="font-semibold">Delivery Address</p>
                                    <p className="text-gray-600 dark:text-gray-400">{order.deliveryAddress.recipientName}</p>
                                    <p className="text-gray-600 dark:text-gray-400">{order.deliveryAddress.contactNo}</p>
                                    <p className="text-gray-600 dark:text-gray-400">{order.deliveryAddress.address}</p>
                                    {order.deliveryAddress.additionalDetails && (
                                        <p className="text-xs text-gray-500 dark:text-gray-500">{order.deliveryAddress.additionalDetails}</p>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 flex justify-between border-t border-gray-200 pt-3 font-bold dark:border-zinc-700">
                                <span>Total</span>
                                <span>${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
