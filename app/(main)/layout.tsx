// app/(main)/layout.tsx
import Sidebar from "@/components/global/Sidebar";
export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto">

                {children}

            </main>
        </div>
    );
}
