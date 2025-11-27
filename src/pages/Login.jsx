import React, { useState, useCallback } from "react";
import { Mail, Lock, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import axios from "axios";

// Particle imports
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Load particles
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  // FUNCTION → Handle Login
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:4000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">

      {/* PARTICLE BACKGROUND */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        className="absolute inset-0"
        options={{
          background: { color: "black" },
          particles: {
            number: { value: 60, density: { enable: true, area: 800 } },
            color: { value: ["#3b82f6", "#6366f1"] },
            size: { value: { min: 1, max: 3 } },
            opacity: { value: 0.15 },
            move: {
              enable: true,
              speed: 0.5,
              random: true,
              direction: "none",
              outModes: "out",
            },
            links: {
              enable: true,
              color: "#3b82f6",
              opacity: 0.08,
              distance: 150,
            },
          },
          retina_detect: true,
        }}
      />

      {/* DEPTH BLUR GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-black to-black backdrop-blur-3xl" />

      {/* LOGIN CARD */}
      <Card className="w-full max-w-md bg-black/60 backdrop-blur-xl border border-neutral-800 shadow-[0px_0px_80px_rgba(0,0,0,0.7)] rounded-2xl p-8 relative z-10">

        {/* HEADER / LOGO */}
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <Shield className="w-14 h-14 text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.7)]" />
          </div>

          <CardTitle className="text-4xl font-bold text-white tracking-tight">
            GuardianBox
          </CardTitle>

          <p className="text-neutral-400 text-sm">
            Enterprise-Grade Encryption & Secure Storage
          </p>
        </CardHeader>

        {/* FORM */}
        <CardContent className="space-y-6">

          {/* Email */}
          <div>
            <label className="text-neutral-300 text-sm font-medium">Email</label>
            <div className="relative mt-1">
              <Mail className="w-5 h-5 absolute left-3 top-2.5 text-neutral-500" />
              <Input
                type="email"
                placeholder="you@example.com"
                className="pl-11 bg-neutral-900/70 border-neutral-700 text-neutral-200
                  focus:ring-blue-600 focus:border-blue-600 rounded-xl transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-neutral-300 text-sm font-medium">Password</label>
            <div className="relative mt-1">
              <Lock className="w-5 h-5 absolute left-3 top-2.5 text-neutral-500" />
              <Input
                type="password"
                placeholder="••••••••"
                className="pl-11 bg-neutral-900/70 border-neutral-700 text-neutral-200
                  focus:ring-blue-600 focus:border-blue-600 rounded-xl transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-5 text-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800
              shadow-[0_0_25px_rgba(59,130,246,0.4)] rounded-xl font-semibold transition-all"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          {/* SIGNUP LINK */}
          <p className="text-center text-neutral-400 text-sm pt-2">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-400 hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
