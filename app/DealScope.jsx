"use client";
import { useState, useRef } from "react";

const mono = "'DM Mono', monospace";
const sans = "'Libre Franklin', 'Helvetica Neue', sans-serif";

const DEFAULT_CONFIG = {
  minRevenue: "4000000", maxRevenue: "30000000", minEBITDA: "1000000", minEBITDAMargin: "10",
  maxMultiple: "6", minGrossMargin: "40", revenueType: "Recurring (SaaS/Subscription)",
  minEmployees: "15", maxEmployees: "150", minYears: "5", stage: "Mature / Profitable",
  countries: "USA, Canada", dealType: "Full Exit", founderTransition: "Required (6-12 months)",
  targetIndustries: "B2B SaaS, Tech-Enabled Services, IT Services",
  excludedIndustries: "Healthcare, Banking, Insurance, B2C, E-commerce, Marketing Agencies, Gambling, Cannabis",
  regulatedOK: "No", targetIRR: "35",
};

function buildScreenSys(cfg) {
  return `You are an expert business analyst screening an acquisition target. Analyze the CIM/exec summary against the buyer's criteria.
CRITERIA: Revenue $${(+cfg.minRevenue/1e6).toFixed(1)}M–$${(+cfg.maxRevenue/1e6).toFixed(1)}M, Min EBITDA $${(+cfg.minEBITDA/1e6).toFixed(1)}M, Min EBITDA Margin ${cfg.minEBITDAMargin}%, Max Multiple ${cfg.maxMultiple}x, Min Gross Margin ${cfg.minGrossMargin}%, Revenue Type ${cfg.revenueType}, Employees ${cfg.minEmployees}–${cfg.maxEmployees}, Min Years ${cfg.minYears}, Stage ${cfg.stage}, Geography ${cfg.countries}, Deal ${cfg.dealType}, Transition ${cfg.founderTransition}, Target Industries: ${cfg.targetIndustries}, Excluded: ${cfg.excludedIndustries}, Regulated OK: ${cfg.regulatedOK}
Respond ONLY in valid JSON. Schema:
{"company":"Name","oneLiner":"Desc","overallFit":"STRONG FIT or FIT or PARTIAL FIT or NO FIT","overallScore":75,"scorecard":[{"criterion":"Revenue Range","status":"PASS or FAIL or UNCLEAR","extracted":"From doc","target":"$4M-$30M","score":100},{"criterion":"EBITDA","status":"PASS or FAIL or UNCLEAR","extracted":"Val","target":"≥$1M","score":100},{"criterion":"EBITDA Margin","status":"PASS or FAIL or UNCLEAR","extracted":"Val","target":"≥10%","score":80},{"criterion":"Industry Fit","status":"PASS or FAIL or UNCLEAR","extracted":"Val","target":"B2B SaaS","score":100},{"criterion":"Employee Count","status":"PASS or FAIL or UNCLEAR","extracted":"Val","target":"15-150","score":90},{"criterion":"Geography","status":"PASS or FAIL or UNCLEAR","extracted":"Val","target":"USA, Canada","score":100},{"criterion":"Deal Structure","status":"PASS or FAIL or UNCLEAR","extracted":"Val","target":"Full Exit","score":80},{"criterion":"Revenue Type","status":"PASS or FAIL or UNCLEAR","extracted":"Val","target":"Recurring","score":70},{"criterion":"Years in Business","status":"PASS or FAIL or UNCLEAR","extracted":"Val","target":"≥5 yrs","score":90},{"criterion":"Regulated Industry","status":"PASS or FAIL or UNCLEAR","extracted":"Val","target":"No","score":100}],"strengths":["s1","s2"],"dealBreakers":["Hard FAILs"],"risks":["r1","r2"],"nextStep":"Next step"}`;
}

function buildDeepSys(incognito) {
  const anonBlock = incognito ? `
CRITICAL ANONYMIZATION REQUIREMENT: This analysis will be shared externally. You MUST anonymize ALL identifying information in your ENTIRE response:
- Company name → use "Target" everywhere
- Product/platform names (e.g. "MediaCloud", "VanguardShield") → use generic descriptions like "the platform", "the core product", "the monitoring tool"
- Founder/CEO/executive names → use titles only: "the CEO", "the Founder", "the VP Engineering"
- Specific cities/states → use broad regions: "US Southeast", "US Mountain West", "Western Canada"
- Named clients, partners, investors → use descriptions: "a top-25 accounting firm", "a leading VC", "a Fortune 500 client"
- Industry associations or named partnerships → generalize: "industry association partnerships"
- Anything else that could identify the company through a simple Google search must be anonymized.
The financial figures, percentages, employee counts, and analytical conclusions should remain accurate — only identifying details are replaced.
` : "";
  return `You are an expert analyst doing due diligence. Be CONCISE — each finding 1 sentence max. Respond ONLY in valid JSON, no markdown.${anonBlock}
Schema:
{"company":"${incognito ? "Target" : "Name"}","overview":"2 sentences","category":"B2B SaaS etc","askingPrice":"From doc or Not disclosed","isSoftwareOrSaaS":true,"sections":[{"title":"Product & Technology","grade":"B+","findings":["short","short"],"keyQuestion":"Q"},{"title":"Market & Competition","grade":"B","findings":["short","short"],"keyQuestion":"Q"},{"title":"Revenue & Unit Economics","grade":"A-","findings":["short","short"],"keyQuestion":"Q"},{"title":"Competitive Moat","grade":"B","findings":["short","short"],"keyQuestion":"Q"},{"title":"Team & Execution","grade":"B+","findings":["short","short"],"keyQuestion":"Q"},{"title":"Growth Levers","grade":"A-","findings":["short","short"],"keyQuestion":"Q"}],"financialSnapshot":[{"label":"metric","value":"val","signal":"positive"}],"overallVerdict":"BUY","thesis":"2 sentences","comparables":["c1","c2"],"documentGaps":["gap1"],"negotiationLeverage":"1-2 sentences","lboInputs":{"latestRevenue":0,"latestEBITDA":0,"revenueCAGR":0,"ebitdaCAGR":0,"cagrYears":0,"revenueCAGRNote":"period desc","ebitdaCAGRNote":"period desc"}}
IMPORTANT: isSoftwareOrSaaS=true if primarily software/SaaS/subscription tech. lboInputs: numeric only, no $ or commas, in dollars. CAGR as pct number (12.4 for 12.4%).`;
}

const VERSUS_SYS = `You are an expert analyst comparing two acquisition targets. Respond ONLY in valid JSON. Schema:
{"companyA":"Name A","companyB":"Name B","summaryA":"1 sentence","summaryB":"1 sentence","dimensions":[{"name":"Revenue Quality","scoreA":7,"scoreB":6,"insight":"Why"},{"name":"Growth Trajectory","scoreA":8,"scoreB":5,"insight":"Why"},{"name":"Competitive Moat","scoreA":6,"scoreB":7,"insight":"Why"},{"name":"Margin Profile","scoreA":7,"scoreB":8,"insight":"Why"},{"name":"Customer Risk","scoreA":6,"scoreB":7,"insight":"Why"},{"name":"Execution","scoreA":7,"scoreB":6,"insight":"Why"}],"verdict":"Which wins","pricingInsight":"Comparison","surprisingInsight":"Non-obvious","ifYouCanOnlyBuyOne":"Recommendation"}`;

const MODES = [
  { id: "quickscreen", label: "Quick Screen", icon: "⚡", minDocs: 1, maxDocs: 1, desc: "Screen a CIM against your investment criteria" },
  { id: "deepdive", label: "Deep Dive", icon: "◉", minDocs: 1, maxDocs: 1, desc: "Comprehensive analysis with optional LBO model" },
  { id: "versus", label: "Head-to-Head", icon: "⟺", minDocs: 2, maxDocs: 2, desc: "Compare 2 CIMs side-by-side" }
];

