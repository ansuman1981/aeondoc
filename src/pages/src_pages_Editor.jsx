import { useState, useRef, useEffect, useCallback } from "react";
import { sb } from "../App";

const C = { bg:"#F5F2ED",chrome:"#FDFCFA",border:"#E2DDD7",borderLight:"#EDE9E3",canvas:"#FFFFFF",uiText:"#3D3A36",sub:"#6B6560",muted:"#A09C97",accent:"#6B8F71",accentLight:"rgba(107,143,113,0.12)",accentDark:"#4A6B4F",rose:"#C0826A",roseLight:"rgba(192,130,106,0.12)",sky:"#7B9BAD",skyLight:"rgba(123,155,173,0.12)",amber:"#C9924A",saved:"#7AAB82",offline:"#E07B39",red:"#E05252" };
const FONTS=[{label:"DM Sans",value:"'DM Sans',system-ui,sans-serif"},{label:"Serif",value:"'DM Serif Display',Georgia,serif"},{label:"Mono",value:"'Courier New',monospace"},{label:"Georgia",value:"Georgia,'Times New Roman',serif"},{label:"Trebuchet",value:"'Trebuchet MS',sans-serif"}];
const SIZES=[10,11,12,13,14,15,16,18,20,22,24,28,32,36,48];
const PALETTE=["#1A1A1A","#555","#888","#BBB","#FFF","#C0392B","#E74C3C","#D35400","#E67E22","#F39C12","#F1C40F","#27AE60","#6B8F71","#1ABC9C","#2980B9","#3498DB","#8E44AD","#9B59B6","#C0826A","#7B9BAD","#C9924A"];
const uid=()=>Math.random().toString(36).slice(2,10);
const SEP=()=><div style={{width:1,height:20,background:C.borderLight,margin:"0 4px",flexShrink:0}}/>;

