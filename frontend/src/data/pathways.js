export const PATHWAYS = {
  "HR repair pathway": {
    description: "Homologous Recombination DNA Repair",
    steps: [
      { id: "dna_break",     label: "DNA Double-Strand Break",         x: 300, y: 50  },
      { id: "brca1_detect",  label: "BRCA1 Detects Break",             x: 300, y: 130 },
      { id: "resection",     label: "DNA End Resection",               x: 300, y: 210 },
      { id: "rad51",         label: "RAD51 Loads onto ssDNA",          x: 300, y: 290 },
      { id: "strand_inv",    label: "Strand Invasion & Synthesis",     x: 300, y: 370 },
      { id: "repair_done",   label: "DNA Repair Complete",             x: 300, y: 450 }
    ],
    edges: [
      { from: "dna_break",    to: "brca1_detect" },
      { from: "brca1_detect", to: "resection"    },
      { from: "resection",    to: "rad51"        },
      { from: "rad51",        to: "strand_inv"   },
      { from: "strand_inv",   to: "repair_done"  }
    ]
  },

  "EGFR signaling pathway": {
    description: "EGFR / RAS / MAPK Signaling",
    steps: [
      { id: "ligand",     label: "EGF Ligand Binds",           x: 300, y: 50  },
      { id: "egfr_act",   label: "EGFR Receptor Activated",    x: 300, y: 130 },
      { id: "ras",        label: "RAS Activation",             x: 300, y: 210 },
      { id: "raf_mek",    label: "RAF → MEK Signaling",        x: 300, y: 290 },
      { id: "erk",        label: "ERK Phosphorylation",        x: 300, y: 370 },
      { id: "proliferate",label: "Cell Proliferation",         x: 300, y: 450 }
    ],
    edges: [
      { from: "ligand",     to: "egfr_act"   },
      { from: "egfr_act",   to: "ras"        },
      { from: "ras",        to: "raf_mek"    },
      { from: "raf_mek",    to: "erk"        },
      { from: "erk",        to: "proliferate"}
    ]
  },

  "p53 tumor suppressor pathway": {
    description: "p53 / MDM2 Tumor Suppression",
    steps: [
      { id: "stress",     label: "Cellular Stress / DNA Damage", x: 300, y: 50  },
      { id: "tp53_stab",  label: "TP53 Stabilized",              x: 300, y: 130 },
      { id: "transcribe", label: "Target Gene Transcription",    x: 300, y: 210 },
      { id: "arrest",     label: "Cell Cycle Arrest",            x: 300, y: 290 },
      { id: "apoptosis",  label: "Apoptosis / Senescence",       x: 300, y: 370 }
    ],
    edges: [
      { from: "stress",     to: "tp53_stab"  },
      { from: "tp53_stab",  to: "transcribe" },
      { from: "transcribe", to: "arrest"     },
      { from: "arrest",     to: "apoptosis"  }
    ]
  }
}

// Maps gene → which step it corresponds to in its pathway
export const GENE_TO_STEP = {
  "BRCA1": { pathway: "HR repair pathway",              broken_step: "brca1_detect" },
  "BRCA2": { pathway: "HR repair pathway",              broken_step: "rad51"        },
  "EGFR":  { pathway: "EGFR signaling pathway",         broken_step: "egfr_act"     },
  "TP53":  { pathway: "p53 tumor suppressor pathway",   broken_step: "tp53_stab"    },
  "KRAS":  { pathway: "EGFR signaling pathway",         broken_step: "ras"          }
}
