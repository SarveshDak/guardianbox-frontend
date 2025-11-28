import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Download as DownloadIcon,
  Lock,
  AlertCircle,
  FileIcon,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { ProgressSteps } from "@/components/ProgressSteps";
import { toast } from "sonner";

import {
  getFileMetadata,
  downloadEncryptedFile,
  API_BASE_URL,
} from "@/lib/api";

import { decryptFile, downloadBlob } from "@/lib/crypto";

const Download = () => {
  const { id } = useParams();

  const [metadata, setMetadata] = useState(null);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStep, setDownloadStep] = useState(0);
  const [error, setError] = useState(null);

  const passwordRef = useRef(null);

  // ---------------------------------------------------
  // LOAD METADATA + AUTO-DETECT PASSWORD FROM URL HASH
  // ---------------------------------------------------
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const data = await getFileMetadata(id);
        setMetadata(data);

        // Detect password from hash: #pw=xxx OR #password=xxx OR #key=xxx
        const hash = window.location.hash;
        const match =
          hash.match(/pw=([^&]+)/) ||
          hash.match(/password=([^&]+)/) ||
          hash.match(/key=([^&]+)/);

        if (match) setPassword(decodeURIComponent(match[1]));
      } catch (err) {
        setError(err?.message || "Failed to load file information");
      } finally {
        setIsLoading(false);
      }
    };

    loadMetadata();
  }, [id]);

  // ---------------------------------------------------
  // DOWNLOAD + DECRYPT PROCESS
  // ---------------------------------------------------
  const handleDownload = async () => {
    if (!password) {
      toast.error("Please enter the password.");
      return;
    }

    setIsDownloading(true);
    setDownloadStep(1);

    try {
      // Fetch encrypted file
      const encryptedFile = await downloadEncryptedFile(id);

      setDownloadStep(2);

      // Decrypt file in-browser
      const decryptedBlob = await decryptFile(
        encryptedFile,
        password,
        metadata.salt,
        metadata.iv
      );

      setDownloadStep(3);

      // Save to device
      downloadBlob(decryptedBlob, metadata.originalFilename);

      toast.success("File decrypted successfully!");
    } catch (err) {
      console.error("Download error:", err);

      if (err.message?.includes("Decryption failed")) {
        toast.error("Incorrect password!");
      } else {
        toast.error(err.message || "Download failed.");
      }

      setDownloadStep(0);
    } finally {
      setIsDownloading(false);
    }
  };

  // ---------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center animate-pulse">
          Loading file information...
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // FILE NOT FOUND / BACKEND ERROR
  // ---------------------------------------------------
  if (error || !metadata) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 max-w-xl">
          <Card className="p-10 bg-card/40 border-destructive">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-3">File Not Found</h1>
              <p className="text-muted-foreground">
                {error || "This file may have been deleted or expired."}
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // FILE EXPIRED OR UNAVAILABLE
  // ---------------------------------------------------
  if (metadata.status !== "ACTIVE") {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 max-w-xl">
          <Card className="p-8 bg-card/40 border-destructive">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-3">File Unavailable</h1>

              <p className="text-muted-foreground mb-3">
                This file is no longer available.
              </p>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>Expires: {new Date(metadata.expiresAt).toLocaleString()}</p>
                <p>
                  Downloads left:{" "}
                  {metadata.remainingDownloads === -1
                    ? "Unlimited"
                    : metadata.remainingDownloads}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // MAIN DOWNLOAD UI
  // ---------------------------------------------------
  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2 text-center">
          Download Encrypted File
        </h1>
        <p className="text-muted-foreground text-center mb-12">
          The file will be decrypted locally in your browser.
        </p>

        {/* Progress Indicator */}
        {isDownloading && (
          <div className="mb-8">
            <ProgressSteps
              currentStep={downloadStep}
              steps={[
                { label: "Fetching File", icon: <DownloadIcon /> },
                { label: "Decrypting", icon: <Lock /> },
                { label: "Saving File", icon: <DownloadIcon /> },
              ]}
            />
          </div>
        )}

        <Card className="p-8 shadow-lg bg-card/50 backdrop-blur-sm border-border">
          <div className="space-y-6">
            {/* File summary */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {metadata.originalFilename}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {(metadata.size / 1024 / 1024).toFixed(2)} MB • expires{" "}
                  {new Date(metadata.expiresAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Password Input */}
            {!password && (
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  className="mt-2"
                  placeholder="Enter decryption password"
                  value={password}
                  ref={passwordRef}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The uploader shared this password with you.
                </p>
              </div>
            )}

            {/* Autofill Password Notice */}
            {password && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                <Lock className="w-4 h-4 inline mr-2" />
                Password detected from secure link. Ready to decrypt.
              </div>
            )}

            {/* Download Button */}
            <Button
              className="w-full gradient-hero py-6 text-lg"
              disabled={!password || isDownloading}
              onClick={handleDownload}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 mr-2" /> Processing...
                </>
              ) : (
                <>
                  <DownloadIcon className="w-5 h-5 mr-2" />
                  Download & Decrypt
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Decryption happens on your device. The password is never sent to the server.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Download;
