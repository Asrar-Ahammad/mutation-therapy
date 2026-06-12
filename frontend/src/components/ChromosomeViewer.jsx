import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Dna } from '@phosphor-icons/react';

export default function ChromosomeViewer({ mapLocation, genomicPos, gene }) {
  if (!mapLocation && !genomicPos?.chr) return null;

  const cytoband = mapLocation || "";
  const chr = genomicPos?.chr || (cytoband.match(/^([0-9XY]+)/)?.[1] || "Unknown");
  
  // Parse band arm and value
  const armMatch = cytoband.match(/[0-9XY]+([pq])([0-9.]+)/);
  const arm = armMatch?.[1] || "";
  const bandValStr = armMatch?.[2] || "";
  const bandVal = parseFloat(bandValStr) || 10;

  // Visual layout configurations:
  // SVGs are drawn on a coordinate system of width 120, height 300
  // Centromere divider is at Y = 110
  // p-arm capsule: Y = 20 to 100
  // q-arm capsule: Y = 120 to 270
  let markerY = 110; 
  if (arm === 'p') {
    // bandVal ranges roughly from 10 to 36
    const factor = Math.min(1, Math.max(0, (bandVal - 10) / 26));
    // p10 is close to centromere (Y = 100), p36 is close to telomere (Y = 30)
    markerY = 100 - (factor * 70); 
  } else if (arm === 'q') {
    // bandVal ranges roughly from 10 to 45
    const factor = Math.min(1, Math.max(0, (bandVal - 10) / 35));
    // q10 is close to centromere (Y = 120), q45 is close to telomere (Y = 250)
    markerY = 120 + (factor * 130);
  } else {
    // fallback if no arm is parsed
    markerY = 140;
  }

  // Format positions with commas
  const formatPos = (val) => {
    if (!val) return "Unknown";
    return Number(val).toLocaleString();
  };

  return (
    <Card className="flex flex-col h-full min-h-[350px]">
      <CardHeader className="pb-3 border-b border-slate-100 bg-white z-10 shrink-0">
        <div className="flex items-center gap-2 text-indigo-700">
          <Dna className="w-5 h-5 animate-pulse" />
          <CardTitle className="text-sm font-bold uppercase tracking-wider">Chromosome Karyotype</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 flex flex-col md:flex-row items-center gap-6 select-none bg-slate-50/20">
        {/* SVG Chromosome Graphic */}
        <div className="w-32 h-[260px] flex-shrink-0 relative flex justify-center">
          <svg className="w-full h-full" viewBox="0 0 120 300">
            {/* Definitions for gradients and drop shadows */}
            <defs>
              <linearGradient id="chrom-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="30%" stopColor="#f8fafc" />
                <stop offset="70%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* Chromosome p-arm capsule */}
            <g filter="url(#shadow)">
              <rect x="35" y="20" width="20" height="80" rx="10" fill="url(#chrom-gradient)" />
              {/* Bands on p-arm */}
              <rect x="35" y="30" width="20" height="8" fill="#475569" opacity="0.45" />
              <rect x="35" y="50" width="20" height="12" fill="#1e293b" opacity="0.65" />
              <rect x="35" y="75" width="20" height="6" fill="#475569" opacity="0.45" />
            </g>

            {/* Centromere divider (constriction) */}
            <circle cx="45" cy="105" r="7" fill="#64748b" opacity="0.9" />

            {/* Chromosome q-arm capsule */}
            <g filter="url(#shadow)">
              <rect x="35" y="110" width="20" height="160" rx="10" fill="url(#chrom-gradient)" />
              {/* Bands on q-arm */}
              <rect x="35" y="125" width="20" height="14" fill="#1e293b" opacity="0.65" />
              <rect x="35" y="150" width="20" height="8" fill="#475569" opacity="0.4" />
              <rect x="35" y="170" width="20" height="20" fill="#1e293b" opacity="0.7" />
              <rect x="35" y="205" width="20" height="10" fill="#475569" opacity="0.4" />
              <rect x="35" y="230" width="20" height="15" fill="#1e293b" opacity="0.55" />
            </g>

            {/* Telomeres */}
            <rect x="35" y="20" width="20" height="4" rx="2" fill="#94a3b8" />
            <rect x="35" y="266" width="20" height="4" rx="2" fill="#94a3b8" />

            {/* Marker pointer to cytological location */}
            <g>
              {/* Pointer line */}
              <line 
                x1="45" 
                y1={markerY} 
                x2="85" 
                y2={markerY} 
                stroke="#ef4444" 
                strokeWidth="1.5" 
                strokeDasharray="2,2" 
              />
              <line 
                x1="85" 
                y1={markerY} 
                x2="95" 
                y2={markerY} 
                stroke="#ef4444" 
                strokeWidth="1.5" 
              />
              
              {/* Pulsing indicator target dot */}
              <circle cx="45" cy={markerY} r="6" fill="#ef4444" opacity="0.4">
                <animate 
                  attributeName="r" 
                  values="4;9;4" 
                  dur="2s" 
                  repeatCount="indefinite" 
                />
                <animate 
                  attributeName="opacity" 
                  values="0.8;0.2;0.8" 
                  dur="2s" 
                  repeatCount="indefinite" 
                />
              </circle>
              <circle cx="45" cy={markerY} r="3" fill="#ef4444" />
            </g>
          </svg>
        </div>

        {/* Details and Description */}
        <div className="flex-1 space-y-4">
          <div>
            <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider block">Target Gene Location</span>
            <div className="text-2xl font-black text-slate-800 flex items-baseline gap-2 mt-0.5">
              <span>{gene}</span>
              <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100 font-mono">
                {cytoband || "Chr " + chr}
              </span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm space-y-3 text-xs">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-slate-700">Cytogenetic Mapping:</span>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Located on chromosome {chr}, {arm === 'p' ? 'short arm (p)' : arm === 'q' ? 'long arm (q)' : 'position'} at band {bandValStr}.
                </p>
              </div>
            </div>

            {genomicPos?.start && (
              <div className="flex items-start gap-2 pt-2 border-t border-slate-50">
                <Dna className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-700">Genomic Coordinates:</span>
                  <div className="text-slate-500 mt-0.5 font-mono text-[10px] space-y-0.5">
                    <div>Chr {chr}: {formatPos(genomicPos.start)} - {formatPos(genomicPos.end)}</div>
                    <div className="text-slate-400">Strand: {genomicPos.strand === 1 ? '+' : genomicPos.strand === -1 ? '-' : 'Unknown'} (GRCh37)</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-slate-400 text-[10px] leading-relaxed italic">
            *This ideogram represents the relative location of the locus mapped from genomic lookup coordinates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
