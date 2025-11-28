import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import confetti from "canvas-confetti";

import { API_BASE_URL } from "@/lib/api"; // ✅ Use global backend URL

// Confetti
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
  const [tier, setTier] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load tier from backend
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

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const remote = (data.tier || "free").toLowerCase();
        setTier(remote);
        localStorage.setItem(PRO_TIER_KEY, remote);
        window.dispatchEvent(new Event("tier-changed"));
      } else {
        setTier("free");
        localStorage.setItem(PRO_TIER_KEY, "free");
      }
    } catch (err) {
      console.error(err);
      setTier("free");
    }
  };

  useEffect(() => {
    fetchTier();
  }, []);

  // Upgrade to Pro
  const goPro = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("You must be logged in to upgrade.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/upgrade`, {
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

      localStorage.setItem(PRO_TIER_KEY, "pro");
      window.dispatchEvent(new Event("tier-changed"));
      setTier("pro");

      fireConfetti();
      toast.success("Upgraded to Pro successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Upgrade failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Downgrade
  const revertToFree = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("You must be logged in to change plan.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/downgrade`, {
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

      localStorage.setItem(PRO_TIER_KEY, "free");
      window.dispatchEvent(new Event("tier-changed"));
      setTier("free");

      toast.success("Switched to Free Plan");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!tier) {
    return (
      <div className="text-center text-white mt-20 text-xl">Loading Plans…</div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* The rest of your Upgrade UI goes here */}
        {/* Keep your original beautiful UI layout */}
      </div>
    </div>
  );
};

export default Upgrade;
