import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthSession, getAuthRedirectPath } from "@/features/auth/hooks";
import { useDmThread, useSendDmMessage } from "@/features/dm/hooks";
import { useCreateTip } from "@/features/tip/hooks";
import { toast } from "sonner";

export function DMRoute() {
  const navigate = useNavigate();
  const { user, loading } = useAuthSession();
  const [message, setMessage] = useState("");
  const redirect = useMemo(() => getAuthRedirectPath("/dm", Boolean(user)), [user]);

  const { data: messages = [], isLoading } = useDmThread(user?.id);
  const sendMessage = useSendDmMessage(user?.id);
  const createTip = useCreateTip();

  if (!loading && redirect) {
    return (
      <section className="space-y-3 py-6">
        <h1 className="font-editorial text-4xl leading-none">Login required</h1>
        <p className="text-sm text-muted-foreground">Sign in to send a private DM.</p>
        <Button onClick={() => navigate({ to: redirect })}>Go to Login</Button>
      </section>
    );
  }

  const onSend = async () => {
    if (!message.trim()) return;
    await sendMessage.mutateAsync(message.trim());
    setMessage("");
  };

  const onTip = async () => {
    if (!user) return;
    await createTip.mutateAsync({
      targetType: "dm",
      targetId: user.id,
      amount: 5,
      currency: "USD",
      userId: user.id,
    });
    toast.success("Tip sent. Thank you!");
  };

  return (
    <section className="space-y-6 py-6">
      <header className="space-y-1 border-b pb-4">
        <h1 className="font-editorial text-4xl leading-none">Private DM</h1>
        <p className="text-sm text-muted-foreground">Single 1:1 thread with the host.</p>
      </header>

      <div className="max-h-80 space-y-2 overflow-auto rounded-md border px-4 py-3">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading messages...</p> : null}
        {messages.map((messageItem) => (
          <p key={messageItem.id} className="text-sm leading-6">
            {messageItem.body}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dm-message">Message</Label>
        <Input id="dm-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about your Korea trip" />
      </div>
      <div className="flex gap-2">
        <Button onClick={() => void onSend()} disabled={sendMessage.isPending || !message.trim()}>
          Send
        </Button>
        <Button variant="outline" onClick={() => void onTip()} disabled={createTip.isPending || !user}>
          Send Tip ($5)
        </Button>
      </div>
      <Link to="/board" className="text-sm text-muted-foreground underline">
        Back to board
      </Link>
    </section>
  );
}
