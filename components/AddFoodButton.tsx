import React, { useState, useRef } from 'react';
import { Camera, X, Check, Loader2, Upload, Plus, Image as ImageIcon, Edit2, Droplets, Candy, Wheat } from 'lucide-react';
import { analyzeFoodImage } from '../services/geminiService';
import { FoodEntry, AnalysisResult } from '../types';

interface AddFoodButtonProps {
  onAdd: (entry: FoodEntry) => void;
}

const AddFoodButton: React.FC<AddFoodButtonProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [editedResult, setEditedResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
        setIsMenuOpen(false);
        const compressedBase64 = await compressImage(file);
        setImagePreview(compressedBase64);
        setIsOpen(true);
        setResult(null);
        setEditedResult(null);
        setError(null);
      } catch (err) {
        console.error("Error processing image:", err);
        alert("Failed to process image. Please try another photo.");
      } finally {
        setIsProcessing(false);
        if (cameraInputRef.current) cameraInputRef.current.value = '';
        if (galleryInputRef.current) galleryInputRef.current.value = '';
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
      setEditedResult(analysis);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to analyze image. Please try again.";
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    const finalData = editedResult || result;
    
    if (finalData && imagePreview) {
      const newEntry: FoodEntry = {
        id: Date.now().toString(),
        name: finalData.foodName,
        description: finalData.description,
        healthTip: finalData.healthTip,
        nutrition: {
            calories: Number(finalData.calories),
            protein: Number(finalData.protein),
            carbs: Number(finalData.carbs),
            fat: Number(finalData.fat),
            fiber: Number(finalData.fiber || 0),
            sugar: Number(finalData.sugar || 0),
            water: Number(finalData.water || 0),
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
    setEditedResult(null);
    setIsAnalyzing(false);
    setError(null);
  };

  const renderMacroInput = (label: string, field: keyof AnalysisResult, unit: string) => (
    <div className="bg-white/60 rounded-lg p-2 shadow-sm border border-slate-50">
        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wide">{label}</div>
        <div className="flex items-center justify-center">
            <input
                type="number"
                value={editedResult?.[field] as number || 0}
                onChange={(e) => editedResult && setEditedResult({...editedResult, [field]: Number(e.target.value)})}
                className="text-slate-800 font-bold w-full text-center bg-transparent outline-none appearance-none p-0 leading-tight"
            />
            <span className="text-slate-500 font-medium text-xs ml-0.5">{unit}</span>
        </div>
    </div>
  );

  return (
    <>
      <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      <input type="file" ref={galleryInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        <div className={`transition-all duration-200 flex items-center gap-3 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
             <span className="bg-white text-slate-700 text-xs font-semibold py-1 px-2 rounded-lg shadow-sm">Upload Photo</span>
             <button onClick={() => galleryInputRef.current?.click()} disabled={isProcessing} className="h-12 w-12 bg-white text-indigo-600 rounded-full shadow-lg shadow-slate-200 flex items-center justify-center hover:bg-indigo-50 transition-colors">
                <ImageIcon size={24} />
             </button>
        </div>
        <div className={`transition-all duration-200 flex items-center gap-3 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}`}>
             <span className="bg-white text-slate-700 text-xs font-semibold py-1 px-2 rounded-lg shadow-sm">Take Picture</span>
             <button onClick={() => cameraInputRef.current?.click()} disabled={isProcessing} className="h-12 w-12 bg-white text-indigo-600 rounded-full shadow-lg shadow-slate-200 flex items-center justify-center hover:bg-indigo-50 transition-colors">
                <Camera size={24} />
             </button>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} disabled={isProcessing} className={`h-16 w-16 bg-slate-900 text-white rounded-full shadow-xl shadow-slate-900/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 ${isMenuOpen ? 'rotate-45' : 'rotate-0'}`}>
          {isProcessing ? <Loader2 className="animate-spin" size={28} /> : <Plus size={32} />}
        </button>
      </div>
      
      {isMenuOpen && <div className="fixed inset-0 bg-black/20 z-30 backdrop-blur-[1px]" onClick={() => setIsMenuOpen(false)} />}

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 transition-opacity animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto">
            
            <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-slate-800">New Entry</h3>
              <button onClick={resetAndClose} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="aspect-square w-full bg-slate-100 rounded-2xl overflow-hidden mb-6 relative group shadow-inner">
                {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />}
                {!result && !isAnalyzing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => { setIsMenuOpen(true); setIsOpen(false); }} className="bg-white/90 text-slate-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm hover:bg-white">
                            <Upload size={16} /> Change Photo
                        </button>
                    </div>
                )}
              </div>

              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-4 space-y-3">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                  <p className="text-slate-500 text-sm font-medium animate-pulse">Consulting Food Scientist...</p>
                </div>
              )}

              {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center mb-4 border border-red-100">{error}</div>}

              {result && editedResult && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
                    {/* Header: Name and Cals */}
                    <div className="flex justify-between items-start mb-3 gap-3">
                         <input
                            type="text"
                            value={editedResult.foodName}
                            onChange={(e) => setEditedResult({...editedResult, foodName: e.target.value})}
                            className="font-bold text-slate-900 text-lg bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 outline-none w-full placeholder-slate-400"
                            placeholder="Food name"
                         />
                         <div className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-full font-bold flex items-center shrink-0 shadow-sm shadow-indigo-200">
                            <input
                                type="number"
                                value={editedResult.calories}
                                onChange={(e) => setEditedResult({...editedResult, calories: Number(e.target.value)})}
                                className="w-10 bg-transparent text-right outline-none appearance-none m-0 p-0 text-white font-bold"
                            />
                            <span className="ml-0.5 opacity-90">kcal</span>
                         </div>
                    </div>
                    
                    {/* Description */}
                    <textarea
                        value={editedResult.description}
                        onChange={(e) => setEditedResult({...editedResult, description: e.target.value})}
                        rows={2}
                        className="text-slate-600 text-sm mb-4 w-full bg-transparent border-none p-0 focus:ring-0 resize-none"
                    />

                    {/* Macros Grid */}
                    <div className="mb-2">
                        <span className="text-xs font-semibold text-slate-400 mb-2 block">MACRONUTRIENTS</span>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            {renderMacroInput("Protein", "protein", "g")}
                            {renderMacroInput("Carbs", "carbs", "g")}
                            {renderMacroInput("Fat", "fat", "g")}
                        </div>
                    </div>

                    {/* Micros Grid */}
                    <div className="mb-4">
                        <span className="text-xs font-semibold text-slate-400 mb-2 block mt-3">MICRONUTRIENTS</span>
                        <div className="grid grid-cols-3 gap-2 text-center">
                             <div className="bg-emerald-50/50 rounded-lg p-2 shadow-sm border border-emerald-100/50">
                                <div className="text-[10px] text-emerald-600 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                                    <Wheat size={10} /> Fiber
                                </div>
                                <div className="flex items-center justify-center">
                                    <input
                                        type="number"
                                        value={editedResult.fiber}
                                        onChange={(e) => setEditedResult({...editedResult, fiber: Number(e.target.value)})}
                                        className="text-emerald-900 font-bold w-full text-center bg-transparent outline-none appearance-none p-0"
                                    />
                                    <span className="text-emerald-700 font-medium text-xs ml-0.5">g</span>
                                </div>
                            </div>

                            <div className="bg-amber-50/50 rounded-lg p-2 shadow-sm border border-amber-100/50">
                                <div className="text-[10px] text-amber-600 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                                    <Candy size={10} /> Sugar
                                </div>
                                <div className="flex items-center justify-center">
                                    <input
                                        type="number"
                                        value={editedResult.sugar}
                                        onChange={(e) => setEditedResult({...editedResult, sugar: Number(e.target.value)})}
                                        className="text-amber-900 font-bold w-full text-center bg-transparent outline-none appearance-none p-0"
                                    />
                                    <span className="text-amber-700 font-medium text-xs ml-0.5">g</span>
                                </div>
                            </div>

                            <div className="bg-blue-50/50 rounded-lg p-2 shadow-sm border border-blue-100/50">
                                <div className="text-[10px] text-blue-600 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                                    <Droplets size={10} /> Water
                                </div>
                                <div className="flex items-center justify-center">
                                    <input
                                        type="number"
                                        value={editedResult.water}
                                        onChange={(e) => setEditedResult({...editedResult, water: Number(e.target.value)})}
                                        className="text-blue-900 font-bold w-full text-center bg-transparent outline-none appearance-none p-0"
                                    />
                                    <span className="text-blue-700 font-medium text-xs ml-0.5">ml</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Health Tip Section */}
                    {editedResult.healthTip && (
                        <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex gap-3 items-start">
                             <div className="bg-white p-1.5 rounded-full shadow-sm text-indigo-600 mt-0.5">
                                <div className="text-xs font-bold">TIP</div>
                             </div>
                             <div>
                                 <textarea 
                                    value={editedResult.healthTip}
                                    onChange={(e) => setEditedResult({...editedResult, healthTip: e.target.value})}
                                    className="text-indigo-900 text-xs italic bg-transparent border-none w-full p-0 focus:ring-0 resize-none leading-relaxed"
                                    rows={2}
                                 />
                             </div>
                        </div>
                    )}

                    <div className="text-center mt-3">
                        <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <Edit2 size={10} /> Tap values to edit analysis
                        </span>
                    </div>
                </div>
              )}

              {!result ? (
                <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Photo'}
                </button>
              ) : (
                <button onClick={handleSave} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <Check size={20} />
                  Confirm & Log Food
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