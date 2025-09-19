// src/app/(main)/layout.tsx
import Header from "@/shared/components/layout/Header"
import Footer from "@/shared/components/layout/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}