

"use client";

import React from 'react'
import Link from "next/link";


import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaShoppingCart } from "react-icons/fa";


import Logo from "./logo"
import SearchBar from "./searchbar"
import type { AppUser, ToggleModal } from "../types";
import ThemeToggle from './themeToggle'
import { useCart } from "../context/cartContext";

type NavBarProps = {
    categories: string[];
    onToggleSidebar: () => void;
    onToggleCartdrawer: () => void;
    onToggleModal: ToggleModal;
    user: AppUser | null;
    onLogout: () => void;
};

const NavBar = ( {categories, onToggleSidebar, onToggleCartdrawer, onToggleModal , user , onLogout }: NavBarProps ) => {
    const buttonClassName = "hover:text-green-900 dark:hover:text-amber-200 cursor-pointer";
    const { state } = useCart();
    const subtotal = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

	return (
			
		<div className="">
			
			<div className="flex min-h-16 w-full flex-row items-center gap-2 bg-amber-200 p-2 text-black dark:bg-zinc-900 dark:text-white">

				<div className="flex flex-row md:basis-1/5 ">
					<button className="md:hidden text-2xl px-2 pb-1.5 m-0" onClick={ onToggleSidebar } >☰</button>
					<div className="text-2xl p-1 pt-1.5 font-bold">
                        <Link href="/">
                            <Logo />
                        </Link></div>
				</div>

				<div className="flex-1">
					<SearchBar />
				</div>

				<div className="hidden md:flex p-2 gap-4 items-center">
                    <div><ThemeToggle /></div>
                    <div>
                        <button className={`${buttonClassName} flex items-center gap-1`} onClick={ onToggleCartdrawer }>
                            <FaShoppingCart size={20} /> 
                            {subtotal > 0 && (
                                <span className="text-sm">${subtotal.toFixed(2)}</span>
                            )}
                        </button>
                    </div>

                    { user ? ( 
                        <>
                            <div>
                                <Link href="/account" className={buttonClassName}>
                                    Hi, { user.firstName }
                                </Link>
                            </div>
                            <div><button className={buttonClassName} onClick={ onLogout } >Logout</button></div>				
                        </>
                    ) : (
                        <>
                            <div><button className={buttonClassName} onClick={ ()=>{ onToggleModal('signup')} } >Signup</button></div>
                            <div><button className={buttonClassName} onClick={ ()=>{ onToggleModal('login') } } >Login</button></div>				
                        </>
                    )}
				</div>

			</div>

			
		</div>

	)
}

export default NavBar
