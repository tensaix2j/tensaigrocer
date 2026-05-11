
import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import '@fortawesome/fontawesome-svg-core/styles.css'
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";


const Modal = ( {children, onClosed } ) => {
    return (
        <>
            <div className="fixed top-0 left-0 bg-[rgba(0,0,0,0.7)] w-full h-full"></div>
            <div className="fixed w-full h-full top-0 left-0 bg-white  
                md:w-1/2 
                md:h-auto  
                md:top-1/2 
                md:left-1/2  
                md:-translate-x-1/2 
                md:-translate-y-1/2 
                md:shadow-2xl 
                md:rounded-xl"
            >
                <button className="m-4 md:hidden text-lg" onClick={ onClosed } >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                { children }

                {/* close button, mobile noneed. */}
                <div className="hidden md:block  absolute top-0 right-0 bg-black border translate-x-1/2 -translate-y-1/2 rounded-4xl aspect-square w-[40px] align-items-center justify-items-center text-white text-2xl pl-1 pt-1" onClick={ onClosed } >
                    <FontAwesomeIcon className="" icon={faXmark} />
                </div>
            </div>
        </>
    )
}

export default Modal

