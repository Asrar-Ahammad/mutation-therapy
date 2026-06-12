import React from 'react';
import { BookOpen, ArrowUpRight } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EvidencePanel({ evidenceData }) {
  if (!evidenceData || !evidenceData.papers || evidenceData.papers.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2 text-slate-800">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-sm font-bold uppercase tracking-wider">Supporting Evidence</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {evidenceData.papers.map((paper, i) => (
            <a
              key={i}
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm font-medium text-slate-800 leading-snug group-hover:text-blue-700">
                  {paper.title}
                </h3>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0" />
              </div>
              <div className="mt-2 text-xs text-slate-500">
                PMID: {paper.pmid}
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
