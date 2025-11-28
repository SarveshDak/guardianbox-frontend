import React from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, UploadCloud, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80">
      <Header />

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        {/* ------------------------------- */}
        {/* HERO SECTION */}
        {/* ------------------------------- */}
        <section className="grid gap-10 md:grid-cols-[2fr,1.5fr] items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground mb-4">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              End-to-end encrypted file sharing
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Share sensitive files
              <span className="block text-primary">without sharing trust.</span>
            </h1>

            <p className="text-muted-foreground text-lg mb-6">
              GuardianBox encrypts files in your browser before upload.
              Only people with the secret password can decrypt —
              <span className="font-semibold">
                {" "}not even the server can see them.
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Link to="/upload">
                <Button size="lg" className="gradient-hero">
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Share a file
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>

              <Link to="/dashboard">
                <Button size="lg" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  View dashboard
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground">
              No accounts required. Files are encrypted client-side using AES-GCM,
              and passwords never leave your browser.
            </p>
          </div>

          {/* ------------------------------- */}
          {/* RIGHT-SIDE “HOW IT WORKS” CARD */}
          {/* ------------------------------- */}
          <Card className="border-border bg-card/60 backdrop-blur-sm p-6 space-y-5">
            <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              How GuardianBox works
            </h2>

            <ol className="space-y-4 text-sm">
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  1
                </span>
                <div>
                  <p className="font-medium">Encrypt in your browser</p>
                  <p className="text-muted-foreground">
                    Choose a file and a strong password. GuardianBox uses PBKDF2
                    + AES-GCM to encrypt everything locally.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  2
                </span>
                <div>
                  <p className="font-medium">Share a secure link</p>
                  <p className="text-muted-foreground">
                    We store only the encrypted blob and metadata. Send the link
                    however you like — chat, email, ticket, etc.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  3
                </span>
                <div>
                  <p className="font-medium">Recipient decrypts locally</p>
                  <p className="text-muted-foreground">
                    With the link + password, the recipient downloads and decrypts
                    the file in their browser. No password ever touches the server.
                  </p>
                </div>
              </li>
            </ol>
          </Card>
        </section>

        {/* FOOTER NOTE */}
        <section className="mt-16 text-center text-xs text-muted-foreground">
          <p>
            Demo build of GuardianBox. In production, this UI connects to your live
            API, storage, and authentication.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Index;
