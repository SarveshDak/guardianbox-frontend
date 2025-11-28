import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Mail, User, Shield, Crown, CreditCard } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";  // ✅ GLOBAL BACKEND URL

export default function Profile() {
  const [user, setUser] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [particles, setParticles] = useState([]);

  const navigate = useNavigate();

  // ---------------- FETCH PROFILE ----------------
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        let msg = "Authentication Failed";
        try {
          const errJson = await res.json();
          msg = errJson?.message || msg;
        } catch {}

        console.warn("Profile fetch failed:", msg);
        navigate("/login");
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("Profile load error:", err);
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchProfile();

    // Generate floating particles
    const count = 18;
    const p = new Array(count).fill(0).map(() => ({
      id: Math.random().toString(36).slice(2),
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 4 + Math.random() * 12,
      delay: Math.random() * 4,
      duration: 6 + Math.random() * 6,
      hueShift: Math.random() * 360,
      opacity: 0.15 + Math.random() * 0.35,
    }));
    setParticles(p);
  }, []); 

  // ---------------- HANDLE UPGRADE ----------------
  const handleUpgrade = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/upgrade`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        let msg = res.statusText;
        try {
          const json = await res.json();
          msg = json?.message || msg;
        } catch {}
        alert(msg);
        return;
      }

      await res.json();
      fetchProfile();
      alert("Upgraded to PRO successfully!");
    } catch (err) {
      console.error("Upgrade error:", err);
      alert("Something went wrong.");
    }
  };

  if (!user)
    return (
      <div className="text-white flex items-center justify-center min-h-screen">
        Loading Profile...
      </div>
    );

  const maskedCard = "•••• •••• •••• 4242";

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "—";

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030612]">
      {/* Aurora background */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="aurora-layer -z-20" />
        <div className="aurora-wave -z-20" />
      </div>

      {/* vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none -z-10" />

      {/* floating particles */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {particles.map((pt) => (
          <span
            key={pt.id}
            className="particle"
            style={{
              left: `${pt.left}%`,
              top: `${pt.top}%`,
              width: `${pt.size}px`,
              height: `${pt.size}px`,
              animationDelay: `${pt.delay}s`,
              animationDuration: `${pt.duration}s`,
              opacity: pt.opacity,
              filter: `hue-rotate(${pt.hueShift}deg)`,
            }}
          />
        ))}
      </div>

      {/* center container */}
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="relative w-full max-w-xl bg-white/6 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-6">
          {/* neon border */}
          <div className="absolute inset-0 rounded-3xl neon-border pointer-events-none" />

          <CardHeader className="text-center relative z-10">
            <CardTitle className="text-3xl font-extrabold text-white tracking-tight">
              Your Profile
            </CardTitle>

            <div className="mt-3 flex justify-center">
              {user.tier === "PRO" ? (
                <div className="pro-badge inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold">
                  <Crown className="w-4 h-4 text-yellow-300" />
                  PRO Member
                </div>
              ) : (
                <div className="free-badge inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold">
                  <Shield className="w-4 h-4 text-sky-300" />
                  Free Plan
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6 text-white pt-6 relative z-10">
            {/* name + email */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-white/60 text-xs uppercase">Name</p>
                <div className="flex items-center gap-2 text-lg font-medium">
                  <User className="w-5 h-5 text-white/75" />
                  {user.name}
                </div>
              </div>

              <div>
                <p className="text-white/60 text-xs uppercase">Email</p>
                <div className="flex items-center gap-2 text-lg font-medium">
                  <Mail className="w-5 h-5 text-white/75" />
                  {user.email}
                </div>
              </div>
            </div>

            {/* tier + member since */}
            <div className="flex flex-col md:flex-row md:justify-between gap-3">
              <div>
                <p className="text-white/60 text-xs uppercase">Account Tier</p>
                <p className="text-xl font-semibold">
                  {user.tier === "FREE" ? "Free Plan" : "Pro Plan"}
                </p>
              </div>

              <div>
                <p className="text-white/60 text-xs uppercase">Member Since</p>
                <p className="text-lg">{memberSince}</p>
              </div>
            </div>

            {/* features */}
            <div className="p-4 rounded-2xl bg-white/4 border border-white/8">
              <p className="text-white/80 text-sm font-semibold mb-3">
                Features Included
              </p>
              {user.tier === "FREE" ? (
                <ul className="text-white/70 space-y-2 text-sm">
                  <li>• 100MB Maximum Upload Size</li>
                  <li>• Files expire in 24 hours</li>
                  <li>• Up to 3 downloads per file</li>
                  <li>• Standard AES-256 Encryption</li>
                </ul>
              ) : (
                <ul className="text-white/70 space-y-2 text-sm">
                  <li>• 5GB Upload Size</li>
                  <li>• Unlimited downloads</li>
                  <li>• Priority Support</li>
                  <li>• Enhanced Encryption</li>
                </ul>
              )}
            </div>

            {/* billing */}
            <div className="p-4 rounded-2xl bg-white/4 border border-white/8">
              <p className="text-white/80 text-sm font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment & Billing
              </p>

              {user.tier === "FREE" ? (
                <p className="text-white/60 text-sm">
                  No billing information. Upgrade to Pro to enable billing.
                </p>
              ) : (
                <>
                  <div className="grid gap-2 text-white/80 text-sm">
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="font-semibold">{maskedCard}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Billing Date:</span>
                      <span className="font-semibold">12/27/2025</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button
                      className="flex-1 bg-gradient-to-r from-[#4f46e5] to-[#06b6d4]"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      Update Payment
                    </Button>

                    <Button
                      className="flex-1 bg-red-600"
                      onClick={() => setShowCancelModal(true)}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* upgrade button */}
            {user.tier === "FREE" ? (
              <Button
                className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-[#06b6d4] to-[#7c3aed]"
                onClick={handleUpgrade}
              >
                Upgrade to PRO
              </Button>
            ) : (
              <Button disabled className="w-full py-3 text-lg font-semibold bg-green-600">
                PRO Subscription Active
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================= MODALS ================= */}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-white/6 border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="absolute inset-0 rounded-2xl neon-modal-border" />

            <h3 className="text-xl font-bold text-white text-center mb-3">
              Update Payment
            </h3>
            <p className="text-white/80 text-sm text-center mb-6">
              Demo mode — no real payment updates.
            </p>

            <div className="mb-4 p-4 rounded-xl bg-white/4 border border-white/8">
              <p className="text-white/80 text-sm">Card</p>
              <div className="mt-2 text-lg font-semibold">{maskedCard}</div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => setShowPaymentModal(false)} className="bg-sky-600">
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowPaymentModal(false);
                  alert("Demo only — integrate Stripe/Razorpay here.");
                }}
                className="bg-gradient-to-r from-[#7c3aed] to-[#06b6d4]"
              >
                Connect (Demo)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-white/6 border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="absolute inset-0 rounded-2xl neon-modal-border-red" />

            <h3 className="text-xl font-bold text-white text-center mb-3">
              Cancel Subscription
            </h3>
            <p className="text-white/80 text-sm text-center mb-6">
              Demo mode — No real cancellation.
            </p>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => setShowCancelModal(false)} className="bg-sky-600">
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowCancelModal(false);
                  alert("Demo only — API cancel endpoint goes here.");
                }}
                className="bg-red-600"
              >
                Confirm Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================== STYLES ================== */}

      <style>{`
        .aurora-layer {
          position: absolute;
          inset: -20% -40% -20% -40%;
          background: radial-gradient(40% 60% at 10% 20%, rgba(124,58,237,0.10), transparent),
                      radial-gradient(30% 50% at 80% 70%, rgba(14,165,233,0.08), transparent);
          filter: blur(48px);
          animation: auroraMove 12s linear infinite;
        }

        .aurora-wave {
          position: absolute;
          inset: -30% -40% -30% -40%;
          background: linear-gradient(120deg, rgba(99,102,241,0.035), rgba(236,72,153,0.02), rgba(6,182,212,0.03));
          transform: skewY(-6deg);
          filter: blur(60px);
          animation: auroraShift 10s ease-in-out infinite;
        }

        @keyframes auroraMove {
          0% { transform: translateX(-5%) }
          50% { transform: translateX(5%) }
          100% { transform: translateX(-5%) }
        }

        @keyframes auroraShift {
          0% { transform: translateY(0) }
          50% { transform: translateY(-8%) }
          100% { transform: translateY(0) }
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(90deg, rgba(124,58,237,.9), rgba(6,182,212,.9));
          animation-name: floatUp;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(-40px); opacity: 0; }
        }

        .neon-border {
          background: linear-gradient(
            90deg,
            rgba(124,58,237,0.06),
            rgba(236,72,153,0.03),
            rgba(6,182,212,0.03),
            rgba(124,58,237,0.06)
          );
          border-radius: 18px;
        }

        .pro-badge {
          background: rgba(250,204,21,0.12);
          border: 1px solid rgba(250,204,21,0.18);
          color: #facc15;
        }

        .free-badge {
          background: rgba(59,130,246,0.06);
          border: 1px solid rgba(56,189,248,0.08);
          color: #93c5fd;
        }

        .neon-modal-border {
          background: rgba(99,102,241,0.06);
          border-radius: 14px;
        }

        .neon-modal-border-red {
          background: rgba(239,68,68,0.06);
          border-radius: 14px;
        }
      `}</style>
    </div>
  );
}
