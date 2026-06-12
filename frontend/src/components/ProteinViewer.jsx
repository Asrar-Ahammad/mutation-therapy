import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

const ProteinViewer = ({ uniprotId, mutationPosition }) => {
  const viewerRef = useRef(null);
  const instanceRef = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!uniprotId || !window.$3Dmol) return;

    setStatus('loading');
    let cancelled = false;

    // Step 1: Query AlphaFold API to get the actual PDB URL
    fetch(`https://alphafold.ebi.ac.uk/api/prediction/${uniprotId}`)
      .then(res => {
        if (!res.ok) throw new Error(`API ${res.status}`);
        return res.json();
      })
      .then(entries => {
        if (cancelled) return;
        const entry = Array.isArray(entries) ? entries[0] : entries;
        const pdbUrl = entry?.pdbUrl;
        if (!pdbUrl) throw new Error('No PDB URL found');
        return fetch(pdbUrl);
      })
      .then(res => {
        if (!res || !res.ok) throw new Error('PDB fetch failed');
        return res.text();
      })
      .then(pdbData => {
        if (cancelled || !viewerRef.current) return;

        const viewer = window.$3Dmol.createViewer(viewerRef.current, {
          backgroundColor: 'white',
          antialias: true,
        });
        instanceRef.current = viewer;

        viewer.addModel(pdbData, 'pdb');

        // Base style: translucent cartoon colored by spectrum
        viewer.setStyle({}, { cartoon: { color: 'spectrum', opacity: 0.85 } });

        // Highlight mutation site if we have a position
        if (mutationPosition) {
          const pos = parseInt(mutationPosition, 10);
          // Highlight a region around the mutation (±5 residues)
          const rangeStart = Math.max(1, pos - 5);
          const rangeEnd = pos + 5;

          // Mutation region: bright red stick + cartoon
          viewer.setStyle(
            { resi: { $gte: rangeStart, $lte: rangeEnd } },
            {
              cartoon: { color: '#ef4444', opacity: 1.0 },
              stick: { color: '#ef4444', radius: 0.15 }
            }
          );

          // Exact mutation residue: large sphere highlight
          viewer.setStyle(
            { resi: pos },
            {
              cartoon: { color: '#dc2626', opacity: 1.0 },
              stick: { color: '#dc2626', radius: 0.2 },
              sphere: { color: '#dc2626', radius: 0.6, opacity: 0.6 }
            }
          );

          // Add a label at the mutation site
          viewer.addLabel(`Mutation: Pos ${pos}`, {
            position: { resi: pos },
            backgroundColor: '#dc2626',
            backgroundOpacity: 0.85,
            fontColor: 'white',
            fontSize: 12,
            font: 'sans-serif',
            showBackground: true,
          }, { resi: pos });
        }

        viewer.zoomTo();
        viewer.render();
        viewer.spin('y', 0.5);  // slow rotation for visual effect
        setStatus('loaded');

        // Set up event listeners on the container div in capture phase
        const container = viewerRef.current;
        if (container && mutationPosition) {
          const pos = parseInt(mutationPosition, 10);

          let startX = 0;
          let startY = 0;
          let startTime = 0;

          const handleMouseDown = (event) => {
            startX = event.clientX;
            startY = event.clientY;
            startTime = Date.now();
          };

          const handleMouseUp = (event) => {
            const dt = Date.now() - startTime;
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // True click: short duration, minimal movement
            if (dt < 300 && dist < 5) {
              const atoms = viewer.selectedAtoms({ resi: pos });
              if (atoms.length === 0) return;

              let sumX = 0, sumY = 0, sumZ = 0;
              atoms.forEach(atom => {
                sumX += atom.x;
                sumY += atom.y;
                sumZ += atom.z;
              });
              const avgAtom = {
                x: sumX / atoms.length,
                y: sumY / atoms.length,
                z: sumZ / atoms.length
              };

              const screenPos = viewer.modelToScreen(avgAtom);
              const rect = container.getBoundingClientRect();
              const clickX = event.clientX - rect.left;
              const clickY = event.clientY - rect.top;

              const clickDistX = clickX - screenPos.x;
              const clickDistY = clickY - screenPos.y;
              const distance = Math.sqrt(clickDistX * clickDistX + clickDistY * clickDistY);

              if (distance < 80) {
                viewer.zoomTo({ resi: pos }, 1000);
                event.stopPropagation();
              }
            }
          };

          const handleDblClick = (event) => {
            const atoms = viewer.selectedAtoms({ resi: pos });
            if (atoms.length === 0) return;

            let sumX = 0, sumY = 0, sumZ = 0;
            atoms.forEach(atom => {
              sumX += atom.x;
              sumY += atom.y;
              sumZ += atom.z;
            });
            const avgAtom = {
              x: sumX / atoms.length,
              y: sumY / atoms.length,
              z: sumZ / atoms.length
            };

            const screenPos = viewer.modelToScreen(avgAtom);
            const rect = container.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;

            const dx = clickX - screenPos.x;
            const dy = clickY - screenPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 80) {
              viewer.zoomTo({ resi: pos }, 1000);
            } else {
              viewer.zoomTo({}, 1000);
            }
            event.stopPropagation();
          };

          const handleMouseMove = (event) => {
            const atoms = viewer.selectedAtoms({ resi: pos });
            if (atoms.length === 0) return;

            let sumX = 0, sumY = 0, sumZ = 0;
            atoms.forEach(atom => {
              sumX += atom.x;
              sumY += atom.y;
              sumZ += atom.z;
            });
            const avgAtom = {
              x: sumX / atoms.length,
              y: sumY / atoms.length,
              z: sumZ / atoms.length
            };

            const screenPos = viewer.modelToScreen(avgAtom);
            const rect = container.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            const dx = mouseX - screenPos.x;
            const dy = mouseY - screenPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 80) {
              container.style.cursor = 'pointer';
            } else {
              container.style.cursor = 'default';
            }
          };

          container.addEventListener('mousedown', handleMouseDown, true);
          container.addEventListener('mouseup', handleMouseUp, true);
          container.addEventListener('dblclick', handleDblClick, true);
          container.addEventListener('mousemove', handleMouseMove, true);

          // Save references to remove later
          container._handleMouseDown = handleMouseDown;
          container._handleMouseUp = handleMouseUp;
          container._handleDblClick = handleDblClick;
          container._handleMouseMove = handleMouseMove;
        }
      })
      .catch(err => {
        console.error('Protein viewer error:', err);
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        const container = viewerRef.current;
        if (container._handleMouseDown) {
          container.removeEventListener('mousedown', container._handleMouseDown, true);
          delete container._handleMouseDown;
        }
        if (container._handleMouseUp) {
          container.removeEventListener('mouseup', container._handleMouseUp, true);
          delete container._handleMouseUp;
        }
        if (container._handleDblClick) {
          container.removeEventListener('dblclick', container._handleDblClick, true);
          delete container._handleDblClick;
        }
        if (container._handleMouseMove) {
          container.removeEventListener('mousemove', container._handleMouseMove, true);
          delete container._handleMouseMove;
        }
      }
      if (instanceRef.current) {
        instanceRef.current.clear();
        instanceRef.current = null;
      }
    };
  }, [uniprotId, mutationPosition]);

  if (!uniprotId) return null;

  return (
    <Card className="flex flex-col h-full overflow-hidden min-h-[350px]">
      <CardHeader className="pb-2 border-b border-slate-100 bg-white z-10 shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">3D Protein Structure</CardTitle>
            {mutationPosition && (
              <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                ● Mutation highlighted at position {mutationPosition}
              </p>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">UniProt: {uniprotId}</span>
        </div>
      </CardHeader>
      <div 
        className="flex-1 relative bg-white min-h-[280px]"
        onMouseEnter={() => { if (instanceRef.current) instanceRef.current.spin(false); }}
        onMouseLeave={() => { if (instanceRef.current) instanceRef.current.spin('y', 0.5); }}
      >
        <div ref={viewerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mr-2" />
            <p className="text-slate-400 text-sm">Loading 3D structure...</p>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <p className="text-red-400 text-sm">Structure not available for this protein</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProteinViewer;
