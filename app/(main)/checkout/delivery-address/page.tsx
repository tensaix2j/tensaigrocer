"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FaMapMarkedAlt, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import CheckoutSteps from "../../../components/checkoutSteps";
import { useCheckout } from "../../../context/checkoutContext";

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

type MapLocation = {
    lng: number;
    lat: number;
    placeName: string;
};

const formatAddress = (address: SavedAddress) => {
    const unit = address.level || address.unit ? `, #${address.level || "-"}-${address.unit || "-"}` : "";
    return `${address.streetName}${unit}, Singapore ${address.postalCode}`;
};

export default function CheckoutDeliveryAddress() {
    const [addresses, setAddresses] = useState<SavedAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [mapLocation, setMapLocation] = useState<MapLocation | null>(null);
    const [mapLoading, setMapLoading] = useState(false);
    const { setAddress } = useCheckout();

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await fetch("/api/account/delivery-addresses");
                const data = (await res.json()) as { addresses?: SavedAddress[]; message?: string };

                if (!res.ok) {
                    toast.error(data.message || "Unable to load addresses");
                    return;
                }

                const nextAddresses = data.addresses || [];
                setAddresses(nextAddresses);
                setSelectedAddressId(nextAddresses[0]?._id || "");
            } catch (error) {
                console.error(error);
                toast.error("Network error");
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, []);

    const selectedAddress = useMemo(
        () => addresses.find((address) => address._id === selectedAddressId),
        [addresses, selectedAddressId]
    );

    useEffect(() => {
        if (!selectedAddress) {
            setAddress(null);
            return;
        }

        setAddress({
            id: selectedAddress._id,
            recipientName: selectedAddress.recipientName,
            contactNo: selectedAddress.contactNo,
            address: formatAddress(selectedAddress),
            additionalDetails: selectedAddress.additionalDetails,
        });
    }, [selectedAddress, setAddress]);

    useEffect(() => {
        const controller = new AbortController();

        const geocodeAddress = async () => {
            try {
                setMapLoading(true);

                if (!selectedAddress) {
                    setMapLocation(null);
                    return;
                }

                const res = await fetch(`/api/mapbox/geocode?address=${encodeURIComponent(selectedAddress.postalCode)}`, {
                    signal: controller.signal,
                });
                const data = (await res.json()) as MapLocation & { message?: string };

                if (!res.ok) {
                    setMapLocation(null);
                    toast.error(data.message || "Unable to load map");
                    return;
                }

                setMapLocation({
                    lng: data.lng,
                    lat: data.lat,
                    placeName: data.placeName,
                });
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error(error);
                    setMapLocation(null);
                    toast.error("Unable to load map");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setMapLoading(false);
                }
            }
        };

        geocodeAddress();

        return () => controller.abort();
    }, [selectedAddress]);

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 text-black dark:text-white">
            <CheckoutSteps currentStep={1} />

            <section>
                <h1 className="text-2xl font-bold">Delivery Address</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Select a saved address or add a new one.</p>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
                <div className="flex flex-col gap-3">
                    <Link
                        href="/account/delivery-address"
                        className="flex min-h-20 items-center justify-center gap-2 rounded-lg border border-dashed border-gray-400 bg-white p-4 font-semibold transition hover:border-orange-600 hover:text-orange-700 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-amber-200 dark:hover:text-amber-200"
                    >
                        <FaPlus size={14} />
                        Add New Delivery Address
                    </Link>

                    {loading ? (
                        <div className="rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300">
                            Loading addresses...
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300">
                            No saved delivery address yet.
                        </div>
                    ) : (
                        addresses.map((address) => {
                            const selected = address._id === selectedAddressId;

                            return (
                                <button
                                    key={address._id}
                                    className={`rounded-lg border bg-white p-4 text-left shadow-sm transition hover:border-orange-600 dark:bg-zinc-900 dark:hover:border-amber-200 ${
                                        selected ? "border-orange-600 dark:border-amber-200" : "border-gray-300 dark:border-zinc-700"
                                    }`}
                                    onClick={() => setSelectedAddressId(address._id)}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="font-bold">{address.recipientName}</h2>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{address.contactNo}</p>
                                        </div>
                                        {selected && <span className="badge badge-primary p-4">Selected</span>}
                                    </div>
                                    <p className="mt-3 text-sm">{formatAddress(address)}</p>
                                    {address.additionalDetails && (
                                        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{address.additionalDetails}</p>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="min-h-80 overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                    <div className="flex h-full min-h-80 flex-col">
                        <div className="flex items-center gap-2 border-b border-gray-300 p-4 font-bold dark:border-zinc-700">
                            <FaMapMarkedAlt className="text-orange-700 dark:text-amber-200" />
                            Map
                        </div>
                        <div className="relative flex flex-1 items-center justify-center bg-green-50 text-center dark:bg-zinc-800">
                            {mapLocation ? (
                                <img
                                    src={`/api/mapbox/static?lng=${mapLocation.lng}&lat=${mapLocation.lat}`}
                                    alt={mapLocation.placeName}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)]" />
                            )}

                            <div className="relative m-6 rounded-lg bg-white/90 p-4 shadow-sm dark:bg-zinc-950/90">
                                <p className="font-semibold">
                                    {mapLoading ? "Loading map..." : selectedAddress ? selectedAddress.recipientName : "No address selected"}
                                </p>
                                <p className="mt-2 max-w-sm text-sm text-gray-600 dark:text-gray-300">
                                    {mapLocation?.placeName || (selectedAddress ? formatAddress(selectedAddress) : "Select or add an address to preview it on the map.")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="flex justify-end">
                <Link
                    href="/checkout/delivery-schedule"
                    className={`btn btn-primary ${selectedAddress ? "" : "btn-disabled"}`}
                    aria-disabled={!selectedAddress}
                >
                    Next
                </Link>
            </section>
        </div>
    );
}
