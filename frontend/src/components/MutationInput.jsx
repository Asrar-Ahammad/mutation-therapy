import React, { useState } from 'react';
import { MagnifyingGlass, Spinner } from '@phosphor-icons/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEMO_CASES = [
  { label: "BRCA1 Frameshift (HGVS)",     mutation: "BRCA1 c.5266dupC" },
  { label: "EGFR Activating (HGVS)",      mutation: "EGFR p.L858R"     },
  { label: "TP53 Missense (HGVS)",        mutation: "TP53 p.R175H"     },
  { label: "BRCA1 (Natural Language)",    mutation: "My patient has a BRCA1 mutation causing early protein truncation" },
  { label: "EGFR (Natural Language)",     mutation: "EGFR activating mutation commonly seen in lung cancer"            },
  { label: "TP53 (Partial)",              mutation: "TP53 missense"                                                     }
];

export default function MutationInput({ onAnalyze, loading }) {
  const [mutation, setMutation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mutation.trim()) {
      onAnalyze(mutation);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-800">Analyze Mutation</h2>
        <p className="text-xs text-slate-500">Enter a specific mutation to view its mechanism and therapy recommendations.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          type="text"
          value={mutation}
          onChange={(e) => setMutation(e.target.value)}
          placeholder="e.g. BRCA1 c.5266dupC"
          disabled={loading}
          className="w-full"
        />
        <Button
          type="submit"
          disabled={loading || !mutation.trim()}
          className="w-full"
        >
          {loading ? <Spinner className="w-4 h-4 animate-spin mr-2" /> : <MagnifyingGlass className="w-4 h-4 mr-2" />}
          Analyze
        </Button>
      </form>

      <div>
        <p className="text-xs text-slate-500 mb-3">Or try a demo case:</p>
        <div className="flex flex-col gap-2">
          {DEMO_CASES.map((demo) => (
            <Button
              key={demo.mutation}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMutation(demo.mutation);
                onAnalyze(demo.mutation);
              }}
              disabled={loading}
              className="justify-start text-xs font-normal"
            >
              {demo.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
