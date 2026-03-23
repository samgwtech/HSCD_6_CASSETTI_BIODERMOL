import type { ReactNode } from "react";

type DashboardLayoutProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

export default function DashboardLayout({ sidebar, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background text-text">
      <aside className="w-[150px] shrink-0 p-1 overflow-auto">
        {sidebar}
      </aside>

      <main className="flex-1 p-3 overflow-auto">
        {children}
      </main>
    </div>
  );
}
