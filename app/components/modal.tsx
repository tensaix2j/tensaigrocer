
import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import '@fortawesome/fontawesome-svg-core/styles.css'
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

type ModalProps = {
    children: React.ReactNode;
    onClosed: () => void;
};

const Modal = ( {children, onClosed }: ModalProps ) => {
    return (
        <>
            <div className="fixed top-0 left-0 bg-[rgba(0,0,0,0.7)] dark:bg-[rgba(0,0,0,0.82)] w-full h-full"></div>
            <div className="fixed w-full h-full top-0 left-0 bg-white text-black dark:bg-zinc-900 dark:text-white
                md:w-1/2 
                md:h-auto  
                md:top-1/2 
                md:left-1/2  
                md:-translate-x-1/2 
                md:-translate-y-1/2 
                md:shadow-2xl 
                md:rounded-xl
                dark:md:shadow-black/60"
            >
                <button className="m-4 md:hidden text-lg hover:text-orange-700 dark:hover:text-amber-200" onClick={ onClosed } >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                { children }

                {/* close button, mobile noneed. */}
                <div className="hidden md:block absolute top-0 right-0 bg-black border border-white/70 dark:bg-white dark:border-zinc-700 translate-x-1/2 -translate-y-1/2 rounded-4xl aspect-square w-[40px] align-items-center justify-items-center text-white dark:text-black text-2xl pl-1 pt-1 cursor-pointer" onClick={ onClosed } >
                    <FontAwesomeIcon className="" icon={faXmark} />
                </div>
            </div>
        </>
    )
}

export default Modal
