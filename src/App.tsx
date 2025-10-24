import React, { useMemo, useState, useEffect, type ReactNode } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  Cell, // [Clio Restoration] Added Cell back for IRFDoubleChart
} from 'recharts';
import type { AxisDomain } from 'recharts/types/util/types'; // [Clio Fix] Import AxisDomain type

// ===================== 小元件：Accordion ===================== //
const Accordion: React.FC<{ title: string; defaultOpen?: boolean; children: ReactNode }> = ({ title, defaultOpen = false, children }) => (
  <details open={defaultOpen} style={{ margin: '16px 0', background: '#0b1220', border: '1px solid #334155', borderRadius: 12 }}>
    <summary style={{ cursor: 'pointer', userSelect: 'none', padding: '14px 16px', color: '#e5e7eb', fontWeight: 700 }}>{title}</summary>
    <div style={{ padding: 16, color: '#d1d5db', lineHeight: 1.8 }}>{children}</div>
  </details>
);

// --- [Clio 整合]：根據 image_173c20.jpg 繪製的 SVG 概念框架圖 ---
const ConceptualFrameworkDiagram = () => (
    <svg viewBox="0 0 600 400" className="w-full h-auto" aria-labelledby="svg-title-conceptual" style={{ background: '#0b1220', borderRadius: 8 }}>
        <title id="svg-title-conceptual">研究概念框架圖</title>
        <defs>
            <marker id="arrowhead-conceptual" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
            </marker>
        </defs>

        {/* 節點 (Boxes) */}
        <g id="node-fdt" transform="translate(150, 80)">
            <rect x="-100" y="-30" width="200" height="60" rx="5" fill="#1f2937" stroke="#93c5fd" strokeWidth="2" />
            <text x="0" y="-5" fontFamily="Noto Sans TC, sans-serif" fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">數位威權脅迫</text>
            <text x="0" y="20" fontFamily="Noto Sans TC, sans-serif" fontSize="12" fill="#9ca3af" textAnchor="middle">(國外假訊息威脅 FDT)</text>
        </g>
        <g id="node-rc" transform="translate(450, 80)">
            <rect x="-100" y="-30" width="200" height="60" rx="5" fill="#1f2937" stroke="#93c5fd" strokeWidth="2" />
            <text x="0" y="5" fontFamily="Noto Sans TC, sans-serif" fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">國家管制能力 (RC)</text>
        </g>
        <g id="node-dap" transform="translate(450, 320)">
            <rect x="-100" y="-30" width="200" height="60" rx="5" fill="#1f2937" stroke="#93c5fd" strokeWidth="2" />
            <text x="0" y="5" fontFamily="Noto Sans TC, sans-serif" fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">防衛濫權 (DAP)</text>
        </g>
        <g id="node-sp" transform="translate(150, 320)">
            <rect x="-100" y="-30" width="200" height="60" rx="5" fill="#1f2937" stroke="#93c5fd" strokeWidth="2" />
            <text x="0" y="5" fontFamily="Noto Sans TC, sans-serif" fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">社會兩極化 (SP)</text>
        </g>

        {/* 實線箭頭 (Hypotheses) */}
        <path id="path-h1" d="M 250,80 H 350" stroke="#9ca3af" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-conceptual)"/>
        <text x="300" y="70" fontSize="12" fill="#d1d5db" textAnchor="middle">H1 (+)</text>

        <path id="path-h2" d="M 450,140 V 260" stroke="#9ca3af" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-conceptual)"/>
        <text x="465" y="200" fontSize="12" fill="#d1d5db" textAnchor="middle">H2 (+)</text>

        <path id="path-h3" d="M 350,320 H 250" stroke="#9ca3af" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-conceptual)"/>
        <text x="300" y="310" fontSize="12" fill="#d1d5db" textAnchor="middle">H3 (+)</text>

        {/* 虛線箭頭 (Feedback) */}
        <path id="path-sp-fdt" d="M 150,260 V 140" stroke="#fb923c" strokeWidth="2" fill="none" strokeDasharray="5 5" markerEnd="url(#arrowhead-conceptual)"/>
        <text x="135" y="200" fontSize="12" fill="#fb923c" textAnchor="middle">內生脆弱性</text>

        <path id="path-rc-sp" d="M 420,110 L 180,290" stroke="#fb923c" strokeWidth="2" fill="none" strokeDasharray="5 5" markerEnd="url(#arrowhead-conceptual)"/>
        <text x="300" y="190" fontSize="12" fill="#fb923c" textAnchor="middle" transform="rotate(-35 300 190)">國家權力悖論</text>
    </svg>
);


