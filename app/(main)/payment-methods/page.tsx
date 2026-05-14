"use client";

import { useEffect, useState } from "react";


import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";


import Modal from "../../components/modal";

import Link from "next/link";
import { toast } from "react-toastify";


const buttonClassName =
    "flex min-h-24 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white p-4 text-center font-semibold shadow-sm transition hover:border-orange-600 hover:text-orange-700 md:w-auto dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-amber-200 dark:hover:text-amber-200";

const inputClassName =
    "input input-bordered w-full border border-gray-300 bg-white text-black placeholder:text-gray-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-gray-400";

type SavedPaymentMethod = {
    _id: string;
    nameOnCard: string;
    brand: string;
    last4: string;
    expiryDate: string;
};

const emptyPayment = {
    nameOnCard: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
};

export default function PaymentMethods() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);
    const [saving, setSaving] = useState(false);
    const [payment, setPayment] = useState(emptyPayment);

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const res = await fetch("/api/account/payment-methods");
                const data = (await res.json()) as { paymentMethods?: SavedPaymentMethod[]; message?: string };

                if (!res.ok) {
                    toast.error(data.message || "Unable to load payment methods");
                    return;
                }

                setPaymentMethods(data.paymentMethods || []);
            } catch (error) {
                console.error(error);
                toast.error("Network error");
            }
        };

        fetchPaymentMethods();
    }, []);

    const updatePayment = (field: keyof typeof payment, value: string) => {
        setPayment((prev) => ({ ...prev, [field]: value }));
    };

    const openAddModal = () => {
        setEditingPaymentId(null);
        setPayment(emptyPayment);
        setModalOpen(true);
    };

    const openEditModal = (savedPaymentMethod: SavedPaymentMethod) => {
        setEditingPaymentId(savedPaymentMethod._id);
        setPayment({
            nameOnCard: savedPaymentMethod.nameOnCard,
            cardNumber: "",
            expiryDate: savedPaymentMethod.expiryDate,
            cvv: "",
        });
        setModalOpen(true);
    };

    const savePayment = async () => {
        try {
            setSaving(true);
            const res = await fetch("/api/account/payment-methods", {
                method: editingPaymentId ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    _id: editingPaymentId || undefined,
                    nameOnCard: payment.nameOnCard,
                    cardNumber: payment.cardNumber,
                    expiryDate: payment.expiryDate,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Unable to save payment method");
                return;
            }

            toast.success(data.message || "Payment method saved");
            setPaymentMethods((prev) => {
                if (editingPaymentId) {
                    return prev.map((paymentMethod) => paymentMethod._id === editingPaymentId ? data.paymentMethod : paymentMethod);
                }

                return [data.paymentMethod, ...prev];
            });
            setPayment(emptyPayment);
            setEditingPaymentId(null);
            setModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Network error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl p-4 text-black dark:text-white">
            
             <div className="mb-6 flex items-center gap-3">
                <Link
                    href="/account"
                    aria-label="Back to account"
                    title="Back to account"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-black transition hover:border-orange-600 hover:text-orange-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:border-amber-200 dark:hover:text-amber-200"
                >
                    <FaChevronLeft size={20} />

                </Link>
                <h1 className="text-2xl font-bold">Payment Methods</h1>
            </div>


            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <button className={buttonClassName} onClick={openAddModal}>
                    <FaPlus size={20} />

                    Add New Payment
                </button>

                {paymentMethods.map((paymentMethod) => (
                    <button
                        key={paymentMethod._id}
                        className="min-h-24 rounded-lg border border-gray-300 bg-white p-4 text-left shadow-sm transition hover:border-orange-600 hover:text-orange-700 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-amber-200 dark:hover:text-amber-200"
                        onClick={() => openEditModal(paymentMethod)}
                    >
                        <h2 className="font-bold">{paymentMethod.brand}</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">•••• {paymentMethod.last4}</p>
                        <p className="mt-3 text-sm">{paymentMethod.nameOnCard}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Expires {paymentMethod.expiryDate}</p>
                    </button>
                ))}
            </div>

            {modalOpen && (
                <Modal onClosed={() => setModalOpen(false)}>
                    <div className="flex flex-col gap-3 p-4 text-black dark:text-white">
                        <h2 className="text-xl font-bold">{editingPaymentId ? "Edit Payment Method" : "Add Payment Method"}</h2>
                        <input className={inputClassName} placeholder="Name on Card" value={payment.nameOnCard} onChange={(e) => updatePayment("nameOnCard", e.target.value)} />
                        <input className={inputClassName} placeholder={editingPaymentId ? "Card Number (enter again to update)" : "Card Number"} value={payment.cardNumber} onChange={(e) => updatePayment("cardNumber", e.target.value)} />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input className={inputClassName} placeholder="Expiry Date" value={payment.expiryDate} onChange={(e) => updatePayment("expiryDate", e.target.value)} />
                            <input className={inputClassName} placeholder="CVV" value={payment.cvv} onChange={(e) => updatePayment("cvv", e.target.value)} />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Card number and CVV are not stored. Only safe card details are saved.
                        </p>
                        <button className="btn btn-primary mt-2 w-full" disabled={saving} onClick={savePayment}>
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
