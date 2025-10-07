import { ReactNode } from "react";
import { AppSidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 transition-all duration-300">
        <div className="container mx-auto p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
