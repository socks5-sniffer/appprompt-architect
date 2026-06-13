import React, { useState } from 'react';
import { WizardData, ProjectType, TechStack, AIProvider } from '../types';
import { POPULAR_STACKS, SECURITY_CHECKLIST, COMMON_FEATURES, TECH_FIELD_SUGGESTIONS, SPRING_BOOT_SECURITY_REQS, POSTGRES_RLS_REQS, IAP_VALIDATION_REQS, FIREBASE_SECURITY_REQS } from '../constants';
import { Label, Input, TextArea, Button, Card } from './common';
import { suggestTechStack } from '../services/aiService';

export interface StepErrors {
  projectName?: string;
  projectDescription?: string;
  frontend?: string;
  coreFeatures?: string;
}

interface StepProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
  errors?: StepErrors;
  provider: AIProvider;
}

export const BasicsStep: React.FC<StepProps> = ({ data, updateData, errors = {} as StepErrors }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Project Basics</h2>
      <p className="text-slate-400">Let's start with the high-level vision.</p>
    </div>
    <div className="grid gap-6">
      <div>
        <Label>Project Name <span className="text-red-400">*</span></Label>
        <Input value={data.projectName} onChange={(e) => updateData({ projectName: e.target.value })} placeholder="e.g. PromptArchitect" error={errors.projectName} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Project Type</Label>
          <select value={data.projectType} onChange={(e) => updateData({ projectType: e.target.value as ProjectType })}
            className="w-full bg-dark-900 border border-dark-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
            {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <Label>Target Audience</Label>
          <Input value={data.targetAudience} onChange={(e) => updateData({ targetAudience: e.target.value })} placeholder="e.g. Developers, Students, Enterprise" />
        </div>
      </div>
      <div>
        <Label>Project Description <span className="text-red-400">*</span></Label>
        <TextArea value={data.projectDescription} onChange={(e) => updateData({ projectDescription: e.target.value })}
          placeholder="Describe what you want to build in 2-3 sentences..." className="h-32" error={errors.projectDescription} />
      </div>
    </div>
  </div>
);

export const TechStackStep: React.FC<StepProps> = ({ data, updateData, errors = {} as StepErrors, provider }) => {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState('');

  const applyPreset = (preset: any) => {
    updateData({ techStack: { frontend: preset.frontend, backend: preset.backend, database: preset.database, styling: preset.styling, deployment: preset.deployment, tools: preset.tools } });
  };

  const handleAiSuggest = async () => {
    setSuggestError('');
    if (!data.projectName && !data.projectDescription) { setSuggestError('Please fill in project name and description first.'); return; }
    setIsSuggesting(true);
    const suggestion = await suggestTechStack(data.projectName, data.projectDescription, data.projectType, provider);
    setIsSuggesting(false);
    if (suggestion) { updateData({ techStack: suggestion }); }
    else { setSuggestError('Could not generate a suggestion. Check that the server is running and your API key is configured.'); }
  };

  const updateStack = (field: keyof TechStack, value: string) => updateData({ techStack: { ...data.techStack, [field]: value } });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Technology Stack</h2>
          <p className="text-slate-400">Choose a proven stack, let AI decide, or customize your own.</p>
        </div>
        <Button variant="secondary" onClick={handleAiSuggest} disabled={isSuggesting} className="shrink-0">
          {isSuggesting ? 'Thinking...' : 'AI Suggest Best Stack'}
        </Button>
      </div>
      {suggestError && <div className="bg-red-900/20 border border-red-500/40 text-red-300 text-sm rounded-lg px-4 py-3">{suggestError}</div>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(POPULAR_STACKS).map(([key, stack]) => (
          <Card key={key} onClick={() => applyPreset(stack)} className="relative group">
            <h3 className="font-bold text-white mb-1 group-hover:text-primary-400 transition-colors text-sm">{stack.name}</h3>
            <p className="text-[10px] text-slate-500 line-clamp-2">{stack.frontend} - {stack.database}</p>
          </Card>
        ))}
      </div>
      <div className="h-px bg-dark-800 my-6" />
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { label: 'Frontend', field: 'frontend', placeholder: 'e.g. React, Vue', required: true },
          { label: 'Backend', field: 'backend', placeholder: 'e.g. Node.js, Python' },
          { label: 'Database', field: 'database', placeholder: 'e.g. PostgreSQL, MongoDB' },
          { label: 'Styling', field: 'styling', placeholder: 'e.g. Tailwind, CSS Modules' },
          { label: 'Deployment', field: 'deployment', placeholder: 'e.g. Vercel, Docker' },
        ].map((item) => (
          <div key={item.field}>
            <Label>{item.label}{item.required && <span className="text-red-400"> *</span>}</Label>
            <Input value={(data.techStack as any)[item.field]} onChange={(e) => updateStack(item.field as keyof TechStack, e.target.value)}
              placeholder={item.placeholder} list={`list-${item.field}`} error={item.field === 'frontend' ? errors.frontend : undefined} />
            <datalist id={`list-${item.field}`}>
              {(TECH_FIELD_SUGGESTIONS[item.field as keyof typeof TECH_FIELD_SUGGESTIONS] || []).map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FeaturesStep: React.FC<StepProps> = ({ data, updateData, errors = {} as StepErrors }) => {
  const [newFeature, setNewFeature] = React.useState('');
  const addFeature = (feat: string) => { if (!feat.trim() || data.coreFeatures.includes(feat.trim())) return; updateData({ coreFeatures: [...data.coreFeatures, feat.trim()] }); setNewFeature(''); };
  const removeFeature = (idx: number) => updateData({ coreFeatures: data.coreFeatures.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Core Features</h2>
        <p className="text-slate-400">List the must-have capabilities of your application.</p>
      </div>
      <div className="flex gap-2">
        <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addFeature(newFeature)} placeholder="e.g. User Authentication via Google" />
        <Button onClick={() => addFeature(newFeature)}>Add</Button>
      </div>
      {errors.coreFeatures && <p className="text-xs text-red-400">{errors.coreFeatures}</p>}
      <div className="space-y-2">
        <Label>Popular Suggestions (Click to add)</Label>
        <div className="flex flex-wrap gap-2">
          {COMMON_FEATURES.map(feat => {
            if (data.coreFeatures.includes(feat)) return null;
            return <button key={feat} onClick={() => addFeature(feat)} className="text-xs bg-dark-900 border border-dark-800 hover:border-primary-500 hover:text-primary-400 text-slate-400 px-3 py-1.5 rounded-full transition-colors">+ {feat}</button>;
          })}
        </div>
      </div>
      <div className="grid gap-2 mt-4">
        {data.coreFeatures.length === 0 && (
          <div className={`text-center py-10 border border-dashed rounded-lg text-slate-600 ${errors.coreFeatures ? 'border-red-500/40' : 'border-dark-800'}`}>No features added yet. Add at least one to continue.</div>
        )}
        {data.coreFeatures.map((feat, idx) => (
          <div key={idx} className="flex items-center justify-between bg-dark-900 border border-dark-800 p-3 rounded-lg group">
            <span className="text-slate-200">{feat}</span>
            <button onClick={() => removeFeature(idx)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-2" aria-label={`Remove ${feat}`}>x</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ConstraintsStep: React.FC<StepProps> = ({ data, updateData }) => {
  const toggleSecurity = (item: string) => {
    const current = data.securityReqs.split(', ').filter(Boolean);
    updateData({ securityReqs: current.includes(item) ? current.filter(i => i !== item).join(', ') : [...current, item].join(', ') });
  };
  const toggleAllSecurity = () => {
    const current = data.securityReqs.split(', ').filter(Boolean);
    updateData({ securityReqs: current.length === SECURITY_CHECKLIST.length ? '' : SECURITY_CHECKLIST.join(', ') });
  };
  const areAllSelected = data.securityReqs.split(', ').filter(Boolean).length === SECURITY_CHECKLIST.length;
  const isSpringBoot = data.techStack.backend.toLowerCase().includes('spring') || data.techStack.backend.toLowerCase().includes('java');
  const isPostgres = data.techStack.database.toLowerCase().includes('postgres') || data.techStack.database.toLowerCase().includes('supabase');
  const isFirebase = data.techStack.database.toLowerCase().includes('firebase') || data.techStack.database.toLowerCase().includes('firestore');
  const isGameOrMobile = data.projectType === ProjectType.GAME || data.projectType === ProjectType.MOBILE_APP;
  const appendSpecifics = (text: string) => {
    if (data.securitySpecifics.includes(text.substring(0, 50))) return;
    updateData({ securitySpecifics: data.securitySpecifics ? `${data.securitySpecifics}\n\n${text}` : text });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Requirements & Constraints</h2>
        <p className="text-slate-400">Define the non-functional requirements.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Security Checklist</Label>
              <button onClick={toggleAllSecurity} className="text-xs text-primary-500 hover:text-primary-400 font-medium">{areAllSelected ? 'Deselect All' : 'Select All'}</button>
            </div>
            <div className="grid gap-2">
              {SECURITY_CHECKLIST.map(item => {
                const isActive = data.securityReqs.includes(item);
                return (
                  <div key={item} onClick={() => toggleSecurity(item)} role="checkbox" aria-checked={isActive} tabIndex={0} onKeyDown={(e) => e.key === ' ' && toggleSecurity(item)}
                    className={`cursor-pointer px-4 py-3 rounded-lg border text-sm transition-all flex items-center gap-3 ${isActive ? 'bg-primary-900/20 border-primary-500/50 text-primary-200' : 'bg-dark-900 border-dark-800 text-slate-400 hover:border-dark-700'}`}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isActive ? 'bg-primary-500 border-primary-500' : 'border-slate-600'}`}>
                      {isActive && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    {item}
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <Label className="mb-0">Custom Security Requirements</Label>
              <div className="flex gap-2 flex-wrap">
                {isSpringBoot && <button onClick={() => appendSpecifics(SPRING_BOOT_SECURITY_REQS)} className="text-xs text-green-400 hover:text-green-300 border border-green-900/50 bg-green-900/10 px-2 py-1 rounded">+ Spring Boot</button>}
                {isPostgres && <button onClick={() => appendSpecifics(POSTGRES_RLS_REQS)} className="text-xs text-blue-400 hover:text-blue-300 border border-blue-900/50 bg-blue-900/10 px-2 py-1 rounded">+ Postgres RLS</button>}
                {isFirebase && <button onClick={() => appendSpecifics(FIREBASE_SECURITY_REQS)} className="text-xs text-orange-400 hover:text-orange-300 border border-orange-900/50 bg-orange-900/10 px-2 py-1 rounded">+ Firebase Rules</button>}
                {isGameOrMobile && <button onClick={() => appendSpecifics(IAP_VALIDATION_REQS)} className="text-xs text-purple-400 hover:text-purple-300 border border-purple-900/50 bg-purple-900/10 px-2 py-1 rounded">+ IAP Validation</button>}
              </div>
            </div>
            <TextArea value={data.securitySpecifics} onChange={(e) => updateData({ securitySpecifics: e.target.value })} placeholder="Specific auth flows, encryption standards, or compliance rules..." className="min-h-[120px]" />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <Label>Design Preferences</Label>
            <TextArea value={data.designPreferences} onChange={(e) => updateData({ designPreferences: e.target.value })} placeholder="e.g. Minimalist, Dark Mode, Material Design, Apple-like..." className="h-32" />
          </div>
          <div>
            <Label>Performance Requirements</Label>
            <TextArea value={data.performanceReqs} onChange={(e) => updateData({ performanceReqs: e.target.value })} placeholder="e.g. <1s load time, SEO optimized, Offline support..." className="h-32" />
          </div>
        </div>
      </div>
    </div>
  );
};
