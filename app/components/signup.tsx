
import React, { useState } from 'react'
import Link from 'next/link'
import { toast } from "react-toastify";
import type { ToggleModal } from "../types";

type SignUpErrors = Partial<Record<"firstName" | "lastName" | "email" | "mobile" | "password", string>>;

type SignUpProps = {
    onClosed?: () => void;
    onToggleModal: ToggleModal;
};

const SignUp = ({ onClosed , onToggleModal }: SignUpProps) => {

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        password: '',
    })

    const [errors, setErrors] = useState<SignUpErrors>({})
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
        const newErrors: SignUpErrors = {}

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required'
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required'
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email'
        }

        const mobileRegex = /^[0-9]{8,15}$/
        if (!formData.mobile) {
            newErrors.mobile = 'Mobile is required'
        } else if (!mobileRegex.test(formData.mobile)) {
            newErrors.mobile = 'Invalid mobile number'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Min 6 characters'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {

        console.log("handleSubmit");
        
        if (!validateForm()) return

        try {
            setLoading(true)

            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                
                toast.error(data.message || 'Something went wrong')
                
                if ( data.message.indexOf( "User already exists") > -1 ) {
                    onToggleModal("login")
                } 
                
                return
            }
            
            toast.success("Registration success");
            onToggleModal("login")
            
        } catch (err) {
            
            console.error(err)
            toast.error('Network error')

        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-2 m-2 text-black dark:text-white">

            <h2 className="text-xl font-bold m-2">Sign Up</h2>

            <input
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="input input-bordered w-full bg-white text-black border border-gray-300 placeholder:text-gray-500 dark:bg-zinc-800 dark:text-white dark:placeholder:text-gray-400 dark:border-zinc-700"
            />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}

            <input
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="input input-bordered w-full bg-white text-black border border-gray-300 placeholder:text-gray-500 dark:bg-zinc-800 dark:text-white dark:placeholder:text-gray-400 dark:border-zinc-700"
            />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}

            <input
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="input input-bordered w-full bg-white text-black border border-gray-300 placeholder:text-gray-500 dark:bg-zinc-800 dark:text-white dark:placeholder:text-gray-400 dark:border-zinc-700"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            <input
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className="input input-bordered w-full bg-white text-black border border-gray-300 placeholder:text-gray-500 dark:bg-zinc-800 dark:text-white dark:placeholder:text-gray-400 dark:border-zinc-700"
            />
            {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}

            <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="input input-bordered w-full bg-white text-black border border-gray-300 placeholder:text-gray-500 dark:bg-zinc-800 dark:text-white dark:placeholder:text-gray-400 dark:border-zinc-700"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

            <div className="text-sm mt-6">
                By submitting, I agree to the
                <Link href="/terms" className="text-blue-600 dark:text-amber-200" onClick={onClosed}>
                    {' '}Terms and Conditions
                </Link>
                {' '}and
                <Link href="/policy" className="text-blue-600 dark:text-amber-200" onClick={onClosed}>
                    {' '}Privacy Policy
                </Link>.
            </div>

            <button
                className="btn btn-primary w-full"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? 'Creating Account...' : 'Create Account'}
            </button>

        </div>
    )
}

export default SignUp
