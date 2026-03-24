import { TopNav } from "./TopNav";
import { RightSidebar } from "./RightSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex pt-14 min-h-screen">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        {showSidebar && <RightSidebar />}
      </div>
    </div>
  );
}
