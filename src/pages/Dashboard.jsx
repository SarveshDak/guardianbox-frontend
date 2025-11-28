import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileIcon, Clock, Download, Trash2, Crown, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import QRCode from "qrcode";
import QRModal from "@/components/QRModal";
import DecryptModal from "@/components/DecryptModal";

import { downloadAndDecrypt } from "@/lib/downloadAndDecrypt";
import { API_BASE_URL } from "@/lib/api"; // ✅ Always use env-based backend URL
console.log("API_BASE_URL =", API_BASE_URL);

const PRO_TIER_KEY = "guardianbox_tier";

/* ⏳ Calculate remaining expiration time */
function timeRemaining(expiresAt) {
  const now = new Date();
  const exp = new Date(expiresAt);
  const diffMs = exp - now;

  if (diffMs <= 0) return "Expired";

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours} hours`;

  const days = Math.floor(diffHours / 24);
  return `${days} days`;
}

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [decryptModalOpen, setDecryptModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrTTL, setQrTTL] = useState(300);

  const [tier, setTier] = useState("free");

  /* Load local tier */
  const loadTier = () => {
    const saved = localStorage.getItem(PRO_TIER_KEY) || "free";
    setTier(saved);
  };

  /* Load files from backend */
  const loadFiles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/files`);
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load shared files");
    } finally {
      setLoading(false);
    }
  };

  /* Initial load */
  useEffect(() => {
    loadTier();
    loadFiles();

    const refresh = () => loadFiles();
    const tierChanged = () => loadTier();

    window.addEventListener("refresh-files", refresh);
    window.addEventListener("tier-changed", tierChanged);

    return () => {
      window.removeEventListener("refresh-files", refresh);
      window.removeEventListener("tier-changed", tierChanged);
    };
  }, []);

  /* Delete file */
  const deleteFile = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/files/${id}`, { method: "DELETE" });

      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast.success("File deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  };

  /* Generate QR code */
  const generateQR = async (fileId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/files/${fileId}/qr`);
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "QR generation failed");
        return;
      }

      const qrImage = await QRCode.toDataURL(result.qrUrl, {
        width: 300,
        margin: 2,
      });

      setQrDataUrl(qrImage);
      setQrTTL(result.ttl);
      setSelectedFileId(fileId);
    } catch (err) {
      console.error(err);
      toast.error("QR generation failed");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-6xl">

        {/* Top section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your active file shares
            </p>
          </div>
          <Link to="/upload">
            <Button className="gradient-hero">
              <FileIcon className="w-4 h-4 mr-2" /> Share New File
            </Button>
          </Link>
        </div>

        {/* Upgrade box */}
        {tier !== "pro" && (
          <Card className="p-6 border-primary bg-primary/5 backdrop-blur-sm mb-8">
            <div className="flex items-start gap-4">
              <Crown className="w-8 h-8 text-primary mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Upgrade to Pro</h3>
                <p className="text-muted-foreground mb-4">
                  Unlock 5GB uploads, custom expiration & unlimited downloads.
                </p>
                <Link to="/upgrade">
                  <Button variant="outline">View Pro Features</Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* File table */}
        <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold">Active Shares</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">Loading...</div>
          ) : files.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <FileIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active file shares yet</p>
              <Link to="/upload">
                <Button className="mt-4" variant="outline">
                  Share Your First File
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Expires In</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {files.map((file) => {
                  const expiresText = timeRemaining(file.expiresAt);
                  const status = expiresText === "Expired" ? "expired" : "active";

                  return (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileIcon className="w-4 h-4 text-primary" />
                          {file.originalFilename}
                        </div>
                      </TableCell>

                      <TableCell>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </TableCell>

                      <TableCell>
                        <Clock className="w-4 h-4 inline mr-1 text-muted-foreground" />
                        {expiresText}
                      </TableCell>

                      <TableCell>
                        <button
                          className="flex items-center gap-1 hover:text-white transition"
                          onClick={() => {
                            setSelectedFileId(file.id);
                            setDecryptModalOpen(true);
                          }}
                          disabled={file.downloadsUsed >= file.maxDownloads}
                        >
                          <Download className="w-4 h-4" />
                          {file.downloadsUsed} / {file.maxDownloads}
                        </button>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={status === "active" ? "default" : "secondary"}
                        >
                          {status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateQR(file.id)}
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFile(file.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Files loaded securely 🎉
        </div>
      </div>

      {/* Decrypt modal */}
      <DecryptModal
        open={decryptModalOpen}
        onClose={() => setDecryptModalOpen(false)}
        onSubmit={async (password) => {
          try {
            await downloadAndDecrypt(selectedFileId, password);
            setDecryptModalOpen(false);
          } catch (e) {
            toast.error(e.message || "Wrong password!");
          }
        }}
      />

      {qrDataUrl && (
  <QRModal
    dataUrl={qrDataUrl}
    downloadUrl={`${API_BASE_URL}/api/files/${selectedFileId}/download`}
    ttl={qrTTL}
    onClose={() => setQrDataUrl("")}
    onRefresh={() => generateQR(selectedFileId)}
  />
)}
    </div>
  );
};

export default Dashboard;
