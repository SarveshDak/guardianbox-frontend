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

/**
 * Premium Profile page: Option A (Neon) + Option C (Aurora) mix
 * - Copy this file over your existing Profile.jsx
 * - All animations and styles are injected via a <style> tag inside the component
 * - No external libs required
 */

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
      const res = await fetch("http://localhost:4000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        navigate("/login");
        return;
      }

      setUser(data);
    } catch (err) {
      console.error(err);
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchProfile();

    // generate floating particles (for background)
    const count = 18;
    const p = new Array(count).fill(0).map(() => {
      return {
        id: Math.random().toString(36).slice(2, 9),
        left: Math.random() * 100, // percent
        top: Math.random() * 100, // percent
        size: 4 + Math.random() * 12, // px
        delay: Math.random() * 4, // s
        duration: 6 + Math.random() * 6, // s
        hueShift: Math.random() * 360,
        opacity: 0.15 + Math.random() * 0.35,
      };
    });
    setParticles(p);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------- HANDLE UPGRADE ----------------
  const handleUpgrade = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:4000/api/auth/upgrade", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        fetchProfile();
      } else {
        alert(data.message || "Upgrade failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  if (!user)
    return (
      <div className="text-white flex items-center justify-center min-h-screen">
        Loading Profile...
      </div>
    );

  // ---------- Helper: masked card number (demo) ----------
  const maskedCard = "•••• •••• •••• 4242";

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030612]">
      {/* Aurora animated background */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="aurora-layer -z-20" aria-hidden />
        <div className="aurora-wave -z-20" aria-hidden />
      </div>

      {/* subtle vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none -z-10" />

      {/* floating particles (behind card) */}
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
        {/* GLASS CARD */}
        <Card className="relative w-full max-w-xl bg-white/6 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-6 overflow-visible transform transition-all duration-450 hover:scale-[1.01]">

          {/* Neon animated gradient border (pointer-events none so clicks pass through) */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none neon-border"
            aria-hidden
          />

          {/* inner aurora sheen */}
          <div className="absolute -inset-[1px] rounded-3xl pointer-events-none inner-sheen" aria-hidden />

          <CardHeader className="text-center relative z-10">
            <CardTitle className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">
              Your Profile
            </CardTitle>

            {/* Tier badge */}
            <div className="mt-3 flex justify-center">
              {user.tier === "PRO" ? (
                <div className="pro-badge relative inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold">
                  <Crown className="w-4 h-4 text-yellow-300 drop-shadow-md" />
                  PRO Member
                </div>
              ) : (
                <div className="free-badge relative inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold">
                  <Shield className="w-4 h-4 text-sky-300 drop-shadow-sm" />
                  Free Plan
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="relative z-10 space-y-6 text-white pt-6">

            {/* top row - name + email in a subtle row */}
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

            {/* account tier and member since */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-white/60 text-xs uppercase">Account Tier</p>
                <p className="text-xl font-semibold">
                  {user.tier === "FREE" ? "Free Plan" : "Pro Plan"}
                </p>
              </div>

              <div>
                <p className="text-white/60 text-xs uppercase">Member Since</p>
                <p className="text-lg">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* features */}
            <div className="p-4 rounded-2xl bg-white/4 border border-white/8">
              <p className="text-white/80 text-sm font-semibold mb-3">
                Features Included in Your Plan
              </p>
              {user.tier === "FREE" ? (
                <ul className="text-white/70 space-y-2 text-sm">
                  <li>• 100MB Maximum Upload Size</li>
                  <li>• Files expire in 24 hours</li>
                  <li>• Up to 3 downloads per file</li>
                  <li>• Standard AES-256 Encryption</li>
                  <li>• Basic Support</li>
                </ul>
              ) : (
                <ul className="text-white/70 space-y-2 text-sm">
                  <li>• 5GB Maximum Upload Size</li>
                  <li>• Permanent secure file storage</li>
                  <li>• Unlimited downloads</li>
                  <li>• Fast-track priority support</li>
                  <li>• Enhanced Zero-Knowledge encryption</li>
                  <li>• PRO Dashboard analytics</li>
                </ul>
              )}
            </div>

            {/* payment & billing */}
            <div className="p-4 rounded-2xl bg-white/4 border border-white/8">
              <p className="text-white/80 text-sm font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment & Billing
              </p>

              {user.tier === "FREE" ? (
                <p className="text-white/60 text-sm">No billing information — upgrade to PRO to add a payment method.</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-2 text-white/80 text-sm">
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="font-semibold">{maskedCard}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Billing Date:</span>
                      <span className="font-semibold">12/27/2025</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Subscription:</span>
                      <span className="font-semibold text-green-400">Active</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button
                      className="flex-1 bg-gradient-to-r from-[#4f46e5] to-[#06b6d4] hover:scale-[1.02] transform transition"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      Update Payment
                    </Button>

                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => setShowCancelModal(true)}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* bottom CTA */}
            <div>
              {user.tier === "FREE" ? (
                <Button
                  className="w-full py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] hover:scale-[1.02] transform transition shadow-lg"
                  onClick={handleUpgrade}
                >
                  Upgrade to PRO
                </Button>
              ) : (
                <Button disabled className="w-full py-3 rounded-xl text-lg font-semibold bg-green-600">
                  PRO Subscription Active
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========== PAYMENT MODAL (glass + neon + particles) ========== */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-white/6 border border-white/10 backdrop-blur-md shadow-2xl">
            {/* neon border */}
            <div className="absolute inset-0 rounded-2xl neon-modal-border pointer-events-none" />

            <h3 className="text-xl font-bold text-white text-center mb-3">Update Payment</h3>
            <p className="text-white/80 text-sm text-center mb-6">
              Demo mode — payment update is not live. This modal shows where you'd place the Stripe/Razorpay flow.
            </p>

            {/* demo card preview */}
            <div className="mb-4 p-4 rounded-xl bg-white/4 border border-white/8">
              <p className="text-white/80 text-sm">Card</p>
              <div className="mt-2 text-lg font-semibold">{maskedCard}</div>
              <div className="mt-2 text-white/60 text-sm">Expiry •••• / ••••</div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => setShowPaymentModal(false)} className="bg-sky-600">Close</Button>
              <Button onClick={() => { setShowPaymentModal(false); alert("Demo: connect real payment gateway here."); }} className="bg-gradient-to-r from-[#7c3aed] to-[#06b6d4]">
                Connect (Demo)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========== CANCEL MODAL ========== */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-white/6 border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="absolute inset-0 rounded-2xl neon-modal-border-red pointer-events-none" />

            <h3 className="text-xl font-bold text-white text-center mb-3">Cancel Subscription</h3>
            <p className="text-white/80 text-sm text-center mb-6">
              Cancelling is disabled in demo mode. In a real app we'd trigger the cancellation flow and update the backend.
            </p>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => setShowCancelModal(false)} className="bg-sky-600">Close</Button>
              <Button onClick={() => { setShowCancelModal(false); alert("Demo: cancellation endpoint would be called."); }} className="bg-red-600">Confirm Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= INLINE STYLES & KEYFRAMES ================= */}
      <style>{`
        /* AURORA background */
        .aurora-layer {
          position: absolute;
          inset: -20% -40% -20% -40%;
          background: radial-gradient(40% 60% at 10% 20%, rgba(124,58,237,0.10), transparent),
                      radial-gradient(30% 50% at 80% 70%, rgba(14,165,233,0.08), transparent);
          transform: translateZ(0);
          filter: blur(48px) saturate(110%);
          animation: auroraMove 12s linear infinite;
        }

        .aurora-wave {
          position: absolute;
          inset: -30% -40% -30% -40%;
          background: linear-gradient(120deg, rgba(99,102,241,0.035), rgba(236,72,153,0.02), rgba(6,182,212,0.03));
          transform: skewY(-6deg);
          filter: blur(60px) saturate(120%);
          animation: auroraShift 10s ease-in-out infinite;
        }

        @keyframes auroraMove {
          0% { transform: translateX(-5%) scale(1) }
          50% { transform: translateX(5%) scale(1.03) }
          100% { transform: translateX(-5%) scale(1) }
        }

        @keyframes auroraShift {
          0% { transform: translateY(0) skewY(-6deg) }
          50% { transform: translateY(-8%) skewY(-4deg) }
          100% { transform: translateY(0) skewY(-6deg) }
        }

        /* floating particles */
        .particle {
          position: absolute;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(124,58,237,0.9), rgba(6,182,212,0.9));
          box-shadow: 0 6px 18px rgba(124,58,237,0.12), 0 2px 6px rgba(6,182,212,0.08);
          transform: translate3d(0, 0, 0);
          animation-name: floatUp;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
          100% {
            transform: translateY(-40px) scale(0.9);
            opacity: 0;
          }
        }

        /* neon gradient border around card */
        .neon-border {
          pointer-events: none;
          border-radius: 18px;
          box-shadow: 0 8px 40px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.02);
          background: linear-gradient(90deg,
            rgba(124,58,237,0.06) 0%,
            rgba(236,72,153,0.03) 40%,
            rgba(6,182,212,0.03) 60%,
            rgba(124,58,237,0.06) 100%);
          mask-image: linear-gradient(#000, #000);
        }

        /* inner sheen for subtle aurora reflection */
        .inner-sheen {
          pointer-events: none;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0));
          mix-blend-mode: overlay;
        }

        /* pro badge pulse */
        .pro-badge {
          background: linear-gradient(90deg, rgba(250,204,21,0.12), rgba(250,204,21,0.06));
          border: 1px solid rgba(250,204,21,0.18);
          box-shadow: 0 6px 26px rgba(250,204,21,0.08), 0 2px 6px rgba(0,0,0,0.35);
          animation: badgePulse 2.4s ease-in-out infinite;
          color: #facc15;
        }

        .free-badge {
          background: linear-gradient(90deg, rgba(59,130,246,0.06), rgba(6,182,212,0.03));
          border: 1px solid rgba(56,189,248,0.08);
          color: #93c5fd;
        }

        @keyframes badgePulse {
          0% { transform: translateY(0) scale(1) }
          50% { transform: translateY(-4px) scale(1.02) }
          100% { transform: translateY(0) scale(1) }
        }

        /* modal neon borders */
        .neon-modal-border {
          box-shadow: 0 8px 40px rgba(99,102,241,0.08), inset 0 0 36px rgba(14,165,233,0.06);
          background: linear-gradient(90deg, rgba(99,102,241,0.06), rgba(14,165,233,0.04));
          border-radius: 14px;
        }

        .neon-modal-border-red {
          box-shadow: 0 8px 40px rgba(239,68,68,0.08), inset 0 0 36px rgba(239,68,68,0.04);
          background: linear-gradient(90deg, rgba(239,68,68,0.06), rgba(236,72,153,0.04));
          border-radius: 14px;
        }

        /* entrance animations */
        @keyframes modalFade {
          from { opacity: 0; transform: translateY(6px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn { animation: modalFade 220ms cubic-bezier(.2,.9,.3,1) both; }
        .animate-scaleIn { animation: modalFade 260ms cubic-bezier(.2,.9,.3,1) both; }

        /* small responsive tweaks */
        @media (max-width: 640px) {
          .neon-border { border-radius: 14px; }
        }
      `}</style>
    </div>
  );
}
