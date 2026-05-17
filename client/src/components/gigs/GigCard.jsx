import { Link } from "react-router-dom";
import Stars from "../common/Stars";
export default function GigCard({ gig }) {
  const price = gig.packages?.basic?.price || 0;
  return (
    <Link to={`/gigs/${gig._id}`} style={{textDecoration:"none"}}>
      <div className="card" style={{cursor:"pointer"}}>
        <div style={{height:180,background:"#f5f5f5",overflow:"hidden"}}>
          {gig.coverImage
            ? <img src={gig.coverImage} alt="" style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.3s"}} onMouseEnter={e=>e.target.style.transform="scale(1.05)"} onMouseLeave={e=>e.target.style.transform="scale(1)"} onError={e=>{e.target.style.display="none"}}/>
            : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,color:"#dadbdd"}}>🎨</div>
          }
        </div>
        <div style={{padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:"#1dbf73",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{gig.seller?.name?.[0]?.toUpperCase()}</div>
            <span style={{fontSize:13,fontWeight:500,color:"#404145"}}>{gig.seller?.name}</span>
            {gig.seller?.isVerified && <span style={{color:"#1dbf73",fontSize:12}}>✓</span>}
          </div>
          <p style={{fontSize:13,color:"#222325",lineHeight:1.4,marginBottom:8,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",minHeight:36}}>{gig.title}</p>
          {gig.reviewCount>0 && <div style={{marginBottom:8}}><Stars rating={gig.rating} count={gig.reviewCount}/></div>}
        </div>
        <div style={{padding:"10px 14px",borderTop:"1px solid #dadbdd",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:12,color:"#95979d"}}>Starting at</span>
          <span style={{fontSize:16,fontWeight:700,color:"#222325"}}>${price}</span>
        </div>
      </div>
    </Link>
  );
}
