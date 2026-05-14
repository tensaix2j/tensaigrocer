"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronLeft, FaCreditCard, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import CheckoutSteps from "../../../components/checkoutSteps";
import { useCheckout } from "../../../context/checkoutContext";

type SavedPaymentMethod = {
    _id: string;
    nameOnCard: string;
    brand: string;
    last4: string;
    cardNumber: string;
    cvv: string;
    expiryDate: string;
};

export default function CheckoutPaymentMethod() {
    const { setPayment } = useCheckout();
    const [savedPaymentMethods, setSavedPaymentMethods] = useState<SavedPaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPaymentId, setSelectedPaymentId] = useState<string>("pay-on-delivery");

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const res = await fetch("/api/account/payment-methods");
                const data = (await res.json()) as { paymentMethods?: SavedPaymentMethod[]; message?: string };

                if (!res.ok) {
                    toast.error(data.message || "Unable to load payment methods");
                    return;
                }

                const methods = data.paymentMethods || [];
                setSavedPaymentMethods(methods);
                if (methods.length > 0) {
                    setSelectedPaymentId(methods[0]._id);
                }
            } catch (error) {
                console.error(error);
                toast.error("Network error");
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentMethods();
    }, []);

    const paymentOptions = useMemo(() => 
        savedPaymentMethods.map((method) => ({
            id: method._id,
            label: method.brand,
            detail: `Ending ${method.last4}`,
            expiry: `Expires ${method.expiryDate}`,
        })),
        [savedPaymentMethods]
    );

    const selectedPayment = useMemo(() => 
        paymentOptions.find((paymentMethod) => paymentMethod.id === selectedPaymentId),
        [paymentOptions, selectedPaymentId]
    );

    const prevPaymentIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!selectedPayment) {
            return;
        }

        // Only update if the selected payment ID has actually changed
        if (prevPaymentIdRef.current === selectedPayment.id) {
            return;
        }
        prevPaymentIdRef.current = selectedPayment.id;

        const savedMethod = savedPaymentMethods.find((m) => m._id === selectedPayment.id);
        if (savedMethod) {
            setPayment({
                id: savedMethod._id,
                label: savedMethod.brand,
                detail: `Ending ${savedMethod.last4}`,
                expiry: `Expires ${savedMethod.expiryDate}`,
            });
        }
    }, [selectedPayment, savedPaymentMethods, setPayment]);

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 text-black dark:text-white">
            <CheckoutSteps currentStep={3} />

            <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">Payment Method</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Choose how you would like to pay for this order.</p>
                    </div>
                    <Link href="/account/payment-methods" className="btn btn-outline btn-sm">
                        <FaPlus size={12} />
                        Add Payment
                    </Link>
                </div>

                {loading ? (
                    <div className="rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300">
                        Loading payment methods...
                    </div>
                ) : savedPaymentMethods.length === 0 ? (
                    <div className="rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300">
                        No payment methods saved. Please add a payment method to continue.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {savedPaymentMethods.map((paymentMethod) => (
                            <button
                                key={paymentMethod._id}
                                className={`rounded-lg border bg-white p-4 text-left shadow-sm transition hover:border-orange-600 dark:bg-zinc-900 dark:hover:border-amber-200 ${
                                    paymentMethod._id === selectedPaymentId ? "border-orange-600 dark:border-amber-200" : "border-gray-300 dark:border-zinc-700"
                                }`}
                                onClick={() => setSelectedPaymentId(paymentMethod._id)}
                            >
                                <div className="mb-3 flex items-center gap-2 font-bold">
                                    <FaCreditCard size={16} />
                                    {paymentMethod.brand}
                                </div>
                                <p className="text-sm">Ending {paymentMethod.last4}</p>
                                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Expires {paymentMethod.expiryDate}</p>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            <section className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                <Link href="/checkout/delivery-schedule" className="btn btn-ghost">
                    <FaChevronLeft size={12} />
                    Back
                </Link>
                <div className="text-sm text-gray-700 dark:text-gray-300">{selectedPayment?.label} {selectedPayment?.detail}</div>
                <Link 
                    href={selectedPayment ? "/checkout/review" : "#"} 
                    className={`btn btn-primary ${!selectedPayment ? "btn-disabled" : ""}`}
                    aria-disabled={!selectedPayment}
                    onClick={(e) => {
                        if (!selectedPayment) {
                            e.preventDefault();
                            toast.error("Please select a payment method to continue");
                        }
                    }}
                >
                    Review Order
                </Link>
            </section>
        </div>
    );
}
