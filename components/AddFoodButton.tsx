import React, { useState, useRef } from 'react';
import { Camera, X, Check, Loader2, Upload } from 'lucide-react';
import { analyzeFoodImage } from '../services/geminiService';
import { FoodEntry, AnalysisResult } from '../types';

interface AddFoodButtonProps {
  onAdd: (entry: FoodEntry) => void;
}

const AddFoodButton: React.FC<AddFoodButtonProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to compress image
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          // Maintain aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.6 quality (significant size reduction)
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsProcessing(true);
        const compressedBase64 = await compressImage(file);
        setImagePreview(compressedBase64);
        setIsOpen(true);
        // Reset previous states
        setResult(null);
        setError(null);
      } catch (err) {
        console.error("Error processing image:", err);
        alert("Failed to process image. Please try another photo.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const analysis = await analyzeFoodImage(imagePreview);
      setResult(analysis);
    } catch (err: any) {
      // Show the actual error message if available (helps with API Key debugging)
      const errorMessage = err?.message || "Failed to analyze image. Please try again.";
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (result && imagePreview) {
      const newEntry: FoodEntry = {
        id: Date.now().toString(),
        name: result.foodName,
        description: result.description,
        nutrition: {
            calories: result.calories,
            protein: result.protein,
            carbs: result.carbs,
            fat: result.fat
        },
        timestamp: Date.now(),
        imageUrl: imagePreview
      };
      onAdd(newEntry);
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setIsOpen(false);
    setImagePreview(null);
    setResult(null);
    setIsAnalyzing(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment" // Prefers camera on mobile
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Floating Action Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="fixed bottom-6 right-6 h-16 w-16 bg-slate-900 text-white rounded-full shadow-lg shadow-slate-900/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 z-40 disabled:opacity-70 disabled:scale-100"
        aria-label="Add Food"
      >
        {isProcessing ? <Loader2 className="animate-spin" size={28} /> : <Camera size={28} />}
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 transition-opacity animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Add Entry</h3>
              <button onClick={resetAndClose} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Image Preview */}
              <div className="aspect-square w-full bg-slate-100 rounded-2xl overflow-hidden mb-6 relative group">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                )}
                {!result && !isAnalyzing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => fileInputRef.current?.click()} 
                            className="bg-white/90 text-slate-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm"
                        >
                            <Upload size={16} /> Change Photo
                        </button>
                    </div>
                )}
              </div>

              {/* States */}
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-4 space-y-3">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                  <p className="text-slate-500 text-sm font-medium animate-pulse">Analyzing food...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center mb-4 break-words">
                  {error}
                </div>
              )}

              {result && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-start mb-2">
                         <h4 className="font-bold text-emerald-900 text-lg">{result.foodName}</h4>
                         <span className="bg-emerald-200 text-emerald-800 text-xs px-2 py-1 rounded-full font-bold">
                            {result.calories} kcal
                         </span>
                    </div>
                    <p className="text-emerald-700 text-sm mb-3">{result.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white/60 rounded-lg p-2">
                            <div className="text-xs text-emerald-600 uppercase font-bold">Protein</div>
                            <div className="text-emerald-900 font-semibold">{result.protein}g</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-2">
                            <div className="text-xs text-emerald-600 uppercase font-bold">Carbs</div>
                            <div className="text-emerald-900 font-semibold">{result.carbs}g</div>
                        </div>
                         <div className="bg-white/60 rounded-lg p-2">
                            <div className="text-xs text-emerald-600 uppercase font-bold">Fat</div>
                            <div className="text-emerald-900 font-semibold">{result.fat}g</div>
                        </div>
                    </div>
                </div>
              )}

              {/* Actions */}
              {!result ? (
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Photo'}
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Add to Log
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddFoodButton;