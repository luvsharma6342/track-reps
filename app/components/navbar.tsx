"use client";

import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { ThemeToggle } from "./theme-toggle";
import { LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white">
            <span className="font-black text-sm">TR</span>
          </div>
          TrackReps
        </Link>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {!isPending && (
            <>
              {session ? (
                <div className="flex items-center gap-3">
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "User"} 
                      className="w-8 h-8 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                  <button 
                    onClick={handleSignOut}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition shadow-sm">
                    Log In
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
