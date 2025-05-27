// app/(main)/layout.tsx
import Navbar from "@/components/global/Navbar";
export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col relative h-screen">
            <Navbar />
            <main className="flex flex-col flex-1">

                {children}

            </main>

        </div>
    );
}
