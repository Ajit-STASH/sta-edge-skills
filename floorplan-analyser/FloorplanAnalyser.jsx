import { useState, useRef, useCallback, useEffect } from "react";

// ─── Electrical icons (20x20 viewBox) ────────────────────────────────────────
const ELEC_ICONS = {
  socket:  { path: "M3 3h14v14H3V3zm2 2v10h10V5H5zm3 2h4v2H8V7zm-1 4h6v2H7v-2z", color: "#f59e0b", label: "Socket" },
  switch:  { path: "M10 2a8 8 0 100 16A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4zm-1 3v6h2V7H9z", color: "#60a5fa", label: "Switch" },
  data:    { path: "M2 5h16v10H2V5zm2 2v6h12V7H4zm2 1h3v1H6V8zm0 2h3v1H6v-1zm5-2h3v1h-3V8zm0 2h3v1h-3v-1z", color: "#34d399", label: "Data" },
  tv:      { path: "M3 4h14v9H3V4zm1 1v7h12V5H4zm-1 9h14v2H3v-2zm5-1v1h4v-1H8z", color: "#a78bfa", label: "TV" },
  light:   { path: "M10 2a5 5 0 015 5c0 2.1-1.3 3.9-3 4.7V13H8v-1.3C6.3 10.9 5 9.1 5 7a5 5 0 015-5zm-2 13h4v1H8v-1zm1 2h2v1H9v-1z", color: "#fcd34d", label: "Light" },
  usb:     { path: "M8 2h4v2H8V2zm-1 2h6v2H7V4zm-2 2h10v2H5V6zm1 2h8v6H6V8zm2 1v4h4V9H8z", color: "#fb923c", label: "USB" },
  special: { path: "M10 2l2.4 5 5.6.8-4 3.9.9 5.5L10 14.5l-4.9 2.7.9-5.5L2 7.8l5.6-.8L10 2z", color: "#f87171", label: "Special" },
};

