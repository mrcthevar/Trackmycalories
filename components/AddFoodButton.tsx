import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, Loader2, Upload, Plus, Image as ImageIcon, Type as TypeIcon, ScanBarcode, ArrowRight, Wheat, Candy, Droplets } from 'lucide-react';
import { analyzeFoodImage, analyzeFoodText, analyzeNutritionLabel } from '../services/geminiService';
import { FoodEntry, AnalysisResult, MealType } from '../types';

interface AddFoodButtonProps {
  onAdd: (entry: FoodEntry) => void;
}

type InputMode = 'food-photo' | 'label-scan' | 'text' | null;

const AddFoodButton: React.FC<AddFoodButtonProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [editedResult, setEditedResult] = useState<AnalysisResult | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('Snack');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  // --- Utilities ---
  const getMealTypeByTime = (): MealType => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    if (currentMinutes >= 300 && currentMinutes <= 750) return 'Breakfast';
    if (currentMinutes >= 751 && currentMinutes <= 1019) return 'Lunch';
    if (currentMinutes >= 1020 && currentMinutes <= 1319) return 'Dinner';
    return 'Snack';
  };

  useEffect(() => {
    if (isOpen && !result) {
        setSelectedMealType(getMealTypeByTime());
    }
  }, [isOpen, result]);

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
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;

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
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // --- Handlers ---
  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'food-photo' | 'label-scan') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsProcessing(true);
        setIsMenuOpen(false);
        const compressedBase64 = await compressImage(file);
        setImagePreview(compressedBase64);
        setInputMode(mode);
        setIsOpen(true);
        setResult(null);
        setEditedResult(null);
        setError(null);
        setTextInput("");
      } catch (err) {
        console.error("Error processing image:", err);
        alert("Failed to process image.");
      } finally {
        setIsProcessing(false);
        if (e.target) e.target.value = '';
      }
    }
  };

  const handleTextMode = () => {
    setIsMenuOpen(false);
    setInputMode('text');
    setIsOpen(true);
    setResult(null);
    setEditedResult(null);
    setImagePreview(null);
    setError(null);
    setTextInput("");
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      let analysis: AnalysisResult;

      if (inputMode === 'text') {
        if (!textInput.trim()) throw new Error("Please enter a food description.");
        analysis = await analyzeFoodText(textInput);
      } else if (inputMode === 'label-scan' && imagePreview) {
        analysis = await analyzeNutritionLabel(imagePreview);
      } else if (inputMode === 'food-photo' && imagePreview) {
        analysis = await analyzeFoodImage(imagePreview);
      } else {
        throw new Error("Invalid input state");
      }

      setResult(analysis);
      setEditedResult(analysis);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to analyze. Please try again.";
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    const finalData = editedResult || result;
    
    if (finalData) {
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
        imageUrl: imagePreview || undefined,
        source: inputMode === 'label-scan' ? 'label' : inputMode === 'text' ? 'text' : 'image',
        mealType: selectedMealType
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
    setInputMode(null);
  };

  const renderMacroInput = (label: string, field: keyof AnalysisResult, unit: string) => (
    <div className="bg-[#F2F2F7] rounded-xl p-3 border border-slate-200/50">
        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wide">{label}</div>
        <div className="flex items-center justify-center">
            <input
                type="number"
                value={editedResult?.[field] as number || 0}
                onChange={(e) => editedResult && setEditedResult({...editedResult, [field]: Number(e.target.value)})}
                className="text-slate-900 font-bold w-full text-center bg-transparent outline-none appearance-none p-0 leading-tight text-lg"
            />
            <span className="text-slate-400 font-medium text-xs ml-0.5">{unit}</span>
        </div>
    </div>
  );

  const MealTypeSelector = () => (
    <div className="flex bg-[#F2F2F7] p-1 rounded-xl mb-6">
        {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealType[]).map((type) => {
            const isActive = selectedMealType === type;
            // Dynamic colorful classes for active state
            let activeClass = 'bg-white text-slate-900 shadow-sm';
            if(type === 'Breakfast') activeClass = 'bg-white text-orange-600 shadow-sm';
            if(type === 'Lunch') activeClass = 'bg-white text-emerald-600 shadow-sm';
            if(type === 'Dinner') activeClass = 'bg-white text-indigo-600 shadow-sm';
            if(type === 'Snack') activeClass = 'bg-white text-pink-600 shadow-sm';

            return (
            <button
                key={type}
                onClick={() => setSelectedMealType(type)}
                className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${
                    isActive ? activeClass : 'text-slate-400'
                }`}
            >
                {type}
            </button>
        )})}
    </div>
  );

  return (
    <>
      <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileSelection(e, 'food-photo')} />
      <input type="file" ref={galleryInputRef} accept="image/*" className="hidden" onChange={(e) => handleFileSelection(e, 'food-photo')} />
      <input type="file" ref={labelInputRef} accept="image/*" className="hidden" onChange={(e) => handleFileSelection(e, 'label-scan')} />

      {/* FAB Menu */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-4">
        
        {/* Menu Items with Colorful Icons */}
        <div className={`transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) flex items-center gap-4 ${isMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}>
             <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[13px] font-semibold py-1.5 px-3 rounded-xl shadow-lg border border-white/20">Type it</span>
             <button onClick={handleTextMode} disabled={isProcessing} className="h-12 w-12 bg-white text-indigo-500 rounded-full shadow-xl shadow-indigo-500/10 flex items-center justify-center hover:scale-105 transition-transform">
                <TypeIcon size={22} strokeWidth={2} />
             </button>
        </div>

        <div className={`transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) delay-[50ms] flex items-center gap-4 ${isMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}>
             <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[13px] font-semibold py-1.5 px-3 rounded-xl shadow-lg border border-white/20">Scan Label</span>
             <button onClick={() => labelInputRef.current?.click()} disabled={isProcessing} className="h-12 w-12 bg-white text-slate-800 rounded-full shadow-xl shadow-slate-900/10 flex items-center justify-center hover:scale-105 transition-transform">
                <ScanBarcode size={22} strokeWidth={2} />
             </button>
        </div>

        <div className={`transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) delay-[100ms] flex items-center gap-4 ${isMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}>
             <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[13px] font-semibold py-1.5 px-3 rounded-xl shadow-lg border border-white/20">Photo Library</span>
             <button onClick={() => galleryInputRef.current?.click()} disabled={isProcessing} className="h-12 w-12 bg-white text-pink-500 rounded-full shadow-xl shadow-pink-500/10 flex items-center justify-center hover:scale-105 transition-transform">
                <ImageIcon size={22} strokeWidth={2} />
             </button>
        </div>

        <div className={`transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) delay-[150ms] flex items-center gap-4 ${isMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}>
             <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[13px] font-semibold py-1.5 px-3 rounded-xl shadow-lg border border-white/20">Take Photo</span>
             <button onClick={() => cameraInputRef.current?.click()} disabled={isProcessing} className="h-12 w-12 bg-white text-blue-500 rounded-full shadow-xl shadow-blue-500/10 flex items-center justify-center hover:scale-105 transition-transform">
                <Camera size={22} strokeWidth={2} />
             </button>
        </div>

        {/* Main FAB: Brand Gradient */}
        <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            disabled={isProcessing} 
            className={`h-16 w-16 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-full shadow-2xl shadow-indigo-500/30 flex items-center justify-center hover:scale-[1.05] active:scale-95 transition-all duration-300 z-50 ${isMenuOpen ? 'rotate-45' : 'rotate-0'}`}
        >
          {isProcessing ? <Loader2 className="animate-spin" size={28} /> : <Plus size={32} strokeWidth={2} />}
        </button>
      </div>
      
      {isMenuOpen && <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-30 transition-opacity duration-300" onClick={() => setIsMenuOpen(false)} />}

      {/* Main Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-50 flex items-end justify-center transition-opacity animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[32px] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-500 cubic-bezier(0.16, 1, 0.3, 1) max-h-[92vh] flex flex-col">
            
            {/* Sheet Handle */}
            <div className="w-full bg-white pt-3 pb-2 flex justify-center flex-shrink-0 cursor-pointer" onClick={resetAndClose}>
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>

            <div className="px-6 pb-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {inputMode === 'text' ? 'Log Food' : inputMode === 'label-scan' ? 'Scan Label' : 'New Entry'}
              </h3>
              <button onClick={resetAndClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                <X size={18} className="text-slate-600" strokeWidth={2.5} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto no-scrollbar">
              
              {/* Image Preview */}
              {(inputMode === 'food-photo' || inputMode === 'label-scan') && (
                <div className="aspect-square w-full bg-slate-50 rounded-[24px] overflow-hidden mb-6 relative group shadow-inner border border-slate-100">
                    {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />}
                    {!result && !isAnalyzing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { 
                                if(inputMode === 'label-scan') labelInputRef.current?.click();
                                else setIsMenuOpen(true); 
                            }} className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-transform">
                                <Upload size={16} /> Retake
                            </button>
                        </div>
                    )}
                </div>
              )}

              {/* Text Input */}
              {inputMode === 'text' && !result && (
                  <div className="mb-6">
                      <textarea 
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Describe your meal... (e.g. Avocado Toast)"
                        className="w-full p-5 rounded-[20px] bg-[#F2F2F7] border-none focus:ring-2 focus:ring-indigo-500/20 text-lg placeholder:text-slate-400 text-slate-900 resize-none font-medium transition-all"
                        rows={4}
                        autoFocus
                      />
                  </div>
              )}

              {/* Loading State */}
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="relative">
                      <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
                      <div className="relative bg-white p-4 rounded-full shadow-lg border border-indigo-50">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                      </div>
                  </div>
                  <p className="text-indigo-600 text-sm font-bold animate-pulse">
                    AI is analyzing your food...
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm text-center mb-6 font-medium">{error}</div>}

              {/* Result Editor */}
              {result && editedResult && (
                <div className="animate-in fade-in duration-300">
                    <MealTypeSelector />

                    {/* Header */}
                    <div className="flex justify-between items-start mb-6 gap-4">
                         <div className="flex-1">
                             <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Food Name</label>
                             <input
                                type="text"
                                value={editedResult.foodName}
                                onChange={(e) => setEditedResult({...editedResult, foodName: e.target.value})}
                                className="font-bold text-slate-900 text-2xl bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none w-full placeholder-slate-300 pb-1 transition-colors"
                                placeholder="Food name"
                             />
                         </div>
                         
                         <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block text-right">Calories</label>
                            <div className="bg-slate-900 text-white px-4 py-2 rounded-[14px] font-bold flex items-center shadow-lg shadow-slate-900/20">
                                <input
                                    type="number"
                                    value={editedResult.calories}
                                    onChange={(e) => setEditedResult({...editedResult, calories: Number(e.target.value)})}
                                    className="w-12 bg-transparent text-right outline-none appearance-none m-0 p-0 text-white font-bold text-lg"
                                />
                                <span className="ml-1 text-sm text-white/70">kcal</span>
                            </div>
                         </div>
                    </div>
                    
                    <div className="mb-6">
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Description</label>
                        <textarea
                            value={editedResult.description}
                            onChange={(e) => setEditedResult({...editedResult, description: e.target.value})}
                            rows={2}
                            className="text-slate-600 text-[15px] w-full bg-[#F2F2F7] rounded-xl p-3 border-none focus:ring-0 resize-none"
                        />
                    </div>

                    {/* Macros Grid */}
                    <div className="mb-6">
                        <span className="text-[11px] font-bold text-slate-900 mb-3 block">MACRONUTRIENTS</span>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            {renderMacroInput("Protein", "protein", "g")}
                            {renderMacroInput("Carbs", "carbs", "g")}
                            {renderMacroInput("Fat", "fat", "g")}
                        </div>
                    </div>

                    {/* Micros Grid */}
                    <div className="mb-6">
                        <span className="text-[11px] font-bold text-slate-900 mb-3 block">MICRONUTRIENTS</span>
                        <div className="grid grid-cols-3 gap-3 text-center">
                             <div className="bg-[#F2F2F7] rounded-xl p-3 border border-slate-200/50">
                                <div className="text-[10px] text-emerald-600 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                                    <Wheat size={10} /> Fiber
                                </div>
                                <div className="flex items-center justify-center">
                                    <input
                                        type="number"
                                        value={editedResult.fiber}
                                        onChange={(e) => setEditedResult({...editedResult, fiber: Number(e.target.value)})}
                                        className="text-slate-900 font-bold w-full text-center bg-transparent outline-none appearance-none p-0 text-lg"
                                    />
                                    <span className="text-slate-400 font-medium text-xs ml-0.5">g</span>
                                </div>
                            </div>

                            <div className="bg-[#F2F2F7] rounded-xl p-3 border border-slate-200/50">
                                <div className="text-[10px] text-amber-600 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                                    <Candy size={10} /> Sugar
                                </div>
                                <div className="flex items-center justify-center">
                                    <input
                                        type="number"
                                        value={editedResult.sugar}
                                        onChange={(e) => setEditedResult({...editedResult, sugar: Number(e.target.value)})}
                                        className="text-slate-900 font-bold w-full text-center bg-transparent outline-none appearance-none p-0 text-lg"
                                    />
                                    <span className="text-slate-400 font-medium text-xs ml-0.5">g</span>
                                </div>
                            </div>

                            <div className="bg-[#F2F2F7] rounded-xl p-3 border border-slate-200/50">
                                <div className="text-[10px] text-cyan-600 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                                    <Droplets size={10} /> Water
                                </div>
                                <div className="flex items-center justify-center">
                                    <input
                                        type="number"
                                        value={editedResult.water}
                                        onChange={(e) => setEditedResult({...editedResult, water: Number(e.target.value)})}
                                        className="text-slate-900 font-bold w-full text-center bg-transparent outline-none appearance-none p-0 text-lg"
                                    />
                                    <span className="text-slate-400 font-medium text-xs ml-0.5">ml</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              )}

              {/* Action Buttons: Gradient */}
              <div className="sticky bottom-0 bg-white pt-2 pb-6">
                {!result ? (
                    <button 
                        onClick={handleAnalyze} 
                        disabled={isAnalyzing || (inputMode === 'text' && !textInput.trim())}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg h-16 rounded-[22px] shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                    {isAnalyzing ? 'Processing...' : (
                        <>
                            {inputMode === 'text' && 'Analyze Text'}
                            {inputMode === 'label-scan' && 'Extract Data'}
                            {inputMode === 'food-photo' && 'Analyze Photo'}
                            {!inputMode && 'Select an option'}
                            <ArrowRight size={22} strokeWidth={2} />
                        </>
                    )}
                    </button>
                ) : (
                    <button onClick={handleSave} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-lg h-16 rounded-[22px] shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                    <Check size={22} strokeWidth={2.5} />
                    Save Entry
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddFoodButton;