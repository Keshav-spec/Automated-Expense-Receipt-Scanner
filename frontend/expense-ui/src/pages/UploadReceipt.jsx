import { useCallback, useRef, useState } from "react";
import { CloudUpload, CreditCard, FileText, Plus } from "lucide-react";
import Header from "../components/Header";
import API from "../api/api";
import { formatCurrency } from "../utils/helpers";

function UploadReceipt() {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const processFile = useCallback(async (file) => {
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setError("Only JPG and PNG images are supported.");
      return;
    }

    setError("");
    setResult(null);
    setUploading(true);
    setProgress(20);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProgress(50);
      const response = await API.post("/receipts/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProgress(100);
      setResult(response.data);
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Upload failed. Please try again."
      );
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  return (
    <div>
      <Header title="Upload Receipt" searchPlaceholder="Search expenses..." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#C5A36E] mb-2">
            Automation Engine
          </p>
          <h2 className="font-serif text-3xl font-bold text-[#355E3B] mb-3">
            Precision Expense Processing
          </h2>
          <p className="text-[#6B6B6B] mb-8 max-w-xl leading-relaxed">
            Our AI extracts merchant details, totals, dates, and categories from
            your receipts with high accuracy — no manual data entry required.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`bg-white rounded-3xl border-2 border-dashed p-12 text-center transition-colors ${
              dragOver
                ? "border-[#4E7D5A] bg-[#F0F7F2]"
                : "border-[#D4CFC4]"
            }`}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-[#E8F0E4] flex items-center justify-center mb-5">
              <CloudUpload size={28} className="text-[#4E7D5A]" />
            </div>
            <p className="font-medium text-[#2F2F2F] mb-1">Drop your files here</p>
            <p className="text-sm text-[#8B8B8B] mb-6">
              Supports PNG and JPEG up to 25MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4E7D5A] text-white rounded-2xl font-semibold hover:bg-[#355E3B] transition-colors disabled:opacity-50"
            >
              <Plus size={18} />
              Upload Receipt
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 text-red-700 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-4 bg-[#E8F0E4] text-[#355E3B] px-5 py-4 rounded-2xl">
              <p className="font-semibold mb-2">Receipt processed successfully</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Merchant: {result.merchant}</span>
                <span>Amount: {formatCurrency(result.amount)}</span>
                <span>Date: {result.date}</span>
                <span>Category: {result.category}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E8E2D8] shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-lg font-bold text-[#2F2F2F]">
                Current Processing
              </h3>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#E8F0E4] text-[#355E3B]">
                {uploading ? "Active" : "Idle"}
              </span>
            </div>

            {!result && !uploading ? (
              <div className="text-center py-8">
                <FileText size={40} className="mx-auto text-[#D4CFC4] mb-3" />
                <p className="text-sm text-[#8B8B8B]">No files uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploading && (
                  <p className="text-sm text-[#6B6B6B]">Scanning receipt...</p>
                )}
                {result && (
                  <div className="flex items-center gap-3 p-3 bg-[#F7F4EE] rounded-2xl">
                    <FileText size={20} className="text-[#4E7D5A]" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {result.merchant}
                      </p>
                      <p className="text-xs text-[#8B8B8B]">
                        {formatCurrency(result.amount)} · {result.category}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6">
              <div className="flex justify-between text-xs text-[#8B8B8B] mb-2">
                <span>Overall Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-[#F3F0E9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C5A36E] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-[#EDE9E0] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#E8E2D8]">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#2F2F2F]">
            Seamless Integration
          </h3>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Connect your corporate cards to auto-match receipts in real-time.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <CreditCard size={28} className="text-[#355E3B]" />
          </div>
          <button
            type="button"
            className="px-5 py-2.5 rounded-2xl border-2 border-[#4E7D5A] text-[#355E3B] text-sm font-medium hover:bg-[#E8F0E4] transition-colors"
          >
            Configure Cards
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadReceipt;