// ===================== FEVD 資料 (硬編碼) ===================== //
const fevdData = {
  fdt: [
    { period: 1, '國外假訊息威脅': 1.0000, '社會兩極化': 0.0000, '管制能力': 0.0000, '防衛濫權': 0.0000 }, { period: 2, '國外假訊息威脅': 0.9208, '社會兩極化': 0.0474, '管制能力': 0.0190, '防衛濫權': 0.0128 }, { period: 3, '國外假訊息威脅': 0.7763, '社會兩極化': 0.1936, '管制能力': 0.0164, '防衛濫權': 0.0137 }, { period: 4, '國外假訊息威脅': 0.6292, '社會兩極化': 0.3475, '管制能力': 0.0125, '防衛濫權': 0.0108 }, { period: 5, '國外假訊息威脅': 0.5171, '社會兩極化': 0.4585, '管制能力': 0.0156, '防衛濫權': 0.0088 }, { period: 6, '國外假訊息威脅': 0.4132, '社會兩極化': 0.5576, '管制能力': 0.0213, '防衛濫權': 0.0079 }, { period: 7, '國外假訊息威脅': 0.3796, '社會兩極化': 0.3869, '管制能力': 0.1501, '防衛濫權': 0.0834 }, { period: 8, '國外假訊息威脅': 0.3859, '社會兩極化': 0.1985, '管制能力': 0.2681, '防衛濫權': 0.1476 }, { period: 9, '國外假訊息威脅': 0.4618, '社會兩極化': 0.0636, '管制能力': 0.2822, '防衛濫權': 0.1925 }, { period: 10, '國外假訊息威脅': 0.4796, '社會兩極化': 0.0227, '管制能力': 0.2965, '防衛濫權': 0.2013 }, { period: 11, '國外假訊息威脅': 0.4932, '社會兩極化': 0.0159, '管制能力': 0.2883, '防衛濫權': 0.2026 }, { period: 12, '國外假訊息威脅': 0.5051, '社會兩極化': 0.0093, '管制能力': 0.2790, '防衛濫權': 0.2066 }, { period: 13, '國外假訊息威脅': 0.4988, '社會兩極化': 0.0109, '管制能力': 0.2859, '防衛濫權': 0.2045 }, { period: 14, '國外假訊息威脅': 0.5080, '社會兩極化': 0.0095, '管制能力': 0.2750, '防衛濫權': 0.2075 }, { period: 15, '國外假訊息威脅': 0.4996, '社會兩極化': 0.0093, '管制能力': 0.2836, '防衛濫權': 0.2075 },
  ],
  sp: [
    { period: 1, '國外假訊息威脅': 0.0004, '社會兩極化': 0.9996, '管制能力': 0.0000, '防衛濫權': 0.0000 }, { period: 2, '國外假訊息威脅': 0.3839, '社會兩極化': 0.3347, '管制能力': 0.1261, '防衛濫權': 0.1552 }, { period: 3, '國外假訊息威脅': 0.3902, '社會兩極化': 0.3903, '管制能力': 0.0785, '防衛濫權': 0.1411 }, { period: 4, '國外假訊息威脅': 0.3840, '社會兩極化': 0.2576, '管制能力': 0.2143, '防衛濫權': 0.1441 }, { period: 5, '國外假訊息威脅': 0.3701, '社會兩極化': 0.2889, '管制能力': 0.2088, '防衛濫權': 0.1323 }, { period: 6, '國外假訊息威脅': 0.4167, '社會兩極化': 0.2297, '管制能力': 0.1916, '防衛濫權': 0.1621 }, { period: 7, '國外假訊息威脅': 0.4304, '社會兩極化': 0.2215, '管制能力': 0.1706, '防衛濫權': 0.1776 }, { period: 8, '國外假訊息威脅': 0.3882, '社會兩極化': 0.2552, '管制能力': 0.1967, '防衛濫權': 0.1600 }, { period: 9, '國外假訊息威脅': 0.4959, '社會兩極化': 0.1786, '管制能力': 0.1455, '防衛濫權': 0.1799 }, { period: 10, '國外假訊息威脅': 0.4237, '社會兩極化': 0.1040, '管制能力': 0.2901, '防衛濫權': 0.1822 }, { period: 11, '國外假訊息威脅': 0.3430, '社會兩極化': 0.2756, '管制能力': 0.2285, '防衛濫權': 0.1530 }, { period: 12, '國外假訊息威脅': 0.4372, '社會兩極化': 0.2045, '管制能力': 0.1762, '防衛濫權': 0.1821 }, { period: 13, '國外假訊息威脅': 0.4349, '社會兩極化': 0.2380, '管制能力': 0.1518, '防衛濫權': 0.1753 }, { period: 14, '國外假訊息威脅': 0.3952, '社會兩極化': 0.2264, '管制能力': 0.2177, '防衛濫權': 0.1608 }, { period: 15, '國外假訊息威脅': 0.3064, '社會兩極化': 0.2642, '管制能力': 0.2827, '防衛濫權': 0.1467 },
  ],
  rc: [
    { period: 1, '國外假訊息威脅': 0.0197, '社會兩極化': 0.1753, '管制能力': 0.8051, '防衛濫權': 0.0000 }, { period: 2, '國外假訊息威脅': 0.5385, '社會兩極化': 0.0093, '管制能力': 0.2562, '防衛濫權': 0.1960 }, { period: 3, '國外假訊息威脅': 0.4876, '社會兩極化': 0.0475, '管制能力': 0.2683, '防衛濫權': 0.1966 }, { period: 4, '國外假訊息威脅': 0.4938, '社會兩極化': 0.0351, '管制能力': 0.2801, '防衛濫權': 0.1909 }, { period: 5, '國外假訊息威脅': 0.5355, '社會兩極化': 0.0243, '管制能力': 0.2370, '防衛濫權': 0.2031 }, { period: 6, '國外假訊息威脅': 0.5134, '社會兩極化': 0.0172, '管制能力': 0.2710, '防衛濫權': 0.1984 }, { period: 7, '國外假訊息威脅': 0.5082, '社會兩極化': 0.0371, '管制能力': 0.2607, '防衛濫權': 0.1941 }, { period: 8, '國外假訊息威脅': 0.4716, '社會兩極化': 0.0903, '管制能力': 0.2495, '防衛濫權': 0.1886 }, { period: 9, '國外假訊息威脅': 0.4735, '社會兩極化': 0.1250, '管制能力': 0.2122, '防衛濫權': 0.1892 }, { period: 10, '國外假訊息威脅': 0.4383, '社會兩極化': 0.1617, '管制能力': 0.2249, '防衛濫權': 0.1751 }, { period: 11, '國外假訊息威脅': 0.5245, '社會兩極化': 0.1116, '管制能力': 0.1732, '防衛濫權': 0.1907 }, { period: 12, '國外假訊息威脅': 0.4353, '社會兩極化': 0.0972, '管制能力': 0.2869, '防衛濫權': 0.1807 }, { period: 13, '國外假訊息威脅': 0.3574, '社會兩極化': 0.2436, '管制能力': 0.2412, '防衛濫權': 0.1578 }, { period: 14, '國外假訊息威脅': 0.4034, '社會兩極化': 0.2442, '管制能力': 0.1800, '防衛濫權': 0.1724 }, { period: 15, '國外假訊息威脅': 0.4395, '社會兩極化': 0.2502, '管制能力': 0.1334, '防衛濫權': 0.1769 },
  ],
  dap: [
    { period: 1, '國外假訊息威脅': 0.5135, '社會兩極化': 0.0594, '管制能力': 0.2245, '防衛濫權': 0.2026 }, { period: 2, '國外假訊息威脅': 0.5005, '社會兩極化': 0.0383, '管制能力': 0.2690, '防衛濫權': 0.1922 }, { period: 3, '國外假訊息威脅': 0.5507, '社會兩極化': 0.0229, '管制能力': 0.2257, '防衛濫權': 0.2007 }, { period: 4, '國外假訊息威脅': 0.5147, '社會兩極化': 0.0285, '管制能力': 0.2598, '防衛濫權': 0.1969 }, { period: 5, '國外假訊息威脅': 0.4608, '社會兩極化': 0.1090, '管制能力': 0.2464, '防衛濫權': 0.1838 }, { period: 6, '國外假訊息威脅': 0.4184, '社會兩極化': 0.1980, '管制能力': 0.2141, '防衛濫權': 0.1695 }, { period: 7, '國外假訊息威脅': 0.5150, '社會兩極化': 0.1202, '管制能力': 0.1698, '防衛濫權': 0.1951 }, { period: 8, '國外假訊息威脅': 0.4622, '社會兩極化': 0.0841, '管制能力': 0.2707, '防衛濫權': 0.1829 }, { period: 9, '國外假訊息威脅': 0.4082, '社會兩極化': 0.1731, '管制能力': 0.2577, '防衛濫權': 0.1610 }, { period: 10, '國外假訊息威脅': 0.4062, '社會兩極化': 0.1792, '管制能力': 0.2398, '防衛濫權': 0.1748 }, { period: 11, '國外假訊息威脅': 0.4007, '社會兩極化': 0.2485, '管制能力': 0.1805, '防衛濫權': 0.1703 }, { period: 12, '國外假訊息威脅': 0.4202, '社會兩極化': 0.2698, '管制能力': 0.1385, '防衛濫權': 0.1715 }, { period: 13, '國外假訊息威脅': 0.4360, '社會兩極化': 0.2491, '管制能力': 0.1471, '防衛濫權': 0.1677 }, { period: 14, '國外假訊息威脅': 0.3451, '社會兩極化': 0.2040, '管制能力': 0.2940, '防衛濫權': 0.1569 }, { period: 15, '國外假訊息威脅': 0.3246, '社會兩極化': 0.2906, '管制能力': 0.2324, '防衛濫權': 0.1525 },
  ],
};
const dataKeys = ['國外假訊息威脅', '社會兩極化', '管制能力', '防衛濫權'];
const colors = { '國外假訊息威脅': '#EF4444', '社會兩極化': '#F97316', '管制能力': '#3B82F6', '防衛濫權': '#8B5CF6' };