// ─── Lighting fixture icons (20x20 viewBox) ───────────────────────────────────
const LIGHT_ICONS = {
  downlight:  {
    color: "#fef3c7", border: "#f59e0b",
    label: "Downlight / Spot",
    draw: (ctx, cx, cy, S) => {
      ctx.beginPath(); ctx.arc(cx, cy, S/2, 0, Math.PI*2);
      ctx.fillStyle="#fef3c7"; ctx.fill();
      ctx.strokeStyle="#f59e0b"; ctx.lineWidth=1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, S/5, 0, Math.PI*2);
      ctx.fillStyle="#f59e0b"; ctx.fill();
    },
    svg: (S) => `<circle r="${S/2}" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/><circle r="${S/5}" fill="#f59e0b"/>`,
  },
  wall_light: {
    color: "#fde68a", border: "#d97706",
    label: "Wall Light",
    draw: (ctx, cx, cy, S) => {
      ctx.fillStyle="#fde68a"; ctx.strokeStyle="#d97706"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy-S/2); ctx.lineTo(cx+S/2, cy); ctx.lineTo(cx, cy+S/2); ctx.lineTo(cx-S/4, cy); ctx.closePath();
      ctx.fill(); ctx.stroke();
    },
    svg: (S) => `<polygon points="0,${-S/2} ${S/2},0 0,${S/2} ${-S/4},0" fill="#fde68a" stroke="#d97706" stroke-width="1.5"/>`,
  },
  pendant:    {
    color: "#e0f2fe", border: "#0284c7",
    label: "Pendant",
    draw: (ctx, cx, cy, S) => {
      ctx.strokeStyle="#0284c7"; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(cx, cy-S/2); ctx.lineTo(cx, cy-S/6); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy+S/6, S/3, 0, Math.PI*2);
      ctx.fillStyle="#e0f2fe"; ctx.fill(); ctx.strokeStyle="#0284c7"; ctx.lineWidth=1.5; ctx.stroke();
    },
    svg: (S) => `<line x1="0" y1="${-S/2}" x2="0" y2="${-S/6}" stroke="#0284c7" stroke-width="1.2"/><circle cy="${S/6}" r="${S/3}" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>`,
  },
  strip:      {
    color: "#d1fae5", border: "#10b981",
    label: "LED Strip",
    draw: (ctx, cx, cy, S) => {
      ctx.fillStyle="#d1fae5"; ctx.strokeStyle="#10b981"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.roundRect(cx-S/2, cy-S/5, S, S*0.4, 3); ctx.fill(); ctx.stroke();
      for(let i=0;i<4;i++){
        ctx.beginPath(); ctx.arc(cx-S/2+S/8+i*(S/4), cy, S/10, 0, Math.PI*2);
        ctx.fillStyle="#10b981"; ctx.fill();
      }
    },
    svg: (S) => `<rect x="${-S/2}" y="${-S/5}" width="${S}" height="${S*0.4}" rx="3" fill="#d1fae5" stroke="#10b981" stroke-width="1.5"/>`,
  },
  floor_lamp: {
    color: "#ede9fe", border: "#7c3aed",
    label: "Floor Lamp",
    draw: (ctx, cx, cy, S) => {
      ctx.strokeStyle="#7c3aed"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy+S/2); ctx.lineTo(cx, cy-S/4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-S/3, cy-S/4); ctx.lineTo(cx+S/3, cy-S/4); ctx.lineTo(cx+S/5, cy-S/2); ctx.lineTo(cx-S/5, cy-S/2); ctx.closePath();
      ctx.fillStyle="#ede9fe"; ctx.fill(); ctx.strokeStyle="#7c3aed"; ctx.stroke();
    },
    svg: (S) => `<line x1="0" y1="${S/2}" x2="0" y2="${-S/4}" stroke="#7c3aed" stroke-width="1.5"/><polygon points="${-S/3},${-S/4} ${S/3},${-S/4} ${S/5},${-S/2} ${-S/5},${-S/2}" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>`,
  },
  accent:     {
    color: "#fce7f3", border: "#db2777",
    label: "Accent / Picture",
    draw: (ctx, cx, cy, S) => {
      ctx.beginPath(); ctx.arc(cx, cy, S/2, 0, Math.PI*2);
      ctx.fillStyle="#fce7f3"; ctx.fill();
      ctx.strokeStyle="#db2777"; ctx.lineWidth=1.5; ctx.stroke();
      ctx.strokeStyle="#db2777"; ctx.lineWidth=1.2;
      for(let a=0;a<6;a++){
        const angle=a*Math.PI/3;
        ctx.beginPath(); ctx.moveTo(cx+Math.cos(angle)*S/5, cy+Math.sin(angle)*S/5);
        ctx.lineTo(cx+Math.cos(angle)*S/2.2, cy+Math.sin(angle)*S/2.2); ctx.stroke();
      }
    },
    svg: (S) => `<circle r="${S/2}" fill="#fce7f3" stroke="#db2777" stroke-width="1.5"/>`,
  },
  cove:       {
    color: "#fef9c3", border: "#ca8a04",
    label: "Cove / Coffer",
    draw: (ctx, cx, cy, S) => {
      ctx.strokeStyle="#ca8a04"; ctx.lineWidth=2; ctx.setLineDash([3,2]);
      ctx.beginPath(); ctx.arc(cx, cy, S/2.2, 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
    },
    svg: (S) => `<circle r="${S/2.2}" fill="none" stroke="#ca8a04" stroke-width="2" stroke-dasharray="3,2"/>`,
  },
  emergency:  {
    color: "#fee2e2", border: "#dc2626",
    label: "Emergency",
    draw: (ctx, cx, cy, S) => {
      ctx.fillStyle="#fee2e2"; ctx.strokeStyle="#dc2626"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy-S/2); ctx.lineTo(cx+S/2, cy+S/2); ctx.lineTo(cx-S/2, cy+S/2); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle="#dc2626"; ctx.font=`bold ${S*0.5}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillText("!", cx, cy+S/8);
    },
    svg: (S) => `<polygon points="0,${-S/2} ${S/2},${S/2} ${-S/2},${S/2}" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>`,
  },
};

const INCLUSION_LABELS = {
  sockets:"Sockets", switches:"Light Switches", data:"Data Points",
  tv:"TV Points", lights:"Light Circuits", usb:"USB Outlets",
  ev:"EV Charger", cooker:"Cooker/Oven Ccts", bathroom:"Bathroom", consumer_unit:"CU Estimate",
};
const DEFAULT_INCLUSIONS = {
  sockets:true, switches:true, data:true, tv:true,
  lights:true, usb:true, ev:false, cooker:false, bathroom:true, consumer_unit:true,
};
const LIGHTING_STYLES = {
  luxury:     "Luxury residential — layered lighting, feature pieces, accent lighting, warm 2700K, high CRI ≥90",
  contemporary:"Contemporary — clean recessed downlights, architectural coves, statement pendants",
  traditional: "Traditional — decorative pendants, wall lights, table lamp positions, warm tones",
  commercial:  "Commercial/office — functional task lighting, even illuminance, daylight CCT",
  hospitality: "Hospitality/hotel — mood lighting, dimmable layers, warm ambient with accent",
};
const STEPS = ["Processing plan...","Identifying rooms...","Estimating points...","Placing fixtures...","Generating report..."];
const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// ─── CSS ─────────────────────────────────────────────────────────────────────
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --o:#d97706;--ob:#f59e0b;--od:#92400e;
    --d:#0a0a0a;--d2:#111;--d3:#1a1a1a;--d4:#242424;
    --b:#2a2a2a;--b2:#333;--t:#e8e8e8;--td:#888;--tdd:#555;
    --g:#22c55e;--r:#ef4444;--p:#a78bfa;
    --mono:'DM Mono',monospace;--sans:'Syne',sans-serif;
  }
  body{background:var(--d);color:var(--t);font-family:var(--sans)}
  .app{min-height:100vh;display:flex;flex-direction:column;background:var(--d);background-image:radial-gradient(ellipse at 20% 0%,rgba(217,119,6,.06) 0%,transparent 60%)}
  .hdr{padding:18px 28px;border-bottom:1px solid var(--b);display:flex;align-items:center;gap:12px;background:rgba(10,10,10,.9);backdrop-filter:blur(10px);position:sticky;top:0;z-index:20}
  .logo{width:30px;height:30px;background:var(--o);clip-path:polygon(0 0,100% 0,100% 70%,70% 100%,0 100%);flex-shrink:0}
  .hdr h1{font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;line-height:1}
  .hdr p{font-size:10px;color:var(--td);font-family:var(--mono);margin-top:2px}
  .badge{margin-left:auto;font-family:var(--mono);font-size:10px;color:var(--o);border:1px solid var(--od);padding:3px 10px;letter-spacing:.1em}
  .main{flex:1;padding:28px;max-width:1400px;margin:0 auto;width:100%}

  .dz{border:1.5px dashed var(--b2);background:var(--d2);padding:56px 40px;text-align:center;transition:all .2s;position:relative;overflow:hidden}
  .dz::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 100%,rgba(217,119,6,.04) 0%,transparent 70%);pointer-events:none}
  .dz:hover,.dz.drag{border-color:var(--o);background:var(--d3)}
  .dz-icon{width:44px;height:44px;margin:0 auto 14px;color:var(--o);opacity:.7}
  .dz h2{font-size:17px;font-weight:700;margin-bottom:6px}
  .dz p{font-family:var(--mono);font-size:12px;color:var(--td);margin-bottom:22px}
  .fil-lbl{display:inline-block;background:var(--o);color:#000;font-family:var(--sans);font-weight:700;font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:9px 22px;cursor:pointer}
  .fil-lbl input[type=file]{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;clip:rect(0,0,0,0)}
  .dz-fmt{margin-top:18px;font-family:var(--mono);font-size:10px;color:var(--tdd);letter-spacing:.05em}

  .pdf-spin{background:var(--d2);border:1px solid var(--b);padding:36px;text-align:center;margin-bottom:16px}
  .pdf-spin p{font-family:var(--mono);font-size:12px;color:var(--td);margin-top:10px}
  .pdf-pg{background:var(--d2);border:1px solid var(--b);padding:18px;margin-bottom:18px}
  .pdf-info{font-family:var(--mono);font-size:11px;color:var(--td);margin-bottom:10px}
  .pdf-info span{color:var(--o)}
  .pg-grid{display:flex;gap:8px;flex-wrap:wrap}
  .pg-th{border:1.5px solid var(--b2);background:var(--d3);cursor:pointer;transition:all .15s;position:relative;overflow:hidden;flex-shrink:0}
  .pg-th:hover{border-color:var(--od)}.pg-th.sel{border-color:var(--o)}
  .pg-lbl{font-family:var(--mono);font-size:9px;color:var(--td);text-align:center;padding:3px;background:var(--d4);border-top:1px solid var(--b)}
  .pg-th.sel .pg-lbl{color:var(--o)}
  .pg-chk{position:absolute;top:3px;right:3px;width:14px;height:14px;background:var(--o);display:flex;align-items:center;justify-content:center;font-size:8px;color:#000;font-weight:700;opacity:0;transition:opacity .15s}
  .pg-th.sel .pg-chk{opacity:1}

  .up-grid{display:grid;grid-template-columns:1fr 320px;gap:18px;margin-bottom:22px}
  @media(max-width:780px){.up-grid{grid-template-columns:1fr}}
  .plan-wrap{background:var(--d2);border:1px solid var(--b);overflow:hidden;position:relative}
  .plan-lbl{position:absolute;top:10px;left:10px;font-family:var(--mono);font-size:10px;background:rgba(0,0,0,.85);color:var(--o);padding:3px 9px;letter-spacing:.08em;border:1px solid var(--od);z-index:5}
  .ctrl{background:var(--d2);border:1px solid var(--b);padding:20px;display:flex;flex-direction:column;gap:16px;overflow-y:auto;max-height:680px}
  .ctrl h3{font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--td);margin-bottom:8px;font-family:var(--mono)}
  .mode-tabs{display:flex;gap:0;border:1px solid var(--b2)}
  .mode-tab{flex:1;font-family:var(--mono);font-size:11px;color:var(--td);padding:7px;cursor:pointer;text-align:center;letter-spacing:.05em;transition:all .15s;border:none;background:var(--d3)}
  .mode-tab:hover{color:var(--t)}
  .mode-tab.on{background:var(--o);color:#000;font-weight:600}
  .tog-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px}
  .tog{display:flex;align-items:center;gap:7px;cursor:pointer;padding:5px 7px;border:1px solid var(--b);transition:all .15s;background:var(--d3)}
  .tog:hover{border-color:var(--od)}.tog.on{border-color:var(--o);background:rgba(217,119,6,.08)}
  .tog-dot{width:7px;height:7px;background:var(--b2);flex-shrink:0;transition:background .15s}
  .tog.on .tog-dot{background:var(--o)}
  .tog span{font-family:var(--mono);font-size:11px;color:var(--td);transition:color .15s}
  .tog.on span{color:var(--t)}
  select.std{background:var(--d3);border:1px solid var(--b2);color:var(--t);font-family:var(--mono);font-size:12px;padding:7px 9px;width:100%;outline:none;cursor:pointer}
  select.std:focus{border-color:var(--o)}
  textarea.nt{background:var(--d3);border:1px solid var(--b2);color:var(--t);font-family:var(--mono);font-size:11px;padding:7px 9px;width:100%;resize:none;height:60px;outline:none;line-height:1.5}
  textarea.nt:focus{border-color:var(--o)}
  textarea.nt::placeholder{color:var(--tdd)}
  .ana-btn{background:var(--o);color:#000;font-family:var(--sans);font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;padding:12px;cursor:pointer;border:none;width:100%;transition:all .15s;margin-top:auto}
  .ana-btn:hover:not(:disabled){background:var(--ob)}
  .ana-btn:disabled{opacity:.4;cursor:not-allowed}
  .rst-btn{background:transparent;color:var(--td);font-family:var(--mono);font-size:11px;border:1px solid var(--b);padding:7px;cursor:pointer;width:100%;transition:all .15s;letter-spacing:.05em}
  .rst-btn:hover{border-color:var(--td);color:var(--t)}

  .spin-block{background:var(--d2);border:1px solid var(--b);padding:56px 40px;text-align:center}
  .ring{width:44px;height:44px;border:2px solid var(--b2);border-top-color:var(--o);border-radius:50%;margin:0 auto 18px;animation:spin .8s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin-block h3{font-size:15px;font-weight:700;margin-bottom:5px}
  .spin-block p{font-family:var(--mono);font-size:12px;color:var(--td)}
  .steps{margin-top:20px;display:flex;flex-direction:column;gap:5px;align-items:center}
  .step{font-family:var(--mono);font-size:11px;color:var(--tdd);display:flex;align-items:center;gap:7px}
  .step.act{color:var(--o)}.step.done{color:var(--g)}
  .sd{width:5px;height:5px;flex-shrink:0}
  .sd.act{background:var(--o);animation:pulse 1s infinite}
  .sd.done{background:var(--g)}.sd.idle{background:var(--b2)}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

  .err-block{background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.3);padding:28px;text-align:center}
  .err-block h3{color:var(--r);margin-bottom:7px;font-size:15px}
  .err-block p{color:var(--td);font-family:var(--mono);font-size:12px}

  .res-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:10px}
  .res-title{font-size:19px;font-weight:800;display:flex;align-items:center;gap:9px}
  .acts{display:flex;gap:7px;flex-wrap:wrap}
  .act-btn{background:var(--d3);border:1px solid var(--b2);color:var(--td);font-family:var(--mono);font-size:11px;padding:6px 12px;cursor:pointer;transition:all .15s;letter-spacing:.05em}
  .act-btn:hover{border-color:var(--o);color:var(--o)}
  .act-btn.pri{background:var(--o);color:#000;border-color:var(--o);font-weight:600}
  .act-btn.pri:hover{background:var(--ob)}

  .sum-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;margin-bottom:24px}
  .sum-card{background:var(--d2);border:1px solid var(--b);padding:14px;position:relative;overflow:hidden}
  .sum-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--o);transform:scaleX(0);transform-origin:left;transition:transform .3s}
  .sum-card:hover::after{transform:scaleX(1)}
  .card-n{font-size:26px;font-weight:800;color:var(--o);line-height:1;font-family:var(--mono);margin-bottom:3px}
  .card-l{font-size:10px;color:var(--td);font-family:var(--mono);letter-spacing:.06em;text-transform:uppercase}
  .card-sub{font-size:10px;color:var(--tdd);font-family:var(--mono);margin-top:2px}

  .sec{font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--td);margin-bottom:10px;font-family:var(--mono);display:flex;align-items:center;gap:7px}
  .sec::after{content:'';flex:1;height:1px;background:var(--b)}
  .tbl-wrap{overflow-x:auto;margin-bottom:24px}
  table{width:100%;border-collapse:collapse;font-family:var(--mono);font-size:12px}
  th{text-align:left;padding:9px 12px;background:var(--d3);border:1px solid var(--b);color:var(--td);font-size:10px;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
  td{padding:9px 12px;border:1px solid var(--b);color:var(--t);vertical-align:top;background:var(--d2);transition:background .1s}
  tr:hover td{background:var(--d3)}
  td.n{color:var(--o);font-weight:500;text-align:center}
  td.rn{font-weight:600}
  td.z{color:var(--tdd);text-align:center}
  td.lt{color:var(--p);font-family:var(--mono);font-size:11px}

  .nb{background:var(--d2);border:1px solid var(--b);border-left:3px solid var(--o);padding:18px 22px;margin-bottom:24px}
  .nb h4{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--o);font-family:var(--mono);margin-bottom:10px}
  .nl{list-style:none;display:flex;flex-direction:column;gap:5px}
  .nl li{font-family:var(--mono);font-size:12px;color:var(--td);display:flex;gap:9px;line-height:1.5}
  .nl li::before{content:'→';color:var(--o);flex-shrink:0}
  .wb{background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.3);border-left:3px solid var(--r);padding:14px 18px;margin-bottom:24px}
  .wb h4{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--r);font-family:var(--mono);margin-bottom:9px}
  .wl{list-style:none;display:flex;flex-direction:column;gap:4px}
  .wl li{font-family:var(--mono);font-size:12px;color:#fca5a5;display:flex;gap:9px}
  .wl li::before{content:'⚠';flex-shrink:0}

  .cf{display:inline-block;font-size:9px;font-family:var(--mono);padding:2px 7px;letter-spacing:.06em;text-transform:uppercase}
  .cf-h{background:rgba(34,197,94,.15);color:var(--g)}
  .cf-m{background:rgba(217,119,6,.15);color:var(--o)}
  .cf-l{background:rgba(239,68,68,.15);color:var(--r)}

  .ann-wrap{position:relative;display:block;width:100%}
  .ann-wrap img,.ann-wrap canvas{display:block;width:100%}
  .ann-svg{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}
  .icon-g{cursor:default;pointer-events:all}
  .icon-g:hover .tip{opacity:1}
  .tip{opacity:0;transition:opacity .15s;pointer-events:none}

  .legend{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
  .leg{display:flex;align-items:center;gap:5px;font-family:var(--mono);font-size:11px;color:var(--td);cursor:pointer;padding:4px 8px;border:1px solid var(--b);transition:all .15s}
  .leg:hover{border-color:var(--b2)}.leg.off{opacity:.3}
  .leg-dot{width:10px;height:10px;border-radius:2px;flex-shrink:0}

  .tabs{display:flex;gap:0;margin-bottom:20px;border-bottom:1px solid var(--b)}
  .tab{font-family:var(--mono);font-size:11px;color:var(--td);padding:9px 16px;cursor:pointer;letter-spacing:.06em;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .15s;white-space:nowrap}
  .tab:hover{color:var(--t)}
  .tab.on{color:var(--o);border-bottom-color:var(--o)}

  .circuit-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-bottom:24px}
  .circuit-card{background:var(--d2);border:1px solid var(--b);padding:16px}
  .circuit-card h4{font-family:var(--mono);font-size:11px;color:var(--o);letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px}
  .circuit-card ul{list-style:none;display:flex;flex-direction:column;gap:4px}
  .circuit-card li{font-family:var(--mono);font-size:11px;color:var(--td);display:flex;justify-content:space-between;gap:12px}
  .circuit-card li span{color:var(--t)}
  .circuit-tag{font-size:9px;background:rgba(167,139,250,.15);color:var(--p);padding:2px 6px;border:1px solid rgba(167,139,250,.3);white-space:nowrap}

  .ftr{padding:14px 28px;border-top:1px solid var(--b);display:flex;align-items:center;justify-content:space-between}
  .ftr p{font-family:var(--mono);font-size:10px;color:var(--tdd);letter-spacing:.05em}
  .ftr span{color:var(--o)}
`;

// ─── PDF helpers ──────────────────────────────────────────────────────────────
function usePdfJs() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.pdfjsLib) { setReady(true); return; }
    const s = document.createElement("script");
    s.src = PDFJS_CDN;
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER; setReady(true); };
    document.head.appendChild(s);
  }, []);
  return ready;
}
async function renderPage(pdfDoc, pageNum, scale) {
  const page = await pdfDoc.getPage(pageNum);
  const vp = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = vp.width; canvas.height = vp.height;
  await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
  return canvas;
}
function PdfCanvas({ canvas, style, onSize }) {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current || !canvas) return;
    ref.current.width = canvas.width; ref.current.height = canvas.height;
    ref.current.getContext("2d").drawImage(canvas, 0, 0);
    if (onSize) onSize({ w: ref.current.offsetWidth, h: ref.current.offsetHeight });
  }, [canvas]);
  return <canvas ref={ref} style={style} />;
}

