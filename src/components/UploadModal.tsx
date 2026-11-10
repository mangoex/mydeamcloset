import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Camera, Sparkles, Check, AlertCircle, RefreshCw, Wand2, Eye, Eraser, RotateCcw } from 'lucide-react';
import { ClothingItem, ClothingCategory, Season, WeatherCondition } from '../types/wardrobe';
import { SEASONS_LIST, WEATHER_CONDITIONS, CATEGORIES_LIST, getWarmthLabel } from '../utils/fashionHelpers';
import {
  isolateGarmentToWhiteBackground,
  prepareCompressedPayload,
  analyzeGarmentLocally,
} from '../utils/imageStudioProcessor';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveItem: (item: ClothingItem) => void;
  initialCategory?: ClothingCategory;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSaveItem,
  initialCategory,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [processedStudioImage, setProcessedStudioImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'studio' | 'original'>('studio');
  const [isProcessingStudio, setIsProcessingStudio] = useState<boolean>(false);
  const [bgTolerance, setBgTolerance] = useState<number>(38);
  const [detectedBoundingBox, setDetectedBoundingBox] = useState<[number, number, number, number] | undefined>(undefined);
  const [eraserPoints, setEraserPoints] = useState<{ x: number; y: number; radius: number }[]>([]);
  const [isEraserMode, setIsEraserMode] = useState<boolean>(false);

  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [userHint, setUserHint] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Form Fields (Auto-filled by Gemini Vision, editable by user)
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<ClothingCategory>(initialCategory || 'top');
  const [subCategory, setSubCategory] = useState<string>('');
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState<string>('');
  const [material, setMaterial] = useState<string>('');
  const [warmth, setWarmth] = useState<number>(3);
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>(['primavera', 'otono']);
  const [selectedWeather, setSelectedWeather] = useState<WeatherCondition[]>(['templado']);
  const [vibes, setVibes] = useState<string[]>(['casual']);
  const [vibeInput, setVibeInput] = useState<string>('');
  const [stylingAdvice, setStylingAdvice] = useState<string>('');

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory, isOpen]);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelected = async (dataUrl: string, mime: string) => {
    setRawImage(dataUrl);
    setImagePreview(dataUrl);
    setMimeType(mime);
    setViewMode('studio');
    setEraserPoints([]);
    setIsProcessingStudio(true);

    try {
      // 1. Isolate garment, completely remove background, and center in middle of pure white
      const initialStudio = await isolateGarmentToWhiteBackground(dataUrl, {
        tolerance: bgTolerance,
        addShadow: true,
      });
      setProcessedStudioImage(initialStudio.resultDataUrl);
    } catch (e) {
      console.error('Initial studio processing error:', e);
    } finally {
      setIsProcessingStudio(false);
    }

    // 2. Run Gemini AI analysis
    analyzeImage(dataUrl, mime);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mime = file.type || 'image/jpeg';
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        handleImageSelected(result, mime);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error abriendo cámara:', err);
      setIsCameraActive(false);
      setAnalysisError('No se pudo acceder a la cámara. Prueba subiendo una foto.');
    }
  };

  const captureCameraPhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 640;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        // Stop stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach((track) => track.stop());
        setIsCameraActive(false);
        handleImageSelected(dataUrl, 'image/jpeg');
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  const analyzeImage = async (base64Img: string, mime: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    let analysisSucceeded = false;

    try {
      // 1. Prepare ultra-lightweight payload (max 720px, ~50KB) to ensure instant network transfer
      // and prevent any iframe proxy buffer or timeout errors
      const compressed = await prepareCompressedPayload(base64Img, 720, 0.78);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch('/api/analyze-clothing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: compressed.compressedBase64,
          mimeType: compressed.mimeType || mime,
          userHint,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          if (data.name) setName(data.name);
          if (data.category) setCategory(data.category);
          if (data.subCategory) setSubCategory(data.subCategory);
          if (Array.isArray(data.colors) && data.colors.length > 0) setColors(data.colors);
          if (data.material) setMaterial(data.material);
          if (typeof data.warmth === 'number') setWarmth(Math.max(1, Math.min(5, data.warmth)));
          if (Array.isArray(data.seasons) && data.seasons.length > 0) setSelectedSeasons(data.seasons);
          if (Array.isArray(data.weather) && data.weather.length > 0) setSelectedWeather(data.weather);
          if (Array.isArray(data.vibes) && data.vibes.length > 0) setVibes(data.vibes);
          if (data.stylingAdvice) setStylingAdvice(data.stylingAdvice);

          // If Gemini detected exact bounding box coordinates of the garment, refine centering
          if (data.boundingBox && Array.isArray(data.boundingBox)) {
            setDetectedBoundingBox(data.boundingBox);
            setIsProcessingStudio(true);
            try {
              const refinedStudio = await isolateGarmentToWhiteBackground(base64Img, {
                boundingBox: data.boundingBox,
                tolerance: bgTolerance,
                manualEraserPoints: eraserPoints,
                addShadow: true,
              });
              setProcessedStudioImage(refinedStudio.resultDataUrl);
            } catch (e) {
              console.error('Error in refined studio centering:', e);
            } finally {
              setIsProcessingStudio(false);
            }
          }

          analysisSucceeded = true;
        }
      }
    } catch (err: any) {
      console.warn('Network analysis notice, using client-side visual engine fallback:', err?.message || err);
    }

    // 2. Fallback to client-side canvas analysis if server fetch was unreachable or failed
    if (!analysisSucceeded) {
      try {
        const localData = await analyzeGarmentLocally(base64Img);
        setName((prev) => prev.trim() || localData.name);
        setCategory(localData.category);
        setSubCategory(localData.subCategory);
        setColors(localData.colors);
        setMaterial(localData.material);
        setWarmth(localData.warmth);
        setSelectedSeasons(localData.seasons);
        setSelectedWeather(localData.weather);
        setVibes(localData.vibes);
        setStylingAdvice(localData.stylingAdvice);
      } catch (localErr) {
        console.error('Local analysis error:', localErr);
        setName((prev) => prev.trim() || 'Prenda nueva');
      }
    }

    setIsAnalyzing(false);
  };

  const handleToleranceChange = async (newVal: number) => {
    setBgTolerance(newVal);
    if (!rawImage) return;
    setIsProcessingStudio(true);
    try {
      const refined = await isolateGarmentToWhiteBackground(rawImage, {
        boundingBox: detectedBoundingBox,
        tolerance: newVal,
        manualEraserPoints: eraserPoints,
        addShadow: true,
      });
      setProcessedStudioImage(refined.resultDataUrl);
    } catch (e) {
      console.error('Reprocess error:', e);
    } finally {
      setIsProcessingStudio(false);
    }
  };

  const handlePreviewClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rawImage) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    // Add manual eraser point
    const newPoints = [...eraserPoints, { x: clickX, y: clickY, radius: 0.08 }];
    setEraserPoints(newPoints);
    setIsProcessingStudio(true);
    try {
      const refined = await isolateGarmentToWhiteBackground(rawImage, {
        boundingBox: detectedBoundingBox,
        tolerance: bgTolerance,
        manualEraserPoints: newPoints,
        addShadow: true,
      });
      setProcessedStudioImage(refined.resultDataUrl);
    } catch (err) {
      console.error('Manual eraser error:', err);
    } finally {
      setIsProcessingStudio(false);
    }
  };

  const handleResetIsolation = async () => {
    if (!rawImage) return;
    setEraserPoints([]);
    setBgTolerance(38);
    setIsProcessingStudio(true);
    try {
      const res = await isolateGarmentToWhiteBackground(rawImage, {
        boundingBox: detectedBoundingBox,
        tolerance: 38,
        addShadow: true,
      });
      setProcessedStudioImage(res.resultDataUrl);
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsProcessingStudio(false);
    }
  };

  const toggleSeason = (seasonId: Season) => {
    setSelectedSeasons((prev) =>
      prev.includes(seasonId) ? prev.filter((s) => s !== seasonId) : [...prev, seasonId]
    );
  };

  const toggleWeather = (weatherId: WeatherCondition) => {
    setSelectedWeather((prev) =>
      prev.includes(weatherId) ? prev.filter((w) => w !== weatherId) : [...prev, weatherId]
    );
  };

  const addColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]);
      setColorInput('');
    }
  };

  const removeColor = (idx: number) => {
    setColors(colors.filter((_, i) => i !== idx));
  };

  const addVibe = () => {
    if (vibeInput.trim() && !vibes.includes(vibeInput.trim())) {
      setVibes([...vibes, vibeInput.trim()]);
      setVibeInput('');
    }
  };

  const removeVibe = (idx: number) => {
    setVibes(vibes.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      setAnalysisError('Debes subir o tomar una foto de la prenda');
      return;
    }
    if (!name.trim()) {
      setAnalysisError('Por favor ponle un nombre a tu prenda');
      return;
    }

    const finalImageUrl =
      (viewMode === 'original' && rawImage ? rawImage : processedStudioImage) ||
      imagePreview ||
      '';

    const newItem: ClothingItem = {
      id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      category,
      subCategory: subCategory.trim() || 'Prenda de vestir',
      imageUrl: finalImageUrl,
      colors: colors.length > 0 ? colors : ['Multicolor'],
      material: material.trim() || 'Textil',
      warmth,
      seasons: selectedSeasons.length > 0 ? selectedSeasons : ['primavera', 'otono'],
      weather: selectedWeather.length > 0 ? selectedWeather : ['templado'],
      vibes: vibes.length > 0 ? vibes : ['casual'],
      stylingAdvice: stylingAdvice.trim(),
      isCustomUpload: true,
      createdAt: Date.now(),
    };

    onSaveItem(newItem);
    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    setImagePreview(null);
    setRawImage(null);
    setProcessedStudioImage(null);
    setDetectedBoundingBox(undefined);
    setName('');
    setAnalysisError(null);
    onClose();
  };

  const warmthInfo = getWarmthLabel(warmth);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Añadir Prenda a Tu Armario
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Sube una foto y la IA identificará su tipo, tela, estaciones y clima ideal.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Step 1: Upload / Camera section */}
          {!imagePreview && !isCameraActive && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-stone-400 rounded-xl p-8 text-center cursor-pointer transition-colors bg-stone-50/50 hover:bg-stone-50"
              >
                <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3 text-stone-600">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-base font-medium text-stone-900 mb-1">
                  Arrastra o selecciona una foto de tu ropa
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
                  Soporta fotos tomadas en perchas, sobre la cama o puestas. Formatos JPG, PNG o WebP.
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
                >
                  Seleccionar archivo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-stone-500">
                <span>O también puedes:</span>
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-900 font-medium underline underline-offset-4 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Tomar foto con cámara
                </button>
              </div>
            </div>
          )}

          {/* Camera View */}
          {isCameraActive && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-4/3 max-h-80 mx-auto">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={captureCameraPhoto}
                  className="px-6 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Capturar Foto
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Image preview & AI Analysis / Form */}
          {imagePreview && (
            <div className="space-y-6">
              {/* Studio White Centered Image Preview Card */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Studio Canvas Box: Pure White #FFFFFF with garment centered */}
                  <div
                    onClick={isEraserMode && viewMode === 'studio' ? handlePreviewClick : undefined}
                    className={`relative w-44 h-44 sm:w-52 sm:h-52 shrink-0 rounded-xl overflow-hidden border border-stone-300 bg-white shadow-xs flex items-center justify-center p-3 select-none ${
                      isEraserMode && viewMode === 'studio'
                        ? 'cursor-crosshair ring-2 ring-stone-900'
                        : ''
                    }`}
                    title={
                      isEraserMode && viewMode === 'studio'
                        ? 'Haz clic sobre cualquier parte del fondo que quieras eliminar'
                        : undefined
                    }
                  >
                    <img
                      src={
                        viewMode === 'studio'
                          ? (processedStudioImage || imagePreview)
                          : (rawImage || imagePreview)
                      }
                      alt="Prenda sola centrada en fondo blanco"
                      className="w-full h-full object-contain pointer-events-none"
                    />

                    {isProcessingStudio && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center text-xs text-stone-700 gap-1.5 p-2 text-center z-10">
                        <RefreshCw className="w-4 h-4 animate-spin text-stone-900" />
                        <span className="font-medium text-[11px]">Aislando prenda y centrando...</span>
                      </div>
                    )}

                    {viewMode === 'studio' && (
                      <div className="absolute bottom-2 left-2 right-2 text-center">
                        <span className="bg-stone-900/85 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-xs">
                          {isEraserMode ? 'Modo Borrador: Clic para limpiar' : 'Prenda sola · Centrada en medio'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Processing Controls & AI Status */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-lg text-xs font-medium">
                        <button
                          type="button"
                          onClick={() => setViewMode('studio')}
                          className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                            viewMode === 'studio'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-stone-800" />
                          <span>Prenda Sola (Fondo Blanco)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('original')}
                          className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                            viewMode === 'original'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <Eye className="w-3 h-3 text-stone-500" />
                          <span>Foto Original</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setRawImage(null);
                          setProcessedStudioImage(null);
                          setName('');
                        }}
                        className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                      >
                        Cambiar foto
                      </button>
                    </div>

                    {/* Background Removal Tools */}
                    {viewMode === 'studio' && (
                      <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] text-stone-600">
                          <span className="font-semibold text-stone-800">
                            Fuerza de eliminación de fondo:
                          </span>
                          <span className="font-mono text-stone-900">{bgTolerance}%</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="70"
                          value={bgTolerance}
                          onChange={(e) => handleToleranceChange(parseInt(e.target.value))}
                          className="w-full accent-stone-900 cursor-pointer h-1.5"
                        />

                        {/* Interactive tools */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => setIsEraserMode(!isEraserMode)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                              isEraserMode
                                ? 'bg-stone-900 text-white'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            }`}
                          >
                            <Eraser className="w-3 h-3" />
                            <span>
                              {isEraserMode ? 'Borrador activo (haz clic en fondo)' : 'Borrar fondo con clic'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={handleResetIsolation}
                            className="px-2 py-1 rounded text-[11px] text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restablecer</span>
                          </button>
                        </div>

                        <p className="text-[10px] text-stone-400">
                          Se elimina por completo el fondo (cama, percha, piso o sombras) y la prenda se ubica acomodada en el centro.
                        </p>
                      </div>
                    )}

                    {isAnalyzing ? (
                      <div className="py-2 space-y-1">
                        <div className="flex items-center gap-2 text-stone-900 font-medium text-xs">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-600" />
                          <span>Analizando prenda con Gemini AI...</span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          Detectando silueta, tonalidades y nivel de calidez térmica.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>¡Prenda sola acomodada en el medio del fondo blanco!</span>
                        </div>
                        {stylingAdvice && (
                          <p className="text-xs text-stone-600 italic bg-white/70 p-2.5 rounded-lg border border-stone-200">
                            "{stylingAdvice}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {analysisError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{analysisError}</span>
                </div>
              )}

              {/* Editable Details Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name & SubCategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Nombre de la prenda *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Suéter de punto crudo"
                      className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Tipo / Subcategoría
                    </label>
                    <input
                      type="text"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      placeholder="Ej: Suéter, Pantalón sastre, Trench..."
                      className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent bg-white"
                    />
                  </div>
                </div>

                {/* Category & Material */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Categoría en el armario
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ClothingCategory)}
                      className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 bg-white"
                    >
                      {CATEGORIES_LIST.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Material / Tejido estimado
                    </label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="Ej: Algodón 100%, Lino, Lana merino"
                      className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 bg-white"
                    />
                  </div>
                </div>

                {/* Warmth Level Slider (1 to 5) */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                      Nivel de Calidez Térmica: {warmth}/5
                    </label>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${warmthInfo.colorClass}`}>
                      {warmthInfo.text}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={warmth}
                    onChange={(e) => setWarmth(parseInt(e.target.value))}
                    className="w-full accent-stone-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-stone-400 mt-1">
                    <span>1: Muy fresco (verano)</span>
                    <span>3: Entretiempo</span>
                    <span>5: Muy abrigador (invierno/nieve)</span>
                  </div>
                </div>

                {/* Seasons Selector (Multi-select) */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                    Temporadas adecuadas (Selecciona las que apliquen)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SEASONS_LIST.map((s) => {
                      const isSelected = selectedSeasons.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleSeason(s.id)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{s.icon}</span>
                            <span>{s.label}</span>
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Weather Suitability (Multi-select) */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                    Climas adecuados para vestir esta prenda
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WEATHER_CONDITIONS.map((w) => {
                      const isSelected = selectedWeather.includes(w.id);
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => toggleWeather(w.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <span>{w.icon}</span>
                          <span>{w.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Colors tags */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Colores de la prenda
                  </label>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {colors.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-800 rounded-md text-xs"
                      >
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => removeColor(idx)}
                          className="hover:text-red-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addColor();
                        }
                      }}
                      placeholder="Añadir color (ej: Beige, Azul marino)"
                      className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800"
                    />
                    <button
                      type="button"
                      onClick={addColor}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Guardar en mi Armario
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