// ===================== IRF 資料 (硬編碼) ===================== //
// [Clio Restoration] Restored hardcoded IRF data arrays from App.txt
const irf_prop1_irf = [0.0007039671,-0.0162145712,-0.0732614146,-0.0669113318,-0.1403808512,-0.1026611397,-0.0341524022,-0.1005110521,0.2487307356,0.0217119911,0.2909506380,0.4846125439,-0.4071855039,1.0627065173,-1.0623278146,0.0275445721];
const irf_prop1_lo  = [-0.000857471,-0.030361948,-0.131984946,-0.13413398,-0.271344886,-0.239599806,-0.128241291,-0.29813237,-0.09067743,-0.255578628,-0.070603564,-0.263433599,-1.105637258,-0.618861464,-2.168478525,-0.822359837];
const irf_prop1_hi  = [0.003922682,0.00495299,0.02677355,0.032902544,0.047857316,0.067193948,0.060955134,0.063883024,0.441592513,0.137710118,0.525676461,0.899683539,0.297939689,2.11062961,0.331797532,0.772758057];

const irf_prop2_irf = [0.016272638,0.017463637,0.01525138,0.024279516,-0.022266289,0.002511071,-0.045697925,-0.071462774,0.027383189,-0.160742113,0.125792737,-0.035317161,-0.089134414,0.545647773,-0.676610157,0.923521332];
const irf_prop2_lo  = [-0.0029080583,-0.0017256013,-0.0049703473,-0.0009095368,-0.041021238,-0.0214324166,-0.0720609612,-0.0904853211,-0.0021835964,-0.1874274165,-0.0349512875,-0.1529670973,-0.1752970086,0.0030079874,-0.9573680505,-0.2043979072];
const irf_prop2_hi  = [0.02057235,0.023013464,0.018441973,0.026534911,0.003851926,0.016937733,0.015106076,0.002367272,0.057080611,0.015971414,0.233259282,0.126055877,0.054728212,0.689639958,0.077017431,1.446032371];

const irf_prop3_irf = [0,0.018973593,-0.018861642,-0.027197312,-0.001568509,-0.078575971,0.096630355,0.001400141,0.105348662,0.346963643,-0.176716412,0.680362536,-0.280873719,-0.082481692,0.977895996,-2.485120695];
const irf_prop3_lo  = [0,0.000493895,-0.030802077,-0.040308903,-0.014660231,-0.085269774,0.005587435,-0.08004427,0.004436165,0.032312671,-0.395447762,0.055598529,-0.754455062,-0.395295966,0.084209103,-3.171130926];
const irf_prop3_hi  = [0,0.0261150756,-0.0016683663,0.0009224662,0.0177653656,-0.0067495908,0.1679343162,0.0649711439,0.1357699338,0.3785829203,0.0141654632,0.852263875,0.1606661943,0.3291835954,1.1376900924,-0.1986283632];

const irf_par1_irf = [0,0.01710544,-0.01028611,-0.04203637,0.01160472,-0.08197875,0.08531538,0.06761674,0.0428128,0.46216597,-0.17886626,0.59474873,0.05353688,-0.60074662,1.50428947,-2.71109754];
const irf_par1_lo  = [0,-0.002264002,-0.025713779,-0.064359129,-0.012208885,-0.097136634,-0.01575455,-0.033221495,-0.043244884,0.002546256,-0.458887758,-0.071271049,-0.582254472,-1.001557562,0.05357802,-3.489605232];
const irf_par1_hi  = [0,0.0253453828,0.0060027923,-0.0007038127,0.0374246533,0.004827915,0.1560528846,0.1482558234,0.0994484103,0.5697783419,0.053069548,0.7968107393,0.5056708999,0.0041245435,1.9605004254,0.1091421945];

