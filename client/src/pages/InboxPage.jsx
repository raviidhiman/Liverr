import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/common/Avatar";
import Spinner from "../components/common/Spinner";
import { errMsg } from "../utils/helpers";

const timeFmt = (d) => new Date(d).toLocaleString("en-IN", { hour: "numeric", minute: "2-digit", day: "numeric", month: "short" });

export default function InboxPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [convs, setConvs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const activeId = params.get("conv");
  const active = convs.find((c) => c._id === activeId);
  const otherOf = (c) => c.participants.find((p) => p._id !== user._id) || c.participants[0];

  const loadConvs = useCallback(() =>
    api.get("/messages/conversations").then((r) => setConvs(r.data.conversations)).catch((e) => setError(errMsg(e))).finally(() => setLoading(false)), []);

  const loadMessages = useCallback(() => {
    if (!activeId) return Promise.resolve();
    return api.get(`/messages/${activeId}`).then((r) => setMessages((prev) => (prev.length === r.data.messages.length && prev.at(-1)?._id === r.data.messages.at(-1)?._id ? prev : r.data.messages))).catch(() => {});
  }, [activeId]);

  // Conversation list: refresh every 8s
  useEffect(() => { loadConvs(); const t = setInterval(loadConvs, 8000); return () => clearInterval(t); }, [loadConvs]);
  // Messages: refresh every 4s while a chat is open
  useEffect(() => { setMessages([]); loadMessages(); const t = setInterval(loadMessages, 4000); return () => clearInterval(t); }, [loadMessages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length, activeId]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true); setError("");
    try {
      const r = await api.post(`/messages/${activeId}`, { text });
      setMessages((m) => [...m, r.data.message]);
      setText("");
      loadConvs();
    } catch (err) { setError(errMsg(err)); }
    finally { setSending(false); }
  };

  const myUnread = (c) => (c.unreadCount && Number(c.unreadCount[user._id])) || 0;

  if (loading) return <Spinner full />;

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <div className="card grid md:grid-cols-[320px_1fr] h-[70vh] min-h-[420px]">
        <div className={`border-r border-gray-200 overflow-y-auto ${activeId ? "hidden md:block" : ""}`}>
          {convs.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm"><div className="text-4xl mb-2">💬</div>No conversations yet. Open a gig and click <b>Contact seller</b>.<div><Link to="/gigs" className="btn-primary mt-3 inline-flex">Browse gigs</Link></div></div>
          ) : convs.map((c) => {
            const o = otherOf(c);
            const unread = myUnread(c);
            return (
              <button key={c._id} onClick={() => setParams({ conv: c._id })} className={`w-full text-left flex gap-3 items-center p-3.5 border-b border-gray-100 hover:bg-gray-50 ${c._id === activeId ? "bg-green-50" : ""}`}>
                <Avatar user={o} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2"><span className="font-semibold text-sm truncate">{o.name}</span>{unread > 0 && <span className="bg-brand text-white text-[11px] font-bold rounded-full px-1.5 min-w-[18px] text-center">{unread}</span>}</div>
                  <div className="text-xs text-gray-500 truncate">{c.lastMessage || (c.relatedGig ? `Re: ${c.relatedGig.title}` : "New conversation")}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className={`flex flex-col min-h-0 ${activeId ? "" : "hidden md:flex"}`}>
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">{activeId ? "Loading conversation..." : "Select a conversation"}</div>
          ) : (
            <>
              <div className="p-3.5 border-b border-gray-200 flex items-center gap-3">
                <button className="md:hidden text-xl" onClick={() => setParams({})} aria-label="Back">←</button>
                <Avatar user={otherOf(active)} size={38} />
                <div className="min-w-0"><Link to={`/profile/${otherOf(active)._id}`} className="font-semibold hover:underline">{otherOf(active).name}</Link>
                  {active.relatedGig && <div className="text-xs text-gray-500 truncate">About: {active.relatedGig.title}</div>}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                {messages.length === 0 && <p className="text-center text-sm text-gray-400 mt-10">Say hello 👋</p>}
                {messages.map((m) => {
                  const mine = (m.sender?._id || m.sender) === user._id;
                  return (
                    <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${mine ? "bg-brand text-white rounded-br-sm" : "bg-white border border-gray-200 rounded-bl-sm"}`}>
                        <div className="whitespace-pre-wrap break-words">{m.text}</div>
                        <div className={`text-[10px] mt-1 ${mine ? "text-green-100" : "text-gray-400"}`}>{timeFmt(m.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              {error && <div className="alert-error m-2">{error}</div>}
              <form onSubmit={send} className="p-3 border-t border-gray-200 flex gap-2">
                <input className="input" placeholder="Type a message..." maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} />
                <button className="btn-primary" disabled={sending || !text.trim()}>Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
