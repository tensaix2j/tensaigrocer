"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Modal from "../../components/modal";


import { toast } from "react-toastify";
import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";


type ProfileModal = "edit" | "email" | "mobile" | "password" | null;

type CurrentUser = {
    email?: string;
    firstName?: string;
    lastName?: string;
    mobile?: string;
};

const actionButtonClassName =
    "flex min-h-24 items-center justify-center rounded-lg border border-gray-300 bg-white p-4 text-center font-semibold shadow-sm transition hover:border-orange-600 hover:text-orange-700 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-amber-200 dark:hover:text-amber-200";

const inputClassName =
    "input input-bordered w-full border border-gray-300 bg-white text-black placeholder:text-gray-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-gray-400";

export default function Profile() {
    const [activeModal, setActiveModal] = useState<ProfileModal>(null);
    const [personalInfo, setPersonalInfo] = useState({
        firstName: "",
        lastName: "",
        mobile: "",
    });
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
    });
    const [saving, setSaving] = useState(false);

    const closeModal = () => setActiveModal(null);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await fetch("/api/me");
                const data = (await res.json()) as { user?: CurrentUser | null };

                if (!res.ok || !data.user) {
                    return;
                }

                setPersonalInfo({
                    firstName: data.user.firstName || "",
                    lastName: data.user.lastName || "",
                    mobile: data.user.mobile || "",
                });
                setEmail(data.user.email || "");
                setMobile(data.user.mobile || "");
            } catch (error) {
                console.error(error);
            }
        };

        fetchCurrentUser();
    }, []);

    const saveProfile = async (payload: Record<string, string>) => {
        try {
            setSaving(true);
            const res = await fetch("/api/account/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Unable to update profile");
                return;
            }

            toast.success(data.message || "Profile updated");
            closeModal();
        } catch (error) {
            console.error(error);
            toast.error("Network error");
        } finally {
            setSaving(false);
        }
    };

    const savePassword = async () => {
        try {
            setSaving(true);
            const res = await fetch("/api/account/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(passwordForm),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Unable to update password");
                return;
            }

            toast.success(data.message || "Password updated");
            closeModal();
        } catch (error) {
            console.error(error);
            toast.error("Network error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto flex min-h-full max-w-4xl flex-col p-4 text-black dark:text-white">
            <div className="mb-6 flex items-center gap-3">
                <Link
                    href="/account"
                    aria-label="Back to account"
                    title="Back to account"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-black transition hover:border-orange-600 hover:text-orange-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:border-amber-200 dark:hover:text-amber-200"
                >
                    <FaChevronLeft size={20} />

                </Link>
                <h1 className="text-2xl font-bold">Profile</h1>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <button className={actionButtonClassName} onClick={() => setActiveModal("edit")}>
                    Edit Personal Info
                </button>
                <button className={actionButtonClassName} onClick={() => setActiveModal("email")}>
                    Update Email
                </button>
                <button className={actionButtonClassName} onClick={() => setActiveModal("mobile")}>
                    Update Mobile Number
                </button>
                <button className={actionButtonClassName} onClick={() => setActiveModal("password")}>
                    Change Password
                </button>
            </div>

            {activeModal === "edit" && (
                <Modal onClosed={closeModal}>
                    <div className="flex flex-col gap-3 p-4 text-black dark:text-white">
                        <h2 className="text-xl font-bold">Edit Personal Info</h2>

                        <input
                            className={inputClassName}
                            name="firstName"
                            placeholder="First Name"
                            value={personalInfo.firstName}
                            onChange={(e) => setPersonalInfo((prev) => ({ ...prev, firstName: e.target.value }))}
                        />
                        <input
                            className={inputClassName}
                            name="lastName"
                            placeholder="Last Name"
                            value={personalInfo.lastName}
                            onChange={(e) => setPersonalInfo((prev) => ({ ...prev, lastName: e.target.value }))}
                        />
                        <input
                            className={inputClassName}
                            name="mobile"
                            placeholder="Mobile Number"
                            value={personalInfo.mobile}
                            onChange={(e) => setPersonalInfo((prev) => ({ ...prev, mobile: e.target.value }))}
                        />

                        <button className="btn btn-primary mt-2 w-full" disabled={saving} onClick={() => saveProfile(personalInfo)}>
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </Modal>
            )}

            {activeModal === "email" && (
                <Modal onClosed={closeModal}>
                    <div className="flex flex-col gap-3 p-4 text-black dark:text-white">
                        <h2 className="text-xl font-bold">Update Email</h2>
                        <input
                            className={inputClassName}
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button className="btn btn-primary mt-2 w-full" disabled={saving} onClick={() => saveProfile({ email })}>
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </Modal>
            )}

            {activeModal === "mobile" && (
                <Modal onClosed={closeModal}>
                    <div className="flex flex-col gap-3 p-4 text-black dark:text-white">
                        <h2 className="text-xl font-bold">Update Mobile Number</h2>
                        <input
                            className={inputClassName}
                            placeholder="Mobile Number"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                        />
                        <button className="btn btn-primary mt-2 w-full" disabled={saving} onClick={() => saveProfile({ mobile })}>
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </Modal>
            )}

            {activeModal === "password" && (
                <Modal onClosed={closeModal}>
                    <div className="flex flex-col gap-3 p-4 text-black dark:text-white">
                        <h2 className="text-xl font-bold">Change Password</h2>
                        <input
                            className={inputClassName}
                            type="password"
                            placeholder="Current Password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        />
                        <input
                            className={inputClassName}
                            type="password"
                            placeholder="New Password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                        />
                        <button className="btn btn-primary mt-2 w-full" disabled={saving} onClick={savePassword}>
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
