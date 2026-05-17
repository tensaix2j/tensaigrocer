"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { FaChevronLeft, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import CheckoutSteps from "../../../components/checkoutSteps";
import { useCart } from "../../../context/cartContext";
import { useCheckout } from "../../../context/checkoutContext";

type PaymentStatus = "generating" | "pending" | "confirmed" | "failed";

export default function CheckoutPaymentMethod() {


    const router = useRouter();
    
    const { state, dispatch, hydratePendingCart } = useCart();
    const { address, schedule, clearCheckout } = useCheckout();
    const [status, setStatus] = useState<PaymentStatus>("generating");
    const [paymentData, setPaymentData] = useState<{
        address: string;
        amount: number;
        qrCode: string;
        orderNo: string;
    } | null>(null);
    const timeoutCheckPaymentStatus = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isLeaving = useRef(false);

    const subtotal = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
    const deliveryFee = state.items.length > 0 ? 3.99 : 0;
    const total = Number( ( subtotal + deliveryFee ).toFixed(2) ) ;

    useEffect(() => {

        if ( isLeaving.current == true ) return;
        
        let cancelled = false;
        
        const preparePayment = async () => {
            if (!address) {
                toast.error("Please select a delivery address first");
                router.push("/checkout/delivery-address");
                return;
            }

            if (state.items.length === 0) {
                const restored = await hydratePendingCart();

                if (!cancelled && !restored) {
                    toast.error("Your cart is empty");
                    setStatus("failed");
                }

                return;
            }

            if (!cancelled && status === "generating") {
                generatePayment();
            }
        };

        preparePayment();

        return () => {
            cancelled = true;
            if ( timeoutCheckPaymentStatus.current ) {
                clearTimeout( timeoutCheckPaymentStatus.current );
            }
        };
    }, [address, hydratePendingCart, state.items.length]);



    //------------
    const generatePayment = async () => {
        try {
            setStatus("generating");
            const res = await fetch("/api/payment/crypto", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: state.items,
                    subtotal,
                    deliveryFee,
                    total,
                    deliveryAddress: address,
                    deliverySchedule: schedule,
                    amount: total,
                    currency: "USDT",
                    network: "ethereum",
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to generate payment");
                setStatus("failed");
                return;
            }

            console.log("Payment data received:", data);
            setPaymentData({
                address: data.address,
                amount: data.amount,
                qrCode: data.qrCode,
                orderNo: data.orderNo,
            });
            setStatus("pending");
            timeoutCheckPaymentStatus.current = setTimeout(() => {
                 checkPaymentStatus( data.orderNo );
            },  5000 );
            
        } catch (error) {
            console.error(error);
            toast.error("Network error");
            setStatus("failed");
        }
    };


    //--------------
    const checkPaymentStatus = async (orderNo: string) => {
        try {
            console.log( "checkPaymentStatus ", orderNo );
            const res = await fetch(`/api/payment/crypto?orderNo=${orderNo}`);
            const data = await res.json();

            if (!res.ok) return;

            if (data.status === "confirmed") {
                
                if ( data.status != status ) {
                    
                    console.log( "checkPaymentStatus ", orderNo, "order CONFIRMED" );

                    setStatus("confirmed");
                    isLeaving.current = true;
                    
                    dispatch({ type: "CLEAR_CART" });
                    clearCheckout();
                    toast.success("Payment confirmed! Order created.");
                    router.replace("/account/order-history");
                    

                } else {
                    console.log( "Already set to confirmed");
                }
            } else {
                timeoutCheckPaymentStatus.current = setTimeout(() => {
                    checkPaymentStatus( data.orderNo );
                },  5000 );
            }
        } catch (error) {
            console.error("Status check error:", error);
        }
    };

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 text-black dark:text-white">
            <CheckoutSteps currentStep={4} />

            <section>
                <h1 className="text-2xl font-bold">Payment</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Send USDT to complete your order. Payment will be detected automatically.
                </p>
            </section>

            <section className="rounded-lg border border-gray-300 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
                {status === "generating" && (
                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                        <FaSpinner className="animate-spin text-3xl text-orange-600" />
                        <p className="text-gray-600 dark:text-gray-300">Generating payment address...</p>
                    </div>
                )}

                {status === "pending" && paymentData && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="rounded-lg border border-orange-200 bg-orange-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
                            <p className="text-center text-lg font-bold text-orange-800 dark:text-amber-200">
                                Send Exactly: {paymentData.amount} USDT
                            </p>
                            <p className="mt-2 text-center text-sm text-orange-600 dark:text-amber-300">
                                Waiting for payment... Payment will be detected automatically
                            </p>
                        </div>

                        <div className="rounded-lg border-2 border-orange-300 bg-white p-6 dark:border-amber-600 dark:bg-zinc-950">
                            <p className="mb-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                Scan QR or send to address below
                            </p>
                            {paymentData.qrCode && (
                                <img
                                    src={paymentData.qrCode}
                                    alt="Payment QR Code"
                                    className="h-64 w-64"
                                />
                            )}
                        </div>

                        <div className="w-full max-w-md space-y-4">
                            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                                <label className="mb-2 block text-center text-sm font-medium text-blue-700 dark:text-blue-300">
                                    Send To This Ethereum Address
                                </label>
                                <div className="w-full break-all rounded-lg border border-blue-300 bg-white p-4 text-center font-mono text-sm tracking-wide text-black dark:border-blue-600 dark:bg-zinc-950 dark:text-white">
                                    {paymentData.address || "0x..."}
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(paymentData.address);
                                        toast.success("Address copied!");
                                    }}
                                    className="btn btn-primary btn-sm mt-3 w-full"
                                    disabled={!paymentData.address}
                                >
                                    Copy Address
                                </button>
                            </div>

                            <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4 dark:border-amber-700 dark:bg-amber-950/20">
                                <label className="mb-2 block text-center text-sm font-medium text-orange-700 dark:text-amber-300">
                                    Amount to Pay (USDT)
                                </label>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-3xl font-bold text-orange-800 dark:text-amber-200">
                                        {paymentData.amount}
                                    </span>
                                    <span className="text-lg text-orange-600 dark:text-amber-400">USDT</span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(paymentData.amount.toString());
                                            toast.success("Amount copied!");
                                        }}
                                        className="btn btn-outline btn-sm ml-2"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Network
                                </label>
                                <input
                                    type="text"
                                    value="Ethereum (ERC-20)"
                                    readOnly
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {status === "confirmed" && (
                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold">Payment Confirmed!</h2>
                        <p className="text-gray-600 dark:text-gray-300">Redirecting to your orders...</p>
                    </div>
                )}

                {status === "failed" && (
                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold">Payment Failed</h2>
                        <p className="text-gray-600 dark:text-gray-300">Please try again</p>
                        <button onClick={generatePayment} className="btn btn-primary">
                            Try Again
                        </button>
                    </div>
                )}
            </section>

            <section className="flex items-center justify-between gap-3">
                <Link href="/checkout/review" className="btn btn-ghost">
                    <FaChevronLeft size={12} />
                    Back
                </Link>
            </section>
        </div>
    );
}
