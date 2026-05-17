export default function Stars({ rating=0, count }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
      <span style={{color:"#f5a623",fontSize:13,letterSpacing:-1}}>{"★".repeat(Math.round(rating))}{"☆".repeat(5-Math.round(rating))}</span>
      <span style={{fontSize:13,fontWeight:600,color:"#404145"}}>{Number(rating).toFixed(1)}</span>
      {count!==undefined && <span style={{fontSize:13,color:"#95979d"}}>({count})</span>}
    </span>
  );
}
