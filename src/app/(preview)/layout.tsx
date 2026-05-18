import { Sidebar } from "@/components/layout/sidebar";
import { mockUser } from "@/lib/mock-data";
import { Header } from "@/components/layout/header";

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-svh overflow-hidden">
      <Sidebar basePath="/preview" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={mockUser} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
