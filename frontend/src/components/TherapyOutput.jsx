import React, { useState } from 'react';
import { Pill, Pulse, ShieldCheck, CaretDown, CaretUp, Warning, Prohibit, Info, Flask, Clock } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TherapyOutput({ therapyData }) {
  const [expandedDrug, setExpandedDrug] = useState(null);

  if (!therapyData) return null;

  return (
    <Card className="bg-green-50/50 border-green-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-green-800">
          <Pill className="w-5 h-5" />
          <CardTitle className="text-sm font-bold uppercase tracking-wider">Recommended Therapy</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Class and Confidence Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Class</span>
            <div className="text-lg font-bold text-green-900 mt-1">{therapyData.therapy_class}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Confidence</span>
            </div>
            <div className="text-sm font-bold capitalize text-slate-800">
              {therapyData.confidence}
            </div>
          </div>
        </div>

        {/* Recommended Drugs Accordion list */}
        <div>
          <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider block mb-2">Recommended Candidates (Click for Details)</span>
          <div className="space-y-2">
            {therapyData.drugs?.map((drug, i) => {
              const isExpanded = expandedDrug === drug;
              const details = therapyData.drug_details?.[drug] || 
                              therapyData.drug_details?.[drug.toLowerCase()] || 
                              therapyData.drug_details?.[drug.toUpperCase()];

              return (
                <div key={i} className="border border-green-100/80 rounded-lg overflow-hidden bg-white shadow-sm transition-all duration-300">
                  <button
                    onClick={() => setExpandedDrug(isExpanded ? null : drug)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-green-50/20 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="font-bold text-slate-800 text-sm">{drug}</span>
                    </div>
                    <div className="text-slate-400">
                      {isExpanded ? <CaretUp className="w-4 h-4" /> : <CaretDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Smooth height transition wrapper */}
                  <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 border-t border-slate-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                    <div className="overflow-hidden">
                      <div className="p-4 bg-slate-50/50 space-y-4 text-xs">
                        {details ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left Column */}
                            <div className="space-y-3">
                              <div>
                                <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[9px] mb-1">
                                  <Info className="w-3.5 h-3.5 text-blue-500" />
                                  <span>1. Class</span>
                                </div>
                                <p className="text-slate-800 leading-relaxed pl-5 font-medium">{details.class}</p>
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[9px] mb-1">
                                  <Pill className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>2. Mechanism</span>
                                </div>
                                <p className="text-slate-800 leading-relaxed pl-5 font-medium">{details.mechanism}</p>
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[9px] mb-1">
                                  <Warning className="w-3.5 h-3.5 text-amber-500" />
                                  <span>4. Cautions about the drug</span>
                                </div>
                                <p className="text-slate-800 leading-relaxed pl-5 font-medium">{details.cautions}</p>
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[9px] mb-1">
                                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>5. Dosage and administration</span>
                                </div>
                                <p className="text-slate-800 leading-relaxed pl-5 font-medium">{details.dosage}</p>
                              </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-3">
                              <div>
                                <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[9px] mb-1">
                                  <Pulse className="w-3.5 h-3.5 text-red-500" />
                                  <span>3. Adverse Effects</span>
                                </div>
                                <ul className="list-disc pl-9 text-slate-800 space-y-0.5 font-medium">
                                  {details.adverse_effects?.map((ae, idx) => (
                                    <li key={idx}>{ae}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[9px] mb-1">
                                  <Prohibit className="w-3.5 h-3.5 text-rose-500" />
                                  <span>6. Contraindications</span>
                                </div>
                                <p className="text-slate-800 leading-relaxed pl-5 font-medium">{details.contraindications}</p>
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[9px] mb-1">
                                  <Info className="w-3.5 h-3.5 text-violet-500" />
                                  <span>7. Drug Interactions</span>
                                </div>
                                <p className="text-slate-800 leading-relaxed pl-5 font-medium">{details.interactions}</p>
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[9px] mb-1">
                                  <Flask className="w-3.5 h-3.5 text-sky-500" />
                                  <span>8. Clinical Evidence</span>
                                </div>
                                <p className="text-slate-800 leading-relaxed pl-5 font-medium">{details.clinical_evidence}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic p-2 font-medium">No details available for this drug.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rationale */}
        <div className="pt-2">
          <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Rationale</span>
          <p className="text-green-900 mt-1 leading-relaxed text-sm">
            {therapyData.rationale}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
