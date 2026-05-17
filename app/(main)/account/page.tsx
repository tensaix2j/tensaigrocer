"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Modal from "../../components/modal";
import { useState } from "react";
import { useAuth } from "../../context/authContext";

const cardClassName =
    "flex min-h-24 items-center justify-center rounded-lg border border-gray-300 bg-white p-4 text-center font-semibold shadow-sm transition hover:border-orange-600 hover:text-orange-700 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-amber-200 dark:hover:text-amber-200";

export default function Account() {
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { onLogout } = useAuth();
    
    const signOut = async () => {
        
        await onLogout();
        toast.success("Logged out successfully");
        router.push("/");
        router.refresh();
    };

    return (
        <div className="mx-auto max-w-4xl p-4 text-black dark:text-white">
            <h1 className="mb-6 text-2xl font-bold">Account</h1>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Link href="/profile" className={cardClassName}>Personal Info</Link>
                <Link href="/account/delivery-address" className={cardClassName}>Delivery Addresses</Link>
                <Link href="/account/order-history" className={cardClassName}>Transactions</Link>
                <button className={cardClassName} onClick={signOut}>Sign out</button>
                <button className={`${cardClassName} hover:border-red-600 hover:text-red-600 dark:hover:border-red-400 dark:hover:text-red-400`} onClick={() => setShowDeleteModal(true)}>
                    Delete Account
                </button>
            </div>

            {showDeleteModal && (
                <Modal onClosed={() => setShowDeleteModal(false)}>
                    <div className="flex flex-col gap-4 p-4 text-black dark:text-white">
                        <h2 className="text-xl font-bold">Are you really sure?</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            This action cannot be undone.
                        </p>
                        <button className="rounded-lg bg-red-600 px-4 py-3 text-lg font-bold text-white hover:bg-red-700" onClick={() => setShowDeleteModal(false)}>
                            Confirm
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
