import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      data-testid="site-shell"
      className="theme-surface mx-auto my-4 max-w-7xl rounded-3xl px-6 shadow-[0_12px_30px_rgba(31,35,48,0.08)]"
    >
      <SiteHeader />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter />
    </div>
  );
}
