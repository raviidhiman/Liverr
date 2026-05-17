import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Stars from "../components/common/Stars";
import GigCard from "../components/gigs/GigCard";
import Spinner from "../components/common/Spinner";
import api from "../api/axios";
export default function ProfilePage() {
  const { id }=useParams();
  const [profile,setProfile]=useState(null); const [gigs,setGigs]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{
    Promise.all([api.get(`/users/${id}`),api.get(`/gigs?seller=${id}&limit=6`)])
      .then(([u,g])=>{setProfile(u.data.user);setGigs(g.data.gigs||[]);})
      .catch(()=>setProfile(null)).finally(()=>setLoading(false));
  },[id]);
  if(loading)return<Spinner full/>;
  if(!profile)return<div style={{textAlign:"center",padding:60}}>User not found. <Link to="/gigs" style={{color:"#1dbf73"}}>Browse gigs</Link></div>;
  return (
    <div style={{minHeight:"calc(100vh - 120px)",background:"#f5f5f5",padding:"32px 24px"}}>
      <div style={{maxWidth:1000,margin:"0 auto"}}>
        <div style={{display:"flex",gap:24,alignItems:"flex-start",flexWrap:"wrap"}}>
          <div style={{width:260,flexShrink:0}}>
            <div style={{background:"#fff",border:"1px solid #dadbdd",borderRadius:8,padding:24,textAlign:"center",position:"sticky",top:88}}>
              <div style={{width:80,height:80,borderRadius:"50%",background:"#1dbf73",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:700,margin:"0 auto 14px"}}>{profile.name?.[0]?.toUpperCase()}</div>
              <h1 style={{fontSize:18,fontWeight:700,marginBottom:4}}>{profile.name}</h1>
              {profile.country&&<p style={{fontSize:13,color:"#62646a",marginBottom:8}}>📍 {profile.country}</p>}
              <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:14}}>
                {profile.isVerified&&<span style={{fontSize:12,fontWeight:600,padding:"3px 10px",borderRadius:20,background:"#f0fdf8",color:"#1a7a4a"}}>✓ Verified</span>}
                <span style={{fontSize:12,fontWeight:600,padding:"3px 10px",borderRadius:20,background:profile.role==="seller"?"#f0fdf8":"#eff6ff",color:profile.role==="seller"?"#1a7a4a":"#1e40af",textTransform:"capitalize"}}>{profile.role}</span>
              </div>
              {profile.rating>0&&<div style={{display:"flex",justifyContent:"center",marginBottom:16}}><Stars rating={profile.rating} count={profile.reviewCount}/></div>}
              {profile.bio&&<p style={{fontSize:13,color:"#62646a",lineHeight:1.6,marginBottom:14,textAlign:"left"}}>{profile.bio}</p>}
              <div style={{borderTop:"1px solid #dadbdd",paddingTop:14,textAlign:"left"}}>
                {profile.languages?.length>0&&<div style={{marginBottom:10}}><p style={{fontSize:12,fontWeight:600,color:"#95979d",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>Languages</p><p style={{fontSize:13,color:"#404145"}}>{profile.languages.join(", ")}</p></div>}
                {profile.skills?.length>0&&<div style={{marginBottom:10}}><p style={{fontSize:12,fontWeight:600,color:"#95979d",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6}}>Skills</p><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{profile.skills.map(s=><span key={s} style={{fontSize:12,padding:"4px 10px",background:"#f5f5f5",border:"1px solid #dadbdd",borderRadius:20,color:"#62646a"}}>{s}</span>)}</div></div>}
                <div><p style={{fontSize:12,fontWeight:600,color:"#95979d",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>Member since</p><p style={{fontSize:13,color:"#404145"}}>{new Date(profile.createdAt).toLocaleDateString("en-US",{month:"long",year:"numeric"})}</p></div>
              </div>
            </div>
          </div>
          <div style={{flex:1,minWidth:0}}>
            {profile.role==="seller"?(
              <>
                <h2 style={{fontSize:20,fontWeight:700,marginBottom:20,color:"#222325"}}>{gigs.length>0?`${profile.name.split(" ")[0]}'s Gigs`:"No gigs yet"}</h2>
                {gigs.length===0?(
                  <div style={{background:"#fff",border:"1px solid #dadbdd",borderRadius:8,padding:40,textAlign:"center"}}><div style={{fontSize:40,marginBottom:12}}>🎨</div><p style={{color:"#62646a"}}>This seller hasn't posted any gigs yet.</p></div>
                ):(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:16}}>{gigs.map(g=><GigCard key={g._id} gig={g}/>)}</div>
                )}
              </>
            ):(
              <div style={{background:"#fff",border:"1px solid #dadbdd",borderRadius:8,padding:32,textAlign:"center"}}><div style={{fontSize:40,marginBottom:12}}>🛒</div><p style={{color:"#62646a"}}>This user is a buyer on FreelanceHub.</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
