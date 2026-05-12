
'use client'
import React from 'react'
import NavBar from "./navbar";
import SideBar from "./sidebar";
import Modal from "./modal";
import { useState, useEffect } from 'react';

import Signup from './signup'
import Login from './login'
import { toast } from "react-toastify";
import type { AppUser, ModalAction } from "../types";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/navigation";

type NavSidebarShellProps = {
    children: React.ReactNode;
    categories: string[];
};

const NavSidebarShell = ({ children, categories }: NavSidebarShellProps) => {

	const [sidebarOpen, setSidebarOpen] = useState(true)
    const [isBigScreen, setIsBigScreen ] = useState(false);
    const [modalOpen, setModalOpen ] = useState( false );
    const [modalAction, setModalAction ] = useState<ModalAction | "">("");
    const [loadingUser, setLoadingUser] = useState(true)

    const { user, setUser, onLogin, onLogout } = useAuth();
    const router = useRouter();
    
    const signOut = async () => {
        await onLogout();
        toast.success("Logged out successfully");
        router.push("/");
        router.refresh();
    };

    const onModalChanged = ( action: ModalAction ) => {
        console.log( "onModalChanged", action )
        setModalAction(action);
        setModalOpen(true);
    }
    const onModalClosed = (  ) => {
        console.log("onModalClosed");
        setModalOpen(false);
    }

    

    


    useEffect(() => {

        const mediaQuery = window.matchMedia("(min-width: 768px)")
        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            setSidebarOpen(e.matches)
            setIsBigScreen(e.matches);
        }

        // initial check
        handleChange(mediaQuery)

        // listen for changes
        mediaQuery.addEventListener("change", handleChange)

        return () => {
            mediaQuery.removeEventListener("change", handleChange)
        }
    }, [])



	return (
		<div className="flex flex-col h-screen">
            <NavBar categories={categories} 
                onToggleSidebar={ () => setSidebarOpen(!sidebarOpen) } 
                onToggleModal={onModalChanged} 
                user={user}   
                onLogout={signOut}
            />
            <div className="p-0 flex-1 flex flex-row w-screen bg-amber-50 text-black dark:bg-zinc-950 dark:text-white">
                            
                
                <div className={`bg-amber-100 text-black dark:bg-zinc-900 dark:text-white ${ sidebarOpen ? "block" : "hidden" } `}>
                    <SideBar categories={categories} 
                            showUserMenu={!isBigScreen} 
                            onToggleModal={onModalChanged} 
                            user={user}
                            onLogout={signOut}
                    />
                </div>
            
                <div className="p-2 flex-1 bg-amber-50 text-black dark:bg-zinc-950 dark:text-white">
                        {children}
                        { modalOpen && 
                            <Modal onClosed={ onModalClosed } >
                                { modalAction == "login" && 
                                    <Login onClosed={ onModalClosed } onToggleModal={onModalChanged} onLogin={ onLogin } />
                                }
                                { modalAction == "signup" && 
                                    <Signup onClosed={ onModalClosed } onToggleModal={onModalChanged}  />
                                }
                            </Modal>
                        }
                </div>
            </div>
		</div>
	)
}

export default NavSidebarShell
