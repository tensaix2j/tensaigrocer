"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaMapMarkerAlt, FaRegClock } from "react-icons/fa";
import { toast } from "react-toastify";
import CheckoutSteps from "../../../components/checkoutSteps";
import { useCart } from "../../../context/cartContext";
import { useCheckout } from "../../../context/checkoutContext";

export default function CheckoutReview() {
    const router = useRouter();
    const { state } = useCart();
    const { address, schedule } = useCheckout();

    useEffect(() => {
        if (!address) {
            toast.error("Please select a delivery address first");
            router.push("/checkout/delivery-address");
        }
    }, [address, router]);
    const subtotal = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
    const deliveryFee = state.items.length > 0 ? 3.99 : 0;
    const total = subtotal + deliveryFee;

    const proceedToPayment = () => {
        if (state.items.length === 0) {
            toast.error("Your cart is empty");
            return;
        }
        if (!address) {
            toast.error("Please select a delivery address");
            return;
        }
        if (!schedule) {
            toast.error("Please select a delivery schedule");
            return;
        }
        router.push("/checkout/payment-method");
    };

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 text-black dark:text-white">
            <CheckoutSteps currentStep={3} />

            <section>
                <h1 className="text-2xl font-bold">Review Order</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Check your delivery details and cart before confirming.</p>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="flex flex-col gap-4">
                    <div className="rounded-lg border border-gray-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                        <h2 className="mb-3 font-bold">Cart Items</h2>
                        {state.items.length === 0 ? (
                            <p className="text-sm text-gray-600 dark:text-gray-300">Your cart is empty.</p>
                        ) : (
                            <div className="flex flex-col divide-y divide-gray-200 dark:divide-zinc-700">
                                {state.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-14 w-14 rounded object-cover"
                                            />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-sm font-semibold">{item.name}</h3>
                                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                                ${item.price.toFixed(2)} x {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-lg border border-gray-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                            <div className="mb-2 flex items-center gap-2 font-bold">
                                <FaMapMarkerAlt className="text-orange-700 dark:text-amber-200" />
                                Address
                            </div>
                            {address ? (
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    <p className="font-semibold text-black dark:text-white">{address.recipientName}</p>
                                    <p>{address.contactNo}</p>
                                    <p className="mt-2">{address.address}</p>
                                    {address.additionalDetails && <p className="mt-1 text-xs">{address.additionalDetails}</p>}
                                </div>
                            ) : (
                                <Link href="/checkout/delivery-address" className="text-sm text-orange-700 dark:text-amber-200">
                                    Select delivery address
                                </Link>
                            )}
                        </div>
                        <div className="rounded-lg border border-gray-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                            <div className="mb-2 flex items-center gap-2 font-bold">
                                <FaRegClock className="text-orange-700 dark:text-amber-200" />
                                Schedule
                            </div>
                            {schedule ? (
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    <p className="font-semibold text-black dark:text-white">{schedule.dayLabel}</p>
                                    <p>{schedule.timeSlot}</p>
                                </div>
                            ) : (
                                <Link href="/checkout/delivery-schedule" className="text-sm text-orange-700 dark:text-amber-200">
                                    Select delivery schedule
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <aside className="h-fit rounded-lg border border-gray-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                    <h2 className="mb-4 font-bold">Order Summary</h2>
                    <div className="flex flex-col gap-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Delivery Fee</span>
                            <span>${deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-gray-200 dark:bg-zinc-700" />
                        <div className="flex justify-between text-base font-bold">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </aside>
            </section>

            <section className="flex items-center justify-between gap-3">
                <Link href="/checkout/delivery-schedule" className="btn btn-ghost">
                    <FaChevronLeft size={12} />
                    Back
                </Link>
                <button className="btn btn-primary" disabled={state.items.length === 0} onClick={proceedToPayment}>
                    Proceed to Payment
                </button>
            </section>
        </div>
    );
}
