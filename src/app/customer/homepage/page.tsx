import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CustomerHomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-1 bg-gradient-to-b from-pink-100 via-white to-blue-100 flex items-center justify-center">
                <h1 className="text-4xl font-bold text-gray-800">Welcome to NekoVi 🌸</h1>
            </main>

            <Footer />
        </div>
    );
}
