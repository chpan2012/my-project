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
  Cell,
} from 'recharts';

// ===================== 小元件：Accordion ===================== //
const Accordion: React.FC<{ title: string; defaultOpen?: boolean; children: ReactNode }> = ({ title, defaultOpen = false, children }) => (
  <details open={defaultOpen} style={{ margin: '16px 0', background: '#0b1220', border: '1px solid #334155', borderRadius: 12 }}>
    <summary style={{ cursor: 'pointer', userSelect: 'none', padding: '14px 16px', color: '#e5e7eb', fontWeight: 700 }}>{title}</summary>
    <div style={{ padding: 16, color: '#d1d5db', lineHeight: 1.8 }}>{children}</div>
  </details>
);

// ===================== 研究架構示意圖（鑽石型） ===================== //
const ResearchFramework: React.FC = () => (
  <div style={{ background: '#0b1220', padding: 24, border: '1px solid #334155', borderRadius: 12, textAlign: 'center', color: '#d1d5db' }}>
    <h3 style={{ color: 'white', marginBottom: 16 }}>研究架構示意圖（鑽石型）</h3>
    <svg viewBox="0 0 600 520" width="100%" height="auto">
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#60a5fa" />
        </marker>
        <marker id="dashedArrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#9ca3af" />
        </marker>
      </defs>

      {/* 節點：FDT 在上、RC 在右、DAP 在下、SP 在左（菱形） */}
      <circle cx="300" cy="100" r="40" fill="#EF4444" />
      <text x="300" y="105" textAnchor="middle" fill="white" fontSize="14">FDT</text>
      <text x="300" y="150" textAnchor="middle" fill="#9ca3af" fontSize="13">假訊息威脅</text>

      <circle cx="500" cy="250" r="40" fill="#3B82F6" />
      <text x="500" y="255" textAnchor="middle" fill="white" fontSize="14">RC</text>
      <text x="500" y="295" textAnchor="middle" fill="#9ca3af" fontSize="13">管制能力</text>

      <circle cx="300" cy="400" r="40" fill="#8B5CF6" />
      <text x="300" y="405" textAnchor="middle" fill="white" fontSize="14">DAP</text>
      <text x="300" y="445" textAnchor="middle" fill="#9ca3af" fontSize="13">防衛濫權</text>

      <circle cx="100" cy="250" r="40" fill="#F97316" />
      <text x="100" y="255" textAnchor="middle" fill="white" fontSize="14">SP</text>
      <text x="100" y="295" textAnchor="middle" fill="#9ca3af" fontSize="13">社會兩極化</text>

      {/* 實線箭頭（主要假設關係） */}
      <line x1="300" y1="140" x2="470" y2="230" stroke="#60a5fa" strokeWidth="2.5" markerEnd="url(#arrow)" />
      <line x1="470" y1="270" x2="330" y2="370" stroke="#60a5fa" strokeWidth="2.5" markerEnd="url(#arrow)" />
      <line x1="270" y1="370" x2="130" y2="270" stroke="#60a5fa" strokeWidth="2.5" markerEnd="url(#arrow)" />

      {/* 虛線箭頭（延伸關係） */}
      <line x1="470" y1="260" x2="130" y2="260" stroke="#9ca3af" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#dashedArrow)" />
      <line x1="150" y1="250" x2="260" y2="130" stroke="#9ca3af" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#dashedArrow)" />

      {/* 圖例 */}
      <text x="300" y="490" textAnchor="middle" fill="#9ca3af" fontSize="13">實線：主要假設關係（FDT→RC→DAP→SP）</text>
      <text x="300" y="510" textAnchor="middle" fill="#9ca3af" fontSize="13">虛線：延伸關係（RC→SP；SP→FDT）</text>
    </svg>
  </div>
);

// ===================== 公用函式 ===================== //
const Dot = ({ color }: { color: string }) => (
  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 9999, background: color, marginRight: 6 }} />
);

const percent = (v?: number) => (typeof v === 'number' ? `${(v * 100).toFixed(1)}%` : '—');

