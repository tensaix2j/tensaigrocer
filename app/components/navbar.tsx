

"use client";

import React from 'react'
import Link from "next/link";


import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaShoppingCart } from "react-icons/fa";


import Logo from "./logo"
import SearchBar from "./searchbar"
import type { AppUser, ToggleModal } from "../types";
import ThemeToggle from './themeToggle'

type NavBarProps = {
    categories: string[];
    onToggleSidebar: () => void;
    onToggleCartdrawer: () => void;
    onToggleModal: ToggleModal;
    cartSubtotal: number;
    user: AppUser | null;
    onLogout: () => void;
};

const NavBar = ( {categories, onToggleSidebar, onToggleCartdrawer, onToggleModal, cartSubtotal, user , onLogout }: NavBarProps ) => {
    const buttonClassName = "hover:text-green-900 dark:hover:text-amber-200 cursor-pointer";

	return (
			
			
			<div className="flex min-h-16 w-full flex-row items-center gap-2 bg-amber-200 p-2 text-black dark:bg-zinc-900 dark:text-white">

				<div className="flex flex-row md:basis-1/6 ">
				
                	<button className="md:hidden text-2xl px-2 pb-1.5 m-0" onClick={ onToggleSidebar } >☰</button>
					
                    <div className="text-2xl p-2 px-2 md:px-4 pt-1.5 font-bold hidden md:block">
                        <Link href="/">
                            <Logo />
                        </Link>
                    </div>
				</div>
                
                <div className="flex-1">
                    <SearchBar />
                </div>

                <div><ThemeToggle /></div>
                    
                <div>
                    <button className={`${buttonClassName} flex items-center gap-1`} onClick={ onToggleCartdrawer }>
                        <FaShoppingCart size={20} /> 
                        {cartSubtotal > 0 && (
                            <span className="text-sm">${cartSubtotal.toFixed(2)}</span>
                        )}
                    </button>
                </div>
                

                <div className="hidden md:flex p-2 gap-4 items-center">
                    

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

			

	)
}

export default NavBar
