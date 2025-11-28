import React, { useEffect, useState } from "react";
import { X, Copy, Download, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

export default function QRModal({ dataUrl, downloadUrl, ttl, onClose, onRefresh }) {
  const [remaining, setRemaining] = useState(ttl);

  // Countdown timer
  useEffect(() => {
    setRemaining(ttl);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onRefresh?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ttl]);

  // Copy link
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(downloadUrl);
      toast.success("Download link copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Download QR image
  const downloadQR = () => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "guardianbox-qr.png";
    a.click();
  };

  const progress = (remaining / ttl) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-2xl p-6 shadow-xl max-w-sm w-full relative">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Secure QR Code</h2>

        <img
          src={dataUrl}
          alt="QR Code"
          className="w-64 h-64 mx-auto rounded-lg shadow border"
        />

        {/* Show the actual link */}
        <p className="text-center text-xs text-muted-foreground mt-3 break-all">
          {downloadUrl}
        </p>

        <p className="text-center text-sm mt-4 text-muted-foreground">
          Expires in <span className="font-semibold text-white">{remaining}s</span>
        </p>

        {/* Progress bar */}
        <div className="mt-2 h-2 bg-neutral-700 rounded overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center mt-6 gap-2">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>

          <button
            onClick={downloadQR}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition"
          >
            <Download className="w-4 h-4" />
            Save
          </button>

          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
