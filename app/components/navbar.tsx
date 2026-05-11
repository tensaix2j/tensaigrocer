

"use client";

import React from 'react'
import { useState } from 'react';
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketShopping } from "@fortawesome/free-solid-svg-icons";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import '@fortawesome/fontawesome-svg-core/styles.css'
import { decode } from "html-entities";

import Logo from "./logo"
import SearchBar from "./searchbar"


const NavBar = ( {categories, onToggleSidebar, onToggleModal , user , onLogout } ) => {

	return (
			
		<div className="">
			
			<div className="w-full flex flex-row p-2 gap-2">

				<div className="flex flex-row md:basis-1/5 ">
					<button className="md:hidden text-2xl px-2 pb-1.5 m-0" onClick={ onToggleSidebar } >☰</button>
					<div className="text-xl p-1 pt-1.5 font-bold"><Link href="/"><Logo /></Link></div>
				</div>

				<div className="flex-1">
					<SearchBar />
				</div>

				<div className="hidden md:flex p-2 gap-4">
                    <div><button className="hover:text-green-900 cursor-pointer"><FontAwesomeIcon icon={faBasketShopping} /> Cart</button></div>

                    { user ? ( 
                        <>
                            <div><button className="hover:text-green-900 cursor-pointer">Hi, { user.firstName }</button></div>
                            <div><button className="hover:text-green-900 cursor-pointer" onClick={ onLogout } >Logout</button></div>				
                        </>
                    ) : (
                        <>
                            <div><button className="hover:text-green-900 cursor-pointer" onClick={ ()=>{ onToggleModal('signup')} } >Signup</button></div>
                            <div><button className="hover:text-green-900 cursor-pointer" onClick={ ()=>{ onToggleModal('login') } } >Login</button></div>				
                        </>
                    )}
				</div>

			</div>

			
		</div>

	)
}

export default NavBar