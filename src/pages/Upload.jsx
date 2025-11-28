import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/Header";
import DragDropUploader from "@/components/DragDropUploader";
import { ProgressSteps } from "@/components/ProgressSteps";
import { encryptFile } from "@/lib/crypto";
import { uploadEncryptedFile, API_BASE_URL } from "@/lib/api";   // ✅ FIXED
import { toast } from "sonner";

const Upload = () => {
  const navigate = useNavigate();

  // STATES
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [tier, setTier] = useState("free");
  const [expiration, setExpiration] = useState("24h");
  const [maxDownloads, setMaxDownloads] = useState("1");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Detect plan
  useEffect(() => {
    const saved = localStorage.getItem("guardianbox_tier");

    if (saved === "pro") {
      setTier("pro");
      setExpiration("3d");
      setMaxDownloads("5");
    }

    const onTierChange = () => {
      const newTier = localStorage.getItem("guardianbox_tier") || "free";
      setTier(newTier);

      if (newTier === "pro") {
        setExpiration("3d");
        setMaxDownloads("5");
      }
    };

    window.addEventListener("tier-changed", onTierChange);
    return () => window.removeEventListener("tier-changed", onTierChange);
  }, []);

  const MAX_SIZE = tier === "free" ? 100 * 1024 * 1024 : 5 * 1024 * 1024 * 1024;

  // -----------------------------
  // UPLOAD
  // -----------------------------
  const handleUpload = async () => {
    if (!selectedFile || !password) {
      toast.error("Please select a file and enter a password");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsUploading(true);
    setUploadStep(0);

    try {
      // Encrypt
      setUploadStep(1);
      const { encryptedBlob, salt, iv } = await encryptFile(selectedFile, password);

      // Expiry
      setUploadStep(2);
      const expiresAt = new Date();
      const hours =
        expiration === "24h"
          ? 24
          : parseInt(expiration.replace("d", ""), 10) * 24;
      expiresAt.setHours(expiresAt.getHours() + hours);

      // Upload
      const response = await uploadEncryptedFile(encryptedBlob, {
        originalFilename: selectedFile.name,
        size: selectedFile.size,
        tier,
        expiresAt: expiresAt.toISOString(),
        maxDownloads:
          maxDownloads === "unlimited" ? 999999 : parseInt(maxDownloads, 10),
        salt,
        iv,
      });

      // -----------------------------
      // FIXED SHARE URL
      // -----------------------------
      setUploadStep(3);
      const shareLink = `${API_BASE_URL}/api/files/${response.id}/download`;

      setShareUrl(shareLink);
      toast.success("File encrypted and uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // -----------------------------
  // COPY LINK
  // -----------------------------
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // -----------------------------
  // SUCCESS VIEW
  // -----------------------------
  if (shareUrl) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Card className="p-8 border-border bg-card/50 backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-accent/20 rounded-full mx-auto flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-3xl font-bold mb-2">File Successfully Encrypted!</h1>
              <p className="text-muted-foreground">
                Share this link. The password is in the URL (#hash).
              </p>
            </div>

            <div className="space-y-4">
              <Label>Share Link</Label>
              <div className="flex gap-2 mt-2">
                <Input value={shareUrl} readOnly className="font-mono text-sm" />
                <Button onClick={copyToClipboard} variant="outline">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Share Another File
              </Button>
              <Button className="flex-1" onClick={() => navigate("/dashboard")}>
                View Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // -----------------------------
  // MAIN PAGE
  // -----------------------------
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Encrypt & Share File</h1>
          <p className="text-muted-foreground">
            Your file is encrypted in your browser before upload.
          </p>
        </div>

        {isUploading && (
          <ProgressSteps
            currentStep={uploadStep}
            steps={[
              { label: "Encrypting File", icon: <Lock className="w-6 h-6" /> },
              { label: "Preparing Upload", icon: <Lock className="w-6 h-6" /> },
              { label: "Uploading Securely", icon: <Lock className="w-6 h-6" /> },
            ]}
          />
        )}

        <Card className="p-8 border-border bg-card/50 backdrop-blur-sm">
          <div className="space-y-6">
            {/* TIER */}
            {/* ... (unchanged UI code) ... */}

            {/* FILE UPLOADER */}
            <div>
              <Label>File</Label>
              <DragDropUploader
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                maxSize={MAX_SIZE}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <Label>Encryption Password</Label>
              <div className="relative mt-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* EXPIRATION */}
            {/* (unchanged UI code) */}

            {/* BUTTON */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !password || isUploading}
              className="w-full gradient-hero"
              size="lg"
            >
              {isUploading ? "Processing..." : "Encrypt & Upload"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
