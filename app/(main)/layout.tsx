import type { Metadata } from "next";
import "../globals.css";

import { getCategories } from "../lib/getCategories"
import NavSidebarShell from "../components/navSidebarShell";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export const metadata: Metadata = {
	title: "Tensai Grocer",
	description: "Find your local groceries",
	icons: {
		icon: "/favicon.png",
	},
};

export default async function RootLayout({
	children
}: {
  children: React.ReactNode;
}) {

    const categories = await getCategories()
    
	return (
        <html
			lang="en"
			data-theme="light"
		>
			<body>
                <NavSidebarShell categories={categories}   >
                    {children}
                    <ToastContainer />
                </NavSidebarShell>
            </body>
		</html>
	);
}
