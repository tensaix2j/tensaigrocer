
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

type NavSidebarShellProps = {
    children: React.ReactNode;
    categories: string[];
};

const NavSidebarShell = ({ children, categories }: NavSidebarShellProps) => {

	const [sidebarOpen, setSidebarOpen] = useState(true)
    const [isBigScreen, setIsBigScreen ] = useState(false);
    const [modalOpen, setModalOpen ] = useState( false );
    const [modalAction, setModalAction ] = useState<ModalAction | "">("");
    
    const [user, setUser] = useState<AppUser | null>(null)
    const [loadingUser, setLoadingUser] = useState(true)


    const onModalChanged = ( action: ModalAction ) => {
        console.log( "onModalChanged", action )
        setModalAction(action);
        setModalOpen(true);
    }
    const onModalClosed = (  ) => {
        console.log("onModalClosed");
        setModalOpen(false);
    }

    const onLogin = async () => {
        await fetchUser()
    }

    const onLogout = async () => {
        await fetch('/api/logout', { method: 'POST' })
        setUser(null)
        toast.success("Logged out successfully");
    }

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/me')
            const data = await res.json()

            if (res.ok) {
                console.log( "User", data.user );
                setUser(data.user)
            } else {
                setUser(null)
            }

        } catch (err) {
            console.error(err)
            setUser(null)
        } finally {
            setLoadingUser(false)
        }
    }

    useEffect(()=>{
        fetchUser()
    },[])



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
                onLogout={onLogout}
            />
            <div className="p-0 flex-1 bg-gray-200 flex flex-row w-screen">
                            
                
                <div className={`bg-gray-300 ${ sidebarOpen ? "block" : "hidden" } `}>
                    <SideBar categories={categories} 
                            showUserMenu={!isBigScreen} 
                            onToggleModal={onModalChanged} 
                            user={user}
                            onLogout={onLogout}
                    />
                </div>
            
                <div className="p-2 flex-1">
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
