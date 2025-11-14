import { Toaster } from "@/shared/components/ui/toaster";
import ProtectedRoute from "@/shared/components/ProtectedRoute";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      {children}
      <Toaster />
    </ProtectedRoute>
  );
}