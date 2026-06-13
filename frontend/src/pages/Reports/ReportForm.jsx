import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { saveReportOffline, prepareOfflineReport } from "../../utils/offlineQueue";
import { useLocalGovStore } from "../../stores/localGovStore";
import {
  Camera,
  MapPin,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  ChevronLeft,
  ShieldAlert,
  Flame,
  Waves,
  Mountain,
  Car,
  Trash2,
  AlertCircle,
  WifiOff,
  MessageSquare
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import API from "../../api/axios";

export default function ReportForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(true);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaSource, setMediaSource] = useState("");

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const captureStartRef = useRef(null);

  const tags = [
    { id: "fire", icon: <Flame size={20} /> },
    { id: "flood", icon: <Waves size={20} /> },
    { id: "landslide", icon: <Mountain size={20} /> },
    { id: "accident", icon: <Car size={20} /> },
    { id: "garbage", icon: <Trash2 size={20} /> },
    { id: "other", icon: <AlertCircle size={20} /> }
  ];

  useEffect(() => {
    const cached = useLocalGovStore.getState().getCoordinates();
    if (cached && cached.length === 2) {
      setLocation({ lat: cached[0], lng: cached[1] });
      setLocating(false);
    } else {
      detectLocation();
    }
    return () => stopCamera();
  }, []);

  const detectLocation = () => {
    setLocating(true);
    setLocation(null);
    if (!navigator.geolocation) {
      toast.error(t("report.locationError", "Geolocation is not supported."));
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        toast.error(t("report.locationError", "GPS failed. Step outside for satellite lock if offline."));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const openCamera = async () => {
    captureStartRef.current = Date.now();
    try {
      setShowCamera(true);
      setCameraReady(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setShowCamera(false);
      fileInputRef.current?.click();
    }
  };

  const handleFileFallback = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("report.selectImage"));
      return;
    }
    const timeDiff = Date.now() - file.lastModified;
    if (!file.lastModified || timeDiff > 5000) {
      toast.error(t("report.livePhotoOnly"));
      e.target.value = "";
      return;
    }
    setMediaSource("fallback");
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleVideoLoaded = () => {
    setCameraReady(true);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `live-${Date.now()}.jpg`, { type: "image/jpeg" });
      setMediaSource("camera");
      setPhotoFile(file);

      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);

      stopCamera();
      setShowCamera(false);
    }, "image/jpeg", 0.85);
  };

  const clearPhoto = () => {
    setPreview(null);
    setPhotoFile(null);
    setMediaSource("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location) {
      detectLocation();
      return toast.error(t("report.locationFetching", "Location is required."));
    }

    if (!photoFile) {
      return toast.error(t("report.livePhotoRequired"));
    }

    if (description.length < 10) {
      return toast.error(t("report.descriptionLength", "Description must be at least 10 characters."));
    }

    if (!type || !tags.map(t => t.id).includes(type)) {
      return toast.error(t("report.invalidType", "Invalid type selected."));
    }

    const locationString = JSON.stringify([location.lng, location.lat]);

    try {
      setStatus("submitting");
      const formData = new FormData();
      formData.append("type", type);
      formData.append("description", description);
      formData.append("location", locationString);
      formData.append("image", photoFile);

      await API.post("/reports", formData);
      setStatus("success");
    } catch (err) {
      console.error(err);
      try {
        const offlineData = await prepareOfflineReport({
          type,
          description,
          location: locationString,
          photoFile,
        });
        await saveReportOffline(offlineData);
        setStatus("queued");
      } catch (queueErr) {
        console.error("Failed to queue offline:", queueErr);
        setErrorMessage(t("report.offlineSaveFailed"));
        setStatus("failed");
      }
    }
  };

  if (status === "submitting" || status === "success" || status === "failed" || status === "queued") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 backdrop-blur-xl">
        <AnimatePresence mode="wait">

          {status === "submitting" && (
            <motion.div key="submitting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center">
              <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                <Loader2 className="animate-spin text-blue-500 w-16 h-16" />
              </div>
              <h2 className="text-2xl font-bold text-white">{t("report.submitting", "Submitting...")}</h2>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div key="success" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-sm w-full mx-4 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("report.success", "Report Submitted!")}</h2>
              <button onClick={() => navigate("/dashboard/home")} className="mt-8 w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">
                {t("report.backHome", "Return Home")}
              </button>
            </motion.div>
          )}

          {status === "queued" && (
            <motion.div key="queued" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-sm w-full mx-4 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <WifiOff size={36} className="text-amber-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("report.queuedTitle", "Saved Offline")}</h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {t("report.queuedMessage", "Your report has been saved and will be submitted automatically when you're back online.")}
              </p>
              <button onClick={() => navigate("/dashboard/home")} className="w-full bg-amber-600 text-white font-bold py-3 rounded-xl hover:bg-amber-700 transition">
                {t("report.backHome", "Return Home")}
              </button>
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div key="failed" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.5 }} className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-sm w-full mx-4 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("report.errorTitle", "Submission Failed")}</h2>
              <p className="text-red-600 mb-8 font-medium">
                {errorMessage}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStatus("idle")} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition">
                  {t("report.cancel", "Cancel")}
                </button>
                <button onClick={handleSubmit} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition">
                  {t("report.retry", "Retry")}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Toaster position="top-center" />

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between p-4 max-w-xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">{t("report.title", "File a Report")}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6 mt-4">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. Location Card */}
          <motion.section initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="text-blue-600" size={18} /> {t("report.location", "Location")}
              </h2>
              <button type="button" onClick={detectLocation} disabled={locating} className="text-xs font-semibold text-blue-600 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition disabled:opacity-50">
                <RefreshCcw size={14} className={locating ? "animate-spin" : ""} /> {t("report.refresh", "Refresh")}
              </button>
            </div>

            <div className={`p-4 rounded-xl border ${location ? "bg-green-50/50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
              {locating ? (
                <div className="flex items-center gap-3 text-gray-600 font-medium text-sm">
                  <Loader2 size={16} className="animate-spin text-blue-600" /> {t("report.locationFetching", "Securing GPS Signal...")}
                </div>
              ) : location ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{t("report.locationSecured", "Location Secured")}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-red-700">
                  <AlertTriangle size={18} />
                  <span className="text-sm font-medium">{t("report.locationError", "Failed to retrieve location.")}</span>
                </div>
              )}
            </div>
          </motion.section>

          {/* 2. Camera Card */}
          <motion.section initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-50">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Camera className="text-blue-600" size={18} /> {t("report.photo", "Visual Evidence")}
              </h2>
            </div>

            <div className="p-5">
              <AnimatePresence mode="wait">
                {showCamera ? (
                  <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative rounded-xl overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      onCanPlay={handleVideoLoaded}
                      className="w-full aspect-[4/3] object-cover"
                    />
                    {!cameraReady && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin text-white w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                      <button
                        type="button"
                        onClick={() => { stopCamera(); setShowCamera(false); }}
                        className="px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold text-sm hover:bg-white/30 transition"
                      >
                        {t("report.cameraCancel")}
                      </button>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={!cameraReady}
                        className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition disabled:opacity-50"
                      >
                        <div className="w-10 h-10 rounded-full border-4 border-gray-800" />
                      </button>
                    </div>
                  </motion.div>
                ) : preview ? (
                  <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative rounded-xl overflow-hidden shadow-md">
                    <img src={preview} alt="Incident" className="w-full aspect-[4/3] object-cover" />
                    <button type="button" onClick={clearPhoto} className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition">
                      <X size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={openCamera}
                      className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white transition shadow"
                    >
                      {t("report.retake")}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <button type="button" onClick={openCamera} className="w-full flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition group">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <Camera size={32} />
                      </div>
                      <span className="font-semibold text-gray-700">{t("report.takePhoto", "Take Live Photo")}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileFallback} className="hidden" />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </motion.section>

          {/* 3. Details Card */}
          <motion.section initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">{t("report.selectAuthority", "Select Incident Type")}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tags.map((tItem) => (
                  <button
                    key={tItem.id}
                    type="button"
                    onClick={() => setType(tItem.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${type === tItem.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span className={type === tItem.id ? "text-blue-600" : "text-gray-500"}>{tItem.icon}</span>
                    <span className="text-xs font-semibold capitalize">{t(`incidentTypes.${tItem.id}`)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t("report.description", "Description")}</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("report.descriptionPlaceholder", "Provide specific details...")}
                className="w-full border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-blue-500 p-3 text-sm bg-gray-50 transition resize-none"
              />
            </div>
          </motion.section>

          {/* 4. SMS Fallback Card */}
          <motion.section initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl shadow-sm border border-indigo-100 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm border border-indigo-100">
                <WifiOff size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">{t("report.noInternet", "No Internet? Report via SMS")}</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {t("report.smsInstruction", "If you cannot connect to the internet, send an SMS. Our AI will automatically parse your emergency and notify authorities.")}
                </p>
              </div>
            </div>
            <a
              href={`sms:${import.meta.env.VITE_TWILIO_PHONE_NUMBER || "+1234567890"}?body=Emergency%20Report:%20`}
              className="flex items-center justify-center gap-2 w-full bg-white border border-indigo-200 text-indigo-700 font-bold py-2.5 rounded-xl hover:bg-indigo-100 transition active:scale-95 text-sm shadow-sm"
            >
              <MessageSquare size={18} /> {t("report.sendSmsNow", "Send SMS Now")}
            </a>
          </motion.section>

          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="pt-2">
            <button
              type="submit"
              disabled={status === "submitting" || locating}
              className="w-full bg-[#e9403e] hover:bg-[#d82e2c] disabled:opacity-70 text-white text-lg font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              {t("report.submit", "Submit")}
            </button>
          </motion.div>

        </form>
      </main>
    </div>
  );
}
