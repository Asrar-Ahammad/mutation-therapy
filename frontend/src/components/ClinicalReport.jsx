import React, { forwardRef } from 'react';

const ClinicalReport = forwardRef(({ result }, ref) => {
  if (!result || !result.chain) return null;

  const getStepData = (stepId) => result.chain.find((n) => n.step === stepId)?.data || {};

  const mutation = getStepData(1);
  const geneData = getStepData(2);
  const mechanism = getStepData(3);
  const therapy = getStepData(4);
  const skeptic = getStepData('4b');
  const consensus = getStepData('4c');
  const evidence = getStepData(5);
  const trials = getStepData(6);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <style type="text/css" media="print">
        {`
          @page { margin: 20mm; }
        `}
      </style>
      <div ref={ref} className="bg-white font-sans text-slate-800" style={{ width: '100%' }}>
        {/* Header */}
      <div className="border-b-4 border-slate-800 pb-4 mb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Molecular Tumor Board Report</h1>
            <p className="text-sm text-slate-500 font-bold tracking-wider mt-1">CONFIDENTIAL MEDICAL RECORD</p>
          </div>
          <div className="text-right whitespace-nowrap">
            <p className="text-sm font-semibold">Date: {currentDate}</p>
            <p className="text-sm font-semibold text-slate-500">Report ID: MT-{Math.floor(Math.random() * 100000)}</p>
          </div>
        </div>
      </div>

      {/* Patient / Mutation Context */}
      <section className="mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h2 className="text-lg font-bold uppercase tracking-wider mb-3 text-slate-700 border-b pb-2">Genomic Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500 uppercase font-bold">Target Gene</p>
            <p className="text-lg font-semibold">{mutation.gene || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 uppercase font-bold">Mutation Type</p>
            <p className="text-lg font-semibold">{mutation.mutation_type || 'N/A'} ({mutation.change})</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-slate-500 uppercase font-bold">Associated Diseases</p>
            <p className="font-medium">{geneData.associated_diseases?.join(', ') || 'N/A'}</p>
          </div>
        </div>
      </section>

      {/* Mechanism */}
      <section className="mb-8">
        <h2 className="text-lg font-bold uppercase tracking-wider mb-3 text-slate-700 border-b border-slate-200 pb-2">Biological Mechanism</h2>
        <div className="space-y-2">
          <p><strong>Affected Pathway:</strong> {mechanism.pathway_affected}</p>
          <p><strong>Effect Type:</strong> <span className="uppercase text-sm font-bold bg-slate-100 px-2 py-1 rounded">{mechanism.effect_type}</span></p>
          <p className="text-justify leading-relaxed">{mechanism.mechanism}</p>
          <p className="text-sm italic text-slate-600 mt-2">Consequence: {mechanism.consequence}</p>
        </div>
      </section>

      {/* Tumor Board Debate */}
      <section className="mb-8">
        <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-slate-700 border-b border-slate-200 pb-2">Tumor Board Consensus</h2>
        
        <div className="space-y-6 mb-6">
          <div className="border-t-2 border-slate-300 pt-3">
            <h3 className="text-sm font-bold uppercase text-slate-500 mb-2">Initial Proposal</h3>
            <p className="font-semibold text-slate-800">{therapy.therapy_class}</p>
            <p className="text-sm mt-1 text-slate-600">{therapy.rationale}</p>
          </div>
          
          <div className="border-t-2 border-red-300 pt-3">
            <h3 className="text-sm font-bold uppercase text-red-600 mb-2">Skeptic Review</h3>
            <p className="text-sm text-red-900">{skeptic.critique}</p>
            {skeptic.resistance_mechanisms?.length > 0 && (
              <ul className="list-disc list-inside text-xs text-red-800 mt-2 space-y-1">
                {skeptic.resistance_mechanisms.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            )}
          </div>
        </div>

        <div className="border-t-4 border-slate-800 pt-4 mt-2 break-inside-avoid">
          <h3 className="text-sm font-bold uppercase text-slate-800 mb-2 flex justify-between">
            <span>Final Recommendation</span>
            <span className="text-emerald-600 font-black">Confidence: {consensus.final_confidence?.toUpperCase()}</span>
          </h3>
          <p className="text-xl font-black mb-2 text-slate-900">{consensus.final_recommendation || therapy.drugs?.[0]}</p>
          <p className="text-sm leading-relaxed text-slate-700">{consensus.consensus_rationale}</p>
        </div>
      </section>

      {/* Trials and Evidence */}
      <div className="space-y-8">
        {/* Evidence */}
        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider mb-3 text-slate-700 border-b border-slate-200 pb-2">Supporting Literature</h2>
          <ul className="space-y-3">
            {evidence.papers?.map((p, i) => (
              <li key={i} className="text-sm">
                <p className="font-semibold leading-tight">{p.title}</p>
                <p className="text-xs text-slate-500 mt-1">PMID: {p.pmid}</p>
              </li>
            ))}
            {!evidence.papers?.length && <p className="text-sm text-slate-400">No literature available.</p>}
          </ul>
        </section>

        {/* Trials */}
        <section>
          <h2 className="text-lg font-bold uppercase tracking-wider mb-3 text-slate-700 border-b border-slate-200 pb-2">Matching Clinical Trials</h2>
          <ul className="space-y-3">
            {trials.trials?.slice(0, 4).map((t, i) => (
              <li key={i} className="text-sm">
                <p className="font-semibold leading-tight">{t.title}</p>
                <p className="text-xs text-slate-500 mt-1">{t.nct_id} • {t.phase}</p>
              </li>
            ))}
            {!trials.trials?.length && <p className="text-sm text-slate-400">No recruiting trials found.</p>}
          </ul>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t-2 border-slate-200 flex justify-between items-center text-xs text-slate-400">
        <p>Generated by MutationTherapy AI</p>
        <p>Page 1 of 1</p>
      </div>
      </div>
    </>
  );
});

ClinicalReport.displayName = 'ClinicalReport';

export default ClinicalReport;