const irf_par2_irf = [0,0.036793994,0.081693426,0.104837267,0.111211129,0.129850085,0.073530056,0.099884623,0.050677517,0.003193477,0.138069611,-0.099993845,0.220065643,0.073943593,-0.10004014,0.761153226];
const irf_par2_lo  = [0,-0.011941673,0.004218836,0.009238447,-0.003681627,-0.018914249,-0.111556418,-0.171690204,-0.352919441,-0.559180888,-0.463748363,-0.814418796,-0.569057775,-0.52433944,-0.770736574,0.008212175];
const irf_par2_hi  = [0,0.06277818,0.11311566,0.14247631,0.18898544,0.24331937,0.26581384,0.37784412,0.43887505,0.55779226,0.81501389,0.76378382,1.03462932,0.76014852,0.59984269,1.29729618];


// ===================== FEVD 圖表 (含控制面板) ===================== //
// FEVD 圖表標題
const fevdChartTitles: Record<keyof typeof fevdData, string> = {
  fdt: 'FEVD: 解釋「國外假訊息威脅」(FDT) 的變異來源',
  sp: 'FEVD: 解釋「社會兩極化」(SP) 的變異來源',
  rc: 'FEVD: 解釋「管制能力」(RC) 的變異來源',
  dap: 'FEVD: 解釋「防衛濫權」(DAP) 的變異來源',
};

// 百分比格式化
const percent = (v: number) => (v * 100).toFixed(1) + '%';
const labelFormatter = (v: number) => v > 0.05 ? percent(v) : '';
// Y 軸刻度格式化
const yAxisFormatter = (v: number) => `${v * 100}`;
// Y 軸的 domain
// [Clio Fix 1/2] TS1355 & TS2322: Explicitly type the function return value as AxisDomain tuple. Remove invalid 'as const'.
const yDomain = (isStacked: boolean): AxisDomain => isStacked ? [0, 1] : [0, 'auto'];
// Y 軸的 ticks
const yTicks = (isStacked: boolean) => isStacked ? [0, 0.2, 0.4, 0.6, 0.8, 1.0] : undefined;

// 圖表控制面板
const Panel: React.FC<{
  target: keyof typeof fevdData;
  setTarget: (target: keyof typeof fevdData) => void;
  isStacked: boolean;
  setIsStacked: (isStacked: boolean) => void;
  showLabel: boolean;
  setShowLabel: (showLabel: boolean) => void;
}> = ({ target, setTarget, isStacked, setIsStacked, showLabel, setShowLabel }) => (
  <div style={{ padding: 16, background: '#1f2937', borderRadius: 8, border: '1px solid #374151', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'center' }}>
    {/* 目標變數選擇 */}
    <div>
      <label htmlFor="target-select" style={{ color: '#d1d5db', marginRight: 8, fontSize: 14 }}>選擇 FEVD 目標:</label>
      <select
        id="target-select"
        value={target}
        onChange={(e) => setTarget(e.target.value as keyof typeof fevdData)}
        style={{ background: '#374151', color: 'white', border: '1px solid #4b5563', borderRadius: 4, padding: '4px 8px' }}
      >
        <option value="fdt">國外假訊息威脅 (FDT)</option>
        <option value="sp">社會兩極化 (SP)</option>
        <option value="rc">管制能力 (RC)</option>
        <option value="dap">防衛濫權 (DAP)</option>
      </select>
    </div>
    {/* 堆疊/分組 切換 */}
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input type="checkbox" id="stack-toggle" checked={isStacked} onChange={() => setIsStacked(!isStacked)} />
      <label htmlFor="stack-toggle" style={{ color: '#d1d5db', fontSize: 14, userSelect: 'none' }}>堆疊長條圖 (Stacked)</label>
    </div>
    {/* 顯示標籤 切換 */}
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input type="checkbox" id="label-toggle" checked={showLabel} onChange={() => setShowLabel(!showLabel)} />
      <label htmlFor="label-toggle" style={{ color: '#d1d5db', fontSize: 14, userSelect: 'none' }}>顯示資料標籤 (Labels)</label>
    </div>
  </div>
);

