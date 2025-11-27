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

const PRO_TIER_KEY = "guardianbox_tier";

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

  // decrypt modal
  const [decryptModalOpen, setDecryptModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);

  // QR modal
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrTTL, setQrTTL] = useState(300);

  // tier
  const [tier, setTier] = useState("free");

  const loadTier = () => {
    try {
      setTier(localStorage.getItem(PRO_TIER_KEY) || "free");
    } catch {
      setTier("free");
    }
  };

  const loadFiles = async () => {
    try {
      const res = await fetch("/api/files");
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load shared files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTier();
    loadFiles();

    const refresh = () => loadFiles();
    window.addEventListener("refresh-files", refresh);

    const onTierChanged = () => loadTier();
    window.addEventListener("tier-changed", onTierChanged);

    return () => {
      window.removeEventListener("refresh-files", refresh);
      window.removeEventListener("tier-changed", onTierChanged);
    };
  }, []);

  const deleteFile = async (id) => {
    try {
      await fetch(`/api/files/${id}`, { method: "DELETE" });
      setFiles(files.filter((f) => f.id !== id));
      toast.success("File deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // ⭐ QR GENERATOR (with auto-refresh support)
  const generateQR = async (fileId) => {
    try {
      const res = await fetch(`/api/files/${fileId}/qr`);
      const { qrUrl, ttl } = await res.json();

      const qrImage = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
      });

      setQrDataUrl(qrImage);
      setQrTTL(ttl);

      // Save for auto-refresh
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your active file shares
            </p>
          </div>
          <Link to="/upload">
            <Button className="gradient-hero">
              <FileIcon className="w-4 h-4 mr-2" />
              Share New File
            </Button>
          </Link>
        </div>

        {/* Upgrade Card */}
        {tier !== "pro" && (
          <Card className="p-6 border-primary bg-primary/5 backdrop-blur-sm mb-8">
            <div className="flex items-start gap-4">
              <Crown className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Upgrade to Pro</h3>
                <p className="text-muted-foreground mb-4">
                  Get access to larger files (5GB), custom expiration, unlimited
                  downloads, and more.
                </p>
                <Link to="/upgrade">
                  <Button variant="outline">View Pro Features</Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Table */}
        <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold">Active Shares</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              Loading...
            </div>
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
                  const status =
                    expiresText === "Expired" ? "expired" : "active";

                  return (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileIcon className="w-4 h-4 text-primary" />
                          {file.originalFilename}
                        </div>
                      </TableCell>

                      <TableCell>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {expiresText}
                        </div>
                      </TableCell>

                      {/* Download */}
                      <TableCell>
                        {file.downloadsUsed >= file.maxDownloads ? (
                          <p className="text-red-400 text-sm">
                            {file.downloadsUsed} / {file.maxDownloads} (Limit
                            reached)
                          </p>
                        ) : (
                          <button
                            className="flex items-center gap-1 hover:text-white transition"
                            onClick={() => {
                              setSelectedFileId(file.id);
                              setDecryptModalOpen(true);
                            }}
                          >
                            <Download className="w-4 h-4" />
                            {file.downloadsUsed} / {file.maxDownloads}
                          </button>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant={
                            status === "active" ? "default" : "secondary"
                          }
                        >
                          {status}
                        </Badge>
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell className="text-right flex gap-2 justify-end">
                        {/* ⭐ QR BUTTON */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateQR(file.id)}
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>

                        {/* Delete */}
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
          <p>Your encrypted shares loaded successfully 🎉</p>
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

      {/* ⭐ QR MODAL (with auto-refresh) */}
      {qrDataUrl && (
        <QRModal
          dataUrl={qrDataUrl}
          ttl={qrTTL}
          onClose={() => setQrDataUrl("")}
          onRefresh={() => generateQR(selectedFileId)}
        />
      )}
    </div>
  );
};

export default Dashboard;
