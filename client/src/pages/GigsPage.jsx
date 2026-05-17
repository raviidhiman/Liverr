import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import GigCard from "../components/gigs/GigCard";
import Spinner from "../components/common/Spinner";
import api from "../api/axios";
const CATS=["Graphics & Design","Digital Marketing","Writing & Translation","Video & Animation","Music & Audio","Programming & Tech","Business","Data","Lifestyle"];
export default function GigsPage() {
  const [sp,setSp]=useSearchParams();
  const [gigs,setGigs]=useState([]); const [total,setTotal]=useState(0); const [loading,setLoading]=useState(true);
  const [page,setPage]=useState(1); const [cat,setCat]=useState(sp.get("category")||""); const [sort,setSort]=useState("-createdAt"); const [min,setMin]=useState(""); const [max,setMax]=useState("");
  const search=sp.get("search")||"";
  useEffect(()=>{setCat(sp.get("category")||"");setPage(1);},[sp.toString()]);
  useEffect(()=>{
    setLoading(true);
    const params={page,limit:16,sort};
    if(cat)params.category=cat; if(search)params.search=search; if(min)params.min=min; if(max)params.max=max;
    api.get("/gigs",{params}).then(r=>{setGigs(r.data.gigs||[]);setTotal(r.data.total||0);}).catch(()=>setGigs([])).finally(()=>setLoading(false));
  },[cat,search,sort,min,max,page]);
  const pages=Math.ceil(total/16);
  return (
    <div style={{minHeight:"calc(100vh - 120px)"}}>
      <div style={{borderBottom:"1px solid #dadbdd",background:"#fff",padding:"16px 0"}}>
        <div className="container">
          <p style={{fontSize:13,color:"#95979d",marginBottom:4}}><Link to="/" style={{color:"#95979d",textDecoration:"none"}}>Home</Link> › {cat||(search?`"${search}"`:"All Services")}</p>
          <h1 style={{fontSize:26,fontWeight:700}}>{search?`Results for "${search}"`:(cat||"All Services")}</h1>
          {!loading&&<p style={{fontSize:13,color:"#95979d",marginTop:4}}>{total.toLocaleString()} services available</p>}
        </div>
      </div>
      <div className="container" style={{paddingTop:24,paddingBottom:48}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:24,alignItems:"center"}}>
          <select value={cat} onChange={e=>{setCat(e.target.value);setPage(1);}} style={{border:"1px solid #dadbdd",borderRadius:4,padding:"8px 12px",fontSize:13,color:"#222325",background:"#fff",cursor:"pointer",outline:"none",fontFamily:"inherit"}}>
            <option value="">All Categories</option>{CATS.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}} style={{border:"1px solid #dadbdd",borderRadius:4,padding:"8px 12px",fontSize:13,color:"#222325",background:"#fff",cursor:"pointer",outline:"none",fontFamily:"inherit"}}>
            <option value="-createdAt">Newest First</option><option value="-rating">Best Rated</option><option value="-orderCount">Most Popular</option>
          </select>
          <div style={{display:"flex",alignItems:"center",gap:6,border:"1px solid #dadbdd",borderRadius:4,padding:"8px 12px"}}>
            <span style={{fontSize:13,color:"#62646a"}}>Budget $</span>
            <input type="number" placeholder="Min" value={min} onChange={e=>{setMin(e.target.value);setPage(1);}} style={{width:60,border:"none",outline:"none",fontSize:13,fontFamily:"inherit"}}/>
            <span style={{color:"#dadbdd"}}>–</span>
            <input type="number" placeholder="Max" value={max} onChange={e=>{setMax(e.target.value);setPage(1);}} style={{width:60,border:"none",outline:"none",fontSize:13,fontFamily:"inherit"}}/>
          </div>
          {(cat||search||min||max)&&<button onClick={()=>{setCat("");setMin("");setMax("");setSp({});setPage(1);}} style={{fontSize:13,color:"#1dbf73",background:"none",border:"none",cursor:"pointer",fontWeight:500}}>Clear all</button>}
        </div>
        {loading?<Spinner full/>:gigs.length===0?(
          <div style={{textAlign:"center",padding:"64px 24px"}}>
            <div style={{fontSize:56,marginBottom:16}}>🔍</div>
            <h2 style={{fontWeight:700,marginBottom:8}}>No results found</h2>
            <p style={{color:"#62646a",fontSize:14}}>Try adjusting filters or <Link to="/gigs" style={{color:"#1dbf73"}}>browse all services</Link></p>
          </div>
        ):(
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:20}}>
              {gigs.map(g=><GigCard key={g._id} gig={g}/>)}
            </div>
            {pages>1&&(
              <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:40}}>
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{width:36,height:36,border:"1px solid #dadbdd",borderRadius:4,background:"#fff",cursor:"pointer",fontSize:15,opacity:page===1?0.4:1}}>‹</button>
                {Array.from({length:Math.min(7,pages)},(_,i)=>i+1).map(n=>(
                  <button key={n} onClick={()=>setPage(n)} style={{width:36,height:36,border:"1px solid #dadbdd",borderRadius:4,background:page===n?"#222325":"#fff",color:page===n?"#fff":"#222325",cursor:"pointer",fontWeight:500,fontSize:13}}>{n}</button>
                ))}
                <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages} style={{width:36,height:36,border:"1px solid #dadbdd",borderRadius:4,background:"#fff",cursor:"pointer",fontSize:15,opacity:page===pages?0.4:1}}>›</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
