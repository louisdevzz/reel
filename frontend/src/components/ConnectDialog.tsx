import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import GoogleLogo from "./GoogleLogo";
import { GOOGLE_CLIENT_ID } from "../lib/core/constants";
import useEphemeralKeyPair from "../lib/core/useEphemeralKeyPair";
import { Wallet2 } from "lucide-react";

interface ConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectWallet: () => void;
}

export default function ConnectDialog({ open, onOpenChange, connectWallet }: ConnectDialogProps) {
  const ephemeralKeyPair = useEphemeralKeyPair();

  const redirectUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  const searchParams = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID || "",
    redirect_uri: `${window.location.origin}/callback`,
    response_type: "id_token",
    scope: "openid email profile",
    nonce: ephemeralKeyPair.nonce,
  });
  redirectUrl.search = searchParams.toString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#121212] text-white">
        <DialogTitle>Login to your account</DialogTitle>
        <div className="flex flex-col gap-4 mt-4">
          <button
            onClick={connectWallet}
            className="w-full flex items-center gap-2 justify-center border rounded-lg px-8 py-2 bg-[#161617] text-white hover:bg-[#121212] transition-all"
          >
            <Wallet2 className="h-5 w-5"/>
            <span>Connect Wallet</span>
          </button>
          <button
            disabled
            className="w-full flex items-center justify-center border rounded-lg px-8 py-2 bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
          >
            <GoogleLogo />
            <span className="ml-2">Sign in with Google</span>
            <span className="ml-2 text-xs text-gray-500">(Coming Soon)</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 