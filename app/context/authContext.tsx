
// context/AuthContext.tsx

"use client";

import {
	createContext,
	useContext,
	useState,
	ReactNode,
} from "react";

type User = {
	id: string;
    emai: string;
	firstName: string;
};

type AuthContextType = {
	user: User | null;
	setUser: (user: User | null) => void;
    onLogin: ()=> Promise<void>;
    onLogout:()=> Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(
	undefined
);


//-------------------------------
export function AuthProvider({
	children,
}: {
	children: ReactNode;
}) {
	
    const [user, setUser] = useState<User | null>(null);


    //-------------------
    const onLogin = async () => {
        await fetchUser()
    }
    
    //-------------------
    const onLogout = async () => {
        await fetch('/api/logout', { method: 'POST' })
        setUser(null)
    }

    //-------------------
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
            
        }
    }


	return (
		<AuthContext.Provider value={{ user, setUser, onLogin, onLogout }}>
			{children}
		</AuthContext.Provider>
	);
}


//-------------------------------
export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used inside AuthProvider");
	}

	return context;
}
