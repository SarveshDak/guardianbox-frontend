import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ----------------------------
// USE ENV VARIABLE FOR BACKEND
// ----------------------------
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("All fields are required");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      console.log("🚀 Sending signup request to:", `${API_BASE_URL}/api/auth/signup`);
      console.log("📦 Form data:", { name: form.name, email: form.email });

      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password
        }),
      });

      console.log("📡 Response status:", res.status);

      // Try to parse response
      let data;
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
        console.log("📥 Response data:", data);
      } else {
        const text = await res.text();
        console.error("❌ Non-JSON response:", text);
        toast.error("Server error: Invalid response format");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        // Handle specific error cases
        if (res.status === 409) {
          toast.error("Email already registered. Please login instead.");
        } else if (res.status === 400) {
          toast.error(data.message || "Invalid input. Please check your details.");
        } else if (res.status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(data.message || "Signup failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Success - save data
      console.log("✅ Signup successful!");
      
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("guardianbox_user", JSON.stringify(data.user));
        localStorage.setItem("guardianbox_tier", (data.user.tier || "free").toLowerCase());

        window.dispatchEvent(new Event("tier-changed"));

        toast.success("Account created successfully! Welcome aboard 🎉");
        
        // Small delay for toast to show
        setTimeout(() => {
          navigate("/");
        }, 500);
      } else {
        toast.error("Signup successful but missing user data");
        setLoading(false);
      }

    } catch (err) {
      console.error("❌ Signup error:", err);
      
      // More specific error messages
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        toast.error("Cannot connect to server. Please check if backend is running.");
      } else if (err.message.includes("NetworkError")) {
        toast.error("Network error. Please check your internet connection.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/95 p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold text-white">
            Create Your Account
          </CardTitle>
          <p className="text-center text-white/70">
            Join GuardianBox — Secure File Encryption & Storage
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Name */}
            <div>
              <label className="text-white font-medium">Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-300" />
                <Input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/50"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-white font-medium">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-300" />
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-white font-medium">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-300" />
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/50"
                  minLength={8}
                />
              </div>
              <p className="text-xs text-white/50 mt-1">
                Minimum 8 characters
              </p>
            </div>

            {/* Signup button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 text-lg font-semibold transition-all"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>

            {/* Footer */}
            <p className="text-center text-white/70 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Signup;