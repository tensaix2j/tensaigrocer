'use client'
import React, { useState } from 'react'
import { toast } from "react-toastify";
import type { ToggleModal } from "../types";

type LoginErrors = Partial<Record<"email" | "password" | "api", string>>;

type LoginProps = {
    onClosed?: () => void;
    onToggleModal: ToggleModal;
    onLogin?: () => void;
};

const Login = ({ onClosed, onToggleModal, onLogin }: LoginProps) => {

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const [errors, setErrors] = useState<LoginErrors>({})
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }))

        setErrors(prev => ({
            ...prev,
            [name]: '',
        }))
    }

    const validateForm = () => {
        const newErrors: LoginErrors = {}

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleLogin = async () => {

        if (!validateForm()) return

        try {
            setLoading(true)

            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                setErrors({ api: data.message || 'Login failed' })
                return
            }

            // SUCCESS
            console.log("Logged in user:", data.user)
            toast.success('Welcome, ' + data.user.firstName)

            // close modal
            onClosed?.()
            onLogin?.()
            
        } catch (err) {
            console.error(err)
            setErrors({ api: 'Network error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-2 m-2 text-black dark:text-white">

            <h2 className="text-xl font-bold m-2">Log In</h2>

            {/* API error */}
            {errors.api && (
                <p className="text-red-500 text-sm">{errors.api}</p>
            )}

            {/* Email */}
            <div>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input input-bordered w-full bg-white text-black border border-gray-300 placeholder:text-gray-500 dark:bg-zinc-800 dark:text-white dark:placeholder:text-gray-400 dark:border-zinc-700"
                />
                {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                )}
            </div>

            {/* Password */}
            <div>
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input input-bordered w-full bg-white text-black border border-gray-300 placeholder:text-gray-500 dark:bg-zinc-800 dark:text-white dark:placeholder:text-gray-400 dark:border-zinc-700"
                />
                {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                )}
            </div>

            <button
                className="btn btn-primary w-full"
                onClick={handleLogin}
                disabled={loading}
            >
                {loading ? 'Logging in...' : 'Log In'}
            </button>

            <div className="text-sm mt-10">
                Don't have an account?
                <button
                    className="cursor-pointer text-blue-600 dark:text-amber-200 ml-1"
                    onClick={() => onToggleModal("signup")}
                >
                    Sign Up
                </button>
            </div>

        </div>
    )
}

export default Login