// ─── SVG icon renderer ────────────────────────────────────────────────────────
function PlacedIcon({ type, x, y, W, H, isLight }) {
  const icons = isLight ? LIGHT_ICONS : ELEC_ICONS;
  const icon = icons[type] || (isLight ? LIGHT_ICONS.downlight : ELEC_ICONS.special);
  const cx = (x / 100) * W;
  const cy = (y / 100) * H;
  const S = Math.max(14, Math.min(22, W / 60));

  if (isLight) {
    return (
      <g className="icon-g" transform={`translate(${cx},${cy})`}>
        <circle r={S/2+1} fill="rgba(0,0,0,0.5)"/>
        <dangerouslySetInnerHTML={{ __html: icon.svg(S) }} />
        <g className="tip" transform={`translate(0,${-S-8})`}>
          <rect x="-28" y="-10" width="56" height="14" rx="3" fill="rgba(0,0,0,0.85)"/>
          <text textAnchor="middle" y="1" fontSize="8" fill="#fff" fontFamily="monospace">{icon.label}</text>
        </g>
      </g>
    );
  }
  const ei = ELEC_ICONS[type] || ELEC_ICONS.special;
  return (
    <g className="icon-g" transform={`translate(${cx - S/2},${cy - S/2})`}>
      <rect width={S} height={S} rx="2" fill={ei.color} fillOpacity="0.92" stroke="#000" strokeWidth="0.8"/>
      <svg viewBox="0 0 20 20" width={S} height={S}><path d={ei.path} fill="#000" fillOpacity="0.85"/></svg>
      <g className="tip" transform={`translate(${S/2},-18)`}>
        <rect x="-24" y="-9" width="48" height="13" rx="2" fill="rgba(0,0,0,0.85)"/>
        <text textAnchor="middle" y="0" fontSize="8" fill="#fff" fontFamily="monospace">{ei.label}</text>
      </g>
    </g>
  );
}

