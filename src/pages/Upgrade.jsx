import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import confetti from "canvas-confetti";

/* Confetti burst effect */
function fireConfetti() {
  confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
  setTimeout(() => {
    confetti({ particleCount: 30, spread: 90, origin: { x: 0.2, y: 0.6 } });
  }, 250);
  setTimeout(() => {
    confetti({ particleCount: 30, spread: 90, origin: { x: 0.8, y: 0.6 } });
  }, 500);
}

const Upgrade = () => {
  const [tier, setTier] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch current user tier from backend and sync localStorage
  const fetchTier = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // If user not logged in, treat as free
        setTier("free");
        localStorage.setItem("guardianbox_tier", "free");
        window.dispatchEvent(new Event("tier-changed"));
        return;
      }

      const res = await fetch("http://localhost:4000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // attempt to parse JSON regardless (server should return JSON)
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const remoteTier = (data.tier || "free").toLowerCase();
        setTier(remoteTier);
        localStorage.setItem("guardianbox_tier", remoteTier);
        window.dispatchEvent(new Event("tier-changed"));
      } else {
        // In case of error, fall back to free but keep the error non-blocking
        setTier("free");
        localStorage.setItem("guardianbox_tier", "free");
        window.dispatchEvent(new Event("tier-changed"));
        console.warn("Failed fetching tier:", data?.message || res.statusText);
      }
    } catch (err) {
      console.error("fetchTier error:", err);
      setTier("free");
      localStorage.setItem("guardianbox_tier", "free");
      window.dispatchEvent(new Event("tier-changed"));
    }
  };

  useEffect(() => {
    fetchTier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Upgrade to PRO (server)
  const goPro = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to upgrade.");
        setIsProcessing(false);
        return;
      }

      const res = await fetch("http://localhost:4000/api/auth/upgrade", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.message || "Upgrade failed");
        setIsProcessing(false);
        return;
      }

      // Persist to localStorage and notify other pages
      localStorage.setItem("guardianbox_tier", "pro");
      window.dispatchEvent(new Event("tier-changed"));

      setTier("pro");
      fireConfetti();
      toast.success("Upgraded to Pro successfully!");
    } catch (err) {
      console.error("goPro error:", err);
      toast.error("Upgrade failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Downgrade to FREE (server)
  const revertToFree = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to change plan.");
        setIsProcessing(false);
        return;
      }

      const res = await fetch("http://localhost:4000/api/auth/downgrade", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.message || "Failed to switch to Free");
        setIsProcessing(false);
        return;
      }

      // Persist to localStorage and notify other pages
      localStorage.setItem("guardianbox_tier", "free");
      window.dispatchEvent(new Event("tier-changed"));

      setTier("free");
      toast.success("Switched to Free Plan");
    } catch (err) {
      console.error("revertToFree error:", err);
      toast.error("Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!tier) {
    return (
      <div className="text-center text-white mt-20 text-xl">
        Loading Plans…
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">Upgrade to Pro</h1>
          <p className="text-muted-foreground mt-2">
            Enjoy larger file sizes, custom expiration, and unlimited downloads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card className={`p-6 ${tier === "free" ? "ring-2 ring-white/5" : "opacity-90"}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">Free</h3>
                <p className="text-sm text-muted-foreground">$0/month</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">100MB</p>
                <p className="text-xs text-muted-foreground">24 hour storage</p>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-muted-foreground mb-6">
              <li>✔ End-to-end encryption</li>
              <li>✔ 24 hour expiry</li>
              <li>✔ 1 download per link</li>
            </ul>

            <div className="flex gap-3">
              <Button
                variant={tier === "free" ? "default" : "outline"}
                onClick={revertToFree}
                disabled={tier === "free" || isProcessing}
                className="flex-1"
              >
                {tier === "free" ? "Current Plan" : isProcessing ? "Switching…" : "Switch to Free"}
              </Button>

              <Link to="/upload">
                <Button variant="ghost">Share File</Button>
              </Link>
            </div>
          </Card>

          {/* Pro Plan */}
          <Card className={`p-6 relative ${tier === "pro" ? "ring-4 ring-accent/20 scale-[1.01]" : ""}`}>
            <div className="absolute -top-4 right-4">
              <div className="bg-accent/90 text-black px-3 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Crown className="w-5 h-5 text-accent" /> Pro
                </h3>
                <p className="text-sm text-muted-foreground">$9/month (demo)</p>
              </div>

              <div className="text-right">
                <p className="text-lg font-semibold">5GB</p>
                <p className="text-xs text-muted-foreground">Custom expiration</p>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-muted-foreground mb-6">
              <li>✔ 5GB file size</li>
              <li>✔ Custom expiration</li>
              <li>✔ Unlimited downloads</li>
              <li>✔ Priority support</li>
            </ul>

            <div className="flex gap-3">
              <Button
                className="flex-1 gradient-hero"
                onClick={goPro}
                disabled={tier === "pro" || isProcessing}
              >
                {tier === "pro" ? "Pro Enabled" : isProcessing ? "Upgrading…" : "Upgrade to Pro"}
              </Button>

              <Link to="/dashboard">
                <Button variant="outline">View Dashboard</Button>
              </Link>
            </div>
          </Card>
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          No real payment is processed — this is a demo upgrade.
        </p>
      </div>
    </div>
  );
};

export default Upgrade;
