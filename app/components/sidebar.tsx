import React from 'react'


import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaShoppingCart } from "react-icons/fa";


import Link  from "next/link"
import { decode } from "html-entities";
import type { AppUser, ToggleModal } from "../types";
import ThemeToggle from './themeToggle'

type SideBarProps = {
    categories: string[];
    showUserMenu: boolean;
    onToggleModal: ToggleModal;
    onToggleCartdrawer: () => void;
    cartSubtotal: number;
    user: AppUser | null;
    onLogout: () => void;
};

const SideBar = ( { categories , showUserMenu , onToggleModal, onToggleCartdrawer, cartSubtotal, user , onLogout }: SideBarProps ) => {
    
    const buttonClassName = "hover:text-green-900 dark:hover:text-amber-200 cursor-pointer";

    return (
		<div className="p-4 px-4 md:px-6 flex flex-col gap-1 text-black dark:text-white">
            
            { showUserMenu &&  
                <div className="flex flex-col gap-1 ml-1">
                    
                    { user ? ( 
                        <>
                            <div>
                                <Link href="/account" className={buttonClassName}>
                                    Hi, { user.firstName }
                                </Link>
                            </div>

                            <div><button className="text-sm hover:text-green-900 dark:hover:text-amber-200 cursor-pointer" onClick={ onLogout } >Logout</button></div>				
                        </>
                    ) : (
                        <>
                            <div><button className="text-sm hover:text-green-900 dark:hover:text-amber-200 cursor-pointer" onClick={ ()=>{ onToggleModal('signup')} } >Signup</button></div>
                            <div><button className="text-sm hover:text-green-900 dark:hover:text-amber-200 cursor-pointer" onClick={ ()=>{ onToggleModal('login') } } >Login</button></div>				                

                        </>
                    )}

                    

                </div>
            }

            { categories.map( (category,i: number)=> (

				<Link href={ "/" + category } key={i} className="flex flex-row p-1 cursor-pointer hover:text-orange-700 dark:hover:text-amber-200 text-sm items-center">
                    <div className="flex-1">
                        { decode( category ) }
                    </div>
                    
				</Link>
            ))}				
		</div>
	)
}

export default SideBar
