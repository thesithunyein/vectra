import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth-context";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toast } from "@/components/ui/Toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StoreProvider>
        <div className="min-h-screen bg-[var(--bg-base)]">
          <Sidebar />
          <main className="pl-[260px]">{children}</main>
          <Toast />
        </div>
      </StoreProvider>
    </AuthProvider>
  );
}