function gradeClr(g) { const c=(g||"")[0]; return c==="A"?"#166534":c==="B"?"#0a66c2":c==="C"?"#b45309":"#b91c1c"; }
function verdictClr(v) { const s=(v||"").toUpperCase(); return s.includes("STRONG")||s==="PASS"?{bg:"#f0fdf4",c:"#166534",bd:"#bbf7d0"}:s==="BUY"||s.includes("FIT")&&!s.includes("NO")?{bg:"#eff6ff",c:"#1e40af",bd:"#bfdbfe"}:s==="HOLD"||s.includes("PARTIAL")?{bg:"#fefce8",c:"#a16207",bd:"#fde68a"}:{bg:"#fef2f2",c:"#b91c1c",bd:"#fecaca"}; }
function sigClr(s) { return s==="positive"||s==="PASS"?"#166534":s==="negative"||s==="FAIL"?"#b91c1c":"#888"; }
function Tag({text,clr}) { return <span style={{display:"inline-block",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:clr.bg,color:clr.c,border:`1px solid ${clr.bd}`,fontFamily:mono}}>{text}</span>; }
function Lbl({children}) { return <span style={{fontSize:10,fontWeight:600,color:"#888",letterSpacing:1,textTransform:"uppercase",fontFamily:mono}}>{children}</span>; }
function Toggle({on,onToggle,label,sub}) { return <div style={{display:"flex",alignItems:"center",gap:10}}><div onClick={onToggle} style={{width:36,height:20,borderRadius:10,background:on?"#166534":"#ddd",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}><div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:on?18:2,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/></div><div><span style={{fontSize:13,fontWeight:600}}>{label}</span>{sub&&<span style={{fontSize:11,color:"#888",marginLeft:6}}>{sub}</span>}</div></div>; }

// Stable input: edits locally, commits on blur/enter — no cursor jumping
function SInput({value, onCommit, style, ...rest}) {
  const [loc, setLoc] = useState(String(value ?? ""));
  const ext = useRef(String(value ?? ""));
  if (String(value ?? "") !== ext.current) { ext.current = String(value ?? ""); setLoc(String(value ?? "")); }
  return <input value={loc} onChange={e=>setLoc(e.target.value)} onBlur={()=>{ext.current=loc;onCommit(loc)}} onKeyDown={e=>{if(e.key==="Enter"){ext.current=loc;onCommit(loc);e.target.blur()}}} style={style} {...rest}/>;
}

function ConfigForm({ config, setConfig }) {
  const [open, setOpen] = useState(false);
  function upd(k,v) { setConfig(p=>({...p,[k]:v})); }
  function F({label,k,half}) { return <div style={{flex:half?"1 1 48%":"1 1 100%",minWidth:half?200:0}}><label style={{fontSize:10,fontWeight:600,color:"#888",letterSpacing:.5,fontFamily:mono,display:"block",marginBottom:4}}>{label}</label><input value={config[k]} onChange={e=>upd(k,e.target.value)} style={{width:"100%",padding:"7px 10px",fontSize:13,border:"1px solid #e0ddd5",borderRadius:6,fontFamily:sans,background:"#fff"}}/></div>; }
  function S({label,k,options,half}) { return <div style={{flex:half?"1 1 48%":"1 1 100%",minWidth:half?200:0}}><label style={{fontSize:10,fontWeight:600,color:"#888",letterSpacing:.5,fontFamily:mono,display:"block",marginBottom:4}}>{label}</label><select value={config[k]} onChange={e=>upd(k,e.target.value)} style={{width:"100%",padding:"7px 10px",fontSize:13,border:"1px solid #e0ddd5",borderRadius:6,fontFamily:sans,background:"#fff"}}>{options.map(o=><option key={o}>{o}</option>)}</select></div>; }
  if(!open) return <div onClick={()=>setOpen(true)} style={{background:"#fff",borderRadius:10,border:"1px solid #e0ddd5",padding:"14px 20px",marginBottom:20,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><span style={{fontSize:13,fontWeight:600}}>Investment Criteria</span><span style={{fontSize:12,color:"#888",marginLeft:10}}>${(+config.minRevenue/1e6).toFixed(0)}M–${(+config.maxRevenue/1e6).toFixed(0)}M rev · ≥${(+config.minEBITDA/1e6).toFixed(0)}M EBITDA · {config.countries} · {config.targetIRR}% IRR</span></div><span style={{fontSize:12,color:"#0a66c2",fontFamily:mono}}>Edit ▸</span></div>;
  return (
    <div style={{background:"#fff",borderRadius:10,border:"1px solid #e0ddd5",padding:24,marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{fontSize:14,fontWeight:700}}>Investment Criteria</span><button onClick={()=>setOpen(false)} style={{fontSize:12,color:"#0a66c2",background:"none",border:"1px solid #0a66c2",padding:"4px 14px",borderRadius:6,cursor:"pointer",fontFamily:mono}}>Done</button></div>
      <div style={{marginBottom:16}}><span style={{fontSize:11,fontWeight:600,display:"block",marginBottom:8}}>Financial</span><div style={{display:"flex",flexWrap:"wrap",gap:10}}><F label="MIN REVENUE ($)" k="minRevenue" half/><F label="MAX REVENUE ($)" k="maxRevenue" half/><F label="MIN EBITDA ($)" k="minEBITDA" half/><F label="MIN EBITDA MARGIN (%)" k="minEBITDAMargin" half/><F label="MIN GROSS MARGIN (%)" k="minGrossMargin" half/><S label="REVENUE TYPE" k="revenueType" options={["Recurring (SaaS/Subscription)","Transactional","Project-based","Mixed","Any"]} half/></div></div>
      <div style={{marginBottom:16}}><span style={{fontSize:11,fontWeight:600,display:"block",marginBottom:8}}>Returns & Valuation</span><div style={{display:"flex",flexWrap:"wrap",gap:10}}><F label="TARGET IRR (%)" k="targetIRR" half/><F label="MAX ENTRY MULTIPLE (x EBITDA)" k="maxMultiple" half/></div></div>
      <div style={{marginBottom:16}}><span style={{fontSize:11,fontWeight:600,display:"block",marginBottom:8}}>Company Profile</span><div style={{display:"flex",flexWrap:"wrap",gap:10}}><F label="MIN EMPLOYEES" k="minEmployees" half/><F label="MAX EMPLOYEES" k="maxEmployees" half/><F label="MIN YEARS" k="minYears" half/><S label="STAGE" k="stage" options={["Mature / Profitable","Growth","Turnaround","Any"]} half/></div></div>
      <div style={{marginBottom:16}}><span style={{fontSize:11,fontWeight:600,display:"block",marginBottom:8}}>Geography & Deal</span><div style={{display:"flex",flexWrap:"wrap",gap:10}}><F label="TARGET COUNTRIES" k="countries" half/><S label="DEAL TYPE" k="dealType" options={["Full Exit","Majority Stake","Growth Equity","Any"]} half/><S label="FOUNDER TRANSITION" k="founderTransition" options={["Required (6-12 months)","Preferred","Not needed","Any"]} half/><S label="REGULATED OK?" k="regulatedOK" options={["No","Yes"]} half/></div></div>
      <div><span style={{fontSize:11,fontWeight:600,display:"block",marginBottom:8}}>Industry</span><div style={{display:"flex",flexWrap:"wrap",gap:10}}><F label="TARGET INDUSTRIES" k="targetIndustries"/><F label="EXCLUDED INDUSTRIES" k="excludedIndustries"/></div></div>
    </div>
  );
}

function DocUploader({docs,setDocs,maxDocs,label}) {
  const fileRef=useRef(null); const [drag,setDrag]=useState(false);
  async function readFile(f) { return new Promise((res,rej)=>{const r=new FileReader();if(f.type==="application/pdf"){r.onload=()=>res({name:f.name,tp:"pdf",txt:null,b64:r.result.split(",")[1],sz:f.size});r.onerror=rej;r.readAsDataURL(f)}else{r.onload=()=>res({name:f.name,tp:"txt",txt:r.result,b64:null,sz:f.size});r.onerror=rej;r.readAsText(f)}}); }
  async function add(files){const res=await Promise.all(Array.from(files).slice(0,maxDocs-docs.length).map(readFile));setDocs(p=>[...p,...res].slice(0,maxDocs));}
  return <div>
    <label style={{fontSize:10,fontWeight:600,color:"#888",letterSpacing:1,textTransform:"uppercase",fontFamily:mono,display:"block",marginBottom:10}}>{label}</label>
    {docs.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"#f5f4f0",borderRadius:8,marginBottom:8,border:"1px solid #e8e6df"}}><div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}><span style={{width:32,height:32,borderRadius:6,background:i===0?"#0a66c2":"#b45309",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:700,fontFamily:mono,flexShrink:0}}>{maxDocs>1?String.fromCharCode(65+i):"◉"}</span><div style={{minWidth:0}}><p style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</p><p style={{fontSize:11,color:"#999",fontFamily:mono}}>{d.tp==="pdf"?"PDF":"Text"} · {(d.sz/1024).toFixed(0)} KB</p></div></div><button onClick={()=>setDocs(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#aaa",fontSize:18,cursor:"pointer"}}>×</button></div>)}
    {docs.length<maxDocs&&<div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);add(e.dataTransfer.files)}} onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${drag?"#0a66c2":"#ddd"}`,borderRadius:10,padding:"28px 20px",textAlign:"center",cursor:"pointer",background:drag?"#eff6ff":"#fafaf7"}}><p style={{fontSize:22,marginBottom:6}}>📎</p><p style={{fontSize:13,color:"#666",fontWeight:500}}>{docs.length===0?"Drop a CIM or executive summary here":"Drop another document"}</p><p style={{fontSize:11,color:"#aaa",marginTop:4,fontFamily:mono}}>PDF, TXT, MD · {docs.length}/{maxDocs}</p><input ref={fileRef} type="file" accept=".pdf,.txt,.md,.csv" multiple={maxDocs>1} onChange={e=>e.target.files&&add(e.target.files)} style={{display:"none"}}/></div>}
  </div>;
}

function ScorecardResult({d}) {
  const vc=verdictClr(d.overallFit); const pass=(d.scorecard||[]).filter(s=>s.status==="PASS").length; const fail=(d.scorecard||[]).filter(s=>s.status==="FAIL").length; const unc=(d.scorecard||[]).filter(s=>s.status==="UNCLEAR").length;
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}><div><h3 style={{fontSize:22,fontWeight:700,margin:0}}>{d.company}</h3><p style={{fontSize:14,color:"#666",marginTop:4,maxWidth:480}}>{d.oneLiner}</p></div><div style={{display:"flex",gap:10,alignItems:"center"}}><Tag text={d.overallFit} clr={vc}/><div style={{width:52,height:52,borderRadius:"50%",background:vc.bg,border:`2px solid ${vc.bd}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:18,fontWeight:700,color:vc.c,fontFamily:mono}}>{d.overallScore}</span></div></div></div>
    <div style={{display:"flex",gap:8,marginBottom:16}}><span style={{fontSize:12,fontFamily:mono,color:"#166534",background:"#f0fdf4",padding:"2px 10px",borderRadius:12}}>{pass} Pass</span><span style={{fontSize:12,fontFamily:mono,color:"#b91c1c",background:"#fef2f2",padding:"2px 10px",borderRadius:12}}>{fail} Fail</span><span style={{fontSize:12,fontFamily:mono,color:"#888",background:"#f5f4f0",padding:"2px 10px",borderRadius:12}}>{unc} Unclear</span></div>
    <div style={{borderRadius:8,border:"1px solid #e8e6df",overflow:"hidden",marginBottom:20}}>
      <div style={{display:"grid",gridTemplateColumns:"1.5fr .7fr 1.5fr 1fr .5fr",padding:"8px 14px",background:"#f5f4f0",gap:8}}>{["Criterion","Status","Extracted","Target","Score"].map(h=><span key={h} style={{fontSize:10,fontWeight:600,color:"#888",fontFamily:mono}}>{h}</span>)}</div>
      {(d.scorecard||[]).map((r,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1.5fr .7fr 1.5fr 1fr .5fr",padding:"8px 14px",borderTop:"1px solid #f0ede5",gap:8,alignItems:"center"}}><span style={{fontSize:13,fontWeight:500}}>{r.criterion}</span><span style={{fontSize:11,fontWeight:700,color:sigClr(r.status),fontFamily:mono}}>{r.status}</span><span style={{fontSize:12,color:"#555"}}>{r.extracted}</span><span style={{fontSize:11,color:"#888",fontFamily:mono}}>{r.target}</span><div style={{display:"flex",alignItems:"center",gap:4}}><div style={{flex:1,height:4,background:"#e8e6df",borderRadius:2,overflow:"hidden"}}><div style={{width:`${r.score}%`,height:"100%",background:r.score>=70?"#166534":r.score>=40?"#b45309":"#b91c1c",borderRadius:2}}/></div><span style={{fontSize:10,color:"#888",fontFamily:mono,minWidth:24,textAlign:"right"}}>{r.score}</span></div></div>)}
    </div>
    {d.dealBreakers?.length>0&&<div style={{background:"#fef2f2",borderRadius:8,padding:14,marginBottom:16,border:"1px solid #fecaca"}}><Lbl>Deal Breakers</Lbl>{d.dealBreakers.map((b,i)=><p key={i} style={{fontSize:13,color:"#b91c1c",marginTop:6}}>✕ {b}</p>)}</div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>{d.strengths?.length>0&&<div style={{background:"#f0fdf4",borderRadius:8,padding:14}}><Lbl>Strengths</Lbl>{d.strengths.map((s,i)=><p key={i} style={{fontSize:13,marginTop:6}}>+ {s}</p>)}</div>}{d.risks?.length>0&&<div style={{background:"#fefce8",borderRadius:8,padding:14}}><Lbl>Risks</Lbl>{d.risks.map((r,i)=><p key={i} style={{fontSize:13,marginTop:6}}>⚠ {r}</p>)}</div>}</div>
    {d.nextStep&&<div style={{borderTop:"1px solid #e8e6df",paddingTop:12}}><Lbl>Next Step</Lbl><p style={{fontSize:13,color:"#0a66c2",marginTop:4,lineHeight:1.6}}>{d.nextStep}</p></div>}
  </div>;
}

function DeepDiveResult({d,incognito}) {
  const vc=verdictClr(d.overallVerdict);
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:16}}>
      <div>
        <h3 style={{fontSize:22,fontWeight:700,margin:0}}>{d.company}</h3>
        <div style={{display:"flex",gap:8,marginTop:4,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:12,color:"#888",fontFamily:mono}}>{d.category}</span>
          {d.askingPrice&&d.askingPrice!=="Not disclosed"&&<span style={{fontSize:11,color:"#666",fontFamily:mono,background:"#f5f4f0",padding:"1px 8px",borderRadius:4}}>Ask: {d.askingPrice}</span>}
        </div>
        {incognito&&<span style={{fontSize:10,color:"#b45309",fontFamily:mono,background:"#fefce8",padding:"2px 8px",borderRadius:4,marginTop:6,display:"inline-block"}}>🔒 Incognito — all identifying info anonymized at source</span>}
      </div>
      <Tag text={d.overallVerdict} clr={vc}/>
    </div>
    <p style={{fontSize:14,color:"#555",lineHeight:1.6,marginBottom:16}}>{d.overview}</p>
    {d.financialSnapshot?.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8,marginBottom:8}}>{d.financialSnapshot.map((m,i)=><div key={i} style={{background:"#f8f8f5",borderRadius:6,padding:"8px 12px",borderLeft:`3px solid ${sigClr(m.signal)}`}}><span style={{fontSize:10,color:"#888",fontFamily:mono}}>{m.label}</span><p style={{fontSize:14,fontWeight:600,color:sigClr(m.signal),marginTop:2}}>{m.value}</p></div>)}</div>}
    {d.sections?.map((s,i)=><div key={i} style={{borderTop:"1px solid #e8e6df",paddingTop:16,marginTop:16}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:13,fontWeight:600}}>{s.title}</span><span style={{fontSize:16,fontWeight:700,color:gradeClr(s.grade),fontFamily:mono}}>{s.grade}</span></div>{s.findings?.map((f,j)=><p key={j} style={{fontSize:13,color:"#444",lineHeight:1.6,marginBottom:4,paddingLeft:12,borderLeft:`2px solid ${gradeClr(s.grade)}33`}}>{f}</p>)}<p style={{fontSize:12,color:"#0a66c2",marginTop:8,fontStyle:"italic"}}>Key question: {s.keyQuestion}</p></div>)}
    <div style={{marginTop:24,padding:16,background:vc.bg,borderRadius:8,border:`1px solid ${vc.bd}`}}><Lbl>Thesis</Lbl><p style={{fontSize:14,marginTop:6,lineHeight:1.6,fontWeight:500}}>{d.thesis}</p></div>
    {d.documentGaps?.length>0&&<div style={{marginTop:16,padding:14,background:"#fefce8",borderRadius:8,border:"1px solid #fde68a"}}><Lbl>Missing from Document</Lbl>{d.documentGaps.map((g,i)=><p key={i} style={{fontSize:13,color:"#92400e",marginTop:6}}>? {g}</p>)}</div>}
    {d.negotiationLeverage&&<div style={{marginTop:12,borderTop:"1px solid #e8e6df",paddingTop:12}}><Lbl>Negotiation Leverage</Lbl><p style={{fontSize:13,color:"#444",marginTop:4,lineHeight:1.6}}>{d.negotiationLeverage}</p></div>}
    {d.comparables&&<div style={{marginTop:12}}><span style={{fontSize:10,fontWeight:600,color:"#888",fontFamily:mono}}>COMPARABLES: </span><span style={{fontSize:13,color:"#555"}}>{d.comparables.join(" · ")}</span></div>}
  </div>;
}

