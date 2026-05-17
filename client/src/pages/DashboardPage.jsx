import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import api from "../api/axios";
const BADGE={awaiting_payment:"badge badge-waiting",pending:"badge badge-pending",in_progress:"badge badge-progress",delivered:"badge badge-delivered",completed:"badge badge-completed",cancelled:"badge badge-cancelled"};
const LABEL={awaiting_payment:"Awaiting Payment",pending:"Pending",in_progress:"In Progress",delivered:"Delivered",completed:"Completed",cancelled:"Cancelled"};
export default function DashboardPage() {
  const { user }=useAuth();
  const [orders,setOrders]=useState([]); const [gigs,setGigs]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{
    (async()=>{
      try{
        const ordRes=user.role==="seller"?await api.get("/orders/seller"):await api.get("/orders/buyer");
        setOrders(ordRes.data.orders||[]);
        if(user.role==="seller"){const gRes=await api.get("/gigs/my-gigs");setGigs(gRes.data.gigs||[]);}
      }catch{}finally{setLoading(false);}
    })();
  },[user.role]);
  const active=orders.filter(o=>["pending","in_progress"].includes(o.status)).length;
  const completed=orders.filter(o=>o.status==="completed").length;
  const earnings=orders.filter(o=>o.status==="completed").reduce((s,o)=>s+o.price,0);
  if(loading)return<Spinner full/>;
  return (
    <div style={{minHeight:"calc(100vh - 120px)",background:"#f5f5f5"}}>
      <div className="container" style={{paddingTop:32,paddingBottom:48}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,flexWrap:"wrap",gap:12}}>
          <div>
            <h1 style={{fontSize:26,fontWeight:700,color:"#222325"}}>Welcome back, {user.name?.split(" ")[0]}! 👋</h1>
            <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
              <span style={{fontSize:12,fontWeight:600,padding:"3px 10px",borderRadius:20,background:user.role==="seller"?"#f0fdf8":"#eff6ff",color:user.role==="seller"?"#1a7a4a":"#1e40af",textTransform:"capitalize"}}>{user.role}</span>
              {user.isVerified&&<span style={{fontSize:12,fontWeight:600,padding:"3px 10px",borderRadius:20,background:"#f0fdf8",color:"#1a7a4a"}}>✓ Verified</span>}
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <Link to="/inbox" className="btn-secondary" style={{padding:"9px 16px",fontSize:13}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Inbox
            </Link>
            {user.role==="seller"&&<Link to="/gigs/new" className="btn-primary" style={{padding:"9px 16px",fontSize:13}}>+ Post a Gig</Link>}
          </div>
        </div>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16,marginBottom:28}}>
          {[
            {label:"Total Orders",val:orders.length,icon:"📦",bg:"#fff"},
            {label:"Active",val:active,icon:"⚡",bg:"#eff6ff"},
            {label:"Completed",val:completed,icon:"✅",bg:"#f0fdf8"},
            user.role==="seller"?{label:"Total Earnings",val:`$${earnings}`,icon:"💰",bg:"#fff9f0"}:{label:"Total Spent",val:`$${earnings}`,icon:"💳",bg:"#fff9f0"},
          ].map(s=>(
            <div key={s.label} style={{background:s.bg,border:"1px solid #dadbdd",borderRadius:8,padding:"20px 22px"}}>
              <div style={{fontSize:28,marginBottom:10}}>{s.icon}</div>
              <p style={{fontSize:13,color:"#62646a",marginBottom:4}}>{s.label}</p>
              <p style={{fontSize:28,fontWeight:800,color:"#222325"}}>{s.val}</p>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:user.role==="seller"?"1fr 1fr":"1fr",gap:20}}>
          {/* Recent Orders */}
          <div style={{background:"#fff",border:"1px solid #dadbdd",borderRadius:8,overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid #dadbdd",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h2 style={{fontSize:16,fontWeight:700,color:"#222325"}}>Recent Orders</h2>
              <Link to="/orders" style={{fontSize:13,color:"#1dbf73",textDecoration:"none",fontWeight:500}}>View all →</Link>
            </div>
            {orders.length===0?(
              <div style={{textAlign:"center",padding:40}}>
                <div style={{fontSize:40,marginBottom:12}}>📦</div>
                <p style={{color:"#62646a",fontSize:14,marginBottom:16}}>No orders yet</p>
                <Link to="/gigs" className="btn-primary" style={{fontSize:13,padding:"9px 18px"}}>Browse Services</Link>
              </div>
            ):(
              <div>
                {orders.slice(0,5).map(o=>(
                  <div key={o._id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",borderBottom:"1px solid #f5f5f5"}}>
                    <div style={{width:40,height:40,background:"#f5f5f5",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🛠️</div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontWeight:600,fontSize:14,color:"#222325",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.gig?.title||"Service"}</p>
                      <p style={{fontSize:12,color:"#95979d"}}>{user.role==="seller"?`Buyer: ${o.buyer?.name}`:`Seller: ${o.seller?.name}`}</p>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <p style={{fontWeight:700,fontSize:15,color:"#222325",marginBottom:3}}>${o.price}</p>
                      <span className={BADGE[o.status]||"badge"}>{LABEL[o.status]||o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* My Gigs (seller) */}
          {user.role==="seller"&&(
            <div style={{background:"#fff",border:"1px solid #dadbdd",borderRadius:8,overflow:"hidden"}}>
              <div style={{padding:"16px 20px",borderBottom:"1px solid #dadbdd",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <h2 style={{fontSize:16,fontWeight:700,color:"#222325"}}>My Gigs</h2>
                <Link to="/my-gigs" style={{fontSize:13,color:"#1dbf73",textDecoration:"none",fontWeight:500}}>Manage →</Link>
              </div>
              {gigs.length===0?(
                <div style={{textAlign:"center",padding:40}}>
                  <div style={{fontSize:40,marginBottom:12}}>🎨</div>
                  <p style={{color:"#62646a",fontSize:14,marginBottom:16}}>No gigs yet</p>
                  <Link to="/gigs/new" className="btn-primary" style={{fontSize:13,padding:"9px 18px"}}>Create First Gig</Link>
                </div>
              ):(
                <div>
                  {gigs.slice(0,5).map(g=>(
                    <Link key={g._id} to={`/gigs/${g._id}`} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",borderBottom:"1px solid #f5f5f5",textDecoration:"none"}}>
                      <div style={{width:40,height:40,background:"#f0fdf8",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🛠️</div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontWeight:600,fontSize:14,color:"#222325",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.title}</p>
                        <p style={{fontSize:12,color:"#95979d"}}>{g.orderCount||0} orders · ⭐ {Number(g.rating).toFixed(1)}</p>
                      </div>
                      <p style={{fontWeight:700,fontSize:15,color:"#222325",flexShrink:0}}>${g.packages?.basic?.price||0}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
