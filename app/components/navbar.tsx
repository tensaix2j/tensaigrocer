

"use client";

import React from 'react'
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketShopping } from "@fortawesome/free-solid-svg-icons";
import '@fortawesome/fontawesome-svg-core/styles.css'

import Logo from "./logo"
import SearchBar from "./searchbar"
import type { AppUser, ToggleModal } from "../types";
import ThemeToggle from './themeToggle'

type NavBarProps = {
    categories: string[];
    onToggleSidebar: () => void;
    onToggleModal: ToggleModal;
    user: AppUser | null;
    onLogout: () => void;
};

const NavBar = ( {categories, onToggleSidebar, onToggleModal , user , onLogout }: NavBarProps ) => {
    const buttonClassName = "hover:text-green-900 dark:hover:text-amber-200 cursor-pointer";

	return (
			
		<div className="">
			
			<div className="w-full flex flex-row p-2 gap-2 items-center bg-amber-200 text-black dark:bg-zinc-900 dark:text-white">

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
                    <div><button className={buttonClassName}><FontAwesomeIcon icon={faBasketShopping} /> Cart</button></div>

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