function LBOModel({targetIRR,lboInputs}) {
  const li=lboInputs||{}; const hasRev=(li.latestRevenue||0)>0; const hasEB=(li.latestEBITDA||0)>0;
  const isSaaS=li.isSoftwareOrSaaS||false;
  const defBasis=isSaaS?"Revenue":hasEB?"EBITDA":hasRev?"Revenue":"EBITDA";
  const defRev=li.latestRevenue||5000000; const defEB=li.latestEBITDA||1500000;
  const defMargin=hasRev&&hasEB?(defEB/defRev*100):30;
  const defEntryMult=defBasis==="Revenue"?4:6;
  const defEarnMult=0.5;
  const defDebt=defBasis==="Revenue"?1:2;
  const histRevCAGR=li.revenueCAGR||10;
  const defMarginGr=parseFloat((histRevCAGR/6).toFixed(1));

  const [a,setA]=useState({basisMetric:defBasis,entryRevenue:defRev,entryEBITDA:defEB,entryMargin:parseFloat(defMargin.toFixed(1)),entryMultiple:defEntryMult,holdingPeriod:5,revGrowth:histRevCAGR,marginGrowth:defMarginGr,exitMultiple:defEntryMult+defEarnMult,debtMultiple:defDebt,debtRate:7.5,debtYears:5,earnout:false,earnoutMultiple:defEarnMult,earnoutDelay:1,dscrThreshold:1.25,taxRate:25,capexPct:1,wcPct:10});
  const [sweepToggles,setSweepToggles]=useState({});

  function switchBasis(nb) {
    const isR=nb==="Revenue"; const em=isR?4:6; const eo=parseFloat(a.earnoutMultiple)||0.5;
    setA(p=>({...p,basisMetric:nb,entryMultiple:em,exitMultiple:em+eo,debtMultiple:isR?1:2}));
  }
  function u(k,v){setA(p=>{const n={...p,[k]:v};
    if(k==="entryRevenue"&&parseFloat(v)>0&&parseFloat(p.entryEBITDA)>0) n.entryMargin=parseFloat((parseFloat(p.entryEBITDA)/parseFloat(v)*100).toFixed(1));
    if(k==="entryEBITDA"&&parseFloat(p.entryRevenue)>0&&parseFloat(v)>0) n.entryMargin=parseFloat((parseFloat(v)/parseFloat(p.entryRevenue)*100).toFixed(1));
    if(k==="entryMargin"&&parseFloat(p.entryRevenue)>0) n.entryEBITDA=Math.round(parseFloat(p.entryRevenue)*parseFloat(v)/100);
    if(k==="entryMultiple"||k==="earnoutMultiple"){const em2=parseFloat(k==="entryMultiple"?v:p.entryMultiple)||0;const eo2=parseFloat(k==="earnoutMultiple"?v:p.earnoutMultiple)||0;n.exitMultiple=em2+eo2;}
    return n;});}
  function num(k){return parseFloat(a[k])||0;}
  function fmt(n){return n>=1e6?"$"+(n/1e6).toFixed(2)+"M":n>=1e3?"$"+(n/1e3).toFixed(1)+"K":"$"+n.toFixed(0);}
  function pct(n){return (n*100).toFixed(1)+"%";}

  const entryRev=num("entryRevenue"); const entryEB=num("entryEBITDA"); const entryMargin=num("entryMargin");
  const basisVal=a.basisMetric==="Revenue"?entryRev:entryEB;
  const purchasePrice=basisVal*num("entryMultiple");
  const earnoutAmt=a.earnout?basisVal*num("earnoutMultiple"):0;
  const totalDealValue=purchasePrice+earnoutAmt;
  const debtAmount=basisVal*num("debtMultiple");
  const equityAtClose=Math.max(purchasePrice-debtAmount,0);
  const totalEquity=equityAtClose+earnoutAmt;

  const hp=num("holdingPeriod"); const revGr=num("revGrowth")/100; const margGr=num("marginGrowth")/100;
  const taxR=num("taxRate")/100; const capexR=num("capexPct")/100;
  const wcR=num("wcPct")/100;
  const dRate=num("debtRate")/100; const dYrs=num("debtYears");
  let debtRem=debtAmount; let totInt=0; let totSweep=0; const annP=dYrs>0?debtAmount/dYrs:0;
  const dscrTh=num("dscrThreshold"); let dscrBad=false; const rows=[];
  const earnoutYr=Math.round(num("earnoutDelay"));
  let cumEquity=equityAtClose;
  const initWC=entryEB*wcR;
  let cashBal=initWC;

  rows.push({yr:0,rev:entryRev,margin:entryMargin,ebitda:entryEB,capex:0,taxes:0,interest:0,principal:0,ds:0,debtRem:debtAmount,earnoutPay:0,fcf:0,addlEquity:0,cumEquity:equityAtClose,cashBal,sweep:0,dscr:999,isYr0:true});

  for(let yr=1;yr<=hp;yr++){
    const rev=entryRev*Math.pow(1+revGr,yr);
    const margin=entryMargin*Math.pow(1+margGr,yr)/100;
    const ebitda=rev*margin;
    const capex=rev*capexR;
    const interest=debtRem*dRate;
    const principal=yr<=dYrs?annP:0;
    const ds=interest+principal;
    const taxableIncome=Math.max(ebitda-capex-interest,0);
    const taxes=taxableIncome*taxR;
    debtRem=Math.max(debtRem-principal,0);
    totInt+=interest;
    const earnoutPay=(a.earnout&&yr===earnoutYr)?earnoutAmt:0;
    let rawFcf=ebitda-capex-taxes-ds-earnoutPay;
    let addlEquity=0;
    if(rawFcf<0){addlEquity=-rawFcf;cumEquity+=addlEquity;rawFcf=0;}
    // Cash balance: accumulate FCF
    cashBal+=rawFcf;
    // Cash sweep: if toggled on, return excess cash above working capital to equity holders
    const wc=ebitda*wcR;
    const sweepOn=sweepToggles[yr]||false;
    let sweep=0;
    if(sweepOn&&yr<hp&&cashBal>wc){sweep=cashBal-wc;cashBal=wc;totSweep+=sweep;}
    const dscr=ds>0?ebitda/ds:999;
    if(dscr<dscrTh)dscrBad=true;
    rows.push({yr,rev,margin:margin*100,ebitda,capex,taxes,interest,principal,ds,debtRem,earnoutPay,fcf:rawFcf,addlEquity,cumEquity,cashBal,wc,sweep,dscr});
  }
  const exitRow=rows.length>1?rows[rows.length-1]:{rev:0,ebitda:0,margin:0,cumEquity:equityAtClose};
  const exitBasis=a.basisMetric==="Revenue"?exitRow.rev:exitRow.ebitda;
  const exitValue=(exitBasis||0)*num("exitMultiple");
  const exitDebt=debtRem; const eqProc=exitValue-exitDebt;
  const finalEquity=exitRow.cumEquity||equityAtClose;
  const moic=finalEquity>0?eqProc/finalEquity:0;

  function calcIRR(){
    const cfs=[{t:0,cf:-equityAtClose}];
    rows.forEach(y=>{
      if(y.addlEquity>0)cfs.push({t:y.yr,cf:-y.addlEquity});
      if(y.sweep>0)cfs.push({t:y.yr,cf:y.sweep});
    });
    cfs.push({t:hp,cf:eqProc});
    let r=0.2;
    for(let i=0;i<200;i++){let npv=0,dn=0;for(const{t,cf}of cfs){const d=Math.pow(1+r,t);npv+=cf/d;dn+=(-t*cf)/(d*(1+r));}if(Math.abs(dn)<1e-12)break;const rn=r-npv/dn;if(Math.abs(rn-r)<1e-8){r=rn;break;}r=Math.max(-0.99,Math.min(10,rn));}return r;
  }
  const irr=calcIRR(); const irrTarget=(parseFloat(targetIRR)||35)/100; const irrMet=irr>=irrTarget&&!dscrBad;

  function goalSeekGrowth(withSweep){
    let lo=-0.3,hi=2.0;
    for(let i=0;i<100;i++){
      const mid=(lo+hi)/2;
      let sd=debtAmount; const sAP=dYrs>0?debtAmount/dYrs:0;
      let simCumEq=equityAtClose;
      let simCashBal=entryEB*wcR;
      const simCfs=[{t:0,cf:-equityAtClose}];
      for(let y=1;y<=hp;y++){
        const sRev=entryRev*Math.pow(1+mid,y);
        const sMarg=entryMargin*Math.pow(1+margGr,y)/100;
        const sEB=sRev*sMarg;
        const sCapex=sRev*capexR;
        const sInt=sd*dRate;
        const sPri=y<=dYrs?sAP:0;
        const sDS=sInt+sPri;
        const sTax=Math.max(sEB-sCapex-sInt,0)*taxR;
        sd=Math.max(sd-sPri,0);
        const sEarnout=(a.earnout&&y===earnoutYr)?earnoutAmt:0;
        let sFcf=sEB-sCapex-sTax-sDS-sEarnout;
        if(sFcf<0){const add=-sFcf;simCumEq+=add;simCfs.push({t:y,cf:-add});sFcf=0;}
        simCashBal+=sFcf;
        if(withSweep&&y<hp){const sWC=sEB*wcR;if(simCashBal>sWC){const sw=simCashBal-sWC;simCashBal=sWC;simCfs.push({t:y,cf:sw});}}
      }
      const simRev=entryRev*Math.pow(1+mid,hp);
      const simMarg=entryMargin*Math.pow(1+margGr,hp)/100;
      const simEB=simRev*simMarg;
      const simBasis=a.basisMetric==="Revenue"?simRev:simEB;
      const simExit=simBasis*num("exitMultiple")-sd;
      simCfs.push({t:hp,cf:simExit});
      let r=0.2;for(let j=0;j<150;j++){let npv=0,dn=0;for(const{t,cf}of simCfs){const d=Math.pow(1+r,t);npv+=cf/d;dn+=(-t*cf)/(d*(1+r));}if(Math.abs(dn)<1e-12)break;const rn=r-npv/dn;if(Math.abs(rn-r)<1e-8){r=rn;break;}r=Math.max(-0.99,Math.min(10,rn));}
      if(r>irrTarget)hi=mid;else lo=mid;
      if(hi-lo<0.0001)break;
    }
    return (lo+hi)/2;
  }
  const neededGr=goalSeekGrowth(false);
  const neededGrSweep=goalSeekGrowth(true);
  const histCAGR=li.revenueCAGR;
  const histNote=li.revenueCAGRNote;
  const histOk=histCAGR&&histCAGR>0;
  const cagrYrs=li.cagrYears||0;
  const achievable=histOk&&histCAGR>=neededGr*100;

  const inpSt={width:"100%",padding:"5px 8px",fontSize:13,border:"1px solid #e0ddd5",borderRadius:5,fontFamily:mono,background:"#fff",color:"#0000FF"};
  function Inp({label,k,prefix,suffix}){return <div style={{flex:"1 1 22%",minWidth:110}}><label style={{fontSize:9,fontWeight:600,color:"#888",letterSpacing:.5,fontFamily:mono,display:"block",marginBottom:3}}>{label}</label><div style={{display:"flex",alignItems:"center"}}>{prefix&&<span style={{fontSize:12,color:"#888",fontFamily:mono,marginRight:2}}>{prefix}</span>}<SInput value={a[k]} onCommit={v=>u(k,v)} style={inpSt}/>{suffix&&<span style={{fontSize:11,color:"#888",fontFamily:mono,marginLeft:3}}>{suffix}</span>}</div></div>;}
  const kpi=ok=>({padding:"12px 16px",borderRadius:8,background:ok?"#f0fdf4":"#fef2f2",border:`1px solid ${ok?"#bbf7d0":"#fecaca"}`,textAlign:"center",flex:1,minWidth:110});

  return <div style={{marginTop:24,borderTop:"2px solid #1a1a1a",paddingTop:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div><span style={{fontSize:15,fontWeight:700}}>LBO Model</span><span style={{fontSize:11,color:"#888",marginLeft:8}}>Edit assumptions — results update live</span></div><span style={{fontSize:10,fontFamily:mono,color:"#888"}}>Tab/Enter to commit</span></div>

    <div style={{background:"#f8f8f5",borderRadius:8,padding:16,marginBottom:12}}>
      <span style={{fontSize:11,fontWeight:600,display:"block",marginBottom:10}}>Deal Structure</span>
      <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
        <div style={{flex:"1 1 22%",minWidth:110}}><label style={{fontSize:9,fontWeight:600,color:"#888",fontFamily:mono,display:"block",marginBottom:3}}>VALUATION BASIS</label><select value={a.basisMetric} onChange={e=>switchBasis(e.target.value)} style={inpSt}><option value="EBITDA">EBITDA</option><option value="Revenue">Revenue</option></select></div>
        <Inp label="ENTRY REVENUE ($)" k="entryRevenue" prefix="$"/>
        <Inp label="ENTRY EBITDA ($)" k="entryEBITDA" prefix="$"/>
        <Inp label="EBITDA MARGIN (%)" k="entryMargin" suffix="%"/>
        <Inp label="ENTRY MULTIPLE (x)" k="entryMultiple" suffix="x"/>
      </div>
      <div style={{marginTop:8,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <span style={{fontSize:12,color:"#555"}}>Purchase ({a.basisMetric} x {num("entryMultiple")}x): <strong style={{fontFamily:mono}}>{fmt(purchasePrice)}</strong></span>
        {(hasRev||hasEB)&&<span style={{fontSize:10,color:"#0a66c2",fontFamily:mono,background:"#eff6ff",padding:"2px 8px",borderRadius:4}}>Rev/EBITDA from document</span>}
      </div>
    </div>

    <div style={{background:"#f8f8f5",borderRadius:8,padding:16,marginBottom:12}}>
      <div style={{marginBottom:10}}><Toggle on={a.earnout} onToggle={()=>{const nv=!a.earnout;setA(p=>({...p,earnout:nv,exitMultiple:num("entryMultiple")+(nv?num("earnoutMultiple"):0)}));}} label="Earnout"/></div>
      {a.earnout&&<div style={{display:"flex",flexWrap:"wrap",gap:10}}><Inp label={"EARNOUT (x "+a.basisMetric+")"} k="earnoutMultiple" suffix="x"/><Inp label="PAYOUT DELAY (YRS)" k="earnoutDelay" suffix="yr"/></div>}
      {a.earnout&&<p style={{fontSize:12,color:"#555",marginTop:8}}>Earnout: <strong style={{fontFamily:mono}}>{fmt(earnoutAmt)}</strong> · Total: <strong style={{fontFamily:mono}}>{fmt(totalDealValue)}</strong> · Exit multiple: <strong style={{fontFamily:mono}}>{num("exitMultiple").toFixed(1)}x</strong> (entry + earnout)</p>}
    </div>

    <div style={{background:"#f8f8f5",borderRadius:8,padding:16,marginBottom:12}}>
      <span style={{fontSize:11,fontWeight:600,display:"block",marginBottom:10}}>Debt</span>
      <div style={{display:"flex",flexWrap:"wrap",gap:10}}><Inp label={"DEBT (x "+a.basisMetric+")"} k="debtMultiple" suffix="x"/><Inp label="RATE (%)" k="debtRate" suffix="%"/><Inp label="AMORT. (YRS)" k="debtYears" suffix="yr"/><Inp label="MIN DSCR" k="dscrThreshold" suffix="x"/></div>
      <div style={{marginTop:8,display:"flex",gap:16,flexWrap:"wrap"}}><span style={{fontSize:12,color:"#555"}}>Debt: <strong style={{fontFamily:mono}}>{fmt(debtAmount)}</strong></span><span style={{fontSize:12,color:"#555"}}>Equity at close: <strong style={{fontFamily:mono}}>{fmt(equityAtClose)}</strong></span>{a.earnout&&<span style={{fontSize:12,color:"#555"}}>+ Earnout equity: <strong style={{fontFamily:mono}}>{fmt(earnoutAmt)}</strong></span>}<span style={{fontSize:12,color:"#555"}}>Total equity: <strong style={{fontFamily:mono}}>{fmt(totalEquity)}</strong></span></div>
    </div>

    <div style={{background:"#f8f8f5",borderRadius:8,padding:16,marginBottom:12}}>
      <span style={{fontSize:11,fontWeight:600,display:"block",marginBottom:10}}>Taxes, Capex & Working Capital</span>
      <div style={{display:"flex",flexWrap:"wrap",gap:10}}><Inp label="TAX RATE (%)" k="taxRate" suffix="%"/><Inp label="MAINT. CAPEX (% OF REV)" k="capexPct" suffix="%"/><Inp label="WORKING CAPITAL (% OF EBITDA)" k="wcPct" suffix="%"/></div>
      <p style={{fontSize:10,color:"#888",marginTop:6,fontStyle:"italic"}}>Cash sweep returns cash balance above working capital to equity holders. Toggle per year in the table.</p>
    </div>

    <div style={{background:"#f8f8f5",borderRadius:8,padding:16,marginBottom:16}}>
      <span style={{fontSize:11,fontWeight:600,display:"block",marginBottom:10}}>Growth & Exit</span>
      <div style={{display:"flex",flexWrap:"wrap",gap:10}}><Inp label="REVENUE GROWTH (%/yr)" k="revGrowth" suffix="%"/><Inp label="EBITDA MARGIN GROWTH (%/yr)" k="marginGrowth" suffix="%"/><Inp label="HOLDING PERIOD (YRS)" k="holdingPeriod" suffix="yr"/><Inp label="EXIT MULTIPLE (x)" k="exitMultiple" suffix="x"/></div>
      <div style={{marginTop:8,display:"flex",gap:14,flexWrap:"wrap"}}>
        <span style={{fontSize:12,color:"#555"}}>Exit Rev: <strong style={{fontFamily:mono}}>{fmt(exitRow.rev||0)}</strong></span>
        <span style={{fontSize:12,color:"#555"}}>Margin: <strong style={{fontFamily:mono}}>{(exitRow.margin||0).toFixed(1)}%</strong></span>
        <span style={{fontSize:12,color:"#555"}}>EBITDA: <strong style={{fontFamily:mono}}>{fmt(exitRow.ebitda||0)}</strong></span>
        <span style={{fontSize:12,color:"#555"}}>Value ({a.basisMetric} x {num("exitMultiple")}x): <strong style={{fontFamily:mono}}>{fmt(exitValue)}</strong></span>
        <span style={{fontSize:12,color:"#555"}}>Debt: <strong style={{fontFamily:mono}}>{fmt(exitDebt)}</strong></span>
        <span style={{fontSize:12,color:"#555"}}>Proceeds: <strong style={{fontFamily:mono}}>{fmt(eqProc)}</strong></span>
      </div>
    </div>

    <div style={{borderRadius:8,border:"1px solid #e8e6df",overflow:"auto",marginBottom:16}}>
      <div style={{display:"grid",gridTemplateColumns:".3fr .65fr .4fr .65fr .45fr .4fr .55fr .55fr .55fr .6fr .55fr .4fr .7fr",padding:"6px 10px",background:"#f5f4f0",gap:2,minWidth:920}}>
        {["Yr","Revenue","Margin","EBITDA","Capex","Taxes","Debt Svc","Debt Bal","Equity","FCF","Cash Bal","DSCR","Cash Sweep"].map(h=><span key={h} style={{fontSize:8,fontWeight:600,color:"#888",fontFamily:mono}}>{h}</span>)}
      </div>
      {rows.map((y,i)=>{const bad=!y.isYr0&&y.dscr<dscrTh;const yr0=y.isYr0;const gc=".3fr .65fr .4fr .65fr .45fr .4fr .55fr .55fr .55fr .6fr .55fr .4fr .7fr";return <div key={i} style={{display:"grid",gridTemplateColumns:gc,padding:"4px 10px",borderTop:yr0?"none":"1px solid #f0ede5",gap:2,background:yr0?"#f0ede5":bad?"#fef2f2":y.addlEquity>0?"#eff6ff":"transparent",minWidth:920,alignItems:"center"}}>
        <span style={{fontSize:11,fontFamily:mono,fontWeight:700,color:yr0?"#1a1a1a":"inherit"}}>{yr0?"Close":y.yr}</span>
        <span style={{fontSize:11,fontFamily:mono}}>{fmt(y.rev)}</span>
        <span style={{fontSize:11,fontFamily:mono,color:"#888"}}>{y.margin.toFixed(1)}%</span>
        <span style={{fontSize:11,fontFamily:mono,color:"#166534"}}>{fmt(y.ebitda)}</span>
        <span style={{fontSize:11,fontFamily:mono,color:yr0?"#ccc":"#888"}}>{yr0?"—":fmt(y.capex)}</span>
        <span style={{fontSize:11,fontFamily:mono,color:yr0?"#ccc":"#b91c1c"}}>{yr0?"—":fmt(y.taxes)}</span>
        <span style={{fontSize:11,fontFamily:mono,color:yr0?"#ccc":"inherit"}}>{yr0?"—":fmt(y.ds)}</span>
        <span style={{fontSize:11,fontFamily:mono,color:y.debtRem>0?"#b91c1c":"#166534"}}>{fmt(y.debtRem)}</span>
        <span style={{fontSize:11,fontFamily:mono,color:y.addlEquity>0?"#b45309":"#555"}}>{fmt(y.cumEquity)}{y.addlEquity>0?" ↑":""}</span>
        <span style={{fontSize:11,fontFamily:mono,fontWeight:yr0?400:600,color:yr0?"#ccc":y.fcf>=0?"#166534":"#b91c1c"}}>{yr0?"—":fmt(y.fcf)}</span>
        <span style={{fontSize:11,fontFamily:mono,color:"#0a66c2"}}>{fmt(y.cashBal)}</span>
        <span style={{fontSize:11,fontFamily:mono,fontWeight:bad?700:400,color:yr0?"#ccc":bad?"#b91c1c":"#166534"}}>{yr0?"—":y.dscr>=100?"∞":y.dscr.toFixed(2)+"x"}</span>
        <span style={{fontSize:11,fontFamily:mono,display:"flex",alignItems:"center",gap:4}}>
          {yr0||y.yr===hp?"—":y.cashBal<=y.wc&&!y.sweep?"—":<><div onClick={()=>setSweepToggles(p=>({...p,[y.yr]:!p[y.yr]}))} style={{width:24,height:14,borderRadius:7,background:sweepToggles[y.yr]?"#166534":"#ddd",cursor:"pointer",position:"relative",flexShrink:0}}><div style={{width:10,height:10,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:sweepToggles[y.yr]?12:2,transition:"left 0.15s",boxShadow:"0 1px 2px rgba(0,0,0,.2)"}}/></div><span style={{color:y.sweep>0?"#166534":"#ccc"}}>{y.sweep>0?fmt(y.sweep):"—"}</span></>}
        </span>
      </div>;})}
      {rows.some(y=>y.addlEquity>0)&&<div style={{padding:"4px 10px",borderTop:"1px solid #e8e6df",background:"#fefce8"}}><span style={{fontSize:10,color:"#92400e",fontFamily:mono}}>↑ Additional equity raised: {fmt(rows.reduce((s,y)=>s+y.addlEquity,0))} (earnout exceeded available FCF)</span></div>}
      {totSweep>0&&<div style={{padding:"4px 10px",borderTop:"1px solid #e8e6df",background:"#f0fdf4"}}><span style={{fontSize:10,color:"#166534",fontFamily:mono}}>Total cash swept to equity: {fmt(totSweep)} over {hp}yr hold</span></div>}
    </div>

    {dscrBad&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>⚠️</span><div><p style={{fontSize:13,fontWeight:600,color:"#b91c1c"}}>DSCR below {dscrTh.toFixed(2)}x</p><p style={{fontSize:12,color:"#92400e",marginTop:2}}>Cash flow insufficient to service debt. IRR and MOIC unreliable.</p></div></div>}

    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      <div style={kpi(moic>=2&&!dscrBad)}><Lbl>MOIC</Lbl><p style={{fontSize:22,fontWeight:700,color:dscrBad?"#888":moic>=2?"#166534":"#b91c1c",fontFamily:mono,marginTop:4,textDecoration:dscrBad?"line-through":"none"}}>{moic.toFixed(2)}x</p><p style={{fontSize:10,color:"#888",marginTop:2}}>{fmt(eqProc)} / {fmt(finalEquity)}</p></div>
      <div style={kpi(irrMet)}><Lbl>IRR on Equity</Lbl><p style={{fontSize:22,fontWeight:700,color:dscrBad?"#888":irr>=irrTarget?"#166534":"#b91c1c",fontFamily:mono,marginTop:4,textDecoration:dscrBad?"line-through":"none"}}>{pct(irr)}</p><p style={{fontSize:10,color:irrMet?"#166534":"#b91c1c",marginTop:2}}>{irr>=irrTarget?"✓":"✕"} Target: {targetIRR}%</p></div>
      <div style={kpi(!dscrBad)}><Lbl>Min DSCR</Lbl><p style={{fontSize:22,fontWeight:700,color:dscrBad?"#b91c1c":"#166534",fontFamily:mono,marginTop:4}}>{rows.filter(y=>!y.isYr0).length>0?Math.min(...rows.filter(y=>!y.isYr0).map(y=>y.dscr>=100?99:y.dscr)).toFixed(2)+"x":"—"}</p><p style={{fontSize:10,color:dscrBad?"#b91c1c":"#166534",marginTop:2}}>{dscrBad?"✕":"✓"} Min: {dscrTh.toFixed(2)}x</p></div>
      <div style={kpi(true)}><Lbl>Total Interest</Lbl><p style={{fontSize:22,fontWeight:700,color:"#1a1a1a",fontFamily:mono,marginTop:4}}>{fmt(totInt)}</p><p style={{fontSize:10,color:"#888",marginTop:2}}>{hp}yr hold</p></div>
      {totSweep>0&&<div style={kpi(true)}><Lbl>Cash Swept</Lbl><p style={{fontSize:22,fontWeight:700,color:"#166534",fontFamily:mono,marginTop:4}}>{fmt(totSweep)}</p><p style={{fontSize:10,color:"#888",marginTop:2}}>Returned to equity</p></div>}
    </div>

    <div style={{marginTop:16,padding:"14px 18px",borderRadius:8,background:achievable?"#f0fdf4":histOk?"#fefce8":"#eff6ff",border:`1px solid ${achievable?"#bbf7d0":histOk?"#fde68a":"#bfdbfe"}`,display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
      <span style={{fontSize:16,marginTop:2}}>{achievable?"✓":"📊"}</span>
      <div style={{flex:1,minWidth:200}}>
        <p style={{fontSize:13,lineHeight:1.6}}><strong>Revenue Growth Needed for {targetIRR}% IRR</strong></p>
        <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:6}}>
          <div><span style={{fontSize:10,color:"#888",fontFamily:mono}}>WITHOUT CASH SWEEP</span><p style={{fontSize:16,fontWeight:700,fontFamily:mono,color:achievable?"#166534":"#b45309",marginTop:2}}>{(neededGr*100).toFixed(1)}%</p></div>
          <div><span style={{fontSize:10,color:"#888",fontFamily:mono}}>WITH MAX CASH SWEEP</span><p style={{fontSize:16,fontWeight:700,fontFamily:mono,color:histOk&&histCAGR>=neededGrSweep*100?"#166534":"#b45309",marginTop:2}}>{(neededGrSweep*100).toFixed(1)}%</p></div>
          {histOk&&<div><span style={{fontSize:10,color:"#888",fontFamily:mono}}>HISTORICAL {cagrYrs>0?cagrYrs+"Y ":""}CAGR</span><p style={{fontSize:16,fontWeight:700,fontFamily:mono,color:achievable?"#166534":"#b91c1c",marginTop:2}}>{parseFloat(histCAGR).toFixed(1)}%</p></div>}
        </div>
        {histNote&&<p style={{fontSize:11,color:"#888",marginTop:6,fontStyle:"italic"}}>{histNote}</p>}
        {!histOk&&<p style={{fontSize:11,color:"#888",marginTop:6,fontStyle:"italic"}}>Historical revenue CAGR not available from document</p>}
      </div>
    </div>
  </div>;
}

function VersusResult({d}) {
  function Bar({sA,sB,label}){const t=sA+sB||1;return <div style={{marginBottom:16}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,fontWeight:600,color:"#0a66c2",fontFamily:mono}}>{sA}</span><span style={{fontSize:11,color:"#888"}}>{label}</span><span style={{fontSize:12,fontWeight:600,color:"#b45309",fontFamily:mono}}>{sB}</span></div><div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",gap:2}}><div style={{width:`${(sA/t)*100}%`,background:"#0a66c2",borderRadius:"4px 0 0 4px"}}/><div style={{flex:1,background:"#b45309",borderRadius:"0 4px 4px 0"}}/></div></div>;}
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}><div><span style={{fontSize:18,fontWeight:700,color:"#0a66c2"}}>{d.companyA}</span>{d.summaryA&&<p style={{fontSize:12,color:"#888",marginTop:2,maxWidth:240}}>{d.summaryA}</p>}</div><span style={{fontSize:12,color:"#ccc",fontFamily:mono,letterSpacing:2,paddingTop:4}}>VS</span><div style={{textAlign:"right"}}><span style={{fontSize:18,fontWeight:700,color:"#b45309"}}>{d.companyB}</span>{d.summaryB&&<p style={{fontSize:12,color:"#888",marginTop:2,maxWidth:240}}>{d.summaryB}</p>}</div></div>
    {d.dimensions?.map((x,i)=><div key={i}><Bar sA={x.scoreA} sB={x.scoreB} label={x.name}/><p style={{fontSize:12,color:"#666",marginTop:-8,marginBottom:16,fontStyle:"italic"}}>{x.insight}</p></div>)}
    <div style={{marginTop:16,padding:16,background:"#f0fdf4",borderRadius:8,border:"1px solid #bbf7d0"}}><Lbl>If You Can Only Buy One</Lbl><p style={{fontSize:14,marginTop:6,lineHeight:1.6,fontWeight:500}}>{d.ifYouCanOnlyBuyOne}</p></div>
    <div style={{marginTop:12,padding:16,background:"#f8f8f5",borderRadius:8}}><Lbl>Verdict</Lbl><p style={{fontSize:13,marginTop:6,lineHeight:1.6}}>{d.verdict}</p></div>
    {d.surprisingInsight&&<div style={{marginTop:12,padding:16,background:"#eff6ff",borderRadius:8,border:"1px solid #bfdbfe"}}><Lbl>Non-Obvious Insight</Lbl><p style={{fontSize:14,marginTop:6,lineHeight:1.6}}>{d.surprisingInsight}</p></div>}
  </div>;
}

export default function DealScopeAI() {
  const [mode,setMode]=useState("quickscreen");
  const [config,setConfig]=useState(DEFAULT_CONFIG);
  const [docs,setDocs]=useState([]);
  const [ctx,setCtx]=useState("");
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [error,setError]=useState(null);
  const [history,setHistory]=useState([]);
  const [showLBO,setShowLBO]=useState(false);
  const [incognito,setIncognito]=useState(false);
  const [mdl,setMdl]=useState("claude-sonnet-4-20250514");

  const m=MODES.find(x=>x.id===mode); const canRun=docs.length>=m.minDocs;

  async function run(){
    if(!canRun)return; setLoading(true);setError(null);setResult(null);
    try{
      const content=[];
      docs.forEach((d,i)=>{const lbl=docs.length>1?"Document "+String.fromCharCode(65+i):"Document";if(d.tp==="pdf"&&d.b64){content.push({type:"document",source:{type:"base64",media_type:"application/pdf",data:d.b64}});content.push({type:"text",text:"[Above PDF is "+lbl+': "'+d.name+'"]'});}else{content.push({type:"text",text:"--- "+lbl+': "'+d.name+'" ---\n\n'+d.txt+"\n\n--- End ---"});}});
      if(ctx.trim())content.push({type:"text",text:"\nAnalyst context: "+ctx.trim()});
      content.push({type:"text",text:"\nAnalyze the above. Respond ONLY in valid JSON."});
      const sysP=mode==="quickscreen"?buildScreenSys(config):mode==="deepdive"?buildDeepSys(incognito):VERSUS_SYS;
      const resp=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:mdl,max_tokens:8000,system:sysP,messages:[{role:"user",content:content}]})});
      const respText=await resp.text();
      let data;
      try{data=JSON.parse(respText);}catch{throw new Error(resp.status===413?"PDF too large. Try a smaller document (< 4MB).":"Server error ("+resp.status+"): "+respText.slice(0,100));}
      if(data.error)throw new Error(data.error.message);
      let cl=(data.content||[]).map(c=>c.text||"").join("").replace(/```json|```/g,"").trim();
      let br=0,bk=0;for(const c of cl){if(c==="{")br++;if(c==="}")br--;if(c==="[")bk++;if(c==="]")bk--;}while(bk>0){cl+="]";bk--;}while(br>0){cl+="}";br--;}
      const parsed=JSON.parse(cl);
      setResult({mode,data:parsed});
      setHistory(p=>[{mode,company:parsed.company||parsed.companyA||"Analysis"},...p.slice(0,9)]);
    }catch(e){setError("Analysis failed: "+(e.message||"Check documents."));}
    finally{setLoading(false);}
  }
  function reset(){setDocs([]);setResult(null);setError(null);setCtx("");setShowLBO(false);setIncognito(false);}

  return <div style={{fontFamily:sans,background:"#fafaf7",minHeight:"100vh",color:"#1a1a1a"}}>
    <div style={{borderBottom:"1px solid #e0ddd5",background:"#fff"}}><div style={{maxWidth:840,margin:"0 auto",padding:"24px 28px 20px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}><div><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:24,fontFamily:"'Fraunces',serif",fontWeight:700,letterSpacing:-.5}}>DealScope</span><span style={{fontSize:10,fontFamily:mono,color:"#fff",background:"#1a1a1a",padding:"2px 8px",borderRadius:3,letterSpacing:1}}>AI</span></div><p style={{fontSize:13,color:"#888",marginTop:2}}>Upload a CIM or exec summary. Screen, analyze, and model returns.</p></div><div style={{textAlign:"right"}}><span style={{fontSize:11,color:"#aaa",fontFamily:mono}}>by Gaurav Singh</span><br/><div style={{display:"flex",alignItems:"center",gap:6,marginTop:4,justifyContent:"flex-end"}}><select value={mdl} onChange={e=>setMdl(e.target.value)} style={{fontSize:10,fontFamily:mono,color:"#888",background:"#f5f4f0",border:"1px solid #e0ddd5",borderRadius:4,padding:"2px 6px",cursor:"pointer"}}><option value="claude-sonnet-4-20250514">Sonnet 4</option><option value="claude-opus-4-20250514">Opus 4</option></select></div></div></div></div></div>

    <div style={{maxWidth:840,margin:"0 auto",padding:"24px 28px 60px"}}>
      <ConfigForm config={config} setConfig={setConfig}/>
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>{MODES.map(x=><button key={x.id} onClick={()=>{setMode(x.id);reset();}} style={{flex:1,minWidth:180,padding:"14px 16px",borderRadius:10,background:mode===x.id?"#1a1a1a":"#fff",color:mode===x.id?"#fafaf7":"#555",border:`1px solid ${mode===x.id?"#1a1a1a":"#e0ddd5"}`,cursor:"pointer",textAlign:"left"}}><div style={{fontSize:18,marginBottom:4}}>{x.icon}</div><div style={{fontSize:13,fontWeight:600}}>{x.label}</div><div style={{fontSize:11,opacity:.7,marginTop:2,lineHeight:1.4}}>{x.desc}</div></button>)}</div>

      {!result&&<div style={{background:"#fff",borderRadius:12,border:"1px solid #e0ddd5",padding:24,marginBottom:24}}>
        <DocUploader docs={docs} setDocs={setDocs} maxDocs={m.maxDocs} label={mode==="versus"?"Upload 2 CIMs to compare":"Upload a CIM or executive summary"}/>
        {mode==="deepdive"&&docs.length>0&&<div style={{marginTop:14,display:"flex",flexDirection:"column",gap:10,padding:"12px 14px",background:"#f8f8f5",borderRadius:8}}>
          <Toggle on={showLBO} onToggle={()=>setShowLBO(!showLBO)} label="Build LBO Model" sub="Interactive returns analysis"/>
          <Toggle on={incognito} onToggle={()=>setIncognito(!incognito)} label="Incognito Mode" sub="Anonymize all identifying info in output"/>
        </div>}
        {docs.length>0&&<div style={{marginTop:16}}><label style={{fontSize:10,fontWeight:600,color:"#888",letterSpacing:1,textTransform:"uppercase",fontFamily:mono,display:"block",marginBottom:8}}>Additional context (optional)</label><textarea value={ctx} onChange={e=>setCtx(e.target.value)} placeholder="e.g. 'Asking price is 5x EBITDA'" rows={2} style={{width:"100%",fontSize:13,fontFamily:sans,border:"1px solid #e8e6df",borderRadius:8,padding:"10px 14px",resize:"none",background:"#fafaf7"}}/></div>}
        <div style={{marginTop:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:11,color:"#bbb",fontFamily:mono}}>{docs.length}/{m.minDocs} required</span><button onClick={run} disabled={!canRun||loading} style={{padding:"12px 32px",borderRadius:8,background:canRun&&!loading?"#1a1a1a":"#ddd",color:canRun&&!loading?"#fff":"#999",border:"none",cursor:canRun&&!loading?"pointer":"default",fontSize:14,fontWeight:600,fontFamily:mono}}>{loading?"Analyzing...":"Run "+m.label}</button></div>
      </div>}

      {loading&&<div style={{background:"#fff",borderRadius:12,border:"1px solid #e0ddd5",padding:40,textAlign:"center",marginBottom:24}}><div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:16}}>{[0,1,2,3,4].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:"#1a1a1a",animation:`pulse 1.2s ease infinite ${i*.15}s`}}/>)}</div><p style={{fontSize:14,color:"#555",fontWeight:500}}>{docs.length>1?"Comparing documents...":'Analyzing "'+docs[0]?.name+'"...'}</p><p style={{fontSize:12,color:"#999",marginTop:4,fontFamily:mono}}>{mode==="quickscreen"?"Screening against criteria":"Applying "+m.label.toLowerCase()+" framework"}</p></div>}

      {error&&<div style={{background:"#fef2f2",borderRadius:12,border:"1px solid #fecaca",padding:20,marginBottom:24}}><p style={{fontSize:13,color:"#b91c1c"}}>{error}</p><button onClick={()=>setError(null)} style={{marginTop:10,fontSize:12,color:"#b91c1c",background:"none",border:"1px solid #fecaca",padding:"4px 12px",borderRadius:6,cursor:"pointer",fontFamily:mono}}>Dismiss</button></div>}

      {result&&<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
          <Lbl>{m.label} Results</Lbl>
          <div style={{display:"flex",gap:8}}>
            {result.mode==="deepdive"&&incognito&&<span style={{fontSize:11,color:"#b45309",background:"#fefce8",border:"1px solid #fde68a",padding:"4px 12px",borderRadius:6,fontFamily:mono}}>🔒 Incognito</span>}
            <button onClick={reset} style={{fontSize:12,color:"#0a66c2",background:"none",border:"1px solid #0a66c2",padding:"4px 14px",borderRadius:6,cursor:"pointer",fontFamily:mono}}>New Analysis</button>
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e0ddd5",padding:24,marginBottom:24}}>
          {result.mode==="quickscreen"&&<ScorecardResult d={result.data}/>}
          {result.mode==="deepdive"&&<DeepDiveResult d={result.data} incognito={incognito}/>}
          {result.mode==="deepdive"&&showLBO&&<LBOModel targetIRR={config.targetIRR} lboInputs={{...result.data?.lboInputs,isSoftwareOrSaaS:result.data?.isSoftwareOrSaaS}}/>}
          {result.mode==="versus"&&<VersusResult d={result.data}/>}
        </div>
      </>}

      {history.length>0&&!loading&&<div style={{marginTop:8}}><Lbl>Recent</Lbl><div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>{history.map((h,i)=><span key={i} style={{fontSize:11,color:"#666",background:"#f5f4f0",border:"1px solid #e8e6df",padding:"4px 12px",borderRadius:20,fontFamily:mono}}>{MODES.find(x=>x.id===h.mode)?.icon} {h.company}</span>)}</div></div>}

      <div style={{marginTop:40,borderTop:"1px solid #e0ddd5",paddingTop:24}}>
        <h4 style={{fontSize:14,fontWeight:700,marginBottom:12}}>About DealScope AI</h4>
        <p style={{fontSize:13,color:"#666",lineHeight:1.7,marginBottom:12}}>Built on the evaluation framework from 200+ company diligences (50+ AI startups) during search fund operations. Configure criteria, upload CIMs, get structured scorecards and interactive LBO models with IRR goal-seeking.</p>
        <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>{[{l:"Built with",v:"Claude API + React"},{l:"Input",v:"CIMs, Exec Summaries"},{l:"Framework",v:"200+ evaluations"},{l:"Author",v:"Gaurav Singh"}].map((x,i)=><div key={i}><span style={{fontSize:10,color:"#aaa",fontFamily:mono}}>{x.l}</span><p style={{fontSize:12,color:"#555",fontWeight:500}}>{x.v}</p></div>)}</div>
      </div>
    </div>
  </div>;
}
