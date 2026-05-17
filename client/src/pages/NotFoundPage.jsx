import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return (
    <div style={{minHeight:"calc(100vh - 120px)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",textAlign:"center",padding:24}}>
      <div style={{fontSize:100,fontWeight:900,color:"#dadbdd",lineHeight:1}}>404</div>
      <h1 style={{fontSize:24,fontWeight:700,color:"#222325",marginTop:16,marginBottom:8}}>Page not found</h1>
      <p style={{fontSize:15,color:"#62646a",marginBottom:24}}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary" style={{padding:"12px 28px"}}>Go Home</Link>
    </div>
  );
}
