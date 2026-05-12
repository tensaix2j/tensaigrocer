"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../components/modal";
import { toast } from "react-toastify";


const buttonClassName =
    "flex min-h-24 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white p-4 text-center font-semibold shadow-sm transition hover:border-orange-600 hover:text-orange-700 md:w-auto dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-amber-200 dark:hover:text-amber-200";

const inputClassName =
    "input input-bordered w-full border border-gray-300 bg-white text-black placeholder:text-gray-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-gray-400";

type SavedAddress = {
    _id: string;
    recipientName: string;
    contactNo: string;
    postalCode: string;
    streetName: string;
    level?: string;
    unit?: string;
    additionalDetails?: string;
};

const emptyAddress = {
    recipientName: "",
    contactNo: "",
    postalCode: "",
    streetName: "",
    level: "",
    unit: "",
    additionalDetails: "",
};

export default function DeliveryAddress() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [addresses, setAddresses] = useState<SavedAddress[]>([]);
    const [address, setAddress] = useState(emptyAddress);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await fetch("/api/account/delivery-addresses");
                const data = (await res.json()) as { addresses?: SavedAddress[]; message?: string };

                if (!res.ok) {
                    toast.error(data.message || "Unable to load addresses");
                    return;
                }

                setAddresses(data.addresses || []);
            } catch (error) {
                console.error(error);
                toast.error("Network error");
            }
        };

        fetchAddresses();
    }, []);

    const updateAddress = (field: keyof typeof address, value: string) => {
        setAddress((prev) => ({ ...prev, [field]: value }));
    };

    const openAddModal = () => {
        setEditingAddressId(null);
        setAddress(emptyAddress);
        setModalOpen(true);
    };

    const openEditModal = (savedAddress: SavedAddress) => {
        setEditingAddressId(savedAddress._id);
        setAddress({
            recipientName: savedAddress.recipientName,
            contactNo: savedAddress.contactNo,
            postalCode: savedAddress.postalCode,
            streetName: savedAddress.streetName,
            level: savedAddress.level || "",
            unit: savedAddress.unit || "",
            additionalDetails: savedAddress.additionalDetails || "",
        });
        setModalOpen(true);
    };

    const saveAddress = async () => {
        try {
            setSaving(true);
            const res = await fetch("/api/account/delivery-addresses", {
                method: editingAddressId ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingAddressId ? { ...address, _id: editingAddressId } : address),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Unable to save address");
                return;
            }

            toast.success(data.message || "Address saved");
            setAddresses((prev) => {
                if (editingAddressId) {
                    return prev.map((savedAddress) => savedAddress._id === editingAddressId ? data.address : savedAddress);
                }

                return [data.address, ...prev];
            });
            setAddress(emptyAddress);
            setEditingAddressId(null);
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
                    <FontAwesomeIcon icon={faChevronLeft} />
                </Link>
                <h1 className="text-2xl font-bold">Delivery Address</h1>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <button className={buttonClassName} onClick={openAddModal}>
                    <FontAwesomeIcon icon={faPlus} />
                    Add New Address
                </button>

                {addresses.map((savedAddress) => (
                    <button
                        key={savedAddress._id}
                        className="min-h-24 rounded-lg border border-gray-300 bg-white p-4 text-left shadow-sm transition hover:border-orange-600 hover:text-orange-700 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-amber-200 dark:hover:text-amber-200"
                        onClick={() => openEditModal(savedAddress)}
                    >
                        <h2 className="font-bold">{savedAddress.recipientName}</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{savedAddress.contactNo}</p>
                        <p className="mt-3 text-sm">
                            {savedAddress.streetName}
                            {savedAddress.level || savedAddress.unit ? `, #${savedAddress.level || "-"}-${savedAddress.unit || "-"}` : ""}
                        </p>
                        <p className="text-sm">Singapore {savedAddress.postalCode}</p>
                        {savedAddress.additionalDetails && (
                            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{savedAddress.additionalDetails}</p>
                        )}
                    </button>
                ))}
            </div>

            {modalOpen && (
                <Modal onClosed={() => setModalOpen(false)}>
                    <div className="flex flex-col gap-3 p-4 text-black dark:text-white">
                        <h2 className="text-xl font-bold">{editingAddressId ? "Edit Delivery Address" : "Add New Address"}</h2>
                        <input className={inputClassName} placeholder="Recipient Name" value={address.recipientName} onChange={(e) => updateAddress("recipientName", e.target.value)} />
                        <input className={inputClassName} placeholder="Contact No" value={address.contactNo} onChange={(e) => updateAddress("contactNo", e.target.value)} />
                        <input className={inputClassName} placeholder="Postal Code" value={address.postalCode} onChange={(e) => updateAddress("postalCode", e.target.value)} />
                        <input className={inputClassName} placeholder="Street Name" value={address.streetName} onChange={(e) => updateAddress("streetName", e.target.value)} />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input className={inputClassName} placeholder="Level" value={address.level} onChange={(e) => updateAddress("level", e.target.value)} />
                            <input className={inputClassName} placeholder="Unit" value={address.unit} onChange={(e) => updateAddress("unit", e.target.value)} />
                        </div>
                        <input className={inputClassName} placeholder="Additional Address Details" value={address.additionalDetails} onChange={(e) => updateAddress("additionalDetails", e.target.value)} />
                        <button className="btn btn-primary mt-2 w-full" disabled={saving} onClick={saveAddress}>
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
