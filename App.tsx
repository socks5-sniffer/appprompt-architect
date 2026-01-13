import React, { useState } from 'react';
import { AppStep, INITIAL_DATA, WizardData } from './types';
import { generateMasterPrompt } from './services/geminiService';
import { BasicsStep, TechStackStep, FeaturesStep, ConstraintsStep } from './components/WizardSteps';
import { Button, Card } from './components/common';

const STEP_LABELS = [
  "Basics",
  "Tech Stack",
  "Features",
  "Constraints",
  "Review",
  "Result"
];

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.BASICS);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const updateData = (updates: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = async () => {
    if (currentStep === AppStep.CONSTRAINTS) {
      setCurrentStep(AppStep.REVIEW);
    } else if (currentStep === AppStep.REVIEW) {
      // Generate Logic
      setIsGenerating(true);
      const result = await generateMasterPrompt(data);
      setGeneratedPrompt(result);
      setIsGenerating(false);
      setCurrentStep(AppStep.RESULT);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const renderContent = () => {
    switch(currentStep) {
      case AppStep.BASICS: return <BasicsStep data={data} updateData={updateData} />;
      case AppStep.TECH_STACK: return <TechStackStep data={data} updateData={updateData} />;
      case AppStep.FEATURES: return <FeaturesStep data={data} updateData={updateData} />;
      case AppStep.CONSTRAINTS: return <ConstraintsStep data={data} updateData={updateData} />;
      case AppStep.REVIEW:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-2xl font-bold text-white mb-2">Review Summary</h2>
             <div className="bg-dark-900 rounded-lg p-6 border border-dark-800 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">Name:</span> <span className="text-slate-200">{data.projectName}</span></div>
                  <div><span className="text-slate-500">Type:</span> <span className="text-slate-200">{data.projectType}</span></div>
                </div>
                <div className="border-t border-dark-800 pt-4">
                  <h4 className="text-primary-400 text-sm font-semibold mb-2">Stack</h4>
                  <p className="text-slate-300 text-sm">
                    {Object.values(data.techStack).filter(Boolean).map(v => Array.isArray(v) ? v.join(', ') : v).join(' • ')}
                  </p>
                </div>
                <div className="border-t border-dark-800 pt-4">
                  <h4 className="text-primary-400 text-sm font-semibold mb-2">Features ({data.coreFeatures.length})</h4>
                  <ul className="list-disc list-inside text-slate-300 text-sm">
                    {data.coreFeatures.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
             </div>
          </div>
        );
      case AppStep.RESULT:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Master Prompt</h2>
              <Button 
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(generatedPrompt);
                  alert("Copied to clipboard!");
                }}
              >
                Copy to Clipboard
              </Button>
            </div>
            <div className="bg-dark-900 rounded-lg p-6 border border-dark-800 font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-300 overflow-x-auto max-h-[60vh] overflow-y-auto">
              {generatedPrompt}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar Progress */}
      <div className="w-64 border-r border-dark-800 bg-dark-900/50 p-8 hidden md:block">
        <div className="mb-10">
          <div className="flex items-center gap-3 text-primary-500 mb-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="font-bold text-xl tracking-tight text-slate-100">PromptArchitect</span>
          </div>
          <p className="text-xs text-slate-500">AI-Assisted Spec Generator</p>
        </div>

        <div className="space-y-1">
          {STEP_LABELS.map((label, idx) => {
             const isActive = idx === currentStep;
             const isPast = idx < currentStep;
             return (
               <div key={label} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-primary-900/20 text-primary-400' : isPast ? 'text-slate-400' : 'text-slate-600'}`}>
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border ${isActive ? 'border-primary-500 text-primary-500' : isPast ? 'border-slate-600 text-slate-600 bg-slate-800/50' : 'border-slate-800 text-slate-700'}`}>
                   {isPast ? '✓' : idx + 1}
                 </div>
                 <span className="text-sm font-medium">{label}</span>
               </div>
             )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-dark-800 flex items-center px-8 justify-between md:hidden">
           <span className="font-bold text-slate-200">PromptArchitect</span>
           <span className="text-xs text-slate-500">Step {currentStep + 1} of {STEP_LABELS.length}</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-3xl mx-auto">
            {renderContent()}
          </div>
        </main>

        <footer className="h-20 border-t border-dark-800 bg-dark-900/30 px-6 md:px-12 flex items-center justify-between">
           <Button 
             variant="ghost" 
             onClick={prevStep} 
             disabled={currentStep === 0 || currentStep === AppStep.RESULT}
           >
             Back
           </Button>

           {currentStep !== AppStep.RESULT && (
             <Button 
               onClick={nextStep}
               disabled={isGenerating}
               className={isGenerating ? "animate-pulse" : ""}
             >
               {currentStep === AppStep.REVIEW 
                 ? (isGenerating ? "Architecting..." : "Generate Master Prompt") 
                 : "Continue"}
             </Button>
           )}
           
           {currentStep === AppStep.RESULT && (
              <Button onClick={() => window.location.reload()}>Start New Project</Button>
           )}
        </footer>
      </div>
    </div>
  );
}

export default App;