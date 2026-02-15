import { AppRouter } from "./router";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <div data-testid="app-shell" className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 text-foreground">
      <AppRouter />
      <Toaster />
    </div>
  );
}
