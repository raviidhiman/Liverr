import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import api from "../api/axios";
export default function InboxPage() {
  const { user }=useAuth(); const { state }=useLocation();
  const [convs,setConvs]=useState([]); const [active,setActive]=useState(null);
  const [msgs,setMsgs]=useState([]); const [text,setText]=useState("");
  const [loadingConvs,setLoadingConvs]=useState(true); const [loadingMsgs,setLoadingMsgs]=useState(false); const [sending,setSending]=useState(false);
  const bottomRef=useRef(null); const pollRef=useRef(null); const textRef=useRef(null);
  const myId=user?._id?.toString();

  const fetchConvs=async()=>{try{const r=await api.get("/messages/conversations");setConvs(r.data.conversations||[]);}catch{setConvs([]);}finally{setLoadingConvs(false);}};
  const fetchMsgs=async convId=>{
    try{
      const r=await api.get(`/messages/${convId}`);
      const normalized=(r.data.messages||[]).map(m=>({...m,sender:m.sender?{...m.sender,_id:m.sender._id?.toString?.()??m.sender._id}:m.sender}));
      setMsgs(normalized);
    }catch{setMsgs([]);}finally{setLoadingMsgs(false);}
  };

  useEffect(()=>{
    if(state?.recipientId){
      api.post("/messages/conversations",{recipientId:state.recipientId,gigId:state.gigId||null})
        .then(r=>{setActive(r.data.conversation);setLoadingMsgs(true);fetchMsgs(r.data.conversation._id);})
        .catch(()=>{});
    }
    fetchConvs();
  },[]);

  useEffect(()=>{
    if(!active)return;
    setLoadingMsgs(true);
    fetchMsgs(active._id);
    clearInterval(pollRef.current);
    pollRef.current=setInterval(()=>fetchMsgs(active._id),3000);
    return()=>clearInterval(pollRef.current);
  },[active?._id]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const selectConv=c=>{setActive(c);setMsgs([]);fetchConvs();};

  const send=async e=>{
    e.preventDefault();
    if(!text.trim()||!active||sending)return;
    setSending(true);
    const saved=text.trim(); setText("");
    try{await api.post(`/messages/${active._id}`,{text:saved});await fetchMsgs(active._id);await fetchConvs();}
    catch{setText(saved);}
    finally{setSending(false);textRef.current?.focus();}
  };

  const other=conv=>conv.participants?.find(p=>(p._id?.toString?.()??p._id)!==myId);

  const timeAgo=d=>{
    const diff=Date.now()-new Date(d);
    if(diff<60000)return"just now";
    if(diff<3600000)return`${Math.floor(diff/60000)}m ago`;
    if(diff<86400000)return new Date(d).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    return new Date(d).toLocaleDateString([],{month:"short",day:"numeric"});
  };

  return (
    <div style={{height:"calc(100vh - 120px)",display:"flex",background:"#fff",overflow:"hidden"}}>
      {/* Sidebar */}
      <div style={{width:300,borderRight:"1px solid #dadbdd",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid #dadbdd"}}>
          <h2 style={{fontSize:18,fontWeight:700,color:"#222325",margin:0}}>Inbox</h2>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {loadingConvs?(
            <div style={{display:"flex",justifyContent:"center",paddingTop:40}}><div className="spinner"/></div>
          ):convs.length===0?(
            <div style={{textAlign:"center",padding:"40px 20px",color:"#95979d"}}>
              <div style={{fontSize:40,marginBottom:12}}>💬</div>
              <p style={{fontSize:14,margin:0}}>No conversations yet</p>
              <p style={{fontSize:12,marginTop:6}}>Go to a gig and click "Contact Seller"</p>
            </div>
          ):convs.map(c=>{
            const o=other(c); const isActive=active?._id===c._id;
            const ucMap=c.unreadCount instanceof Map?Object.fromEntries(c.unreadCount):(c.unreadCount||{});
            const uc=ucMap[myId]||0;
            return(
              <button key={c._id} onClick={()=>selectConv(c)}
                style={{width:"100%",textAlign:"left",padding:"14px 16px",border:"none",borderBottom:"1px solid #f0f0f0",background:isActive?"#f0fdf8":"#fff",cursor:"pointer",display:"flex",gap:12,alignItems:"flex-start",fontFamily:"inherit"}}>
                <div style={{position:"relative",flexShrink:0}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:"#1dbf73",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:16}}>{o?.name?.[0]?.toUpperCase()||"?"}</div>
                  <div style={{position:"absolute",bottom:0,right:0,width:11,height:11,background:"#22c55e",borderRadius:"50%",border:"2px solid #fff"}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                    <span style={{fontWeight:600,fontSize:14,color:"#222325"}}>{o?.name||"User"}</span>
                    <span style={{fontSize:11,color:"#95979d"}}>{timeAgo(c.lastMessageAt)}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <p style={{fontSize:12,color:"#62646a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:160,margin:0}}>{c.lastMessage||"No messages yet"}</p>
                    {uc>0&&<span style={{background:"#1dbf73",color:"#fff",fontSize:11,fontWeight:700,borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{uc>9?"9+":uc}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {/* Chat */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {!active?(
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:"#f9fafb"}}>
            <div style={{textAlign:"center"}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:32}}>💬</div>
              <h3 style={{fontSize:18,fontWeight:700,color:"#222325",marginBottom:8}}>Your Messages</h3>
              <p style={{fontSize:14,color:"#95979d"}}>Select a conversation to start chatting</p>
            </div>
          </div>
        ):(
          <>
            {/* Header */}
            <div style={{padding:"14px 20px",borderBottom:"1px solid #dadbdd",display:"flex",alignItems:"center",gap:12,background:"#fff",flexShrink:0}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"#1dbf73",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:15}}>{other(active)?.name?.[0]?.toUpperCase()}</div>
              <div>
                <p style={{fontWeight:600,fontSize:15,color:"#222325",margin:0}}>{other(active)?.name}</p>
                <p style={{fontSize:12,color:"#22c55e",margin:0}}>● Online</p>
              </div>
            </div>
            {/* Messages */}
            <div style={{flex:1,overflowY:"auto",padding:"20px 24px",background:"#f9fafb",display:"flex",flexDirection:"column",gap:10}}>
              {loadingMsgs?(
                <div style={{display:"flex",justifyContent:"center",paddingTop:40}}><div className="spinner"/></div>
              ):msgs.length===0?(
                <div style={{textAlign:"center",paddingTop:60,color:"#95979d"}}>
                  <div style={{fontSize:32,marginBottom:8}}>👋</div>
                  <p style={{fontSize:14}}>No messages yet. Say hello!</p>
                </div>
              ):msgs.map((m,i)=>{
                const isMe=m.sender?._id?.toString()===myId;
                const showAvatar=i===0||msgs[i-1]?.sender?._id?.toString()!==m.sender?._id?.toString();
                return(
                  <div key={m._id} style={{display:"flex",flexDirection:isMe?"row-reverse":"row",alignItems:"flex-end",gap:8}}>
                    {!isMe&&(showAvatar
                      ?<div style={{width:28,height:28,borderRadius:"50%",background:"#1dbf73",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{m.sender?.name?.[0]?.toUpperCase()||"?"}</div>
                      :<div style={{width:28,flexShrink:0}}/>
                    )}
                    <div style={{maxWidth:"65%",display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start",gap:3}}>
                      <div style={{padding:"10px 14px",borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px",background:isMe?"#1dbf73":"#fff",color:isMe?"#fff":"#222325",fontSize:14,lineHeight:1.5,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",border:isMe?"none":"1px solid #dadbdd",wordBreak:"break-word"}}>
                        {m.text}
                      </div>
                      <span style={{fontSize:11,color:"#95979d",paddingLeft:4,paddingRight:4}}>{timeAgo(m.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef}/>
            </div>
            {/* Input */}
            <form onSubmit={send} style={{padding:"12px 20px",borderTop:"1px solid #dadbdd",background:"#fff",display:"flex",gap:10,alignItems:"flex-end",flexShrink:0}}>
              <div style={{flex:1,border:"1px solid #dadbdd",borderRadius:24,padding:"10px 16px",background:"#fff"}}>
                <textarea ref={textRef} value={text}
                  onChange={e=>{setText(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,100)+"px";}}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(e);}}}
                  placeholder="Type a message…" rows={1}
                  style={{width:"100%",border:"none",outline:"none",resize:"none",fontSize:14,fontFamily:"inherit",background:"transparent",maxHeight:100,lineHeight:1.5,color:"#222325",display:"block"}}/>
              </div>
              <button type="submit" disabled={!text.trim()||sending}
                style={{width:42,height:42,borderRadius:"50%",background:text.trim()?"#1dbf73":"#dadbdd",border:"none",cursor:text.trim()?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.15s"}}>
                {sending
                  ?<div className="spinner" style={{width:16,height:16,borderWidth:2,borderColor:"rgba(255,255,255,0.3)",borderTopColor:"#fff"}}/>
                  :<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                }
              </button>
            </form>
            <p style={{textAlign:"center",fontSize:11,color:"#95979d",paddingBottom:6,background:"#fff",margin:0}}>Enter to send · Shift+Enter for new line</p>
          </>
        )}
      </div>
    </div>
  );
}
