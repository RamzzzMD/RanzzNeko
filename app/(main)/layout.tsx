import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex flex-1 gap-8 py-6">
        <Sidebar variant="desktop" />
        <main className="min-w-0 flex-1 pb-16 lg:pb-0">{children}</main>
      </div>
      <Footer />
      <MobileNav />
    </div>
  );
}