// ─── Light icon SVG (use foreignObject trick for dynamic SVG paths) ────────────
function LightSvgIcon({ type, cx, cy, S }) {
  const icon = LIGHT_ICONS[type] || LIGHT_ICONS.downlight;
  // Render each type directly
  if (type === "downlight") return (
    <g transform={`translate(${cx},${cy})`} className="icon-g">
      <circle r={S/2+1} fill="rgba(0,0,0,0.5)"/>
      <circle r={S/2} fill={icon.color} stroke={icon.border} strokeWidth="1.5"/>
      <circle r={S/5} fill={icon.border}/>
    </g>
  );
  if (type === "wall_light") return (
    <g transform={`translate(${cx},${cy})`} className="icon-g">
      <circle r={S/2+1} fill="rgba(0,0,0,0.5)"/>
      <polygon points={`0,${-S/2} ${S/2},0 0,${S/2} ${-S/4},0`} fill={icon.color} stroke={icon.border} strokeWidth="1.5"/>
    </g>
  );
  if (type === "pendant") return (
    <g transform={`translate(${cx},${cy})`} className="icon-g">
      <circle r={S/2+1} fill="rgba(0,0,0,0.5)"/>
      <line x1="0" y1={-S/2} x2="0" y2={-S/6} stroke={icon.border} strokeWidth="1.2"/>
      <circle cy={S/6} r={S/3} fill={icon.color} stroke={icon.border} strokeWidth="1.5"/>
    </g>
  );
  if (type === "strip") return (
    <g transform={`translate(${cx},${cy})`} className="icon-g">
      <circle r={S/2+1} fill="rgba(0,0,0,0.5)"/>
      <rect x={-S/2} y={-S/5} width={S} height={S*0.4} rx="3" fill={icon.color} stroke={icon.border} strokeWidth="1.5"/>
    </g>
  );
  if (type === "floor_lamp") return (
    <g transform={`translate(${cx},${cy})`} className="icon-g">
      <circle r={S/2+1} fill="rgba(0,0,0,0.5)"/>
      <line x1="0" y1={S/2} x2="0" y2={-S/4} stroke={icon.border} strokeWidth="1.5"/>
      <polygon points={`${-S/3},${-S/4} ${S/3},${-S/4} ${S/5},${-S/2} ${-S/5},${-S/2}`} fill={icon.color} stroke={icon.border} strokeWidth="1.5"/>
    </g>
  );
  if (type === "accent") return (
    <g transform={`translate(${cx},${cy})`} className="icon-g">
      <circle r={S/2+1} fill="rgba(0,0,0,0.5)"/>
      <circle r={S/2} fill={icon.color} stroke={icon.border} strokeWidth="1.5"/>
      {[0,1,2,3,4,5].map(i=>{
        const a = i*Math.PI/3;
        return <line key={i} x1={Math.cos(a)*S/5} y1={Math.sin(a)*S/5} x2={Math.cos(a)*S/2.2} y2={Math.sin(a)*S/2.2} stroke={icon.border} strokeWidth="1.2"/>;
      })}
    </g>
  );
  if (type === "cove") return (
    <g transform={`translate(${cx},${cy})`} className="icon-g">
      <circle r={S/2+1} fill="rgba(0,0,0,0.5)"/>
      <circle r={S/2.2} fill="none" stroke={icon.border} strokeWidth="2" strokeDasharray="3,2"/>
    </g>
  );
  if (type === "emergency") return (
    <g transform={`translate(${cx},${cy})`} className="icon-g">
      <circle r={S/2+1} fill="rgba(0,0,0,0.5)"/>
      <polygon points={`0,${-S/2} ${S/2},${S/2} ${-S/2},${S/2}`} fill={icon.color} stroke={icon.border} strokeWidth="1.5"/>
      <text textAnchor="middle" y={S/4} fontSize={S*0.5} fill={icon.border} fontWeight="bold">!</text>
    </g>
  );
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FloorplanAnalyser() {
  const pdfReady = usePdfJs();
  const planRef = useRef();

  // file
  const [fileType, setFileType] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageB64, setImageB64] = useState(null);
  const [pdfPages, setPdfPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(0);
  const [pdfConverting, setPdfConverting] = useState(false);
  const [dragging, setDragging] = useState(false);

  // mode: "electrical" | "lighting" | "both"
  const [mode, setMode] = useState("both");
  const [inclusions, setInclusions] = useState(DEFAULT_INCLUSIONS);
  const [standard, setStandard] = useState("uk_domestic");
  const [lightingStyle, setLightingStyle] = useState("luxury");
  const [notes, setNotes] = useState("");

  // results
  const [status, setStatus] = useState("idle");
  const [elecResults, setElecResults] = useState(null);
  const [lightResults, setLightResults] = useState(null);
  const [elecPlacements, setElecPlacements] = useState(null);
  const [lightPlacements, setLightPlacements] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loadStep, setLoadStep] = useState(0);
  const [activeTab, setActiveTab] = useState("lighting_plan");
  const [hiddenTypes, setHiddenTypes] = useState({});
  const [planDims, setPlanDims] = useState({ w: 800, h: 600 });

  useEffect(() => {
    if (!planRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setPlanDims({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(planRef.current);
    return () => ro.disconnect();
  }, [status]);

  const handleImageFile = useCallback((file) => {
    setImagePreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = e => setImageB64(e.target.result.split(",")[1]);
    reader.readAsDataURL(file);
    setFileType("image");
  }, []);

  const handlePdfFile = useCallback(async (file) => {
    if (!pdfReady) { alert("PDF engine loading, please try again."); return; }
    setPdfConverting(true); setFileType("pdf");
    try {
      const buf = await file.arrayBuffer();
      const doc = await window.pdfjsLib.getDocument({ data: buf }).promise;
      const pages = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const full = await renderPage(doc, i, 1.5);
        const thumb = await renderPage(doc, i, 0.22);
        pages.push({ full, thumb, b64: full.toDataURL("image/png").split(",")[1], pageNum: i });
      }
      setPdfPages(pages); setSelectedPage(0); setImageB64(pages[0].b64);
    } catch (e) { alert("Failed to read PDF: " + e.message); setFileType(null); }
    setPdfConverting(false);
  }, [pdfReady]);

  const handleFile = useCallback((file) => {
    if (!file) return;
    setElecResults(null); setLightResults(null);
    setElecPlacements(null); setLightPlacements(null);
    setStatus("idle"); setErrorMsg("");
    if (file.type === "application/pdf" || file.name?.endsWith(".pdf")) handlePdfFile(file);
    else handleImageFile(file);
  }, [handlePdfFile, handleImageFile]);

  const selectPage = (idx) => {
    setSelectedPage(idx); setImageB64(pdfPages[idx].b64);
    setElecResults(null); setLightResults(null);
    setElecPlacements(null); setLightPlacements(null); setStatus("idle");
  };

  // ─── API helper ──────────────────────────────────────────────────────────────
  async function callAPI(prompt) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 8000,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: "image/png", data: imageB64 } },
          { type: "text", text: prompt }
        ]}]
      })
    });
    const data = await res.json();
    if (data.stop_reason === "max_tokens") throw new Error("Plan too complex — try scoping to one area in notes.");
    const raw = data?.content?.[0]?.text || "";
    try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
    catch { throw new Error(raw.includes('"rooms"') && !raw.trimEnd().endsWith('}') ? "Response truncated. Try scoping to one floor." : "Parse error: " + raw.slice(0, 200)); }
  }

  // ─── Analyse ─────────────────────────────────────────────────────────────────
  const analyse = async () => {
    if (!imageB64) return;
    setStatus("loading"); setLoadStep(0);
    setElecResults(null); setLightResults(null);
    setElecPlacements(null); setLightPlacements(null); setErrorMsg("");

    const stepTimer = setInterval(() => setLoadStep(s => Math.min(s + 1, STEPS.length - 1)), 1400);
    const pageNote = fileType === "pdf" && pdfPages.length > 1 ? `Page ${selectedPage+1} of ${pdfPages.length}. ` : "";
    const stdLabel = { uk_domestic:"UK domestic BS 7671 18th Edition", uk_commercial:"UK commercial BS 7671", eu_domestic:"EU domestic" }[standard];
    const activeItems = Object.entries(inclusions).filter(([,v])=>v).map(([k])=>INCLUSION_LABELS[k]).join(", ");

    try {
      // ── Electrical schedule ──
      if (mode !== "lighting") {
        setLoadStep(1);
        const elec = await callAPI(`Expert UK electrical estimator. ${pageNote}Standard:${stdLabel}. Estimate:${activeItems}.${notes?` Notes:${notes}`:""}
Rules: sockets=double sockets per 18thEd; switches=per circuit zone; data=Cat6; tv=coax/HDMI; EV if garage; cooker 45A if kitchen; bathroom=shaver+extractor; CU=circuits+25% spare. Max 3 assumptions/warnings, notes<8 words.
ONLY compact minified JSON:
{"property_type":string,"floors_detected":number,"confidence":"high"|"medium"|"low","rooms":[{"name":string,"floor":string,"area_estimate":string,"sockets":number,"switches":number,"data_points":number,"tv_points":number,"light_circuits":number,"usb_outlets":number,"special_circuits":[string],"notes":string}],"totals":{"sockets":number,"switches":number,"data_points":number,"tv_points":number,"light_circuits":number,"usb_outlets":number,"special_circuits":number,"consumer_unit_ways":number},"assumptions":[string],"warnings":[string]}`);
        setElecResults(elec);

        setLoadStep(2);
        const elecP = await callAPI(`Place electrical icons on this floor plan. Rooms: ${elec.rooms.map(r=>r.name).join(", ")}.
For each room place realistic wall-position icons: sockets near worktops/walls, switches near doors, data near desk areas.
x=0 left x=100 right y=0 top y=100 bottom (% of image). Place multiple icons per room spread around perimeter.
ONLY compact minified JSON:
{"icons":[{"room":string,"type":"socket"|"switch"|"data"|"tv"|"light"|"usb"|"special","x":number,"y":number}]}`);
        setElecPlacements(elecP);
      }

      // ── Lighting design ──
      if (mode !== "electrical") {
        setLoadStep(3);
        const styleDesc = LIGHTING_STYLES[lightingStyle] || lightingStyle;
        const light = await callAPI(`You are a professional lighting designer. ${pageNote}Analyse this floor plan and produce a professional lighting design.
Style: ${styleDesc}.${notes?` Client notes: ${notes}`:""}

For each room design a layered lighting scheme:
- AMBIENT: primary general illumination (downlights, ceiling fixtures)
- TASK: functional lighting (kitchen worktop, desk, bathroom vanity)
- ACCENT: decorative/feature lighting (wall wash, picture lights, cove, shelving)
- DECORATIVE: statement pieces (pendants, floor lamps, table lamp positions)

For each fixture specify: type, quantity, suggested spec (wattage, CCT, CRI), dimmable Y/N, circuit group.
Circuit groups: group logically for scene control (e.g. "Ambient", "Accent", "Feature").
This is for Lutron Homeworks QSX/RadioRA3 system — maximise dimmable circuits.

ONLY compact minified JSON:
{"property_type":string,"lighting_style":string,"rooms":[{"name":string,"floor":string,"layers":{"ambient":{"fixture_type":string,"qty":number,"spec":string,"dimmable":boolean,"notes":string},"task":{"fixture_type":string,"qty":number,"spec":string,"dimmable":boolean,"notes":string},"accent":{"fixture_type":string,"qty":number,"spec":string,"dimmable":boolean,"notes":string},"decorative":{"fixture_type":string,"qty":number,"spec":string,"dimmable":boolean,"notes":string}},"circuit_groups":[{"name":string,"fixtures":string,"lutron_circuit":boolean}],"design_notes":string}],"totals":{"total_fixtures":number,"dimmable_circuits":number,"switched_circuits":number,"total_circuits":number},"design_rationale":string,"lutron_notes":string}`);
        setLightResults(light);

        setLoadStep(4);
        const lightP = await callAPI(`Place lighting fixture icons on this floor plan. Rooms: ${light.rooms.map(r=>r.name).join(", ")}.
For each room place fixture icons at realistic ceiling/wall positions.
Types: "downlight"=recessed ceiling spot, "wall_light"=wall mounted, "pendant"=hanging, "strip"=LED strip/cove, "floor_lamp"=floor standing, "accent"=picture/accent spot, "cove"=cove/coffer lighting, "emergency"=emergency light.
Place downlights in grid patterns. Wall lights on walls. Pendants centred over tables/islands. Strips along cove lines.
x=0 left x=100 right y=0 top y=100 bottom (% of image). Place all fixtures accurately within room boundaries.
ONLY compact minified JSON:
{"icons":[{"room":string,"type":"downlight"|"wall_light"|"pendant"|"strip"|"floor_lamp"|"accent"|"cove"|"emergency","x":number,"y":number,"layer":"ambient"|"task"|"accent"|"decorative","label":string}]}`);
        setLightPlacements(lightP);
      }

      clearInterval(stepTimer); setLoadStep(STEPS.length - 1);
      setStatus("done");
      setActiveTab(mode === "electrical" ? "elec_plan" : "lighting_plan");
    } catch(e) {
      clearInterval(stepTimer); setErrorMsg(e.message); setStatus("error");
    }
  };

  const reset = () => {
    setFileType(null); setImagePreview(null); setImageB64(null);
    setPdfPages([]); setSelectedPage(0);
    setElecResults(null); setLightResults(null);
    setElecPlacements(null); setLightPlacements(null);
    setStatus("idle"); setErrorMsg(""); setLoadStep(0);
    setActiveTab("lighting_plan"); setHiddenTypes({});
  };

  const toggleType = t => setHiddenTypes(h => ({...h,[t]:!h[t]}));
  const cfClass = c => c==="high"?"cf-h":c==="medium"?"cf-m":"cf-l";
  const hasFile = fileType !== null && !pdfConverting;

  // icon size responsive to plan dims
  const iconS = Math.max(14, Math.min(24, planDims.w / 55));

  // ── Export CSV ──
  const exportCSV = () => {
    if (!elecResults) return;
    const h = ["Room","Floor","Area","Sockets","Switches","Data","TV","Light Circuits","USB","Special","Notes"];
    const rows = elecResults.rooms.map(r=>[r.name,r.floor,r.area_estimate,r.sockets,r.switches,r.data_points,r.tv_points,r.light_circuits,r.usb_outlets,(r.special_circuits||[]).join("; "),r.notes]);
    const csv = [h,...rows].map(row=>row.map(c=>`"${c}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download="electrical-schedule.csv"; a.click();
  };

  const exportLightingCSV = () => {
    if (!lightResults) return;
    const h = ["Room","Floor","Layer","Fixture Type","Qty","Spec","Dimmable","Circuit Group","Notes"];
    const rows = [];
    lightResults.rooms.forEach(r => {
      Object.entries(r.layers||{}).forEach(([layer, l]) => {
        if (l?.fixture_type) rows.push([r.name, r.floor, layer, l.fixture_type, l.qty||0, l.spec||"", l.dimmable?"Yes":"No", (r.circuit_groups||[])[0]?.name||"", l.notes||""]);
      });
    });
    const csv = [h,...rows].map(row=>row.map(c=>`"${c}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download="lighting-schedule.csv"; a.click();
  };

  // Export annotated plan PNG
  const exportPlan = (isLight) => {
    const wrap = planRef.current; if (!wrap) return;
    const src = wrap.querySelector("img,canvas"); if (!src) return;
    const W = src.naturalWidth || src.width;
    const H = src.naturalHeight || src.height;
    const dW = src.offsetWidth; const dH = src.offsetHeight;
    const sX = W/dW; const sY = H/dH;
    const exp = document.createElement("canvas"); exp.width=W; exp.height=H;
    const ctx = exp.getContext("2d"); ctx.drawImage(src,0,0,W,H);
    const icons = isLight ? lightPlacements?.icons : elecPlacements?.icons;
    const S = Math.max(16, W/60);
    if (icons) {
      icons.forEach(ic => {
        if (hiddenTypes[ic.type]) return;
        const cx = (ic.x/100)*dW*sX; const cy = (ic.y/100)*dH*sY;
        const iconDefs = isLight ? LIGHT_ICONS : ELEC_ICONS;
        const icon = iconDefs[ic.type] || (isLight ? LIGHT_ICONS.downlight : ELEC_ICONS.special);
        if (isLight && icon.draw) { icon.draw(ctx, cx, cy, S); }
        else if (!isLight) {
          ctx.fillStyle = icon.color; ctx.globalAlpha=0.92;
          ctx.fillRect(cx-S/2, cy-S/2, S, S); ctx.globalAlpha=1;
          ctx.fillStyle="#000"; ctx.font=`bold ${S*0.5}px monospace`;
          ctx.textAlign="center"; ctx.textBaseline="middle";
          const l=ic.type[0].toUpperCase(); ctx.fillText(l,cx,cy);
        }
      });
    }
    const a = document.createElement("a"); a.href=exp.toDataURL("image/png");
    a.download=isLight?"lighting-plan.png":"electrical-plan.png"; a.click();
  };

  // unique types for legends
  const elecTypes = elecPlacements?.icons ? [...new Set(elecPlacements.icons.map(i=>i.type))] : [];
  const lightTypes = lightPlacements?.icons ? [...new Set(lightPlacements.icons.map(i=>i.type))] : [];

  // Plan image component
  const PlanImage = ({ annotate, isLight }) => {
    const icons = isLight ? lightPlacements?.icons : elecPlacements?.icons;
    return (
      <div className="plan-wrap" style={{marginBottom:20}}>
        <div className="plan-lbl">{isLight?"LIGHTING PLAN":"ELECTRICAL PLAN"}</div>
        <div className="ann-wrap" ref={planRef}>
          {fileType==="pdf" && pdfPages[selectedPage]
            ? <PdfCanvas canvas={pdfPages[selectedPage].full} style={{width:"100%",display:"block"}} onSize={setPlanDims}/>
            : <img src={imagePreview} alt="Plan" style={{width:"100%",display:"block"}} onLoad={e=>setPlanDims({w:e.target.offsetWidth,h:e.target.offsetHeight})}/>
          }
          {annotate && icons?.length>0 && (
            <svg className="ann-svg" viewBox={`0 0 ${planDims.w} ${planDims.h}`} xmlns="http://www.w3.org/2000/svg">
              {icons.filter(ic=>!hiddenTypes[ic.type]).map((ic,i) => {
                if (isLight) {
                  const cx=(ic.x/100)*planDims.w; const cy=(ic.y/100)*planDims.h;
                  return <LightSvgIcon key={i} type={ic.type} cx={cx} cy={cy} S={iconS}/>;
                } else {
                  const ei = ELEC_ICONS[ic.type]||ELEC_ICONS.special;
                  const cx=(ic.x/100)*planDims.w; const cy=(ic.y/100)*planDims.h;
                  return (
                    <g key={i} className="icon-g" transform={`translate(${cx-iconS/2},${cy-iconS/2})`}>
                      <rect width={iconS} height={iconS} rx="2" fill={ei.color} fillOpacity="0.92" stroke="#000" strokeWidth="0.8"/>
                      <svg viewBox="0 0 20 20" width={iconS} height={iconS}><path d={ei.path} fill="#000" fillOpacity="0.85"/></svg>
                    </g>
                  );
                }
              })}
            </svg>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{STYLE}</style>
      <div className="app">
        <header className="hdr">
          <div className="logo"/>
          <div>
            <h1>Floor Plan Analyser</h1>
            <p>STA Smart Homes — Electrical & Lighting Design</p>
          </div>
          <div className="badge">CLAUDE VISION</div>
        </header>

        <main className="main">
          {/* Drop zone */}
          {!fileType && !pdfConverting && (
            <div className={`dz${dragging?" drag":""}`}
              onDragOver={e=>{e.preventDefault();setDragging(true);}}
              onDragLeave={()=>setDragging(false)}
              onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0]);}}>
              <svg className="dz-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2>Upload Floor Plan</h2>
              <p>PDF, PNG, JPG or WEBP — electrical schedule + lighting design</p>
              <label className="fil-lbl">
                Choose File
                <input type="file" accept="image/*,.pdf,application/pdf" onChange={e=>handleFile(e.target.files[0])}/>
              </label>
              <div className="dz-fmt">PDF · PNG · JPG · WEBP &nbsp;·&nbsp; Multi-page PDFs supported</div>
            </div>
          )}

          {/* PDF converting */}
          {pdfConverting && <div className="pdf-spin"><div className="ring"/><p>Reading PDF pages…</p></div>}

          {/* PDF page picker */}
          {fileType==="pdf" && pdfPages.length>0 && status!=="loading" && (
            <div className="pdf-pg">
              <div className="pdf-info"><span>{pdfPages.length}</span> page{pdfPages.length!==1?"s":""} · Select floor plan page</div>
              <div className="pg-grid">
                {pdfPages.map((p,i)=>(
                  <div key={i} className={`pg-th${selectedPage===i?" sel":""}`} onClick={()=>selectPage(i)}>
                    <PdfCanvas canvas={p.thumb} style={{display:"block",width:90,height:120,objectFit:"contain"}}/>
                    <div className="pg-lbl">Page {p.pageNum}</div>
                    <div className="pg-chk">✓</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload preview + controls */}
          {hasFile && status!=="loading" && (
            <div className="up-grid">
              <div className="plan-wrap">
                <div className="plan-lbl">{fileType==="pdf"?`PDF — PAGE ${selectedPage+1}`:"FLOOR PLAN"}</div>
                {fileType==="pdf" && pdfPages[selectedPage]
                  ? <PdfCanvas canvas={pdfPages[selectedPage].full} style={{width:"100%",height:360,objectFit:"contain",display:"block",background:"#111"}}/>
                  : <img src={imagePreview} alt="Plan" style={{width:"100%",height:360,objectFit:"contain",display:"block",background:"#111"}}/>
                }
              </div>
              <div className="ctrl">
                {/* Mode selector */}
                <div>
                  <h3>Analysis Mode</h3>
                  <div className="mode-tabs">
                    {[["both","Both"],["electrical","Electrical Only"],["lighting","Lighting Only"]].map(([v,l])=>(
                      <div key={v} className={`mode-tab${mode===v?" on":""}`} onClick={()=>setMode(v)}>{l}</div>
                    ))}
                  </div>
                </div>

                {/* Electrical options */}
                {mode !== "lighting" && (
                  <div>
                    <h3>Electrical — include</h3>
                    <div className="tog-grid">
                      {Object.entries(INCLUSION_LABELS).map(([k,l])=>(
                        <div key={k} className={`tog${inclusions[k]?" on":""}`} onClick={()=>setInclusions(p=>({...p,[k]:!p[k]}))}>
                          <div className="tog-dot"/><span>{l}</span>
                        </div>
                      ))}
                    </div>
                    <select className="std" style={{marginTop:8}} value={standard} onChange={e=>setStandard(e.target.value)}>
                      <option value="uk_domestic">UK Domestic (BS 7671 18th Ed)</option>
                      <option value="uk_commercial">UK Commercial (BS 7671)</option>
                      <option value="eu_domestic">EU Domestic</option>
                    </select>
                  </div>
                )}

                {/* Lighting options */}
                {mode !== "electrical" && (
                  <div>
                    <h3>Lighting design style</h3>
                    <select className="std" value={lightingStyle} onChange={e=>setLightingStyle(e.target.value)}>
                      {Object.entries(LIGHTING_STYLES).map(([k,v])=>(
                        <option key={k} value={k}>{k.charAt(0).toUpperCase()+k.slice(1).replace("_"," ")}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <h3>Notes (optional)</h3>
                  <textarea className="nt" placeholder="e.g. master suite on first floor, open plan kitchen/living, feature wall in lounge..." value={notes} onChange={e=>setNotes(e.target.value)}/>
                </div>

                {status!=="done" && <button className="ana-btn" onClick={analyse} disabled={!imageB64}>Analyse Plan →</button>}
                <button className="rst-btn" onClick={reset}>Upload Different Plan</button>
              </div>
            </div>
          )}

          {/* Loading */}
          {status==="loading" && (
            <div className="spin-block">
              <div className="ring"/>
              <h3>Analysing Floor Plan</h3>
              <p>Running {mode==="both"?"electrical + lighting design":"analysis"}…</p>
              <div className="steps">
                {STEPS.map((s,i)=>(
                  <div key={i} className={`step${i===loadStep?" act":i<loadStep?" done":""}`}>
                    <div className={`sd${i===loadStep?" act":i<loadStep?" done":" idle"}`}/>{s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {status==="error" && (
            <div className="err-block">
              <h3>Analysis Failed</h3>
              <p>{errorMsg}</p><br/>
              <button className="rst-btn" style={{maxWidth:200,margin:"0 auto"}} onClick={()=>setStatus("idle")}>Try Again</button>
            </div>
          )}

          {/* Results */}
          {status==="done" && (
            <>
              <div className="res-hdr">
                <div className="res-title">
                  {elecResults?.property_type || lightResults?.property_type || "Results"}
                  {elecResults && <span className={`cf ${cfClass(elecResults.confidence)}`}>{elecResults.confidence}</span>}
                </div>
                <div className="acts">
                  {elecResults && <button className="act-btn pri" onClick={exportCSV}>Elec CSV</button>}
                  {lightResults && <button className="act-btn pri" onClick={exportLightingCSV}>Lighting CSV</button>}
                  {elecPlacements?.icons?.length>0 && <button className="act-btn" onClick={()=>exportPlan(false)}>Export Elec PNG</button>}
                  {lightPlacements?.icons?.length>0 && <button className="act-btn" onClick={()=>exportPlan(true)}>Export Light PNG</button>}
                  <button className="act-btn" onClick={reset}>New Plan</button>
                </div>
              </div>

              {/* Tabs */}
              <div className="tabs">
                {lightResults && <div className={`tab${activeTab==="lighting_plan"?" on":""}`} onClick={()=>setActiveTab("lighting_plan")}>Lighting Plan</div>}
                {lightResults && <div className={`tab${activeTab==="lighting_schedule"?" on":""}`} onClick={()=>setActiveTab("lighting_schedule")}>Lighting Schedule</div>}
                {elecResults && <div className={`tab${activeTab==="elec_plan"?" on":""}`} onClick={()=>setActiveTab("elec_plan")}>Electrical Plan</div>}
                {elecResults && <div className={`tab${activeTab==="elec_schedule"?" on":""}`} onClick={()=>setActiveTab("elec_schedule")}>Electrical Schedule</div>}
              </div>

              {/* ── LIGHTING PLAN TAB ── */}
              {activeTab==="lighting_plan" && lightResults && (
                <>
                  <div className="legend">
                    {lightTypes.map(t=>{
                      const ic = LIGHT_ICONS[t]||LIGHT_ICONS.downlight;
                      return (
                        <div key={t} className={`leg${hiddenTypes[t]?" off":""}`} onClick={()=>toggleType(t)}>
                          <div className="leg-dot" style={{background:ic.border||ic.color}}/>
                          {ic.label}
                        </div>
                      );
                    })}
                  </div>
                  <PlanImage annotate={true} isLight={true}/>
                  <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--td)",marginBottom:12}}>
                    Style: <span style={{color:"var(--p)"}}>{lightResults.lighting_style}</span> &nbsp;·&nbsp;
                    {lightResults.totals?.total_fixtures} fixtures &nbsp;·&nbsp;
                    {lightResults.totals?.dimmable_circuits} dimmable circuits
                  </div>
                  {lightResults.design_rationale && (
                    <div className="nb" style={{borderLeftColor:"var(--p)"}}>
                      <h4 style={{color:"var(--p)"}}>Design Rationale</h4>
                      <p style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--td)",lineHeight:1.6}}>{lightResults.design_rationale}</p>
                    </div>
                  )}
                  {lightResults.lutron_notes && (
                    <div className="nb">
                      <h4>Lutron Integration Notes</h4>
                      <p style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--td)",lineHeight:1.6}}>{lightResults.lutron_notes}</p>
                    </div>
                  )}
                </>
              )}

              {/* ── LIGHTING SCHEDULE TAB ── */}
              {activeTab==="lighting_schedule" && lightResults && (
                <>
                  <p className="sec">Fixture Summary</p>
                  <div className="sum-grid">
                    {[
                      ["Total Fixtures", lightResults.totals?.total_fixtures, ""],
                      ["Dimmable Circuits", lightResults.totals?.dimmable_circuits, "Lutron circuits"],
                      ["Switched Circuits", lightResults.totals?.switched_circuits, ""],
                      ["Total Circuits", lightResults.totals?.total_circuits, ""],
                    ].map(([l,v,s])=>(
                      <div className="sum-card" key={l}>
                        <div className="card-n">{v??"-"}</div>
                        <div className="card-l">{l}</div>
                        {s && <div className="card-sub">{s}</div>}
                      </div>
                    ))}
                  </div>

                  <p className="sec">Room-by-Room Lighting Design</p>
                  <div className="tbl-wrap">
                    <table>
                      <thead><tr><th>Room</th><th>Layer</th><th>Fixture</th><th>Qty</th><th>Spec</th><th>Dim</th><th>Circuit</th><th>Notes</th></tr></thead>
                      <tbody>
                        {lightResults.rooms?.map((r,ri)=>{
                          const layers = Object.entries(r.layers||{}).filter(([,l])=>l?.fixture_type&&l?.qty>0);
                          return layers.map(([layer,l],li)=>(
                            <tr key={`${ri}-${li}`}>
                              {li===0&&<td className="rn" rowSpan={layers.length}>{r.name}</td>}
                              <td style={{color:"var(--td)",textTransform:"capitalize",fontSize:11}}>{layer}</td>
                              <td className="lt">{l.fixture_type}</td>
                              <td className="n">{l.qty}</td>
                              <td style={{fontSize:11,color:"var(--td)",maxWidth:160}}>{l.spec}</td>
                              <td style={{textAlign:"center"}}>{l.dimmable?<span style={{color:"var(--g)"}}>✓</span>:<span style={{color:"var(--tdd)"}}>—</span>}</td>
                              <td>{(r.circuit_groups||[]).map((cg,i)=>(
                                <span key={i} className="circuit-tag" style={{marginRight:4}}>{cg.name}</span>
                              ))}</td>
                              <td style={{fontSize:11,color:"var(--tdd)",maxWidth:180}}>{l.notes}</td>
                            </tr>
                          ));
                        })}
                      </tbody>
                    </table>
                  </div>

                  <p className="sec">Lutron Circuit Groups</p>
                  <div className="circuit-grid">
                    {lightResults.rooms?.map((r,i)=>(r.circuit_groups?.length>0&&(
                      <div className="circuit-card" key={i}>
                        <h4>{r.name}</h4>
                        <ul>
                          {r.circuit_groups.map((cg,j)=>(
                            <li key={j}>
                              <span>{cg.name}</span>
                              <span>{cg.fixtures}</span>
                              {cg.lutron_circuit&&<span className="circuit-tag">Lutron</span>}
                            </li>
                          ))}
                        </ul>
                        {r.design_notes&&<p style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--tdd)",marginTop:10,lineHeight:1.5}}>{r.design_notes}</p>}
                      </div>
                    )))}
                  </div>
                </>
              )}

              {/* ── ELECTRICAL PLAN TAB ── */}
              {activeTab==="elec_plan" && elecResults && (
                <>
                  <div className="legend">
                    {elecTypes.map(t=>{const ic=ELEC_ICONS[t]||ELEC_ICONS.special;return(
                      <div key={t} className={`leg${hiddenTypes[t]?" off":""}`} onClick={()=>toggleType(t)}>
                        <div className="leg-dot" style={{background:ic.color}}/>{ic.label}
                      </div>
                    );})}
                  </div>
                  <PlanImage annotate={true} isLight={false}/>
                </>
              )}

              {/* ── ELECTRICAL SCHEDULE TAB ── */}
              {activeTab==="elec_schedule" && elecResults && (
                <>
                  <p className="sec">Summary</p>
                  <div className="sum-grid">
                    {[["Sockets",elecResults.totals.sockets],["Switches",elecResults.totals.switches],["Data",elecResults.totals.data_points],["TV Points",elecResults.totals.tv_points],["Light Ccts",elecResults.totals.light_circuits],["USB",elecResults.totals.usb_outlets],["Special",elecResults.totals.special_circuits],["CU Ways",elecResults.totals.consumer_unit_ways]].map(([l,v])=>(
                      <div className="sum-card" key={l}><div className="card-n">{v??"-"}</div><div className="card-l">{l}</div></div>
                    ))}
                  </div>
                  <p className="sec">Room Breakdown</p>
                  <div className="tbl-wrap">
                    <table>
                      <thead><tr><th>Room</th><th>Floor</th><th>Area</th><th>Sockets</th><th>Switches</th><th>Data</th><th>TV</th><th>Lgt Ccts</th><th>USB</th><th>Special</th><th>Notes</th></tr></thead>
                      <tbody>
                        {elecResults.rooms?.map((r,i)=>(
                          <tr key={i}>
                            <td className="rn">{r.name}</td>
                            <td style={{color:"var(--td)"}}>{r.floor}</td>
                            <td style={{color:"var(--td)",whiteSpace:"nowrap"}}>{r.area_estimate}</td>
                            <td className={r.sockets>0?"n":"z"}>{r.sockets||"—"}</td>
                            <td className={r.switches>0?"n":"z"}>{r.switches||"—"}</td>
                            <td className={r.data_points>0?"n":"z"}>{r.data_points||"—"}</td>
                            <td className={r.tv_points>0?"n":"z"}>{r.tv_points||"—"}</td>
                            <td className={r.light_circuits>0?"n":"z"}>{r.light_circuits||"—"}</td>
                            <td className={r.usb_outlets>0?"n":"z"}>{r.usb_outlets||"—"}</td>
                            <td style={{color:"var(--td)",fontSize:11}}>{(r.special_circuits||[]).join(", ")||"—"}</td>
                            <td style={{color:"var(--tdd)",fontSize:11,maxWidth:180}}>{r.notes||""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {elecResults.assumptions?.length>0&&(<><p className="sec">Assumptions</p><div className="nb"><h4>Notes</h4><ul className="nl">{elecResults.assumptions.map((a,i)=><li key={i}>{a}</li>)}</ul></div></>)}
                  {elecResults.warnings?.length>0&&(<><p className="sec">Warnings</p><div className="wb"><h4>Review Required</h4><ul className="wl">{elecResults.warnings.map((w,i)=><li key={i}>{w}</li>)}</ul></div></>)}
                </>
              )}
            </>
          )}
        </main>

        <footer className="ftr">
          <p><span>STA Smart Homes</span> — Floor Plan Electrical & Lighting Analyser</p>
          <p>Indicative only · Always verify on-site · Lighting design subject to photometric review</p>
        </footer>
      </div>
    </>
  );
}
