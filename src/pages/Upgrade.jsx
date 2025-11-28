import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Crown, Check, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import confetti from "canvas-confetti";

import { API_BASE_URL } from "@/lib/api";

function fireConfetti() {
  confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
  setTimeout(() => {
    confetti({ particleCount: 30, spread: 90, origin: { x: 0.2, y: 0.6 } });
  }, 250);
  setTimeout(() => {
    confetti({ particleCount: 30, spread: 90, origin: { x: 0.8, y: 0.6 } });
  }, 500);
}

const PRO_TIER_KEY = "guardianbox_tier";

const Upgrade = () => {
  const navigate = useNavigate();
  const [tier, setTier] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchTier = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setTier("free");
        localStorage.setItem(PRO_TIER_KEY, "free");
        window.dispatchEvent(new Event("tier-changed"));
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setTier("free");
        localStorage.setItem(PRO_TIER_KEY, "free");
        return;
      }

      const data = await res.json();
      
      // ✅ FIX: Normalize to lowercase
      const remote = (data.tier || "FREE").toLowerCase();
      setTier(remote);
      localStorage.setItem(PRO_TIER_KEY, remote);
      window.dispatchEvent(new Event("tier-changed"));
    } catch (err) {
      console.error("Fetch tier error:", err);
      setTier("free");
      localStorage.setItem(PRO_TIER_KEY, "free");
    }
  };

  useEffect(() => {
    fetchTier();
  }, []);

  const goPro = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("You must be logged in to upgrade.");
        setIsProcessing(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/upgrade`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Upgrade failed");
        setIsProcessing(false);
        return;
      }

      // ✅ Save as lowercase
      localStorage.setItem(PRO_TIER_KEY, "pro");
      window.dispatchEvent(new Event("tier-changed"));
      setTier("pro");

      fireConfetti();
      toast.success("🎉 Upgraded to Pro successfully!");
    } catch (err) {
      console.error("Upgrade error:", err);
      toast.error("Upgrade failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const revertToFree = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("You must be logged in to change plan.");
        setIsProcessing(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/downgrade`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Failed to switch to Free");
        setIsProcessing(false);
        return;
      }

      // ✅ Save as lowercase
      localStorage.setItem(PRO_TIER_KEY, "free");
      window.dispatchEvent(new Event("tier-changed"));
      setTier("free");

      toast.success("Switched to Free Plan");
    } catch (err) {
      console.error("Downgrade error:", err);
      toast.error("Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!tier) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="text-center text-white mt-20 text-xl">
          Loading Plans...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Add your full Upgrade UI here - the pricing cards, features, etc. */}
        {/* Keep your original beautiful UI layout */}
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg">
            Current Plan: <span className="font-semibold">{tier.toUpperCase()}</span>
          </p>
        </div>

        {/* Your pricing cards go here */}
        <div className="flex gap-4 justify-center">
          <Button onClick={goPro} disabled={isProcessing || tier === "pro"}>
            {tier === "pro" ? "Current Plan: PRO" : "Upgrade to PRO"}
          </Button>
          <Button onClick={revertToFree} disabled={isProcessing || tier === "free"}>
            {tier === "free" ? "Current Plan: FREE" : "Downgrade to FREE"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;