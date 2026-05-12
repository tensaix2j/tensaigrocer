import type { Metadata } from "next";
import "../globals.css";

import { getCategories } from "../lib/getCategories"
import NavSidebarShell from "../components/navSidebarShell";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Varela_Round } from 'next/font/google'

import { ThemeProvider } from 'next-themes'

export const metadata: Metadata = {
	title: "Tensai Grocer",
	description: "Find your local groceries",
	icons: {
		icon: "/favicon.png",
	},
};



const varelaRound = Varela_Round({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})



export default async function RootLayout({
	children
}: {
  children: React.ReactNode;
}) {

    const categories = await getCategories()
    
	return (
        <html
			lang="en"
            className={varelaRound.className}
            suppressHydrationWarning
		>
			<body>
                <ThemeProvider
                    attribute="data-theme"
                    defaultTheme="light"
                    enableSystem={false}
                    themes={["light", "dark"]}
                >
                    
                    <NavSidebarShell categories={categories}   >
                        {children}
                        <ToastContainer />
                    </NavSidebarShell>
                </ThemeProvider>
            </body>
		</html>
	);
}
