import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, ChevronLeft, Info, Search, Save, CheckCircle2, MoreVertical, Edit2, Plus, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Card, Progress } from './UIComponents';
import { FoodItem, Meal } from '../types';
import { analyzeFoodImage } from '../services/geminiService';
import { cn } from '../lib/utils';

interface AnalysisFlowProps {
  onCancel: () => void;
  onSave: (meal: Meal) => void;
}

export default function AnalysisFlow({ onCancel, onSave }: AnalysisFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [image, setImage] = useState<string | null>(null);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mealType, setMealType] = useState<Meal['type']>('Lunch');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false 
  } as any);

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const results = await analyzeFoodImage(image);
      setItems(results);
      setStep(2);
    } catch (error) {
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveMeal = () => {
    const totalCals = items.reduce((sum, i) => sum + i.calories, 0);
    const newMeal: Meal = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type: mealType,
      items,
      totalCalories: totalCals,
      imageUrl: image || undefined
    };
    onSave(newMeal);
    setStep(3);
  };

  const totalCals = items.reduce((sum, item) => sum + item.calories, 0);
  const totalMacros = items.reduce((acc, item) => ({
    protein: acc.protein + item.protein,
    carbs: acc.carbs + item.carbs,
    fats: acc.fats + item.fats,
  }), { protein: 0, carbs: 0, fats: 0 });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <button onClick={onCancel} className="flex items-center gap-3 text-slate-400 font-bold hover:text-slate-900 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-slate-50 shadow-sm">
                <ChevronLeft size={20} />
            </div>
            Back
          </button>
          
          <div className="flex items-center gap-12 bg-white px-8 py-3 rounded-full border border-slate-100 shadow-sm">
            <StepIndicator number={1} label="Upload" active={step === 1} completed={step > 1} />
            <StepIndicator number={2} label="Analyze" active={step === 2} completed={step > 2} />
            <StepIndicator number={3} label="Finish" active={step === 3} />
          </div>
          
          <div className="w-24" /> {/* Spacer */}
        </header>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-12"
            >
              <div 
                {...getRootProps()} 
                className={cn(
                  "bg-white rounded-[48px] border-4 border-dashed p-5 aspect-square flex flex-col items-center justify-center relative overflow-hidden transition-all cursor-pointer group",
                  isDragActive ? "border-emerald-400 bg-emerald-50" : "border-slate-100",
                  image ? "border-solid" : ""
                )}
              >
                <input {...getInputProps()} />
                {image ? (
                  <img src={image} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="Preview" />
                ) : (
                  <div className="text-center p-12">
                    <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center text-emerald-600 mx-auto mb-8 shadow-sm group-hover:scale-110 transition-transform">
                      <Camera size={48} />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Capture or Upload</h3>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest max-w-[240px] mx-auto opacity-70">Click to open camera or drag food photos here.</p>
                  </div>
                )}
                {image && (
                   <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <Button variant="secondary" className="px-8 py-3 bg-white text-slate-900">Change Photo</Button>
                   </div>
                )}
              </div>

              <div className="flex flex-col justify-between py-6">
                <div>
                   <h2 className="text-4xl font-bold text-slate-900 mb-10 tracking-tight">Tips for best results</h2>
                   <div className="space-y-8">
                      <Tip icon="💡" label="Use natural lighting" desc="Make sure the food is well-lit for better detection." />
                      <Tip icon="📸" label="Take photo from above" desc="Top-down view helps our AI estimate portion sizes." />
                      <Tip icon="🚫" label="Avoid blurry images" desc="Sharp focus ensures accurate recognition of ingredients." />
                      <Tip icon="🍽️" label="Include all items in plate" desc="Try to keep items separate on the plate if possible." />
                   </div>
                </div>
                
                <div className="flex gap-4 mt-12">
                   <Button onClick={() => setImage(null)} variant="outline" className="flex-1 py-4 text-lg bg-white rounded-2xl border-2">Retake Photo</Button>
                   <Button disabled={!image || isAnalyzing} onClick={handleAnalyze} className="flex-1 py-4 text-lg flex items-center justify-center gap-3 rounded-2xl">
                     {isAnalyzing ? "Processing..." : (
                       <>Analyze Meal <Zap size={20} className="fill-current" /></>
                     )}
                   </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid lg:grid-cols-2 gap-12"
            >
              <Card className="rounded-[48px] relative h-full overflow-hidden border-4 border-white shadow-2xl">
                <img src={image!} className="w-full h-full object-cover" alt="Meal" />
                {/* Visual indicator overlay */}
                {items.map((item, i) => (
                  <div 
                    key={item.id} 
                    className="absolute bg-emerald-500 text-white w-11 h-11 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-xl animate-pulse"
                    style={{ 
                      top: `${20 + i * 15}%`, 
                      left: `${30 + i * 10}%` 
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
              </Card>

              <div className="flex flex-col h-full py-2">
                <div className="flex-1 space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Detection Result</h2>
                    <button className="text-emerald-600 font-bold hover:underline tracking-tight">Refine All</button>
                  </div>
                  
                  <div className="space-y-4">
                    {items.map((item, i) => (
                      <AnalysisItem key={item.id} index={i+1} item={item} />
                    ))}
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <div className="flex items-end justify-between mb-8">
                      <div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">Estimated Total</p>
                        <p className="text-5xl font-extrabold text-emerald-600 tracking-tighter">{totalCals} <span className="text-2xl font-bold text-slate-300">kcal</span></p>
                      </div>
                      <div className="flex gap-8">
                        <MacroMini label="Protein" value={totalMacros.protein} color="text-emerald-600" />
                        <MacroMini label="Carbs" value={totalMacros.carbs} color="text-blue-500" />
                        <MacroMini label="Fats" value={totalMacros.fats} color="text-orange-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10">
                   <div className="flex gap-3 mb-5">
                     {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
                       <button
                         key={type}
                         onClick={() => setMealType(type as any)}
                         className={cn(
                           "flex-1 py-3.5 font-bold rounded-2xl transition-all border-2 text-sm",
                           mealType === type ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-700/5" : "border-slate-50 bg-white text-slate-400 hover:bg-slate-50 hover:border-slate-200"
                         )}
                       >
                         {type}
                       </button>
                     ))}
                   </div>
                   <Button onClick={handleSaveMeal} className="w-full py-5 text-xl flex items-center justify-center gap-3 rounded-[24px]">
                     <Save size={24} /> Log this meal
                   </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto flex flex-col items-center py-20 text-center"
            >
              <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-10 shadow-inner">
                 <CheckCircle2 size={72} className="fill-current bg-white rounded-full p-2" />
              </div>
              <h2 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Successfully Logged!</h2>
              <p className="text-slate-500 text-xl mb-16 font-medium leading-relaxed">
                Your <span className="text-emerald-600 font-bold">{mealType}</span> has been tracked. <br />You're staying on top of your goals!
              </p>
              
              <div className="grid grid-cols-2 gap-6 w-full">
                <Button onClick={onCancel} className="w-full py-5 bg-emerald-600 text-xl rounded-2xl">Go to Dashboard</Button>
                <Button onClick={() => { setStep(1); setImage(null); setItems([]); }} variant="outline" className="w-full py-5 text-xl bg-white border-2 border-slate-200 rounded-2xl">Log Another</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepIndicator({ number, label, active = false, completed = false }: { number: number; label: string; active?: boolean; completed?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all shadow-sm",
        active ? "bg-emerald-600 text-white scale-110 shadow-emerald-200" : completed ? "bg-emerald-100 text-emerald-600" : "bg-slate-50 text-slate-300"
      )}>
        {completed ? <CheckCircle2 size={18} /> : number}
      </div>
      <span className={cn("font-bold text-xs uppercase tracking-widest", active ? "text-slate-900" : "text-slate-400")}>{label}</span>
    </div>
  );
}

function Tip({ icon, label, desc }: { icon: string; label: string; desc: string }) {
  return (
    <div className="flex items-center gap-5 group">
      <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-all group-hover:shadow-emerald-100 group-hover:border-emerald-100">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1">{label}</h4>
        <p className="text-sm text-slate-400 font-semibold leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function AnalysisItem({ index, item }: { index: number; item: FoodItem; key?: React.Key }) {
  return (
    <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[32px] group hover:border-emerald-200 hover:bg-emerald-50/20 transition-all shadow-sm">
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-extrabold border-2 border-emerald-100 shadow-sm">
           {index}
        </div>
        <div>
           <h4 className="font-bold text-slate-800 text-lg leading-tight">{item.name}</h4>
           <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.1em]">{item.portion}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className="font-extrabold text-slate-900 text-lg">{item.calories} <span className="text-slate-300 font-bold text-sm">kcal</span></span>
        <button className="p-2.5 bg-slate-50 rounded-xl text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
           <Edit2 size={18} />
        </button>
      </div>
    </div>
  );
}

function MacroMini({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
      <p className={cn("font-extrabold text-lg", color)}>{value}g</p>
    </div>
  );
}
