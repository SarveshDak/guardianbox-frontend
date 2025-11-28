import React from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, Clock, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* --------------------------- */}
      {/* HERO SECTION */}
      {/* --------------------------- */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 animate-fade-in">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              End-to-End Encrypted
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Secure File Sharing,
            <br />
            Zero Trust
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Share files with military-grade encryption. Your files are encrypted
            in your browser before upload. We never see your password or
            unencrypted data.
          </p>

          <Link to="/upload">
            <Button size="lg" className="gradient-hero glow-primary text-lg px-8 py-6">
              Securely Share a File
            </Button>
          </Link>
        </div>
      </section>

      {/* --------------------------- */}
      {/* FEATURES SECTION */}
      {/* --------------------------- */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

          {/* CARD 1 */}
          <Card className="p-6 border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
            <Lock className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Client-Side Encryption</h3>
            <p className="text-muted-foreground">
              Files are encrypted using AES-256-GCM directly in your browser.
              Your password never leaves your device.
            </p>
          </Card>

          {/* CARD 2 */}
          <Card className="p-6 border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
            <Shield className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Password in URL Hash</h3>
            <p className="text-muted-foreground">
              Passwords stay in the URL fragment, which is never sent to our
              servers — ensuring true zero-knowledge sharing.
            </p>
          </Card>

          {/* CARD 3 */}
          <Card className="p-6 border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
            <Clock className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Auto-Expiring Links</h3>
            <p className="text-muted-foreground">
              Set expiration times and download limits. Links self-destruct
              automatically for maximum security.
            </p>
          </Card>
        </div>
      </section>

      {/* --------------------------- */}
      {/* PRICING SECTION */}
      {/* --------------------------- */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* FREE PLAN */}
          <Card className="p-8 border-border bg-card/50 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4">Free</h3>

            <div className="text-4xl font-bold mb-6">
              $0
              <span className="text-lg text-muted-foreground">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Up to 100MB per file",
                "24 hour storage",
                "1 download per link",
                "End-to-end encryption",
              ].map((txt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5" />
                  <span>{txt}</span>
                </li>
              ))}
            </ul>

            <Link to="/upload">
              <Button variant="outline" className="w-full">
                Get Started
              </Button>
            </Link>
          </Card>

          {/* PRO PLAN */}
          <Card className="p-8 border-primary glow-primary bg-card/50 backdrop-blur-sm relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
              Popular
            </div>

            <h3 className="text-2xl font-bold mb-4">Pro</h3>

            <div className="text-4xl font-bold mb-6">
              $9
              <span className="text-lg text-muted-foreground">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Up to 5GB per file",
                "Custom expiration (up to 30 days)",
                "Unlimited downloads",
                "Dashboard with active links",
                "Priority support",
              ].map((txt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5" />
                  <span>{txt}</span>
                </li>
              ))}
            </ul>

            <Link to="/upgrade">
              <Button className="w-full gradient-hero">Upgrade to Pro</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* --------------------------- */}
      {/* FOOTER */}
      {/* --------------------------- */}
      <footer className="border-t border-border py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          © 2024 GuardianBox — Your files, your keys, your security.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