// FEVD 圖表本體
const FevdChart: React.FC = () => {
  const [target, setTarget] = useState<keyof typeof fevdData>('sp');
  const [isStacked, setIsStacked] = useState(true);
  const [showLabel, setShowLabel] = useState(true);

  const data = fevdData[target];

  return (
    <div style={{ background: '#0b1220', padding: '24px 16px', border: '1px solid #334155', borderRadius: 12 }}>
      <h3 style={{ color: 'white', fontWeight: 700, fontSize: 20, textAlign: 'center', marginBottom: 24 }}>
        {fevdChartTitles[target]}
      </h3>
      <Panel
        target={target}
        setTarget={setTarget}
        isStacked={isStacked}
        setIsStacked={setIsStacked}
        showLabel={showLabel}
        setShowLabel={setShowLabel}
      />
      <ResponsiveContainer width="100%" height={400} style={{ marginTop: 24 }}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="period"
            label={{ value: '期數 (Period)', position: 'insideBottom', offset: -15, fill: '#9ca3af' }}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            stroke="#4b5563"
          />
          <YAxis
            label={{ value: isStacked ? '解釋比例 (%)' : '變異數', angle: -90, position: 'insideLeft', offset: 10, fill: '#9ca3af' }}
            tickFormatter={isStacked ? yAxisFormatter : undefined}
            domain={yDomain(isStacked)}
            ticks={yTicks(isStacked)}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            stroke="#4b5563"
          />
          <Tooltip
            formatter={(value: number) => percent(value)}
            contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', border: '1px solid #4b5563', borderRadius: 8, color: 'white' }}
            cursor={{ fill: '#374151', opacity: 0.6 }}
          />
          <Legend wrapperStyle={{ color: '#d1d5db', paddingTop: 20 }} />
          {dataKeys.map((key) => (
            <Bar key={key} dataKey={key} stackId={isStacked ? 'a' : key} fill={colors[key as keyof typeof colors]} radius={isStacked ? 0 : [4, 4, 0, 0]}>
              {showLabel && <LabelList dataKey={key} position={isStacked ? "center" : "top"} formatter={labelFormatter} fill="white" fontSize={10} />}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


// ===================== [Clio Restoration] IRF 圖表 (雙層含信賴區間) ===================== //
const irfChartTitles: Record<string, string> = {
  fdt_rc: 'H1: 國外假訊息 (FDT) 衝擊 → 管制能力 (RC)',
  rc_dap: 'H2: 管制能力 (RC) 衝擊 → 防衛濫權 (DAP)',
  dap_sp: 'H3: 防衛濫權 (DAP) 衝擊 → 社會兩極化 (SP)',
  rc_sp: '悖論一: 管制能力 (RC) 衝擊 → 社會兩極化 (SP)',
  sp_fdt: '悖論二: 社會兩極化 (SP) 衝擊 → 國外假訊息 (FDT)',
};

const irfColors = {
  impulse: '#60a5fa', // Light Blue for main line
  confidence: 'rgba(156, 163, 175, 0.5)', // Gray for CI lines
  sigPositive: '#10b981', // Green for significant positive bars/areas
  sigNegative: '#ef4444', // Red for significant negative bars/areas
  nonSig: '#6b7280', // Darker Gray for non-significant bars
  areaPositive: 'rgba(16, 185, 129, 0.08)', // Faint Green for positive sig area
  areaNegative: 'rgba(239, 68, 68, 0.08)', // Faint Red for negative sig area
  // [Clio Fix] Added missing paradox colors
  paradox: '#F97316', // Orange (matching FEVD)
  paradoxConfidence: 'rgba(249, 115, 22, 0.15)', // Faint Orange
};

// [Clio Restoration] Restored helper functions from App.txt
interface IRFPoint { period: number; irf: number; lower: number; upper: number; sig: boolean; }
function buildIRF(irf: number[], lower: number[], upper: number[]): IRFPoint[] {
  const n = Math.min(irf.length, lower.length, upper.length);
  const rows: IRFPoint[] = [];
  for (let i = 0; i < n; i++) {
    const l = lower[i] ?? 0; // Use ?? 0 as fallback if data is missing/undefined
    const u = upper[i] ?? 0;
    const val = irf[i] ?? 0;
    const sig = (l > 0 && u > 0) || (l < 0 && u < 0); // Both bounds must be on the same side of 0
    rows.push({ period: i , irf: val, lower: l, upper: u, sig }); // Changed period to start from 0
  }
  // Ensure period starts from 1 for chart display if needed, or adjust XAxis domain
   return rows.map(row => ({ ...row, period: row.period + 1 }));
}

function contiguousSigRanges(data: IRFPoint[]): Array<{ start: number; end: number; pos: boolean }>{
  const out: Array<{ start: number; end: number; pos: boolean }> = [];
  let i = 0;
  while (i < data.length) {
    if (!data[i].sig) { i++; continue; }
    const pos = data[i].irf >= 0;
    let j = i;
    // Find end of contiguous significant block with the same sign
    while (j < data.length && data[j].sig && (data[j].irf >= 0) === pos) j++;
     // Adjust start/end for ReferenceArea which uses category index (period - 0.5)
    out.push({ start: data[i].period - 0.5, end: data[j - 1].period + 0.5, pos });
    i = j; // Continue search after the block
  }
  return out;
}


// [Clio Restoration] Restored IRF_PROP1, PROP2, PROP3, PAR1, PAR2 constants
const IRF_PROP1 = buildIRF(irf_prop1_irf, irf_prop1_lo, irf_prop1_hi);
const IRF_PROP2 = buildIRF(irf_prop2_irf, irf_prop2_lo, irf_prop2_hi);
const IRF_PROP3 = buildIRF(irf_prop3_irf, irf_prop3_lo, irf_prop3_hi);
const IRF_PAR1  = buildIRF(irf_par1_irf,  irf_par1_lo,  irf_par1_hi);
const IRF_PAR2  = buildIRF(irf_par2_irf,  irf_par2_lo,  irf_par2_hi);

// [Clio Restoration] Restored IRFDoubleChart component from App.txt
const IRFDoubleChart: React.FC<{
  title: string;
  data: IRFPoint[];
  isParadox?: boolean; // Keep paradox styling if needed
}> = ({ title, data, isParadox }) => {
  const ranges = useMemo(() => contiguousSigRanges(data), [data]);
  // Calculate Y-axis domain dynamically, adding 10% padding
  const { yMin, yMax } = useMemo(() => {
    const allValues = data.flatMap(d => [d.lower, d.upper, d.irf]);
    const minVal = Math.min(...allValues, 0); // Include 0 in min/max calculation
    const maxVal = Math.max(...allValues, 0);
    const padding = (maxVal - minVal) * 0.10; // 10% padding
    return { yMin: minVal - padding, yMax: maxVal + padding };
  }, [data]);
  const yDomain: [number, number] = [yMin, yMax]; // Explicit tuple type

  // Define colors based on whether it's a paradox chart
  const mainLineColor = isParadox ? irfColors.paradox : irfColors.impulse;
  const sigPositiveColor = isParadox ? irfColors.paradox : irfColors.sigPositive;
  const areaPositiveColor = isParadox ? irfColors.paradoxConfidence : irfColors.areaPositive;


  // Custom Tooltip for IRF Charts
  const IRFCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pointData = data.find(d => d.period === label);
      return (
        <div style={{ background: 'rgba(31, 41, 55, 0.9)', border: '1px solid #4b5563', padding: 12, borderRadius: 8, color: 'white', fontSize: 12 }}>
          <p style={{ fontWeight: 'bold', marginBottom: 4 }}>期數 (Period): {label}</p>
          <p style={{ color: mainLineColor }}>衝擊響應 (IRF): {payload[2]?.value?.toFixed(4)}</p>
          <p style={{ color: irfColors.confidence }}>95% 信賴區間: [{payload[0]?.value?.toFixed(4)}, {payload[1]?.value?.toFixed(4)}]</p>
          <p style={{ marginTop: 4, color: pointData?.sig ? (pointData.irf >= 0 ? irfColors.sigPositive : irfColors.sigNegative) : irfColors.nonSig }}>
            {pointData?.sig ? '顯著' : '不顯著'}
          </p>
        </div>
      );
    }
    return null;
  };


  return (
    <div style={{ background: '#0b1220', border: '1px solid #334155', borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <h4 style={{ color: 'white', textAlign: 'center', marginBottom: 8, fontWeight: 700 }}>{title}</h4>
      {/* 上層：IRF 折線 + 上下界 + 顯著期段陰影 */}
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="period" tick={{ fill: '#d1d5db', fontSize: 11 }} interval={2} />
          <YAxis domain={yDomain} tick={{ fill: '#d1d5db', fontSize: 11 }} tickFormatter={(v) => v.toFixed(2)} width={40}/>
          <Tooltip content={<IRFCustomTooltip />} />
          {/* Render significant areas first */}
          {ranges.map((r, idx) => (
            <ReferenceArea key={`area-${idx}`} x1={r.start} x2={r.end} y1={yDomain[0]} y2={yDomain[1]}
             fill={r.pos ? areaPositiveColor : irfColors.areaNegative}
             ifOverflow="hidden" />
          ))}
          {/* Confidence Interval Lines (dashed) */}
          <Line type="monotone" dataKey="lower" stroke={irfColors.confidence} dot={false} strokeDasharray="4 3" activeDot={false} />
          <Line type="monotone" dataKey="upper" stroke={irfColors.confidence} dot={false} strokeDasharray="4 3" activeDot={false} />
           {/* Main Impulse Response Line */}
          <Line type="monotone" dataKey="irf" stroke={mainLineColor} dot={{ r: 2, fill: mainLineColor }} strokeWidth={2} activeDot={{ r: 4 }}/>
          {/* Zero Reference Line */}
          <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1}/>
        </ComposedChart>
      </ResponsiveContainer>
      {/* 下層：顯著性條形圖 */}
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 6, right: 16, left: 0, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="period" tick={{ fill: '#d1d5db', fontSize: 11 }} interval={2} />
          <YAxis tick={{ fill: '#d1d5db', fontSize: 11 }} domain={yDomain} tickFormatter={(v) => v.toFixed(2)} width={40}/>
          <Tooltip content={<IRFCustomTooltip />} />
          <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1} />
          <Bar dataKey="irf">
            {data.map((d, i) => (
              <Cell key={`cell-${i}`} fill={d.sig ? (d.irf >= 0 ? sigPositiveColor : irfColors.sigNegative) : irfColors.nonSig} opacity={d.sig ? 0.9 : 0.4} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center', marginTop: 6 }}>上圖：IRF 主線與 95% 信賴上下界；背景色塊代表顯著期段。下圖：以顏色呈現顯著與方向。</p>
    </div>
  );
};


// ===================== 圖片燈箱 Modal ===================== //
const Modal: React.FC<{ src: string | null; onClose: () => void }> = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, cursor: 'pointer' }}
    >
      <span onClick={onClose} style={{ position: 'absolute', top: 20, right: 35, color: 'white', fontSize: 40, fontWeight: 'bold', cursor: 'pointer' }}>
        &times;
      </span>
      <img
        src={src}
        alt="Enlarged chart"
        style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }}
        onClick={(e) => e.stopPropagation()} // 防止點擊圖片關閉
      />
    </div>
  );
};

