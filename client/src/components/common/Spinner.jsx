export default function Spinner({ full }) {
  if (full) return <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:300}}><div className="spinner"/></div>;
  return <div className="spinner" style={{width:24,height:24,borderWidth:2}}/>;
}