export default function Editor({ user, doc: initialDoc, onBack }) {
  const [title,      setTitle]      = useState(initialDoc?.title||"");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [wordCount,  setWordCount]  = useState(initialDoc?.words||0);
  const [aiMode,     setAiMode]     = useState(null);
  const [aiResult,   setAiResult]   = useState("");
  const [aiLoading,  setAiLoading]  = useState(false);
  const [fontSize,   setFontSize]   = useState(15);
  const [fontFamily, setFontFamily] = useState(FONTS[0].value);
  const [showColorPicker,setShowColorPicker]=useState(null);
  const [showFontMenu,   setShowFontMenu]   =useState(false);
  const [showSizeMenu,   setShowSizeMenu]   =useState(false);
  const [isOnline,   setIsOnline]   = useState(navigator.onLine);

  const editorRef  = useRef(null);
  const saveTimer  = useRef(null);
  const docId      = useRef(initialDoc?.id||uid());
  const isNew      = useRef(!initialDoc?.id);
  const fileRef    = useRef(null);

  useEffect(()=>{const on=()=>setIsOnline(true),off=()=>setIsOnline(false);window.addEventListener("online",on);window.addEventListener("offline",off);return()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off)};},[]);
  useEffect(()=>{if(editorRef.current&&initialDoc?.content){editorRef.current.innerHTML=initialDoc.content;setWordCount(initialDoc.words||0);}},[]);
  useEffect(()=>{const h=e=>{if(!e.target.closest(".ae-popup")&&!e.target.closest(".ae-popup-trigger")){setShowColorPicker(null);setShowFontMenu(false);setShowSizeMenu(false);}};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);

  const saveToSupabase=useCallback(async(html,titleVal)=>{
    if(!isOnline)return;
    setSaveStatus("saving");
    try{
      const client=await sb();
      const text=html.replace(/<[^>]+>/g,"");
      const words=text.trim().split(/\s+/).filter(Boolean).length;
      const payload={id:docId.current,user_id:user.id,title:titleVal||"Untitled",content:html,preview:text.slice(0,140),words,updated_at:new Date().toISOString()};
      if(isNew.current){payload.created_at=new Date().toISOString();const{error}=await client.from("documents").insert(payload);if(!error)isNew.current=false;if(error)throw error;}
      else{const{error}=await client.from("documents").update(payload).eq("id",docId.current);if(error)throw error;}
      setSaveStatus("saved");
    }catch(err){console.error(err);setSaveStatus("error");}
  },[user.id,isOnline]);

  const handleInput=()=>{setSaveStatus("unsaved");clearTimeout(saveTimer.current);const t=editorRef.current?.innerText||"";setWordCount(t.trim()?t.trim().split(/\s+/).length:0);saveTimer.current=setTimeout(()=>saveToSupabase(editorRef.current?.innerHTML||"",title),1200);};
  useEffect(()=>{if(title!==(initialDoc?.title||"")){clearTimeout(saveTimer.current);saveTimer.current=setTimeout(()=>saveToSupabase(editorRef.current?.innerHTML||"",title),800);}},[title]);

  const fmt=(cmd,val)=>{editorRef.current?.focus();document.execCommand(cmd,false,val||null);};
  const applyFont=(val)=>{setFontFamily(val);setShowFontMenu(false);editorRef.current?.focus();document.execCommand("fontName",false,val);};
  const applySize=(sz)=>{setFontSize(sz);setShowSizeMenu(false);editorRef.current?.focus();const sel=window.getSelection();if(sel&&sel.rangeCount&&!sel.isCollapsed){const r=sel.getRangeAt(0);const span=document.createElement("span");span.style.fontSize=sz+"px";try{r.surroundContents(span);}catch{}}};
  const applyColor=(color,type)=>{editorRef.current?.focus();if(type==="text")document.execCommand("foreColor",false,color);else document.execCommand("hiliteColor",false,color);setShowColorPicker(null);};
  const insertImage=(e)=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{editorRef.current?.focus();const img=document.createElement("img");img.src=ev.target.result;img.style.cssText="max-width:100%;width:360px;display:block;margin:12px 0;border-radius:6px;";const sel=window.getSelection();if(sel&&sel.rangeCount){const r=sel.getRangeAt(0);r.collapse(false);r.insertNode(img);r.setStartAfter(img);sel.removeAllRanges();sel.addRange(r);}else editorRef.current.appendChild(img);handleInput();};reader.readAsDataURL(file);e.target.value="";};

  const runAI=async(mode)=>{const text=editorRef.current?.innerText?.trim()||"";setAiMode(mode);setAiResult("");setAiLoading(true);if(!text){setAiLoading(false);setAiResult("Write something first.");return;}if(!isOnline){setAiLoading(false);setAiResult("AI requires internet.");return;}const prompts={summary:`Summarize into 5-7 crisp bullet points:\n\n${text}`,suggest:`Direct writing coach — 3-5 blunt suggestions:\n\n${text}`,structure:`Reorganize into clean doc. ONLY: # H1, ## H2, - bullets:\n\n${text}`};try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompts[mode]}]})});const d=await res.json();setAiResult((d.content||[]).filter(c=>c.type==="text").map(c=>c.text).join("")||"No response.");}catch{setAiResult("Connection error.");}setAiLoading(false);};
  const applyStructure=()=>{if(!editorRef.current||!aiResult)return;const lines=aiResult.split("\n");let html="";let inList=false;for(const line of lines){if(/^[-*] /.test(line)){if(!inList){html+="<ul>";inList=true;}html+=`<li>${line.slice(2)}</li>`;}else{if(inList){html+="</ul>";inList=false;}if(line.startsWith("# "))html+=`<h1>${line.slice(2)}</h1>`;else if(line.startsWith("## "))html+=`<h2>${line.slice(3)}</h2>`;else if(line.trim())html+=`<p>${line}</p>`;}}if(inList)html+="</ul>";editorRef.current.innerHTML=html;handleInput();setAiMode(null);setAiResult("");};
  const exportPDF=()=>{if(!window.html2pdf){alert("Loading…");return;}window.html2pdf().set({margin:14,filename:`${title||"document"}.pdf`,html2canvas:{scale:2},jsPDF:{unit:"mm",format:"a4"}}).from(document.getElementById("doc-canvas")).save();};

  useEffect(()=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";document.head.appendChild(s);},[]);

  const statusColor=saveStatus==="saved"?C.saved:saveStatus==="saving"?C.amber:saveStatus==="error"?C.red:C.muted;
  const statusText=!isOnline?"Offline":saveStatus==="saved"?"Saved ☁":saveStatus==="saving"?"Saving…":saveStatus==="error"?"Error":"Unsaved";
  const aiModes=[{mode:"summary",label:"Summarise",color:C.accent,lightColor:C.accentLight},{mode:"suggest",label:"Suggest",color:C.rose,lightColor:C.roseLight},{mode:"structure",label:"Structure",color:C.sky,lightColor:C.skyLight}];

  const IconBtn=({tip,onMouseDown,onClick,children,active})=>(
    <button title={tip} onMouseDown={onMouseDown} onClick={onClick}
      style={{background:active?C.accentLight:"transparent",border:`1px solid ${active?C.accent:C.border}`,color:active?C.accentDark:C.uiText,borderRadius:5,padding:"3px 8px",fontSize:13,fontWeight:500,cursor:"pointer",transition:"all 0.12s",lineHeight:1.5,display:"flex",alignItems:"center",gap:3,flexShrink:0}}
      onMouseEnter={e=>{if(!active)e.currentTarget.style.background="#F0EDE8"}}
      onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent"}}>{children}</button>
  );
  const ColorGrid=({type})=>(
    <div className="ae-popup" style={{position:"absolute",top:"100%",left:0,zIndex:100,marginTop:4,background:C.chrome,border:`1px solid ${C.border}`,borderRadius:8,padding:10,boxShadow:"0 4px 20px rgba(0,0,0,0.12)",display:"grid",gridTemplateColumns:"repeat(7,24px)",gap:4,width:210}}>
      <div style={{gridColumn:"1/-1",fontSize:10,color:C.muted,marginBottom:4,fontWeight:500,letterSpacing:"0.06em"}}>{type==="text"?"TEXT COLOR":"HIGHLIGHT"}</div>
      {PALETTE.map(col=>(<div key={col} onMouseDown={e=>{e.preventDefault();applyColor(col,type);}} style={{width:24,height:24,borderRadius:5,background:col,cursor:"pointer",border:col==="#FFF"?`1px solid ${C.border}`:"none",transition:"transform 0.1s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.2)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>))}
      <div style={{gridColumn:"1/-1",marginTop:6,display:"flex",gap:6,alignItems:"center"}}>
        <span style={{fontSize:10,color:C.muted,fontWeight:500}}>CUSTOM</span>
        <input type="color" defaultValue="#000000" style={{width:28,height:22,border:`1px solid ${C.border}`,borderRadius:4,cursor:"pointer",padding:1}} onMouseDown={e=>e.stopPropagation()} onChange={e=>applyColor(e.target.value,type)}/>
      </div>
    </div>
  );

  return (
    <div style={{background:C.bg,height:"100vh",display:"flex",flexDirection:"column",fontFamily:"'DM Sans',system-ui,sans-serif",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=DM+Serif+Display:ital@0;1&display=swap');
        *{box-sizing:border-box}
        #ae-editor{outline:none;font-size:${fontSize}px;font-family:${fontFamily}}
        #ae-editor:empty:before{content:'Begin writing...';color:#C4BFB9;font-style:italic;font-size:15px}
        #ae-editor h1{font-size:2em;font-weight:400;line-height:1.25;margin:1.4rem 0 0.5rem;letter-spacing:-0.01em;color:#1E1C19}
        #ae-editor h2{font-size:1.45em;font-weight:400;margin:1.1rem 0 0.4rem;color:#2C2825}
        #ae-editor h3{font-size:1.15em;font-weight:500;margin:0.9rem 0 0.3rem;color:#2C2825}
        #ae-editor p,#ae-editor div{margin:0 0 0.7rem;line-height:1.85;color:#3D3A36}
        #ae-editor ul,#ae-editor ol{padding-left:1.5rem;margin:0 0 0.7rem}
        #ae-editor li{margin-bottom:0.25rem;line-height:1.75;color:#3D3A36}
        #ae-editor b,#ae-editor strong{color:#1E1C19}
        #ae-editor img{max-width:100%;border-radius:6px;display:block;margin:10px 0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeSlide{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes popIn{from{opacity:0;transform:scale(0.96) translateY(-4px)}to{opacity:1;transform:scale(1) translateY(0)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:10px}
        ::selection{background:rgba(107,143,113,0.18)}
      `}</style>

      {/* Top bar */}
      <div style={{background:C.chrome,borderBottom:`1px solid ${C.border}`,padding:"10px 20px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <button onClick={onBack} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5,flexShrink:0,fontFamily:"inherit",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accentDark}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted}}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          My Docs
        </button>
        <div style={{width:1,height:18,background:C.border}}/>
        <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect width="18" height="18" rx="4" fill={C.accent} opacity="0.9"/><path d="M4 6h10M4 9h7M4 12h8" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <span style={{color:C.accentDark,fontWeight:500,fontSize:12}}>Aeondoc</span>
        </div>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Untitled document" style={{background:"transparent",border:"none",outline:"none",color:C.uiText,fontSize:13.5,fontWeight:500,flex:1,minWidth:0,maxWidth:340}}/>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            {saveStatus==="saving"&&<div style={{width:12,height:12,border:`2px solid ${C.border}`,borderTopColor:C.amber,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>}
            {saveStatus!=="saving"&&<div style={{width:6,height:6,borderRadius:"50%",background:statusColor,transition:"background 0.4s"}}/>}
            <span style={{fontSize:12,color:statusColor,fontWeight:500}}>{statusText}</span>
          </div>
          <span style={{fontSize:12,color:C.muted}}>{wordCount}w</span>
          <button onClick={exportPDF} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.uiText,borderRadius:6,padding:"5px 14px",fontSize:12,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all 0.15s",fontFamily:"inherit"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accentDark}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.uiText}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 6l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Export PDF
          </button>
        </div>
      </div>

      {!isOnline&&<div style={{background:"rgba(224,123,57,0.1)",borderBottom:`1px solid ${C.offline}44`,padding:"8px 20px",display:"flex",alignItems:"center",gap:8,flexShrink:0}}><div style={{width:7,height:7,borderRadius:"50%",background:C.offline,flexShrink:0}}/><span style={{fontSize:12,color:C.offline,fontWeight:500}}>You're offline — changes will sync when connection returns</span></div>}

      {/* Toolbar */}
      <div style={{background:C.chrome,borderBottom:`1px solid ${C.borderLight}`,padding:"6px 20px",display:"flex",alignItems:"center",gap:4,flexShrink:0,flexWrap:"wrap",rowGap:6}}>
        <IconBtn tip="H1" onMouseDown={e=>{e.preventDefault();fmt("formatBlock","h1")}}>H1</IconBtn>
        <IconBtn tip="H2" onMouseDown={e=>{e.preventDefault();fmt("formatBlock","h2")}}>H2</IconBtn>
        <IconBtn tip="H3" onMouseDown={e=>{e.preventDefault();fmt("formatBlock","h3")}}>H3</IconBtn>
        <SEP/>
        <IconBtn tip="Bold"      onMouseDown={e=>{e.preventDefault();fmt("bold")}}><b>B</b></IconBtn>
        <IconBtn tip="Italic"    onMouseDown={e=>{e.preventDefault();fmt("italic")}}><i>I</i></IconBtn>
        <IconBtn tip="Underline" onMouseDown={e=>{e.preventDefault();fmt("underline")}}><u>U</u></IconBtn>
        <IconBtn tip="Strike"    onMouseDown={e=>{e.preventDefault();fmt("strikeThrough")}}><s>S</s></IconBtn>
        <SEP/>
        <IconBtn tip="Bullets" onMouseDown={e=>{e.preventDefault();fmt("insertUnorderedList")}}>• List</IconBtn>
        <IconBtn tip="Numbers" onMouseDown={e=>{e.preventDefault();fmt("insertOrderedList")}}>1. List</IconBtn>
        <IconBtn tip="Left"    onMouseDown={e=>{e.preventDefault();fmt("justifyLeft")}}>≡L</IconBtn>
        <IconBtn tip="Center"  onMouseDown={e=>{e.preventDefault();fmt("justifyCenter")}}>≡C</IconBtn>
        <IconBtn tip="Right"   onMouseDown={e=>{e.preventDefault();fmt("justifyRight")}}>≡R</IconBtn>
        <SEP/>
        <div style={{position:"relative"}}>
          <button className="ae-popup-trigger" onClick={()=>{setShowFontMenu(v=>!v);setShowSizeMenu(false);setShowColorPicker(null);}} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.uiText,borderRadius:5,padding:"3px 10px",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:fontFamily,minWidth:90}}>
            <span style={{flex:1,overflow:"hidden",whiteSpace:"nowrap",maxWidth:76}}>{FONTS.find(f=>f.value===fontFamily)?.label||"Font"}</span>
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M1 1l3 3 3-3" stroke={C.muted} strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>
          {showFontMenu&&<div className="ae-popup" style={{position:"absolute",top:"100%",left:0,zIndex:100,marginTop:4,background:C.chrome,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.12)",minWidth:140,animation:"popIn 0.15s ease"}}>{FONTS.map(f=>(<div key={f.value} onMouseDown={()=>applyFont(f.value)} style={{padding:"8px 14px",fontSize:13,fontFamily:f.value,cursor:"pointer",background:fontFamily===f.value?C.accentLight:"transparent",color:fontFamily===f.value?C.accentDark:C.uiText}} onMouseEnter={e=>{if(fontFamily!==f.value)e.currentTarget.style.background="#F0EDE8"}} onMouseLeave={e=>{if(fontFamily!==f.value)e.currentTarget.style.background="transparent"}}>{f.label}</div>))}</div>}
        </div>
        <div style={{position:"relative"}}>
          <button className="ae-popup-trigger" onClick={()=>{setShowSizeMenu(v=>!v);setShowFontMenu(false);setShowColorPicker(null);}} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.uiText,borderRadius:5,padding:"3px 8px",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4,minWidth:50}}>
            <span>{fontSize}</span>
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M1 1l3 3 3-3" stroke={C.muted} strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>
          {showSizeMenu&&<div className="ae-popup" style={{position:"absolute",top:"100%",left:0,zIndex:100,marginTop:4,background:C.chrome,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.12)",maxHeight:180,overflowY:"auto",animation:"popIn 0.15s ease"}}>{SIZES.map(sz=>(<div key={sz} onMouseDown={()=>applySize(sz)} style={{padding:"6px 16px",fontSize:13,cursor:"pointer",background:fontSize===sz?C.accentLight:"transparent",color:fontSize===sz?C.accentDark:C.uiText,whiteSpace:"nowrap"}} onMouseEnter={e=>{if(fontSize!==sz)e.currentTarget.style.background="#F0EDE8"}} onMouseLeave={e=>{if(fontSize!==sz)e.currentTarget.style.background="transparent"}}>{sz}px</div>))}</div>}
        </div>
        <SEP/>
        <div style={{position:"relative"}}>
          <button className="ae-popup-trigger" title="Text colour" onClick={()=>{setShowColorPicker(v=>v==="text"?null:"text");setShowFontMenu(false);setShowSizeMenu(false);}} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.uiText,borderRadius:5,padding:"3px 8px",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontWeight:700,borderBottom:"2.5px solid #C0392B",lineHeight:1.3}}>A</span>
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M1 1l3 3 3-3" stroke={C.muted} strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>
          {showColorPicker==="text"&&<ColorGrid type="text"/>}
        </div>
        <div style={{position:"relative"}}>
          <button className="ae-popup-trigger" title="Highlight" onClick={()=>{setShowColorPicker(v=>v==="bg"?null:"bg");setShowFontMenu(false);setShowSizeMenu(false);}} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.uiText,borderRadius:5,padding:"3px 8px",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontWeight:600,background:"#F1C40F",padding:"0 3px",borderRadius:2}}>H</span>
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M1 1l3 3 3-3" stroke={C.muted} strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>
          {showColorPicker==="bg"&&<ColorGrid type="bg"/>}
        </div>
        <SEP/>
        <IconBtn tip="Insert image" onClick={()=>fileRef.current?.click()}>
          <svg width="13" height="11" viewBox="0 0 13 11" fill="none"><rect x="0.5" y="0.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.1"/><circle cx="3.5" cy="3.5" r="1.2" fill="currentColor"/><path d="M0.5 7l3-2.5 2.5 2.5 2-1.5 4 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{fontSize:11}}>Image</span>
        </IconBtn>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={insertImage}/>
        <SEP/>
        <span style={{color:C.muted,fontSize:10,fontWeight:600,letterSpacing:"0.1em",marginRight:4}}>AI</span>
        {aiModes.map(({mode,label,color,lightColor})=>(
          <button key={mode} onClick={()=>runAI(mode)} style={{background:aiMode===mode?lightColor:"transparent",border:`1px solid ${aiMode===mode?color:C.border}`,color:aiMode===mode?color:C.muted,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.15s"}} onMouseEnter={e=>{if(aiMode!==mode){e.currentTarget.style.borderColor=color;e.currentTarget.style.color=color}}} onMouseLeave={e=>{if(aiMode!==mode){e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted}}}>{label}</button>
        ))}
        {aiMode&&<button onClick={()=>{setAiMode(null);setAiResult("");}} style={{marginLeft:"auto",background:"transparent",border:"none",color:C.muted,fontSize:12,cursor:"pointer",padding:"3px 8px"}} onMouseEnter={e=>e.currentTarget.style.color=C.uiText} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>✕ Close</button>}
      </div>

      {/* Body */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:"36px 20px",background:C.bg}}>
          <div id="doc-canvas" style={{maxWidth:680,margin:"0 auto",background:C.canvas,border:`1px solid ${C.border}`,borderRadius:10,padding:"52px 60px",minHeight:560,boxShadow:"0 2px 24px rgba(100,90,80,0.07)"}}>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Document title" style={{display:"block",width:"100%",border:"none",outline:"none",background:"transparent",fontSize:28,fontWeight:400,color:"#1E1C19",fontFamily:"'DM Serif Display',Georgia,serif",lineHeight:1.25,marginBottom:title?8:28,letterSpacing:"-0.01em"}}/>
            {title&&<div style={{width:36,height:2,background:C.accent,borderRadius:2,marginBottom:28,opacity:0.7}}/>}
            <div id="ae-editor" ref={editorRef} contentEditable suppressContentEditableWarning onInput={handleInput} style={{minHeight:340,outline:"none"}}/>
          </div>
        </div>
        {aiMode&&(
          <div style={{width:296,background:C.chrome,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",animation:"fadeSlide 0.2s ease",flexShrink:0}}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.borderLight}`,display:"flex",alignItems:"center",gap:8}}>
              {(()=>{const m=aiModes.find(x=>x.mode===aiMode);return(<><div style={{width:7,height:7,borderRadius:"50%",background:m?.color}}/><span style={{color:C.uiText,fontSize:13,fontWeight:500}}>{m?.label}</span></>);})()}
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
              {aiLoading?(<div style={{display:"flex",flexDirection:"column",gap:16,alignItems:"center",paddingTop:24}}><div style={{width:18,height:18,border:`2px solid ${C.border}`,borderTopColor:C.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/><p style={{color:C.muted,fontSize:13,margin:0,textAlign:"center"}}>Reading your document…</p></div>):(<p style={{color:C.sub,fontSize:13.5,lineHeight:1.8,whiteSpace:"pre-wrap",margin:0,animation:"fadeIn 0.3s ease"}}>{aiResult}</p>)}
            </div>
            {aiMode==="structure"&&aiResult&&!aiLoading&&(<div style={{padding:"12px 18px",borderTop:`1px solid ${C.borderLight}`}}><button onClick={applyStructure} style={{width:"100%",background:C.sky,border:"none",color:"#1A2D38",borderRadius:7,padding:"9px",fontSize:13,fontWeight:500,cursor:"pointer"}}>Apply to document</button></div>)}
          </div>
        )}
      </div>
    </div>
  );
}
