import React, { useState } from 'react';
import { analyzeMutation } from './api/analyze';
import MutationInput from './components/MutationInput';
import ReasoningGraph from './components/ReasoningGraph';
import NodeDetail from './components/NodeDetail';
import TherapyOutput from './components/TherapyOutput';
import EvidencePanel from './components/EvidencePanel';
import ClinicalReport from './components/ClinicalReport';
import ProteinViewer from './components/ProteinViewer';
import ChromosomeViewer from './components/ChromosomeViewer';
import { useReactToPrint } from 'react-to-print';
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [error, setError] = useState(null);

  const reportRef = React.useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: 'Molecular_Tumor_Board_Report',
  });

  const handleAnalyze = async (mutation) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedNode(null);

    try {
      const data = await analyzeMutation(mutation);
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const therapyNode = result?.chain?.find(n => n.step === 4)?.data;
  const evidenceNode = result?.chain?.find(n => n.step === 5)?.data;
  const uniprotId = result?.chain?.find(n => n.step === 2)?.data?.uniprot_id;
  const mutationPosition = result?.chain?.find(n => n.step === 1)?.data?.amino_acid_position;
  
  const geneLookupNode = result?.chain?.find(n => n.step === 2)?.data;
  const mapLocation = geneLookupNode?.map_location;
  const genomicPos = geneLookupNode?.genomic_pos;
  const gene = result?.chain?.find(n => n.step === 1)?.data?.gene;

  return (
    <SidebarProvider>
      <AppSidebar>
        <MutationInput onAnalyze={handleAnalyze} loading={loading} />
      </AppSidebar>

      <SidebarInset className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <header className="flex h-14 items-center justify-between border-b bg-white px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="font-semibold text-slate-800">Mutation Therapy AI Dashboard</h1>
          </div>
          {result && (
            <Button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-700 text-white shadow-sm h-8 px-4 text-xs font-semibold">
              <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Export PDF
            </Button>
          )}
        </header>

        {/* Hidden printable component */}
        <div style={{ display: 'none' }}>
          <ClinicalReport ref={reportRef} result={result} />
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm">
                  {error}
                </div>
              )}

              {!result && !error && !loading && (
                <div className="h-[60vh] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-medium text-slate-600">No Analysis Results</h3>
                    <p className="text-slate-400 text-sm">Enter a mutation in the sidebar to begin.</p>
                  </div>
                </div>
              )}

              {result && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="flex flex-col h-full min-h-[350px]">
                      <CardHeader className="pb-3 shrink-0">
                        <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-y-auto">
                        <p className="text-slate-700 text-sm leading-relaxed">{result.summary}</p>
                      </CardContent>
                    </Card>
                    
                    {uniprotId && <ProteinViewer uniprotId={uniprotId} mutationPosition={mutationPosition} />}
                    
                    {(mapLocation || genomicPos?.chr) && (
                      <ChromosomeViewer 
                        mapLocation={mapLocation} 
                        genomicPos={genomicPos} 
                        gene={gene} 
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {therapyNode && <TherapyOutput therapyData={therapyNode} />}
                    {evidenceNode && <EvidencePanel evidenceData={evidenceNode} />}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 relative overflow-hidden">
                      <ReasoningGraph chain={result?.chain} onNodeClick={setSelectedNode} />
                    </div>

                    <div className="lg:col-span-1 flex flex-col">
                      {selectedNode ? (
                        <NodeDetail 
                          node={selectedNode} 
                          gene={result?.chain?.find(n => n.step === 1)?.data?.gene}
                          onClose={() => setSelectedNode(null)} 
                        />
                      ) : (
                        <Card className="h-full flex items-center justify-center bg-slate-50/50">
                          <CardContent className="text-center text-slate-400 text-sm pt-6">
                            Click a node in the reasoning graph to view details
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