// ===================== 主應用程式 App ===================== //
export default function App() {
  const [modalImage, setModalImage] = useState<string | null>(null);

  // 開發時的資料驗證
  useEffect(() => {
    // 驗證百分比格式化
    console.assert(percent(0.05) === '5.0%', `percent(0.05) 測試失敗`);
    console.assert(labelFormatter(0.051) === '5.1%', `labelFormatter(0.051) 測試失敗`);
    console.assert(labelFormatter(0.049) === '', `labelFormatter(0.049) 測試失敗`);

    // 驗證 FEVD 資料總和
    [fevdData.fdt, fevdData.sp, fevdData.rc, fevdData.dap].forEach((dataset, i) => {
      const targetName = ['fdt', 'sp', 'rc', 'dap'][i];
      dataset.slice(0, 5).forEach(row => { // 抽樣前 5 期
        const sum = dataKeys.reduce((acc, key) => acc + row[key as keyof typeof row], 0);
        console.assert(Math.abs(sum - 1) < 0.05, `FEVD data sum error for ${targetName}, period ${row.period}. Sum: ${sum}`);
      });
    });
  }, []);

  return (
    <div style={{ fontFamily: 'Noto Sans TC, sans-serif', background: '#030712', color: '#d1d5db', minHeight: '100vh', padding: '16px 8px' }}>
      <Modal src={modalImage} onClose={() => setModalImage(null)} />
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        <header style={{ textAlign: 'center', padding: '32px 0' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>防衛或侵蝕？</h1>
          <p style={{ fontSize: '1.25rem', color: '#e5e7eb', marginTop: 16 }}>數位威權脅迫下的國家能力與社會極化：台灣的實證研究 (2000-2024)</p>
          <p style={{ fontSize: '1.125rem', color: '#9ca3af', marginTop: 24 }}>潘競恒 (國立中興大學 國家政策與公共事務研究所)</p>
        </header>

        {/* [Clio Add] Added Research Background Accordion */}
        <Accordion title="研究背景" defaultOpen={true}>
          <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>民主政體面臨數位威權的假訊息威脅</li>
              <li>台灣為地緣政治風險第一線，嚴重遭受境外假訊息攻擊</li>
              <li>數位平台成為資訊干預與社會極化溫床</li>
              <li>民主治理面臨「防衛vs濫權」張力</li>
              <li>本研究以時間序列的結構模型填補動態變化與制度回饋的研究缺口</li>
          </ul>
        </Accordion>

        <Accordion title="研究概念架構 (Conceptual Framework)" defaultOpen={true}>
          <ConceptualFrameworkDiagram />
        </Accordion>

        <Accordion title="研究問題與假設 (Questions & Hypotheses)">
          <h4 style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', marginTop: 8 }}>核心問題</h4>
          <p style={{ marginTop: 8 }}>外部的「國外假訊息威脅」(FDT)、內部的「社會兩極化」(SP)、國家的「管制能力」(RC)與政府的「防衛濫權」(DAP)四者之間，是否存在一個長期的動態互動結構?</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li><strong>子問題一：</strong>外部假訊息衝擊，如何影響 RC 與 DAP 的短期與延遲反應？</li>
            <li><strong>子問題二：</strong>內部社會極化加劇，如何改變 RC 與 DAP 的治理模式？</li>
          </ul>
          <h4 style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', marginTop: 24 }}>研究假設</h4>
          <ul style={{ listStyleType: 'disc', paddingLeft: 24, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li><strong>假設 H1: FDT → RC</strong> (外部威脅驅動管制擴張)</li>
            <li><strong>假設 H2: RC → DAP</strong> (管制能力與濫權具內在連動)</li>
            <li><strong>假設 H3: DAP → SP</strong> (防衛濫權加劇社會極化)</li>
          </ul>
        </Accordion>

        <Accordion title="方法論 (Methodology)">
          <ul style={{ listStyleType: 'disc', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <li><strong>資料來源：</strong> V-Dem 多元民主中心 v15 版 (社群媒體資料集)。</li>
            <li><strong>樣本期間：</strong> 2000-2024 (N=25)。</li>
            <li><strong>單根檢定 (Unit Root Test)：</strong> ADF 檢定顯示，所有四個變數 (FDT, SP, RC, DAP) 在水準值上均不平穩，但在「一階差分」後呈現平穩，皆為 I(1) 整合序列。</li>
            <li><strong>共整合檢定 (Johansen Test)：</strong> 檢定結果顯示，四個變數間存在 3 個共整合向量 (r=3)，意味著它們之間有穩定的長期均衡關係。</li>
            <li><strong>模型選擇：</strong> 基於 I(1) 與共整合的前提，選擇「結構向量誤差修正模型 (SVEC)」。</li>
            <li><strong>分析方法：</strong> 衝擊反應函數 (IRF)、預測誤差變異分解 (FEVD)。</li>
          </ul>
        </Accordion>

        <Accordion title="關鍵發現 (Key Findings)" defaultOpen={true}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <h3 style={{ color: '#60a5fa', fontWeight: 700, fontSize: '1.5rem', textAlign: 'center' }}>悖論一：國家權力悖論 (State Power Paradox)</h3>
              <p style={{ marginTop: 12, textAlign: 'center' }}>管制能力(RC) 對 社會極化(SP) 的衝擊，短期雖能壓制，但長期卻轉為正向，成為加劇極化的來源。</p>
              {/* [Clio Restoration] Use IRFDoubleChart for paradox 1 */}
              <IRFDoubleChart title={irfChartTitles['rc_sp']} data={IRF_PAR1} isParadox={true} />
            </div>
            <div>
              <h3 style={{ color: '#f97316', fontWeight: 700, fontSize: '1.5rem', textAlign: 'center' }}>悖論二：內生脆弱性 (Endogenous Vulnerability)</h3>
              <p style={{ marginTop: 12, textAlign: 'center' }}>社會極化(SP) 對 國外假訊息(FDT) 具顯著正向衝擊，顯示內部脆弱性會「吸引」並「放大」外部威脅。</p>
              {/* [Clio Restoration] Use IRFDoubleChart for paradox 2 */}
              <IRFDoubleChart title={irfChartTitles['sp_fdt']} data={IRF_PAR2} isParadox={true} />
            </div>
          </div>
        </Accordion>

        <Accordion title="實證圖表：預測誤差變異分解 (FEVD)" defaultOpen={true}>
          <FevdChart />
        </Accordion>

        <Accordion title="實證圖表：衝擊響應 (IRF - 核心假設)" defaultOpen={true}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
             {/* [Clio Restoration] Use IRFDoubleChart for hypotheses */}
            <IRFDoubleChart title={irfChartTitles['fdt_rc']} data={IRF_PROP1} />
            <IRFDoubleChart title={irfChartTitles['rc_dap']} data={IRF_PROP2} />
            <IRFDoubleChart title={irfChartTitles['dap_sp']} data={IRF_PROP3} />
          </div>
        </Accordion>

        {/* [Clio Deletion] Removed the Accordion for static PNG IRF images */}

        {/* [Clio Deletion] Removed the duplicate FevdTable Accordion call */}
        {/* <Accordion title="實證圖表：FEVD 完整數據表 (Table)" defaultOpen={false}>
          <FevdTable />
        </Accordion> */}

        <Accordion title="結論與政策意涵 (Conclusion)">
          <ul style={{ listStyleType: 'disc', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <li><strong>理論貢獻：</strong> 本研究挑戰了傳統線性的「威脅-回應」模型，提出一個更具動態性的「<strong>共生演化</strong>」分析框架。</li>
            <li><strong>實證發現：</strong> 揭示了「國家權力悖論」與「內生脆弱性」兩個關鍵機制。</li>
            <li><strong>政策意涵：</strong> 國家在建構防衛機制時必須高度警惕。單純擴張政府的管制能力可能是危險的，甚至會反過來侵蝕社會信任、加劇內部對立。因此，真正的韌性不僅在於抵禦外部威L威脅，更在於處理「內部極化」，並對國家權力建立嚴格且透明的**制度制衡**。</li>
          </ul>
        </Accordion>

        <Accordion title="變數測量 (Variables)">
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
            <thead>
              <tr style={{ background: '#1f2937' }}>
                <th style={{ border: '1px solid #374151', padding: 10, textAlign: 'left', color: 'white' }}>核心變數</th>
                <th style={{ border: '1px solid #374151', padding: 10, textAlign: 'left', color: 'white' }}>V-Dem 指標</th>
                <th style={{ border: '1px solid #374151', padding: 10, textAlign: 'left', color: 'white' }}>指標測量的具體問題</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #374151', padding: 10, fontWeight: 700 }}>國外假訊息 (FDT)</td>
                <td style={{ border: '1px solid #374151', padding: 10, fontFamily: 'monospace' }}><code>v2smfordom</code></td>
                <td style={{ border: '1px solid #374151', padding: 10 }}>「外國政府...在多大的常規程度上，利用社群媒體散播...不實資訊，以影響本國國內政治？」</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #374151', padding: 10, fontWeight: 700 }}>社會極化 (SP)</td>
                <td style={{ border: '1px solid #374151', padding: 10, fontFamily: 'monospace' }}><code>v2smpolsoc</code></td>
                <td style={{ border: '1px solid #374151', padding: 10 }}>「您如何描述這個社會在主要政治議題上的意見差異？...在多大程度上導致了『主要的觀點衝突與兩極化』。」</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #374151', padding: 10, fontWeight: 700 }}>管制能力 (RC)</td>
                <td style={{ border: '1px solid #374151', padding: 10, fontFamily: 'monospace' }}><code>v2smregcap</code></td>
                <td style={{ border: '1px solid #374151', padding: 10 }}>「政府是否有充足的員工與資源，以依據現行法律來管制網路內容？」</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #374151', padding: 10, fontWeight: 700 }}>防衛濫權 (DAP)</td>
                <td style={{ border: '1px solid #374151', padding: 10, fontFamily: 'monospace' }}><code>v2smdefabu</code></td>
                <td style={{ border: '1px solid #374151', padding: 10 }}>「菁英在多大程度上，濫用法律體系（例如誹謗與版權法）來審查網路上的政治言論？」</td>
              </tr>
            </tbody>
          </table>
        </Accordion>

        {/* ===================== FEVD 表格元件 ===================== */}
        {/* [Clio Correction] Ensure FevdTable is called only once, inside its own Accordion */}
        <FevdTable />


        {/* ===================== 頁尾 ===================== */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: '#1f2937', border: '1px solid #374151', padding: '10px 14px', borderRadius: 8, color: '#e5e7eb', cursor: 'pointer' }}>回到頂部 ↑</button>
          <button onClick={() => window.print()} style={{ background: '#1f2937', border: '1px solid #374151', padding: '10px 14px', borderRadius: 8, color: '#e5e7eb', cursor: 'pointer' }}>列印 / 匯出 PDF</button>
        </div>

        {/* 開發測試結果（可保留） */}
        <details style={{ marginTop: 16, color: '#9ca3af' }}>
          <summary>Internal Test Results / 開發測試結果</summary>
          <ul>
            <li>percent() 與 labelFormatter() 的基本測試已於 console.assert 執行（含 5% 邊界）。</li>
            <li>抽樣前 5 期 FEVD 圖表資料合計接近 1（允許 0.05 誤差）。</li>
            <li>FEVD 表格資料行加總檢查通過（允許 0.05 誤差）。</li>
            {/* <li>yDomain 會依堆疊/分組自動加 3% 視覺餘裕。</li> */} {/* Clio removed this line as yDomain calculation changed */}
          </ul>
        </details>

        <footer style={{ textAlign: 'center', paddingTop: 24, marginTop: 32, borderTop: '1px solid #374151' }}>
          <p>潘競恒 | 國立中興大學 國家政策與公共事務研究所</p>
          <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 8 }}>[請填寫您的 Email] | [請填寫您的 ORCID]</p>
        </footer>

      </div>
    </div>
  );
}

// ===================== FEVD 表格元件 ===================== //
const FevdTable: React.FC = () => {
  const [target, setTarget] = useState<keyof typeof fevdData>('fdt');
  const data = fevdData[target];

  // 驗證資料總和
  useEffect(() => {
    data.forEach(row => {
      const sum = dataKeys.reduce((acc, key) => acc + row[key as keyof typeof row], 0);
      console.assert(Math.abs(sum - 1) < 0.05, `FEVD Table data sum error for ${target}, period ${row.period}. Sum: ${sum}`);
    });
  }, [data, target]);

  return (
    <Accordion title="實證圖表：FEVD 完整數據表 (Table)" defaultOpen={false}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
        <label htmlFor="table-target-select" style={{ color: '#d1d5db', fontSize: 14 }}>選擇 FEVD 目標:</label>
        <select
          id="table-target-select"
          value={target}
          onChange={(e) => setTarget(e.target.value as keyof typeof fevdData)}
          style={{ background: '#374151', color: 'white', border: '1px solid #4b5563', borderRadius: 4, padding: '4px 8px' }}
        >
          <option value="fdt">國外假訊息威脅 (FDT)</option>
          <option value="sp">社會兩極化 (SP)</option>
          <option value="rc">管制能力 (RC)</option>
          <option value="dap">防衛濫權 (DAP)</option>
        </select>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#1f2937' }}>
              <th style={{ border: '1px solid #374151', padding: 8, textAlign: 'center', color: 'white' }}>期數 (Period)</th>
              {dataKeys.map(key => (
                <th key={key} style={{ border: '1px solid #374151', padding: 8, textAlign: 'center', color: 'white' }}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.period} style={{ background: row.period % 2 === 0 ? '#0b1220' : '#111827' }}>
                <td style={{ border: '1px solid #374151', padding: 8, textAlign: 'center', fontWeight: 700 }}>{row.period}</td>
                {dataKeys.map(key => (
                  <td key={key} style={{ border: '1px solid #374151', padding: 8, textAlign: 'right', fontFamily: 'monospace' }}>
                    {(row[key as keyof typeof row] * 100).toFixed(2)}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Accordion>
  );
};

