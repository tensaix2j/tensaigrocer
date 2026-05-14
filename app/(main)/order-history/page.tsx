



import Link from "next/link";

import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";


const orders = Array.from({ length: 10 }, (_, index) => ({
    id: `TG-${String(index + 1).padStart(4, "0")}`,
    date: `May ${12 - (index % 7)}, 2026`,
    total: `$${(24.5 + index * 3.8).toFixed(2)}`,
    status: index % 3 === 0 ? "Delivered" : index % 3 === 1 ? "Processing" : "Pending",
}));

export default function OrderHistory() {
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

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                    >
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <h2 className="font-bold">{order.id}</h2>
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-900 dark:bg-zinc-800 dark:text-amber-200">
                                {order.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.date}</p>
                        <p className="mt-3 text-lg font-semibold">{order.total}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

