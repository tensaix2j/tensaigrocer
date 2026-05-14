
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
import CartDrawer from "./cartDrawer";

type NavSidebarShellProps = {
    children: React.ReactNode;
    categories: string[];
};

const NavSidebarShell = ({ children, categories }: NavSidebarShellProps) => {

	const [sidebarOpen, setSidebarOpen] = useState(true)
    const [cartdrawerOpen, setCartdrawerOpen] = useState(true)
    
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
		<div className="h-screen w-full overflow-hidden">
            
            {/* Navbar */}
            <div className="fixed left-0 right-0 top-0 z-30">
                <NavBar categories={categories} 
                    onToggleSidebar={ () => setSidebarOpen(!sidebarOpen) } 
                    onToggleCartdrawer={ () => setCartdrawerOpen(!cartdrawerOpen) }
                    onToggleModal={onModalChanged} 
                    user={user}   
                    onLogout={signOut}
                />
            </div>

            {/* Cart Drawer */}
            <div className={`${ cartdrawerOpen ? "block" : "hidden" }`} >
                <div className="fixed top-16 right-0 z-20 h-[calc(100vh-4rem)] w-[50vw] bg-gray-100 dark:bg-zinc-950 dark:text-white md:w-[25vw]">
                    <CartDrawer />
                </div>
            </div>

            <div className="flex h-screen w-screen flex-row overflow-hidden pt-16 bg-amber-50 text-black dark:bg-zinc-950 dark:text-white">
                            
                
                {/* Left Sidebar */}
                <div className={`overflow-y-auto bg-amber-100 text-black dark:bg-zinc-900 dark:text-white ${ sidebarOpen ? "block" : "hidden" } `}>
                    <SideBar categories={categories} 
                            showUserMenu={!isBigScreen} 
                            onToggleModal={onModalChanged} 
                            onToggleCartdrawer={ () => setCartdrawerOpen(!cartdrawerOpen) }
                            user={user}
                            onLogout={signOut}
                    />
                </div>
            
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-2 bg-amber-50 text-black dark:bg-zinc-950 dark:text-white">
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
