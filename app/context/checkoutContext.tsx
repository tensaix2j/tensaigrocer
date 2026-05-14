"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

export type CheckoutAddress = {
    id: string;
    recipientName: string;
    contactNo: string;
    address: string;
    additionalDetails?: string;
};

export type CheckoutSchedule = {
    dayId: string;
    dayLabel: string;
    timeSlot: string;
};

export type CheckoutPayment = {
    id: string;
    label: string;
    detail: string;
    expiry?: string;
};

type CheckoutState = {
    address: CheckoutAddress | null;
    schedule: CheckoutSchedule | null;
    payment: CheckoutPayment | null;
};

type CheckoutContextType = CheckoutState & {
    setAddress: (address: CheckoutAddress | null) => void;
    setSchedule: (schedule: CheckoutSchedule | null) => void;
    setPayment: (payment: CheckoutPayment | null) => void;
    clearCheckout: () => void;
};

const storageKey = "tensaiGrocerCheckout";
const CheckoutContext = createContext<CheckoutContextType | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
    const [checkout, setCheckout] = useState<CheckoutState>(() => {
        if (typeof window === "undefined") {
            return { address: null, schedule: null, payment: null };
        }

        const savedCheckout = window.localStorage.getItem(storageKey);

        if (!savedCheckout) {
            return { address: null, schedule: null, payment: null };
        }

        try {
            const parsed = JSON.parse(savedCheckout) as CheckoutState;
            return {
                address: parsed.address || null,
                schedule: parsed.schedule || null,
                payment: parsed.payment || null,
            };
        } catch {
            window.localStorage.removeItem(storageKey);
            return { address: null, schedule: null, payment: null };
        }
    });

    useEffect(() => {
        window.localStorage.setItem(storageKey, JSON.stringify(checkout));
    }, [checkout]);

    const setAddress = useCallback((address: CheckoutAddress | null) => {
        setCheckout((prev) => ({ ...prev, address }));
    }, []);

    const setSchedule = useCallback((schedule: CheckoutSchedule | null) => {
        setCheckout((prev) => ({ ...prev, schedule }));
    }, []);

    const setPayment = useCallback((payment: CheckoutPayment | null) => {
        setCheckout((prev) => ({ ...prev, payment }));
    }, []);

    const clearCheckout = useCallback(() => {
        setCheckout({ address: null, schedule: null, payment: null });
        window.localStorage.removeItem(storageKey);
    }, []);

    return (
        <CheckoutContext.Provider value={{ ...checkout, setAddress, setSchedule, setPayment, clearCheckout }}>
            {children}
        </CheckoutContext.Provider>
    );
}

export function useCheckout() {
    const context = useContext(CheckoutContext);

    if (!context) {
        throw new Error("useCheckout must be used inside CheckoutProvider");
    }

    return context;
}
