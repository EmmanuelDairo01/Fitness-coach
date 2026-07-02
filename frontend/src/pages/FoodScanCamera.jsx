import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Image as ImageIcon, Zap } from 'lucide-react';

export default function FoodScanCamera() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setCameraError('Camera unavailable — use "Upload photo" below instead.');
      }
    }
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function goToResult(imageBase64) {
    navigate('/scan/result', { state: { imageBase64 } });
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    goToResult(canvas.toDataURL('image/jpeg', 0.85));
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => goToResult(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <div className="app-shell bg-black text-white">
      <div className="relative flex-1 flex flex-col">
        <div className="flex items-center justify-between px-5 pt-6 z-10">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40"
          >
            <X size={18} />
          </button>
          <Zap size={18} />
        </div>

        <div className="flex-1 relative overflow-hidden">
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center px-10 text-center text-sm text-white/70">
              {cameraError}
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
          )}
          <canvas ref={canvasRef} className="hidden" />

          {/* Framing guide */}
          <div className="absolute inset-12 border-2 border-white/60 rounded-3xl pointer-events-none" />
        </div>

        <div className="px-8 pb-10 pt-6 text-center">
          <p className="text-sm text-white/80 mb-6">Take a clear photo of your food in good lighting</p>
          <div className="flex items-center justify-between">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center"
            >
              <ImageIcon size={18} />
            </button>
            <button
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-white border-4 border-white/30"
              aria-label="Capture photo"
            />
            <span className="text-xs text-white/70 w-11">Tips</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
}
