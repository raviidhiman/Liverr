import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
const CATS=[{name:"Graphics & Design",emoji:"🎨",bg:"#fef3f0"},{name:"Programming & Tech",emoji:"💻",bg:"#f0f7fe"},{name:"Digital Marketing",emoji:"📱",bg:"#fdf8f0"},{name:"Video & Animation",emoji:"🎬",bg:"#f0fdf4"},{name:"Writing & Translation",emoji:"✍️",bg:"#fdf0f8"},{name:"Music & Audio",emoji:"🎵",bg:"#f5f0fd"},{name:"Business",emoji:"📊",bg:"#f0fbfd"},{name:"Data",emoji:"🗃️",bg:"#fdfaf0"}];
const POPULAR=["Website Design","Logo Design","WordPress","Voice Over","Video Editing","SEO","Social Media","Copywriting"];
export default function HomePage() {
  const [q,setQ]=useState("");
  const nav=useNavigate();
  const search=e=>{e.preventDefault();if(q.trim())nav(`/gigs?search=${encodeURIComponent(q)}`)};
  return (
    <div>
      {/* Hero */}
      <section style={{background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)",padding:"72px 24px",textAlign:"center"}}>
        <div style={{maxWidth:700,margin:"0 auto"}}>
          <h1 style={{fontSize:44,fontWeight:800,color:"#fff",lineHeight:1.2,marginBottom:16}}>Find the perfect <span style={{color:"#1dbf73"}}>freelance</span> services for your business</h1>
          <p style={{fontSize:17,color:"rgba(255,255,255,0.75)",marginBottom:28}}>Work with talented freelancers. Get quality work done fast.</p>
          <form onSubmit={search} style={{display:"flex",background:"#fff",borderRadius:6,overflow:"hidden",maxWidth:620,margin:"0 auto 20px"}}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Try 'logo design' or 'react developer'..."
              style={{flex:1,padding:"16px 20px",fontSize:15,border:"none",outline:"none",fontFamily:"inherit"}}/>
            <button type="submit" className="btn-primary" style={{borderRadius:0,padding:"0 28px",fontSize:15}}>Search</button>
          </form>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
            <span style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>Popular:</span>
            {POPULAR.map(t=>(
              <button key={t} onClick={()=>nav(`/gigs?search=${encodeURIComponent(t)}`)}
                style={{fontSize:13,color:"rgba(255,255,255,0.8)",background:"transparent",border:"1px solid rgba(255,255,255,0.3)",borderRadius:20,padding:"4px 12px",cursor:"pointer",fontFamily:"inherit"}}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>
      {/* Trusted */}
      <section style={{borderBottom:"1px solid #dadbdd",padding:"14px 0"}}>
        <div className="container" style={{display:"flex",alignItems:"center",gap:32,flexWrap:"wrap"}}>
          <span style={{fontSize:13,color:"#95979d",fontWeight:500}}>Trusted by:</span>
          {["Meta","Google","Netflix","PayPal","Microsoft","Shopify"].map(b=><span key={b} style={{fontSize:18,fontWeight:800,color:"#b5b6ba",letterSpacing:-0.5}}>{b}</span>)}
        </div>
      </section>
      {/* Categories */}
      <section style={{padding:"56px 0",background:"#fff"}}>
        <div className="container">
          <h2 style={{fontSize:28,fontWeight:700,marginBottom:28,color:"#222325"}}>Popular categories</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:16}}>
            {CATS.map(c=>(
              <Link key={c.name} to={`/gigs?category=${encodeURIComponent(c.name)}`}
                style={{textDecoration:"none",background:c.bg,border:"1px solid #dadbdd",borderRadius:8,padding:"20px 16px",display:"block",transition:"box-shadow 0.2s,transform 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)";e.currentTarget.style.transform="translateY(-2px)"}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)"}}>
                <div style={{fontSize:32,marginBottom:10}}>{c.emoji}</div>
                <div style={{fontSize:13,fontWeight:600,color:"#222325",lineHeight:1.3}}>{c.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* How it works */}
      <section style={{padding:"56px 0",background:"#f5f5f5"}}>
        <div className="container">
          <h2 style={{fontSize:28,fontWeight:700,marginBottom:36,color:"#222325",textAlign:"center"}}>How it works</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:24}}>
            {[{icon:"🔍",title:"1. Find a service",desc:"Browse thousands of services from verified professionals across all categories."},{icon:"🤝",title:"2. Contact & Order",desc:"Chat with the seller, place your order and pay securely through our platform."},{icon:"✅",title:"3. Get results",desc:"Receive quality work on time. Approve delivery and release payment — guaranteed."}].map(s=>(
              <div key={s.title} style={{background:"#fff",border:"1px solid #dadbdd",borderRadius:8,padding:28,textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:16}}>{s.icon}</div>
                <h3 style={{fontSize:17,fontWeight:700,color:"#222325",marginBottom:10}}>{s.title}</h3>
                <p style={{fontSize:14,color:"#62646a",lineHeight:1.6}}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA */}
      <section style={{background:"#1dbf73",padding:"56px 24px",textAlign:"center"}}>
        <h2 style={{fontSize:30,fontWeight:800,color:"#fff",marginBottom:12}}>Ready to get started?</h2>
        <p style={{fontSize:16,color:"rgba(255,255,255,0.85)",marginBottom:24}}>Join thousands of businesses and freelancers.</p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <Link to="/gigs" className="btn-secondary" style={{background:"#fff",color:"#1dbf73",borderColor:"#fff"}}>Find a Service</Link>
          <Link to="/register" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",background:"transparent",color:"#fff",border:"2px solid #fff",fontWeight:600,fontSize:14,padding:"11px 22px",borderRadius:4,textDecoration:"none"}}>Become a Seller</Link>
        </div>
      </section>
      {/* Footer */}
      <footer style={{background:"#222325",color:"#fff",padding:"40px 0 24px"}}>
        <div className="container">
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:32,marginBottom:32}}>
            <div>
              <div style={{fontSize:20,fontWeight:800,marginBottom:12}}>freelance<span style={{color:"#1dbf73"}}>hub</span></div>
              <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.6}}>The marketplace for digital freelance services.</p>
            </div>
            {[{title:"Categories",links:["Graphics & Design","Programming & Tech","Digital Marketing","Video & Animation"]},{title:"For Sellers",links:["Become a Seller","Post a Gig","Dashboard"]},{title:"Support",links:["Help Center","Privacy Policy","Terms"]}].map(col=>(
              <div key={col.title}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:"rgba(255,255,255,0.8)",textTransform:"uppercase",letterSpacing:"0.5px"}}>{col.title}</div>
                {col.links.map(l=><div key={l} style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginBottom:8}}>{l}</div>)}
              </div>
            ))}
          </div>
          <div style={{borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:20,fontSize:12,color:"rgba(255,255,255,0.35)",textAlign:"center"}}>
            © {new Date().getFullYear()} FreelanceHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
