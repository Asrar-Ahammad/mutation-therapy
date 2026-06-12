import React from 'react';
import { X } from '@phosphor-icons/react';
import PathwayDiagram from "./PathwayDiagram";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NodeDetail({ node, gene, onClose }) {
  if (!node) return null;

  return (
    <Card className="h-full max-h-[700px] flex flex-col overflow-hidden relative border-slate-200">
      <CardHeader className="border-b border-slate-100 pb-4 bg-white flex flex-row items-center justify-between shadow-sm shrink-0">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-slate-800">{node.label}</CardTitle>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step {node.step}</div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 -mt-2 -mr-2 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>

      <div className="flex-1 overflow-y-auto">
        <CardContent className="pt-6 space-y-4">
        {Object.entries(node.data).map(([key, value]) => {
          if ((key === 'papers' || key === 'drugs' || key === 'trials') && Array.isArray(value)) {
             return (
               <div key={key}>
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{key.replace(/_/g, ' ')}</h3>
                 <ul className="list-disc list-inside space-y-2">
                   {value.length > 0 ? (
                     value.map((v, i) => (
                       <li key={i} className="text-slate-700 text-sm">
                         {typeof v === 'object' && v.title && v.nct_id ? (
                           <div className="inline-block align-top">
                             <a href={v.url} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline font-medium">
                               {v.title}
                             </a>
                             <div className="text-xs text-slate-500 ml-4 mt-1">
                               <span className="font-semibold">{v.nct_id}</span> • Phase: {v.phase}
                             </div>
                           </div>
                         ) : typeof v === 'object' && v.title ? (
                           <a href={v.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{v.title}</a>
                         ) : typeof v === 'object' && v.name ? (
                           <span><span className="font-medium">{v.name}</span> ({v.mechanism})</span>
                         ) : v}
                       </li>
                     ))
                   ) : (
                     <li className="text-slate-400 text-sm list-none">No data available</li>
                   )}
                 </ul>
               </div>
             )
          }

          if (Array.isArray(value)) {
            return (
              <div key={key}>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</h3>
                <p className="text-slate-800 text-sm">{value.join(', ')}</p>
              </div>
            );
          }

          if (key === 'gene_function') {
            const sentences = String(value).split('. ').filter(s => s.trim().length > 0);
            return (
              <div key={key}>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{key.replace(/_/g, ' ')}</h3>
                <div className="flex flex-col items-center space-y-2">
                  {sentences.map((sentence, i) => (
                    <React.Fragment key={i}>
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm text-slate-700 text-center w-full shadow-sm">
                        {sentence.trim() + (sentence.trim().endsWith('.') ? '' : '.')}
                      </div>
                      {i < sentences.length - 1 && (
                        <div className="text-slate-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          }

          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return (
              <div key={key}>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</h3>
                <div className="bg-slate-50 p-2 rounded text-sm text-slate-700 font-mono text-xs overflow-x-auto">
                  {JSON.stringify(value, null, 2)}
                </div>
              </div>
            );
          }

          return (
            <div key={key}>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</h3>
              <p className="text-slate-800 text-sm leading-relaxed">{String(value)}</p>
            </div>
          );
        })}

        {node.step === 1 && node.data.input_mode && node.data.input_mode !== "hgvs" && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg shadow-inner">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-wide mb-2">
                Natural Language Parsed
              </p>
              <p className="text-slate-400 text-sm mb-1">
                Original: <span className="text-slate-200 italic">"{node.data.original_input}"</span>
              </p>
              <p className="text-slate-400 text-sm mb-2">
                Interpreted as:{" "}
                <span className="text-green-400 font-semibold">{node.data.notation}</span>
              </p>
              <p className="text-slate-500 text-xs">
                Extraction confidence:{" "}
                <span className={
                  node.data.extraction_confidence === "high"   ? "text-green-500" :
                  node.data.extraction_confidence === "medium" ? "text-yellow-500" :
                                                                 "text-red-500"
                }>
                  {node.data.extraction_confidence}
                </span>
              </p>
            </div>
          </div>
        )}

        {node.step === 3 && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pathway Visualization</h3>
            <PathwayDiagram
              gene={gene}
              effect_type={node.data.effect_type}
            />
          </div>
        )}

        {node.step === '4b' && (
          <div className="mt-6 border-t border-red-100 pt-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg shadow-inner">
              <p className="text-red-600 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
                ⚠️ Skeptic Review Warning
              </p>
              <p className="text-red-800 text-sm">
                The tumor board skeptic has raised concerns about this therapy. The consensus will review these points.
              </p>
            </div>
          </div>
        )}
        </CardContent>
      </div>
    </Card>
  );
}