// ✅ 嚴格大於 5% 才顯示
const labelFormatter = (v?: number) => (typeof v === 'number' && v > 0.05 ? percent(v) : '');

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: '#0b1220', border: '1px solid #334155', padding: 12, borderRadius: 8, color: '#e5e7eb', minWidth: 220 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>期數：{label}</div>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, lineHeight: 1.6 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Dot color={entry.color} />
            <span>{entry.name}</span>
          </div>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{percent(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ===================== 原始資料（FEVD 圖表） ===================== //
const fevdDataFDT = [
  { period: 1, '國外假訊息威脅': 1.0, '社會兩極化': 0.0, '管制能力': 0.0, '防衛濫權': 0.0 },
  { period: 2, '國外假訊息威脅': 0.9208, '社會兩極化': 0.0474, '管制能力': 0.019, '防衛濫權': 0.0128 },
  { period: 3, '國外假訊息威脅': 0.7763, '社會兩極化': 0.1936, '管制能力': 0.0164, '防衛濫權': 0.0137 },
  { period: 4, '國外假訊息威脅': 0.6292, '社會兩極化': 0.3475, '管制能力': 0.0125, '防衛濫權': 0.0108 },
  { period: 5, '國外假訊息威脅': 0.5171, '社會兩極化': 0.4585, '管制能力': 0.0156, '防衛濫權': 0.0088 },
  { period: 6, '國外假訊息威脅': 0.4132, '社會兩極化': 0.5576, '管制能力': 0.0213, '防衛濫權': 0.0079 },
  { period: 7, '國外假訊息威脅': 0.3796, '社會兩極化': 0.3869, '管制能力': 0.1501, '防衛濫權': 0.0834 },
  { period: 8, '國外假訊息威脅': 0.3859, '社會兩極化': 0.1985, '管制能力': 0.2681, '防衛濫權': 0.1476 },
  { period: 9, '國外假訊息威脅': 0.4618, '社會兩極化': 0.0636, '管制能力': 0.2822, '防衛濫權': 0.1925 },
  { period: 10, '國外假訊息威脅': 0.4796, '社會兩極化': 0.0227, '管制能力': 0.2965, '防衛濫權': 0.2013 },
  { period: 11, '國外假訊息威脅': 0.4932, '社會兩極化': 0.0159, '管制能力': 0.2883, '防衛濫權': 0.2026 },
  { period: 12, '國外假訊息威脅': 0.5051, '社會兩極化': 0.0093, '管制能力': 0.279, '防衛濫權': 0.2066 },
  { period: 13, '國外假訊息威脅': 0.4988, '社會兩極化': 0.0109, '管制能力': 0.2859, '防衛濫權': 0.2045 },
  { period: 14, '國外假訊息威脅': 0.508, '社會兩極化': 0.0095, '管制能力': 0.275, '防衛濫權': 0.2075 },
  { period: 15, '國外假訊息威脅': 0.4996, '社會兩極化': 0.0093, '管制能力': 0.2836, '防衛濫權': 0.2075 },
];

const fevdDataSP = [
  { period: 1, '國外假訊息威脅': 0.0004, '社會兩極化': 0.9996, '管制能力': 0.0, '防衛濫權': 0.0 },
  { period: 2, '國外假訊息威脅': 0.3839, '社會兩極化': 0.3347, '管制能力': 0.1261, '防衛濫權': 0.1552 },
  { period: 3, '國外假訊息威脅': 0.3902, '社會兩極化': 0.3903, '管制能力': 0.0785, '防衛濫權': 0.1411 },
  { period: 4, '國外假訊息威脅': 0.384, '社會兩極化': 0.2576, '管制能力': 0.2143, '防衛濫權': 0.1441 },
  { period: 5, '國外假訊息威脅': 0.3701, '社會兩極化': 0.2889, '管制能力': 0.2088, '防衛濫權': 0.1323 },
  { period: 6, '國外假訊息威脅': 0.4167, '社會兩極化': 0.2297, '管制能力': 0.1916, '防衛濫權': 0.1621 },
  { period: 7, '國外假訊息威脅': 0.4304, '社會兩極化': 0.2215, '管制能力': 0.1706, '防衛濫權': 0.1776 },
  { period: 8, '國外假訊息威脅': 0.3882, '社會兩極化': 0.2552, '管制能力': 0.1967, '防衛濫權': 0.16 },
  { period: 9, '國外假訊息威脅': 0.4959, '社會兩極化': 0.1786, '管制能力': 0.1455, '防衛濫權': 0.1799 },
  { period: 10, '國外假訊息威脅': 0.4237, '社會兩極化': 0.104, '管制能力': 0.2901, '防衛濫權': 0.1822 },
  { period: 11, '國外假訊息威脅': 0.343, '社會兩極化': 0.2756, '管制能力': 0.2285, '防衛濫權': 0.153 },
  { period: 12, '國外假訊息威脅': 0.4372, '社會兩極化': 0.2045, '管制能力': 0.1762, '防衛濫權': 0.1821 },
  { period: 13, '國外假訊息威脅': 0.4349, '社會兩極化': 0.238, '管制能力': 0.1518, '防衛濫權': 0.1753 },
  { period: 14, '國外假訊息威脅': 0.3952, '社會兩極化': 0.2264, '管制能力': 0.2177, '防衛濫權': 0.1608 },
  { period: 15, '國外假訊息威脅': 0.3064, '社會兩極化': 0.2642, '管制能力': 0.2827, '防衛濫權': 0.1467 },
];

// ===================== 其它資料：FEVD 表格 ===================== //
const fevdRC = [
  [0.01969217, 0.17529986, 0.8050080, 0.0000000],
  [0.53853478, 0.00928679, 0.2561803, 0.1959981],
  [0.48760081, 0.04749330, 0.2683242, 0.1965817],
  [0.49380977, 0.03514216, 0.2801144, 0.1909337],
  [0.53553416, 0.02432393, 0.2370140, 0.2031279],
  [0.51341127, 0.01723455, 0.2709698, 0.1983843],
  [0.50818038, 0.03705098, 0.2606835, 0.1940851],
  [0.47158033, 0.09029295, 0.2494949, 0.1886318],
  [0.47354519, 0.12504305, 0.2122164, 0.1891954],
  [0.43829693, 0.16167855, 0.2249368, 0.1750877],
  [0.52448250, 0.11161845, 0.1732356, 0.1906635],
  [0.43531397, 0.09715476, 0.2868750, 0.1806563],
  [0.35742966, 0.24355839, 0.2411720, 0.1578399],
  [0.40343289, 0.24416302, 0.1800273, 0.1723768],
  [0.43951924, 0.25016855, 0.1333780, 0.1769342],
];

const fevdDAP = [
  [0.5135349, 0.05940237, 0.2244510, 0.2026118],
  [0.5004798, 0.03831854, 0.2689877, 0.1922139],
  [0.5506975, 0.02285111, 0.2257468, 0.2007046],
  [0.5147459, 0.02849596, 0.2598274, 0.1969307],
  [0.4607921, 0.10904073, 0.2463709, 0.1837963],
  [0.4184042, 0.19797597, 0.2141259, 0.1694940],
  [0.5149977, 0.12017589, 0.1697574, 0.1950690],
  [0.4622266, 0.08410186, 0.2707454, 0.1829261],
  [0.4081556, 0.17314083, 0.2576589, 0.1610447],
  [0.4062434, 0.17921058, 0.2397794, 0.1747667],
  [0.4007088, 0.24846464, 0.1805325, 0.1702940],
  [0.4201773, 0.26979592, 0.1384806, 0.1715462],
  [0.4360359, 0.24914434, 0.1470736, 0.1677462],
  [0.3451436, 0.20395306, 0.2939841, 0.1569193],
  [0.3245588, 0.29061450, 0.2323553, 0.1524715],
];

// ===== IRF 數據（五組）：irf / lower / upper =====
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

// 將 4 欄矩陣（FDT, SP, RC, DAP）轉為圖表資料物件陣列
function transformFevdMatrix(mat: number[][]) {
  const KEYS = ['國外假訊息威脅', '社會兩極化', '管制能力', '防衛濫權'];
  return mat.map((row, i) => {
    const obj: any = { period: i + 1 };
    KEYS.forEach((k, idx) => (obj[k] = row[idx] ?? 0));
    return obj;
  });
}

const fevdRC_stacked = transformFevdMatrix(fevdRC);
const fevdDAP_stacked = transformFevdMatrix(fevdDAP);

const COLMAP: Record<string, string> = {
  '國外假訊息威脅': '#EF4444',
  '社會兩極化': '#F97316',
  '管制能力': '#3B82F6',
  '防衛濫權': '#8B5CF6',
};

const SERIES_KEYS = Object.keys(COLMAP);

// 依據資料與顯示模式，動態計算 Y 軸上限（微幅空間，避免標籤被裁切）
function computeYDomain(data: any[], stacked: boolean): [number, number] {
  const HEADROOM = 0.03; // 3% 視覺餘裕
  if (stacked) {
    const maxSum = Math.max(
      ...data.map((r) => SERIES_KEYS.reduce((acc, k) => acc + (r?.[k] ?? 0), 0))
    );
    return [0, Math.min(1, maxSum + HEADROOM)];
  } else {
    const maxVal = Math.max(
      ...data.flatMap((r) => SERIES_KEYS.map((k) => r?.[k] ?? 0))
    );
    return [0, Math.min(1, maxVal + HEADROOM)];
  }
}

// ===== IRF 資料處理與雙層圖表 ===== //
interface IRFPoint { period: number; irf: number; lower: number; upper: number; sig: boolean; }
function buildIRF(irf: number[], lower: number[], upper: number[]): IRFPoint[] {
  const n = Math.min(irf.length, lower.length, upper.length);
  const rows: IRFPoint[] = [];
  for (let i = 0; i < n; i++) {
    const l = lower[i];
    const u = upper[i];
    const val = irf[i];
    const sig = (l > 0) || (u < 0); // 95% CI 不含 0 即顯著
    rows.push({ period: i + 1, irf: val, lower: l, upper: u, sig });
  }
  return rows;
}
function contiguousSigRanges(data: IRFPoint[]): Array<{ start: number; end: number; pos: boolean }>{
  const out: Array<{ start: number; end: number; pos: boolean }> = [];
  let i = 0;
  while (i < data.length) {
    if (!data[i].sig) { i++; continue; }
    const pos = data[i].irf >= 0;
    let j = i;
    while (j < data.length && data[j].sig && (data[j].irf >= 0) === pos) j++;
    out.push({ start: data[i].period, end: data[j - 1].period, pos });
    i = j;
  }
  return out;
}

const IRF_PROP1 = buildIRF(irf_prop1_irf, irf_prop1_lo, irf_prop1_hi);
const IRF_PROP2 = buildIRF(irf_prop2_irf, irf_prop2_lo, irf_prop2_hi);
const IRF_PROP3 = buildIRF(irf_prop3_irf, irf_prop3_lo, irf_prop3_hi);
const IRF_PAR1  = buildIRF(irf_par1_irf,  irf_par1_lo,  irf_par1_hi);
const IRF_PAR2  = buildIRF(irf_par2_irf,  irf_par2_lo,  irf_par2_hi);

interface IRFDoubleChartProps { title: string; data: IRFPoint[]; }
const IRFDoubleChart: React.FC<IRFDoubleChartProps> = ({ title, data }) => {
  const ranges = useMemo(() => contiguousSigRanges(data), [data]);
  const maxAbs = useMemo(() => Math.max(...data.map(d => Math.abs(d.upper)), ...data.map(d => Math.abs(d.lower))), [data]);
  const yDomain: [number, number] = [-(maxAbs * 1.1), maxAbs * 1.1];
  return (
    <div style={{ background: '#0b1220', border: '1px solid #334155', borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <h4 style={{ color: 'white', textAlign: 'center', marginBottom: 8 }}>{title}</h4>
      {/* 上層：IRF 折線 + 上下界 + 顯著期段陰影 */}
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="period" tick={{ fill: '#d1d5db', fontSize: 11 }} />
          <YAxis domain={yDomain} tick={{ fill: '#d1d5db', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#0b1220', border: '1px solid #334155', color: '#e5e7eb' }} />
          {ranges.map((r, idx) => (
            <ReferenceArea key={idx} x1={r.start} x2={r.end} y1={yDomain[0]} y2={yDomain[1]} fill={r.pos ? '#10b981' : '#ef4444'} fillOpacity={0.08} />
          ))}
          <Line type="monotone" dataKey="lower" stroke="#9ca3af" dot={false} strokeDasharray="4 3" />
          <Line type="monotone" dataKey="upper" stroke="#9ca3af" dot={false} strokeDasharray="4 3" />
          <Line type="monotone" dataKey="irf" stroke="#60a5fa" dot={{ r: 2 }} strokeWidth={2} />
          <ReferenceLine y={0} stroke="#6b7280" />
        </ComposedChart>
      </ResponsiveContainer>
      {/* 下層：顯著性條形圖 */}
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 6, right: 16, left: 8, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="period" tick={{ fill: '#d1d5db', fontSize: 11 }} />
          <YAxis tick={{ fill: '#d1d5db', fontSize: 11 }} domain={yDomain} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#6b7280" />
          <Bar dataKey="irf">
            {data.map((d, i) => (
              <Cell key={i} fill={d.sig ? (d.irf >= 0 ? '#10b981' : '#ef4444') : '#6b7280'} opacity={d.sig ? 0.9 : 0.4} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center', marginTop: 6 }}>上圖：IRF 主線（藍）與 95% 信賴上下界（灰虛線）；綠/紅底代表顯著期段。下圖：以顏色呈現顯著與方向，數值為期別反應。</p>
    </div>
  );
};

// ===================== FEVD 圖表元件 ===================== //
interface FevdChartProps {
  data: any[];
  title: string;
  stacked?: boolean;
  showDataLabels?: boolean;
}

const FevdChart: React.FC<FevdChartProps> = ({ data, title, stacked = true, showDataLabels = false }) => {
  const keys = useMemo(() => SERIES_KEYS, []);
  const yDomain = useMemo(() => computeYDomain(data, stacked), [data, stacked]);

  return (
    <div style={{ backgroundColor: '#1f2937', padding: '24px', borderRadius: '8px', border: "1px solid #4b5563", marginBottom: '24px' }}>
      <h4 style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center', color: '#d1d5db', marginBottom: '16px' }}>{title}</h4>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
          <XAxis dataKey="period" tick={{ fill: '#d1d5db', fontSize: 11 }} />
          <YAxis domain={yDomain} tick={{ fill: '#d1d5db', fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#d1d5db' }} />
          {keys.map((k) => (
            <Bar key={k} dataKey={k} stackId={stacked ? 'a' : undefined} fill={COLMAP[k]}>
              {showDataLabels && (
                <LabelList dataKey={k} position="top" formatter={labelFormatter} style={{ fill: '#e5e7eb', fontSize: 10 }} />
              )}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
      <p style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center', marginTop: 8 }}>Y 軸為貢獻比例（0–1），會依據資料自動給 3% 視覺餘裕。</p>
    </div>
  );
};

// FEVD 表格渲染（保留以利比對）
const FevdTable: React.FC<{ title: string; rows: number[][] }> = ({ title, rows }) => (
  <div style={{ background: '#0b1220', border: '1px solid #334155', borderRadius: 12, padding: 16, marginBottom: 16 }}>
    <h4 style={{ color: '#e5e7eb', fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>{title}</h4>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#d1d5db', fontVariantNumeric: 'tabular-nums' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #334155' }}>期數</th>
            <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #334155' }}>國外假訊息威脅</th>
            <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #334155' }}>社會兩極化</th>
            <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #334155' }}>管制能力</th>
            <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #334155' }}>防衛濫權</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ padding: 8 }}>{i + 1}</td>
              {r.map((v, j) => (
                <td key={j} style={{ padding: 8, textAlign: 'right' }}>{(v * 100).toFixed(1)}%</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ===================== 控制面板 ===================== //
const Panel: React.FC<{
  dataset: string;
  setDataset: (v: string) => void;
  stacked: boolean;
  setStacked: (v: boolean) => void;
  showLabels: boolean;
  setShowLabels: (v: boolean) => void;
}> = ({ dataset, setDataset, stacked, setStacked, showLabels, setShowLabels }) => {
  return (
    <div style={{ background: '#0b1220', border: '1px solid #374151', borderRadius: 12, padding: 16, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#d1d5db' }}>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>資料來源（FEVD 目標）</span>
        <select value={dataset} onChange={(e) => setDataset(e.target.value)} style={{ background: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: 8, padding: '10px 12px' }}>
          <option value="SP">社會兩極化（SP）的變異來源</option>
          <option value="FDT">國外假訊息威脅（FDT）的變異來源</option>
        </select>
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db' }}>
        <input type="checkbox" checked={stacked} onChange={(e) => setStacked(e.target.checked)} />
        <span>堆疊顯示</span>
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#d1d5db' }}>
        <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
        <span>顯示資料標籤（&gt;5%）</span>
      </label>
    </div>
  );
};

// ===================== 主畫面 ===================== //
export default function App() {
  const [dataset, setDataset] = useState<'SP' | 'FDT'>('SP');
  const [stacked, setStacked] = useState(true);
  const [showLabels, setShowLabels] = useState(false);

  const data = dataset === 'SP' ? fevdDataSP : fevdDataFDT;

  // ===================== 內建簡易測試（Dev Tests）===================== //
  useEffect(() => {
    // 1) percent() 輸出
    console.assert(percent(0.1) === '10.0%', 'percent(0.1) 應為 10.0%');
    console.assert(percent(undefined) === '—', 'percent(undefined) 應為 —');

    // 2) labelFormatter 邏輯：嚴格大於 5%
    console.assert(labelFormatter(0.049) === '', 'labelFormatter(0.049) 應為 空字串');
    console.assert(labelFormatter(0.051) === '5.1%', 'labelFormatter(0.051) 應為 5.1%');
    console.assert(labelFormatter(0.05) === '', 'labelFormatter(0.05) 應為 空字串（嚴格大於 5%）');

    // 3) 每期資料總和約等於 1（允許小數誤差）
    const rows = (dataset === 'SP' ? fevdDataSP : fevdDataFDT).slice(0, 5); // 抽樣前 5 期
    rows.forEach((r) => {
      const sum = SERIES_KEYS.reduce((acc, k) => acc + (r as any)[k], 0);
      console.assert(Math.abs(1 - sum) < 0.05, `第 ${r.period} 期合計應約為 1，實得 ${sum}`);
    });

    // 4) yDomain 上限基本測試
    const stackedDomain = computeYDomain(rows as any, true);
    console.assert(stackedDomain[0] === 0 && stackedDomain[1] <= 1, '堆疊模式 yDomain 上限應 <= 1');
    const groupedDomain = computeYDomain(rows as any, false);
    console.assert(groupedDomain[0] === 0 && groupedDomain[1] <= 1, '分組模式 yDomain 上限應 <= 1');

    // 5) FEVD 表格資料行檢查（加總約 1）
    [fevdRC, fevdDAP].forEach((tbl, idx) => {
      tbl.forEach((r, i) => {
        const s = r.reduce((a, b) => a + b, 0);
        console.assert(Math.abs(1 - s) < 0.05, `FEVD-${idx === 0 ? 'RC' : 'DAP'} 第 ${i + 1} 期合計應約為 1，實得 ${s}`);
      });
    });
  }, [dataset]);

  return (
    <div style={{ backgroundColor: '#111827', color: '#d1d5db', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '64px 16px' }}>
        <header style={{ textAlign: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: "2px solid #374151" }}>
          <h1 style={{ fontSize: 48, fontWeight: 'bold', color: 'white', marginBottom: 12 }}>防衛或侵蝕？</h1>
          <p style={{ fontSize: 20, color: '#e5e7eb', marginBottom: 6 }}>數位威權脅迫下的國家能力與社會極化</p>
          <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 6 }}>台灣實證研究 (2000–2024)</p>
          <p style={{ fontSize: 14, color: '#6b7280' }}>潘競恒｜國立中興大學 國家政策與公共事務研究所</p>
        </header>

        {/* ====== 區塊 1：研究背景（收折） ====== */}
        <Accordion title="研究背景" defaultOpen={false}>
          <ul style={{ marginLeft: 18 }}>
            <li>民主政體面臨數位威權的假訊息威脅</li>
            <li>台灣為地緣政治前線，遭受境外假訊息嚴重攻擊</li>
            <li>數位平台成為資訊干預與社會極化溫床</li>
            <li>政府治理面臨「防衛與濫權」張力</li>
            <li>本研究以系統性計量模型填補動態互動與制度回饋研究缺口</li>
          </ul>
        </Accordion>

        {/* ====== 區塊 2：理論架構（收折，含示意圖） ====== */}
        <Accordion title="理論架構" defaultOpen={false}>
          <ResearchFramework />
          <div style={{ marginTop: 12, background: '#0b1220', border: '1px solid #334155', borderRadius: 12, padding: 16 }}>
            <h4 style={{ color: 'white', marginBottom: 8 }}>理論架構補充（PPTX 摘要）</h4>
            <h5 style={{ color: '#d1d5db', margin: '8px 0 4px' }}>國家能力擴張的驅動機制</h5>
            <ul style={{ marginLeft: 18, lineHeight: 1.8 }}>
              <li><strong>外部威脅驅動（Threat-Driven Expansion）</strong>：外部安全競爭為擴張根本動力（Tilly, 1985）；假訊息操作為新型戰爭工具、形塑數位主權（Henschke, 2021）。</li>
              <li><strong>內部極化壓力（Internal Demand）</strong>：情感極化造成治理失靈，增加國家介入需求。</li>
            </ul>
            <h5 style={{ color: '#d1d5db', margin: '12px 0 4px' }}>威脅互動與治理悖論</h5>
            <ul style={{ marginLeft: 18, lineHeight: 1.8 }}>
              <li><strong>共生假說</strong>：外部資訊干預與內部裂痕相互催化。</li>
              <li><strong>工具共生與雙重用途</strong>：RC 工具能處理仇恨言論，也可能壓制異議。</li>
              <li><strong>濫權與惡性循環</strong>：壓制手段引發心理抗拒與逆火效應（Brehm, 1966），防衛濫權侵蝕制度信任，推升社會極化。</li>
            </ul>
          </div>
        </Accordion>

        {/* ====== 區塊 3：研究問題與假設（收折） ====== */}
        <Accordion title="研究問題與假設" defaultOpen={false}>
          <p style={{ marginBottom: 8 }}><strong>核心問題：</strong>FDT、SP、RC、DAP 是否存在長期動態互動結構？</p>
          <ul style={{ marginLeft: 18, lineHeight: 1.9 }}>
            <li><strong style={{ color: '#60a5fa' }}>H1：FDT → RC</strong> 外部威脅驅動管制擴張。</li>
            <li><strong style={{ color: '#60a5fa' }}>H2：RC ↔ DAP</strong> 管制能力與濫權具連動性。</li>
            <li><strong style={{ color: '#60a5fa' }}>H3：DAP → SP</strong> 防衛濫權加劇社會極化。</li>
          </ul>
        </Accordion>

        {/* ====== 區塊 4：關鍵研究發現（完整 FEVD 控制＋圖表） ====== */}
        <section style={{ margin: '24px 0' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', textAlign: 'center', marginBottom: 8 }}>關鍵研究發現</h2>
          <div style={{ color: '#d1d5db', background: '#0b1220', border: '1px solid #334155', borderRadius: 12, padding: 12, marginBottom: 10 }}>
            <strong style={{ color: 'white' }}>重點摘要：</strong>
            <ul style={{ margin: '6px 0 0 18px', lineHeight: 1.7 }}>
              <li><strong>SP（社會兩極化）</strong>：短期主要由<strong>自身衝擊</strong>解釋；中長期<strong>FDT</strong>（假訊息威脅）與<strong>RC</strong>（管制能力）貢獻上升，<strong>DAP</strong>（防衛濫權）影響逐步顯現。</li>
              <li><strong>FDT（假訊息威脅）</strong>：短期<strong>完全由自身</strong>解釋；中期起<strong>SP</strong>（社會兩極化）成為最主要外生來源，其次為<strong>RC</strong>與<strong>DAP</strong>的穩定貢獻。</li>
            </ul>
          </div>
          <Panel
            dataset={dataset}
            setDataset={(v) => setDataset(v as 'SP' | 'FDT')}
            stacked={stacked}
            setStacked={setStacked}
            showLabels={showLabels}
            setShowLabels={setShowLabels}
          />
          <section style={{ margin: '12px 0', padding: 16, background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 'bold', color: 'white', marginBottom: 8, textAlign: 'center' }}>讀圖說明</h3>
            <p style={{ color: '#9ca3af', lineHeight: 1.8, textAlign: 'center' }}>
              「變異分解（FEVD）」顯示某一目標變數未來預測誤差的來源占比。例如選擇「社會兩極化（SP）」時，
              每期柱狀堆疊代表 SP 的預測誤差來自「國外假訊息威脅、社會兩極化自身、管制能力、防衛濫權」四者的比例。
            </p>
          </section>
          {dataset === 'SP' ? (
            <FevdChart data={fevdDataSP} title="FEVD：社會兩極化（SP）的變異來源" stacked={stacked} showDataLabels={showLabels} />
          ) : (
            <FevdChart data={fevdDataFDT} title="FEVD：國外假訊息威脅（FDT）的變異來源" stacked={stacked} showDataLabels={showLabels} />
          )}
        </section>

        {/* ====== 區塊 5：實證圖表（收折） ====== */}
        <Accordion title="實證圖表：FEVD & IRF" defaultOpen={false}>
          <h4 style={{ color: 'white', margin: '8px 0' }}>FEVD（堆疊圖）</h4>
          <FevdChart data={fevdRC_stacked} title="FEVD：管制能力 (RC) 的變異來源" stacked={true} showDataLabels={true} />
          <FevdChart data={fevdDAP_stacked} title="FEVD：防衛濫權 (DAP) 的變異來源" stacked={true} showDataLabels={true} />

          <h4 style={{ color: 'white', margin: '16px 0 8px' }}>IRF 圖（95% Bootstrap CI, 100 runs）</h4>
          <div style={{ display: 'grid', gap: 12 }}>
            <img src="/IRF_Paradox_RC_to_SP.png" alt="延伸發現：管制能力對社會兩極化的響應" style={{ width: '100%', border: '1px solid #334155', borderRadius: 8 }} />
            <img src="/IRF_Paradox_SP_to_FDT.png" alt="延伸發現：社會兩極化對國外假訊息威脅的響應" style={{ width: '100%', border: '1px solid #334155', borderRadius: 8 }} />
            <img src="/IRF_Prop1_FDT_to_RC.png" alt="命題一：國外假訊息威脅對管制能力的響應" style={{ width: '100%', border: '1px solid #334155', borderRadius: 8 }} />
            <img src="/IRF_Prop2_RC_to_DAP.png" alt="命題二：管制能力對防衛濫權的響應" style={{ width: '100%', border: '1px solid #334155', borderRadius: 8 }} />
            <img src="/IRF_Prop3_DAP_to_SP.png" alt="命題三：防衛濫權對社會兩極化的響應" style={{ width: '100%', border: '1px solid #334155', borderRadius: 8 }} />
          </div>

          <h4 style={{ color: 'white', margin: '16px 0 8px' }}>IRF 雙層互動圖（含顯著期段與條形顯著性）</h4>
          <IRFDoubleChart title="命題一：FDT → RC" data={IRF_PROP1} />
          <IRFDoubleChart title="命題二：RC → DAP" data={IRF_PROP2} />
          <IRFDoubleChart title="命題三：DAP → SP" data={IRF_PROP3} />
          <IRFDoubleChart title="延伸發現：RC → SP" data={IRF_PAR1} />
          <IRFDoubleChart title="延伸發現：SP → FDT" data={IRF_PAR2} />
        </Accordion>

        {/* 操作小工具 */}
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
            <li>yDomain 會依堆疊/分組自動加 3% 視覺餘裕。</li>
          </ul>
        </details>

        <footer style={{ textAlign: 'center', paddingTop: 24, marginTop: 32, borderTop: '1px solid #374151', color: '#6b7280', fontSize: 14 }}>
          <p>潘競恒｜國立中興大學 國家政策與公共事務研究所</p>
        </footer>
      </div>

      {/* 列印樣式 */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          a, button { display: none !important; }
          header { border: none !important; }
          details { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
