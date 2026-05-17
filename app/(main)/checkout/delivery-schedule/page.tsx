"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaChevronLeft, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";
import CheckoutSteps from "../../../components/checkoutSteps";
import { useCheckout } from "../../../context/checkoutContext";

const timeSlots = [
    "10:00 am - 1:00 pm",
    "1:00 pm - 4:00 pm",
    "4:00 pm - 7:00 pm",
    "6:00 pm - 9:00 pm",
];

const formatDay = (date: Date) =>
    new Intl.DateTimeFormat("en-SG", {
        weekday: "short",
        day: "numeric",
        month: "short",
    }).format(date);

export default function CheckoutDeliverySchedule() {
    const router = useRouter();
    const { address, setSchedule } = useCheckout();

    useEffect(() => {
        if (!address) {
            toast.error("Please select a delivery address first");
            router.push("/checkout/delivery-address");
        }
    }, [address, router]);
    const deliveryDays = useMemo(() => {
        const today = new Date();

        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() + index + 1);

            return {
                id: date.toISOString().slice(0, 10),
                label: index === 0 ? "Tomorrow" : formatDay(date).split(",")[0],
                date: formatDay(date),
            };
        });
    }, []);

    const [selectedDay, setSelectedDay] = useState(deliveryDays[0]?.id || "");
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(timeSlots[0]);
    const selectedDayLabel = deliveryDays.find((day) => day.id === selectedDay)?.date;

    useEffect(() => {
        if (!selectedDayLabel) {
            return;
        }

        setSchedule({
            dayId: selectedDay,
            dayLabel: selectedDayLabel,
            timeSlot: selectedTimeSlot,
        });
    }, [selectedDay, selectedDayLabel, selectedTimeSlot, setSchedule]);

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 text-black dark:text-white">
            <CheckoutSteps currentStep={2} />

            <section>
                <h1 className="text-2xl font-bold">Delivery Schedule</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Select a delivery day and time slot.</p>
            </section>

            <section className="rounded-lg border border-gray-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                <h2 className="mb-3 flex items-center gap-2 font-bold">
                    <FaCalendarAlt size={16} />
                    Delivery Day
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {deliveryDays.map((day) => {
                        const selected = day.id === selectedDay;

                        return (
                            <button
                                key={day.id}
                                className={`min-w-32 rounded-lg border p-4 text-left shadow-sm transition hover:border-orange-600 dark:hover:border-amber-200 ${
                                    selected
                                        ? "border-orange-600 bg-orange-50 dark:border-amber-200 dark:bg-zinc-800"
                                        : "border-gray-300 bg-white dark:border-zinc-700 dark:bg-zinc-950"
                                }`}
                                onClick={() => setSelectedDay(day.id)}
                            >
                                <div className="font-bold">{day.label}</div>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{day.date}</p>
                            </button>
                        );
                    })}
                </div>

                <h2 className="mb-3 mt-5 flex items-center gap-2 font-bold">
                    <FaClock size={16} />
                    Delivery Time
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {timeSlots.map((slot) => {
                        const selected = slot === selectedTimeSlot;

                        return (
                            <button
                                key={slot}
                                className={`rounded-lg border p-4 text-left font-semibold shadow-sm transition hover:border-orange-600 dark:hover:border-amber-200 ${
                                    selected
                                        ? "border-orange-600 bg-orange-50 dark:border-amber-200 dark:bg-zinc-800"
                                        : "border-gray-300 bg-white dark:border-zinc-700 dark:bg-zinc-950"
                                }`}
                                onClick={() => setSelectedTimeSlot(slot)}
                            >
                                {slot}
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="flex items-center justify-between gap-3">
                <Link href="/checkout/delivery-address" className="btn btn-ghost">
                    <FaChevronLeft size={12} />
                    Back
                </Link>
                <div className="hidden text-sm text-gray-700 dark:text-gray-300 sm:block">
                    {selectedDayLabel}, {selectedTimeSlot}
                </div>
                <Link href="/checkout/review" className="btn btn-primary">
                    Next
                </Link>
            </section>
        </div>
    );
}
