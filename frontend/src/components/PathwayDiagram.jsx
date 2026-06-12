import React from 'react';
import { PATHWAYS, GENE_TO_STEP } from "../data/pathways"

export default function PathwayDiagram({ gene, effect_type }) {
  const geneInfo = GENE_TO_STEP[gene]
  if (!geneInfo) return (
    <div className="text-slate-400 text-sm p-4">
      Pathway diagram not available for {gene}
    </div>
  )

  const pathway    = PATHWAYS[geneInfo.pathway]
  const brokenStep = geneInfo.broken_step
  const { steps, edges, description } = pathway

  const NODE_W = 240
  const NODE_H = 48
  const OFFSET_X = (300 - NODE_W) / 2  // center horizontally in 300px

  function getColor(stepId) {
    const brokenIdx  = steps.findIndex(s => s.id === brokenStep)
    const currentIdx = steps.findIndex(s => s.id === stepId)
    if (stepId === brokenStep)     return { fill: "#fef2f2", stroke: "#ef4444", text: "#dc2626" }
    if (currentIdx > brokenIdx)    return { fill: "#fff7ed", stroke: "#f97316", text: "#ea580c" }
    return                                { fill: "#f0fdf4", stroke: "#22c55e", text: "#16a34a" }
  }

  const svgHeight = steps.length * 80 + 100;

  return (
    <div className="bg-slate-900 rounded-xl p-4 mt-4 overflow-hidden shadow-inner flex flex-col items-center">
      <p className="text-white font-semibold text-sm mb-3 text-center">{description}</p>
      <svg viewBox={`0 0 300 ${svgHeight}`} className="w-full h-auto max-w-full">
        {/* arrow marker definition */}
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="7"
            refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
        </defs>

        {/* edges */}
        {edges.map((edge, i) => {
          const from = steps.find(s => s.id === edge.from)
          const to   = steps.find(s => s.id === edge.to)
          return (
            <line key={i}
              x1={OFFSET_X + NODE_W / 2}
              y1={from.y + NODE_H}
              x2={OFFSET_X + NODE_W / 2}
              y2={to.y}
              stroke="#6b7280"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />
          )
        })}

        {/* nodes */}
        {steps.map((step) => {
          const colors  = getColor(step.id)
          const isBroken = step.id === brokenStep
          return (
            <g key={step.id}>
              <rect
                x={OFFSET_X} y={step.y}
                width={NODE_W} height={NODE_H}
                rx="8"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={isBroken ? 2.5 : 1.5}
              />
              <text
                x={OFFSET_X + NODE_W / 2}
                y={step.y + NODE_H / 2 - (isBroken ? 6 : 0)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={colors.text}
                fontSize="12"
                fontWeight={isBroken ? "700" : "600"}
              >
                {step.label}
              </text>
              {isBroken && effect_type && (
                <text
                  x={OFFSET_X + NODE_W / 2}
                  y={step.y + NODE_H / 2 + 10}
                  textAnchor="middle"
                  fill="#ef4444"
                  fontSize="9"
                  fontWeight="700"
                >
                  ✕ MUTATION SITE — {effect_type.replace(/_/g, " ")}
                </text>
              )}
            </g>
          )
        })}

        {/* legend */}
        {[
          { color: "#22c55e", label: "Functional" },
          { color: "#ef4444", label: "Mutation site" },
          { color: "#f97316", label: "Downstream disrupted" }
        ].map((item, i) => (
          <g key={i} transform={`translate(30, ${steps.length * 80 + 10 + i * 20})`}>
            <rect width="12" height="12" rx="2" fill={item.color} />
            <text x="24" y="10" fill="#9ca3af" fontSize="11">{item.label}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}
