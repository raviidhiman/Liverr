import { useRef, useState } from "react";
export default function OTPInput({ onComplete, disabled }) {
  const [vals, setVals] = useState(Array(6).fill(""));
  const refs = useRef([]);
  const handle = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const n=[...vals]; n[i]=v.slice(-1); setVals(n);
    if (v && i<5) refs.current[i+1]?.focus();
    if (n.every(Boolean) && n.join("").length===6) onComplete(n.join(""));
  };
  const keydown = (i, e) => { if (e.key==="Backspace" && !vals[i] && i>0) refs.current[i-1]?.focus(); };
  const paste = e => { e.preventDefault(); const p=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6); if(p.length===6){setVals(p.split(""));onComplete(p);} };
  return (
    <div style={{display:"flex",gap:10,justifyContent:"center"}}>
      {vals.map((v,i)=>(
        <input key={i} ref={el=>refs.current[i]=el} type="text" inputMode="numeric" maxLength={1} value={v} disabled={disabled}
          onChange={e=>handle(i,e.target.value)} onKeyDown={e=>keydown(i,e)} onPaste={paste} onFocus={e=>e.target.select()}
          style={{width:48,height:56,textAlign:"center",fontSize:22,fontWeight:700,border:v?"2px solid #1dbf73":"2px solid #dadbdd",borderRadius:6,outline:"none",background:v?"#f0fdf8":"#fff",color:v?"#1dbf73":"#222325",fontFamily:"monospace",transition:"all 0.15s",opacity:disabled?0.6:1}}
        />
      ))}
    </div>
  );
}
