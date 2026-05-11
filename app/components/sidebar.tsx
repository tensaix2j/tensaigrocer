import React from 'react'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { faBasketShopping } from "@fortawesome/free-solid-svg-icons";

import '@fortawesome/fontawesome-svg-core/styles.css'

import Link  from "next/link"
import { decode } from "html-entities";
import type { AppUser, ToggleModal } from "../types";

type SideBarProps = {
    categories: string[];
    showUserMenu: boolean;
    onToggleModal: ToggleModal;
    user: AppUser | null;
    onLogout: () => void;
};

const SideBar = ( { categories , showUserMenu , onToggleModal , user , onLogout }: SideBarProps ) => {
    
    return (
		<div className="p-2">
            
            { showUserMenu &&  
                <div className="flex flex-col gap-1 ml-1">
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
            }

            { categories.map( (category,i: number)=> (

				<Link href={ "/" + category } key={i} className="flex flex-row p-1 cursor-pointer hover:text-green-700 items-center">
                    <div className="flex-1">
                        { decode( category ) }
                    </div>
                    <div className="text-gray-400">
                            <FontAwesomeIcon icon={faChevronRight} />
                    </div>
                    
				</Link>
            ))}				
		</div>
	)
}

export default SideBar
