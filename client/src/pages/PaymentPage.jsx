import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Spinner from "../components/common/Spinner";
export default function PaymentPage() {
  const { orderId }=useParams(); const nav=useNavigate();
  const [order,setOrder]=useState(null); const [loading,setLoading]=useState(true); const [paying,setPaying]=useState(false); const [err,setErr]=useState("");
  useEffect(()=>{api.get("/orders/buyer").then(r=>{const found=r.data.orders?.find(o=>o._id===orderId);setOrder(found||null);}).catch(()=>setOrder(null)).finally(()=>setLoading(false));},  [orderId]);
  const loadRazorpay=()=>new Promise(resolve=>{
    if(window.Razorpay)return resolve(true);
    const s=document.createElement("script");s.src="https://checkout.razorpay.com/v1/checkout.js";
    s.onload=()=>resolve(true);s.onerror=()=>resolve(false);document.body.appendChild(s);
  });
  const handlePay=async()=>{
    setErr("");setPaying(true);
    try{
      const loaded=await loadRazorpay();
      if(!loaded){setErr("Failed to load payment gateway. Check internet connection.");setPaying(false);return;}
      const {data}=await api.post("/payments/create-order",{orderId});
      const options={
        key:data.keyId,amount:data.amount,currency:data.currency,
        name:"FreelanceHub",description:order?.gig?.title||"Service Payment",
        order_id:data.razorpayOrderId,
        prefill:{name:order?.buyer?.name||"",email:""},
        theme:{color:"#1dbf73"},
        handler:async response=>{
          try{
            await api.post("/payments/verify",{razorpayOrderId:response.razorpay_order_id,razorpayPaymentId:response.razorpay_payment_id,razorpaySignature:response.razorpay_signature,orderId});
            nav("/orders?paid=1");
          }catch(e){setErr("Payment verification failed: "+(e.response?.data?.message||e.message));}
        },
        modal:{ondismiss:()=>setPaying(false)},
      };
      const rzp=new window.Razorpay(options);
      rzp.on("payment.failed",resp=>{setErr("Payment failed: "+resp.error.description);setPaying(false);});
      rzp.open();
    }catch(e){setErr(e.response?.data?.message||"Payment setup failed. Try again.");setPaying(false);}
  };
  if(loading)return<Spinner full/>;
  if(!order)return<div style={{textAlign:"center",padding:60}}><p style={{color:"#62646a"}}>Order not found.</p><Link to="/orders" style={{color:"#1dbf73",marginTop:12,display:"inline-block"}}>← My Orders</Link></div>;
  const totalINR=(order.price*83).toFixed(0);
  return (
    <div style={{minHeight:"calc(100vh - 120px)",background:"#f5f5f5",padding:"32px 24px"}}>
      <div style={{maxWidth:860,margin:"0 auto"}}>
        <h1 style={{fontSize:24,fontWeight:700,marginBottom:24,color:"#222325"}}>Checkout</h1>
        <div style={{display:"flex",gap:24,flexWrap:"wrap",alignItems:"flex-start"}}>
          <div style={{flex:"1 1 480px"}}>
            <div style={{background:"#fff",border:"1px solid #dadbdd",borderRadius:8,padding:24,marginBottom:20}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:16,color:"#222325"}}>Order Details</h2>
              <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                <div style={{width:64,height:64,background:"#f5f5f5",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>🛠️</div>
                <div>
                  <p style={{fontWeight:600,fontSize:14,color:"#222325",marginBottom:4}}>{order.gig?.title||"Service"}</p>
                  <p style={{fontSize:13,color:"#62646a"}}><span style={{textTransform:"capitalize"}}>{order.package}</span> Package · {order.deliveryTime}-day delivery</p>
                  <p style={{fontSize:13,color:"#62646a",marginTop:4}}>Seller: {order.seller?.name}</p>
                </div>
              </div>
            </div>
            <div style={{background:"#fff",border:"1px solid #dadbdd",borderRadius:8,padding:24,marginBottom:20}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:12}}>Payment via Razorpay</h2>
              <div style={{background:"#f0fdf8",border:"1px solid #b3edd1",borderRadius:6,padding:16,marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:24}}>🔒</span>
                  <div>
                    <p style={{fontSize:14,fontWeight:600,color:"#1a7a4a"}}>Secure Payment Gateway</p>
                    <p style={{fontSize:12,color:"#2d6a4f"}}>Pay via Credit/Debit Card, UPI, Net Banking, Wallets & EMI</p>
                  </div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
                {[{icon:"💳",label:"Cards"},{icon:"📱",label:"UPI / GPay"},{icon:"🏦",label:"Net Banking"}].map(m=>(
                  <div key={m.label} style={{border:"1px solid #dadbdd",borderRadius:6,padding:"12px 8px",textAlign:"center",background:"#fafafa"}}>
                    <div style={{fontSize:22,marginBottom:4}}>{m.icon}</div>
                    <div style={{fontSize:12,fontWeight:600,color:"#62646a"}}>{m.label}</div>
                  </div>
                ))}
              </div>
              <p style={{fontSize:12,color:"#95979d",lineHeight:1.6}}>🔐 256-bit SSL encrypted. Powered by Razorpay.</p>
            </div>
            {err&&<div className="alert-error" style={{marginBottom:16}}>{err}</div>}
            <button onClick={handlePay} disabled={paying} className="btn-primary" style={{width:"100%",padding:16,fontSize:16,justifyContent:"center"}}>
              {paying?<span style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center"}}><div className="spinner" style={{width:18,height:18,borderWidth:2}}/> Processing…</span>:`Pay ₹${totalINR} (≈ $${order.price})`}
            </button>
            <p style={{textAlign:"center",fontSize:12,color:"#95979d",marginTop:10}}>Payment held securely until you approve delivery.</p>
          </div>
          {/* Summary */}
          <div style={{width:260,flexShrink:0}}>
            <div style={{background:"#fff",border:"1px solid #dadbdd",borderRadius:8,overflow:"hidden",position:"sticky",top:88}}>
              <div style={{padding:"16px 20px",borderBottom:"1px solid #dadbdd"}}><h2 style={{fontSize:15,fontWeight:700}}>Price Summary</h2></div>
              <div style={{padding:"16px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:10,color:"#62646a"}}><span>Service fee</span><span>${order.price}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:10,color:"#62646a"}}><span>Platform fee</span><span>$0</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:16,color:"#62646a"}}><span>Approx. (INR)</span><span>₹{totalINR}</span></div>
                <div style={{borderTop:"1px solid #dadbdd",paddingTop:16,display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:16}}><span>Total</span><span>${order.price}</span></div>
              </div>
              <div style={{background:"#f0fdf8",margin:"0 16px 16px",borderRadius:6,padding:12}}>
                <p style={{fontSize:12,color:"#1a7a4a",lineHeight:1.5}}><strong>FreelanceHub Guarantee:</strong> Payment is released only after you approve delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
