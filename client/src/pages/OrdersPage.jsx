import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import api from "../api/axios";
const BADGE={awaiting_payment:"badge badge-waiting",pending:"badge badge-pending",in_progress:"badge badge-progress",delivered:"badge badge-delivered",completed:"badge badge-completed",cancelled:"badge badge-cancelled",revision:"badge badge-pending"};
const LABEL={awaiting_payment:"Awaiting Payment",pending:"Pending",in_progress:"In Progress",delivered:"Delivered",completed:"Completed",cancelled:"Cancelled",revision:"Revision"};
export default function OrdersPage() {
  const { user }=useAuth(); const [sp]=useSearchParams();
  const [orders,setOrders]=useState([]); const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("buying"); const [updating,setUpdating]=useState(null); const [filterStatus,setFilterStatus]=useState("all");
  const paid=sp.get("paid")==="1";
  const fetchOrders=async()=>{
    setLoading(true);
    try{const r=tab==="selling"?await api.get("/orders/seller"):await api.get("/orders/buyer");setOrders(r.data.orders||[]);}
    catch{setOrders([]);}finally{setLoading(false);}
  };
  useEffect(()=>{fetchOrders();},[tab]);
  const statusUpdate=async(id,status)=>{
    setUpdating(id);
    try{await api.put(`/orders/${id}/status`,{status});await fetchOrders();}
    catch(e){alert(e.response?.data?.message||"Update failed");}
    finally{setUpdating(null);}
  };
  const getBuyerActions=o=>{
    if(o.status==="delivered")return[{label:"✓ Accept & Complete",status:"completed",style:{background:"#1dbf73",color:"#fff",border:"none",borderRadius:4,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}},{label:"↩ Request Revision",status:"revision",style:{background:"#fff",color:"#62646a",border:"1px solid #dadbdd",borderRadius:4,padding:"8px 14px",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}];
    if(o.status==="pending")return[{label:"Cancel",status:"cancelled",style:{background:"#fff",color:"#c0392b",border:"1px solid #dadbdd",borderRadius:4,padding:"8px 14px",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}];
    return[];
  };
  const getSellerActions=o=>{
    if(o.status==="pending")return[{label:"Start Working",status:"in_progress",style:{background:"#1dbf73",color:"#fff",border:"none",borderRadius:4,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}];
    if(o.status==="in_progress")return[{label:"Mark as Delivered",status:"delivered",style:{background:"#7c3aed",color:"#fff",border:"none",borderRadius:4,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}];
    return[];
  };
  const displayed=filterStatus==="all"?orders:orders.filter(o=>o.status===filterStatus);
  return (
    <div style={{minHeight:"calc(100vh - 120px)",background:"#f5f5f5"}}>
      <div className="container" style={{paddingTop:32,paddingBottom:48}}>
        <h1 style={{fontSize:26,fontWeight:700,marginBottom:20,color:"#222325"}}>Orders</h1>
        {paid&&<div className="alert-success" style={{marginBottom:20}}>🎉 Payment successful! Your order is now active.</div>}
        {/* Tabs */}
        <div style={{display:"flex",gap:4,background:"#fff",border:"1px solid #dadbdd",borderRadius:6,padding:4,width:"fit-content",marginBottom:20}}>
          {[["buying","Buying"],...(user?.role==="seller"?[["selling","Selling"]]:[])].map(([v,l])=>(
            <button key={v} onClick={()=>{setTab(v);setFilterStatus("all");}} style={{padding:"8px 20px",borderRadius:4,border:"none",cursor:"pointer",fontSize:14,fontWeight:600,background:tab===v?"#222325":"transparent",color:tab===v?"#fff":"#62646a",transition:"all 0.15s",fontFamily:"inherit"}}>{l}</button>
          ))}
        </div>
        {/* Status filters */}
        <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
          {["all","pending","in_progress","delivered","completed","cancelled"].map(s=>(
            <button key={s} onClick={()=>setFilterStatus(s)} style={{fontSize:13,padding:"6px 14px",borderRadius:20,border:"1px solid #dadbdd",cursor:"pointer",fontWeight:500,background:filterStatus===s?"#222325":"#fff",color:filterStatus===s?"#fff":"#62646a",transition:"all 0.15s",fontFamily:"inherit"}}>
              {s==="all"?"All":LABEL[s]}
            </button>
          ))}
        </div>
        {loading?<Spinner full/>:displayed.length===0?(
          <div style={{textAlign:"center",padding:"60px 24px",background:"#fff",border:"1px solid #dadbdd",borderRadius:8}}>
            <div style={{fontSize:48,marginBottom:16}}>📦</div>
            <h2 style={{fontWeight:700,marginBottom:8}}>No orders found</h2>
            <p style={{color:"#62646a",fontSize:14,marginBottom:20}}>{tab==="buying"?"Browse services to place your first order":"Orders from buyers will appear here"}</p>
            {tab==="buying"&&<Link to="/gigs" className="btn-primary">Browse Services</Link>}
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {displayed.map(o=>{
              const actions=tab==="selling"?getSellerActions(o):getBuyerActions(o);
              return(
                <div key={o._id} style={{background:"#fff",border:"1px solid #dadbdd",borderRadius:8,padding:"20px 22px"}}>
                  <div style={{display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap"}}>
                    <div style={{width:52,height:52,background:"#f5f5f5",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>🛠️</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,flexWrap:"wrap",gap:8}}>
                        <h3 style={{fontWeight:700,fontSize:15,color:"#222325"}}>{o.gig?.title||"Service"}</h3>
                        <span className={BADGE[o.status]||"badge"}>{LABEL[o.status]||o.status}</span>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:"4px 16px",fontSize:13,color:"#62646a",marginBottom:12}}>
                        <span>{tab==="selling"?`Buyer: ${o.buyer?.name}`:`Seller: ${o.seller?.name}`}</span>
                        <span style={{textTransform:"capitalize"}}>{o.package} package</span>
                        <span>{o.deliveryTime}-day delivery</span>
                        <span>Placed {new Date(o.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
                      </div>
                      {o.requirements&&<p style={{fontSize:13,color:"#62646a",background:"#f5f5f5",padding:"8px 12px",borderRadius:4,marginBottom:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📝 {o.requirements}</p>}
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                        <span style={{fontWeight:800,fontSize:20,color:"#222325"}}>${o.price}</span>
                        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                          {o.status==="awaiting_payment"&&tab==="buying"&&(
                            <Link to={`/payment/${o._id}`} className="btn-primary" style={{padding:"8px 16px",fontSize:13}}>💳 Pay Now</Link>
                          )}
                          {actions.map(a=>(
                            <button key={a.status} onClick={()=>statusUpdate(o._id,a.status)} disabled={updating===o._id} style={{...a.style,opacity:updating===o._id?0.6:1}}>
                              {updating===o._id?"…":a.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
