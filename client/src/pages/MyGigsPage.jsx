import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import Stars from "../components/common/Stars";
import api from "../api/axios";
export default function MyGigsPage() {
  const [gigs,setGigs]=useState([]); const [loading,setLoading]=useState(true);
  const [deletingId,setDeletingId]=useState(null); const [confirmId,setConfirmId]=useState(null);
  const fetchGigs=async()=>{try{const r=await api.get("/gigs/my-gigs");setGigs(r.data.gigs||[]);}catch{setGigs([]);}finally{setLoading(false);}};
  useEffect(()=>{fetchGigs();},[]);
  const handleDelete=async gigId=>{
    setDeletingId(gigId);
    try{await api.delete(`/gigs/${gigId}`);setGigs(prev=>prev.filter(g=>g._id!==gigId));}
    catch(e){alert(e.response?.data?.message||"Failed to delete gig");}
    finally{setDeletingId(null);setConfirmId(null);}
  };
  if(loading)return<Spinner full/>;
  return (
    <div style={{minHeight:"calc(100vh - 120px)",background:"#f5f5f5"}}>
      <div className="container" style={{paddingTop:32,paddingBottom:48}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,flexWrap:"wrap",gap:12}}>
          <div>
            <h1 style={{fontSize:26,fontWeight:700,color:"#222325",margin:0}}>My Gigs</h1>
            <p style={{fontSize:14,color:"#62646a",marginTop:4}}>{gigs.length} gig{gigs.length!==1?"s":""} published</p>
          </div>
          <Link to="/gigs/new" className="btn-primary" style={{padding:"10px 20px"}}>+ Create New Gig</Link>
        </div>
        {gigs.length===0?(
          <div style={{background:"#fff",border:"1px solid #dadbdd",borderRadius:8,padding:"60px 24px",textAlign:"center"}}>
            <div style={{fontSize:56,marginBottom:16}}>🎨</div>
            <h2 style={{fontWeight:700,fontSize:20,color:"#222325",marginBottom:8}}>No gigs yet</h2>
            <p style={{color:"#62646a",fontSize:14,marginBottom:24}}>Create your first gig and start earning</p>
            <Link to="/gigs/new" className="btn-primary">Create a Gig</Link>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {gigs.map(gig=>(
              <div key={gig._id} style={{background:"#fff",border:"1px solid #dadbdd",borderRadius:8,overflow:"hidden"}}>
                <div style={{display:"flex",gap:16,padding:"18px 20px",alignItems:"flex-start",flexWrap:"wrap"}}>
                  <div style={{width:80,height:60,background:"#f5f5f5",borderRadius:6,overflow:"hidden",flexShrink:0}}>
                    {gig.coverImage?<img src={gig.coverImage} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🎨</div>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <Link to={`/gigs/${gig._id}`} style={{fontWeight:700,fontSize:15,color:"#222325",textDecoration:"none",display:"block",marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{gig.title}</Link>
                    <div style={{display:"flex",flexWrap:"wrap",gap:"3px 14px",marginBottom:8}}>
                      <span style={{fontSize:12,background:"#f5f5f5",border:"1px solid #dadbdd",borderRadius:20,padding:"2px 10px",color:"#62646a"}}>{gig.category}</span>
                      <span style={{fontSize:12,color:"#62646a"}}>📦 {gig.orderCount||0} orders</span>
                      {gig.reviewCount>0&&<Stars rating={gig.rating} count={gig.reviewCount}/>}
                    </div>
                    <div style={{display:"flex",gap:16,fontSize:13,color:"#62646a",flexWrap:"wrap"}}>
                      <span>Basic: <strong style={{color:"#222325"}}>${gig.packages?.basic?.price||0}</strong></span>
                      {gig.packages?.standard?.price&&<span>Standard: <strong style={{color:"#222325"}}>${gig.packages.standard.price}</strong></span>}
                      {gig.packages?.premium?.price&&<span>Premium: <strong style={{color:"#222325"}}>${gig.packages.premium.price}</strong></span>}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:10,flexShrink:0}}>
                    <span style={{fontSize:12,fontWeight:600,padding:"4px 10px",borderRadius:20,background:gig.isActive?"#f0fdf8":"#f5f5f5",color:gig.isActive?"#1a7a4a":"#62646a"}}>{gig.isActive?"● Active":"● Paused"}</span>
                    <div style={{display:"flex",gap:8}}>
                      <Link to={`/gigs/${gig._id}`} style={{fontSize:13,padding:"7px 14px",border:"1px solid #dadbdd",borderRadius:4,color:"#222325",textDecoration:"none",fontWeight:500,background:"#fff"}}>View</Link>
                      <button onClick={()=>setConfirmId(gig._id)} style={{fontSize:13,padding:"7px 14px",border:"1px solid #ffd7d7",borderRadius:4,color:"#c0392b",background:"#fff9f9",cursor:"pointer",fontWeight:500,fontFamily:"inherit"}}>Delete</button>
                    </div>
                  </div>
                </div>
                {/* Confirm delete row */}
                {confirmId===gig._id&&(
                  <div style={{background:"#fff9f9",borderTop:"1px solid #ffd7d7",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                    <div>
                      <p style={{fontWeight:600,fontSize:14,color:"#c0392b",margin:"0 0 2px"}}>⚠️ Delete this gig?</p>
                      <p style={{fontSize:13,color:"#62646a",margin:0}}>This cannot be undone. All gig data will be permanently removed.</p>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>setConfirmId(null)} style={{fontSize:13,padding:"8px 16px",border:"1px solid #dadbdd",borderRadius:4,background:"#fff",cursor:"pointer",fontWeight:500,fontFamily:"inherit"}}>Cancel</button>
                      <button onClick={()=>handleDelete(gig._id)} disabled={deletingId===gig._id} style={{fontSize:13,padding:"8px 16px",border:"none",borderRadius:4,background:"#c0392b",color:"#fff",cursor:"pointer",fontWeight:600,opacity:deletingId===gig._id?0.7:1,fontFamily:"inherit"}}>
                        {deletingId===gig._id?"Deleting…":"Yes, Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
