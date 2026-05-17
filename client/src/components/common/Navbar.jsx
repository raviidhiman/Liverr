import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
const CATS=["Graphics & Design","Programming & Tech","Digital Marketing","Writing & Translation","Video & Animation","Music & Audio","Business","Data"];
export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [drop, setDrop] = useState(false);
  const dropRef = useRef(null);
  useEffect(()=>{
    const h=e=>{if(dropRef.current&&!dropRef.current.contains(e.target))setDrop(false)};
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[]);
  const search=e=>{e.preventDefault();if(q.trim()){nav(`/gigs?search=${encodeURIComponent(q)}`);setQ("");}};
  return (
    <header style={{position:"sticky",top:0,zIndex:100,background:"#fff",borderBottom:"1px solid #dadbdd",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
      <div className="container" style={{display:"flex",alignItems:"center",height:72,gap:16}}>
        <Link to="/" style={{textDecoration:"none",flexShrink:0,marginRight:8}}>
          <span style={{fontSize:24,fontWeight:800,color:"#222325",letterSpacing:"-0.5px"}}>freelance<span style={{color:"#1dbf73"}}>hub</span></span>
        </Link>
        <form onSubmit={search} style={{flex:1,maxWidth:560,display:"flex",border:"1px solid #222325",borderRadius:4,overflow:"hidden"}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="What service are you looking for today?"
            style={{flex:1,padding:"10px 16px",fontSize:14,border:"none",outline:"none",fontFamily:"inherit"}}/>
          <button type="submit" style={{background:"#222325",color:"#fff",border:"none",padding:"0 18px",cursor:"pointer",display:"flex",alignItems:"center"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </form>
        <nav style={{display:"flex",alignItems:"center",gap:20,marginLeft:"auto",flexShrink:0}}>
          {!user ? (
            <>
              <Link to="/login" style={{fontSize:14,fontWeight:500,color:"#62646a",textDecoration:"none"}}>Sign In</Link>
              <Link to="/register" className="btn-secondary" style={{padding:"9px 18px",fontSize:14}}>Join</Link>
            </>
          ) : (
            <>
              <Link to="/inbox" title="Inbox" style={{color:"#62646a",display:"flex"}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </Link>
              <Link to="/orders" style={{fontSize:14,fontWeight:500,color:"#62646a",textDecoration:"none"}}>Orders</Link>
              {user.role==="seller"&&<Link to="/my-gigs" style={{fontSize:14,fontWeight:500,color:"#62646a",textDecoration:"none"}}>My Gigs</Link>}
              <div style={{position:"relative"}} ref={dropRef}>
                <button onClick={()=>setDrop(d=>!d)} style={{width:36,height:36,borderRadius:"50%",background:"#1dbf73",color:"#fff",border:"none",cursor:"pointer",fontWeight:700,fontSize:15}}>
                  {user.name?.[0]?.toUpperCase()}
                </button>
                {drop&&(
                  <div style={{position:"absolute",right:0,top:"calc(100% + 8px)",width:210,background:"#fff",border:"1px solid #dadbdd",borderRadius:6,boxShadow:"0 4px 20px rgba(0,0,0,0.12)",zIndex:200}}>
                    <div style={{padding:"12px 16px",borderBottom:"1px solid #dadbdd"}}>
                      <div style={{fontWeight:600,fontSize:14,color:"#222325"}}>{user.name}</div>
                      <div style={{fontSize:12,color:"#95979d",marginTop:2}}>{user.email}</div>
                    </div>
                    {[
                      {to:"/dashboard",label:"Dashboard"},
                      {to:"/inbox",label:"Inbox"},
                      ...(user.role==="seller"?[{to:"/my-gigs",label:"My Gigs"},{to:"/gigs/new",label:"Post a Gig"}]:[]),
                      {to:`/profile/${user._id}`,label:"Profile"},
                      {to:"/orders",label:"Orders"},
                    ].map(item=>(
                      <Link key={item.to} to={item.to} onClick={()=>setDrop(false)}
                        style={{display:"block",padding:"10px 16px",fontSize:14,color:"#222325",textDecoration:"none",borderBottom:"1px solid #f5f5f5"}}
                        onMouseEnter={e=>e.target.style.background="#f5f5f5"}
                        onMouseLeave={e=>e.target.style.background="transparent"}>
                        {item.label}
                      </Link>
                    ))}
                    <button onClick={()=>{logout();setDrop(false);nav("/");}}
                      style={{display:"block",width:"100%",textAlign:"left",padding:"10px 16px",fontSize:14,color:"#c0392b",background:"none",border:"none",cursor:"pointer",borderTop:"1px solid #dadbdd"}}>
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </div>
      <div style={{borderTop:"1px solid #dadbdd",overflowX:"auto"}}>
        <div className="container" style={{display:"flex",gap:0}}>
          {CATS.map(c=>(
            <Link key={c} to={`/gigs?category=${encodeURIComponent(c)}`}
              style={{fontSize:13,color:"#62646a",textDecoration:"none",padding:"10px 14px",whiteSpace:"nowrap",borderBottom:"2px solid transparent",display:"block"}}
              onMouseEnter={e=>{e.target.style.color="#222325";e.target.style.borderBottomColor="#222325"}}
              onMouseLeave={e=>{e.target.style.color="#62646a";e.target.style.borderBottomColor="transparent"}}>
              {c}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
