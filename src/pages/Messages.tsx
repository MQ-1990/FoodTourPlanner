import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

type Person = { _id: string; username?: string; avatar?: string };
type Conversation = { _id: string; lastMessage: string; unreadCount: number; userId: Person; restaurantId: { _id: string; name: string; image?: string; address?: string; owner?: Person | string } };
type ChatMessage = { _id: string; sender: Person | string; senderRole: 'customer' | 'owner'; content: string; createdAt: string };

const avatarFor = (person?: Person | string, fallback = 'https://i.pravatar.cc/100?u=cityfoodtour') => typeof person === 'object' && person?.avatar ? person.avatar : fallback;
const nameFor = (person?: Person | string, fallback = 'Restaurant owner') => typeof person === 'object' && person?.username ? person.username : fallback;

export const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const selected = conversations.find((conversation) => conversation._id === conversationId);
  const ownerView = (conversation: Conversation) => String(typeof conversation.restaurantId.owner === 'string' ? conversation.restaurantId.owner : conversation.restaurantId.owner?._id) === user?.id;
  const partner = (conversation: Conversation) => ownerView(conversation) ? conversation.userId : conversation.restaurantId.owner;

  const loadConversations = useCallback(async () => { const response = await api.get('/messages/mine'); setConversations(response.data.conversations || []); }, []);
  const loadMessages = useCallback(async (id: string, silent = false) => {
    try { const response = await api.get(`/messages/${id}`); setMessages(response.data.messages || []); }
    catch (error: any) { if (!silent) toast.error(error?.response?.data?.message || 'Unable to load this conversation.'); }
  }, []);

  useEffect(() => { loadConversations().catch((error) => toast.error(error?.response?.data?.message || 'Unable to load messages.')).finally(() => setLoading(false)); }, [loadConversations]);
  useEffect(() => {
    if (!conversationId) { setMessages([]); return; }
    loadMessages(conversationId);
    const interval = window.setInterval(() => { loadMessages(conversationId, true); loadConversations().catch(() => {}); }, 8000);
    return () => window.clearInterval(interval);
  }, [conversationId, loadConversations, loadMessages]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!conversationId || !draft.trim()) return;
    setSending(true);
    try { await api.post('/messages/send', { conversationId, content: draft.trim() }); setDraft(''); await Promise.all([loadMessages(conversationId, true), loadConversations()]); }
    catch (error: any) { toast.error(error?.response?.data?.message || 'Unable to send message.'); }
    finally { setSending(false); }
  };
  // senderRole is assigned by the backend after authorization. It is more
  // reliable than comparing frontend session IDs with MongoDB ObjectIds.
  const isMine = (message: ChatMessage) => selected ? message.senderRole === (ownerView(selected) ? 'owner' : 'customer') : false;

  return <div className="container mx-auto max-w-6xl px-4 py-8">
    <div className="mb-6 flex items-center gap-3"><div className="rounded-xl bg-orange-50 p-3 text-[#FF6B35]"><MessageCircle className="h-6 w-6" /></div><div><h1 className="text-2xl font-bold text-slate-800">Messages</h1><p className="text-sm text-gray-500">Chat with restaurant owners about their restaurants.</p></div></div>
    <div className="messages-layout min-h-[600px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <aside className="chat-sidebar bg-white"><div className="chat-sidebar__heading">Conversations</div>
        {loading ? <p className="p-5 text-sm text-gray-500">Loading conversations...</p> : conversations.length === 0 ? <p className="p-5 text-sm leading-6 text-gray-500">No conversations yet. Open a restaurant and choose “Message Owner”.</p> : <div className="max-h-64 overflow-y-auto p-2 md:max-h-[548px]">{conversations.map((conversation) => {
          const other = partner(conversation); const isOwner = ownerView(conversation);
          return <button key={conversation._id} onClick={() => navigate(`/messages/${conversation._id}`)} className={`chat-conversation ${conversation._id === conversationId ? 'chat-conversation--selected' : ''}`}>
            <img src={isOwner ? avatarFor(other) : conversation.restaurantId.image || avatarFor(other)} alt="" className="chat-avatar chat-avatar--list" />
            <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-sm font-semibold text-slate-800">{isOwner ? nameFor(other, 'Customer') : conversation.restaurantId.name}</span>{conversation.unreadCount > 0 && <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF6B35]" />}</span><span className="mt-1 block truncate text-xs text-gray-500">{conversation.lastMessage || 'No messages yet'}</span></span>
          </button>;
        })}</div>}
      </aside>
      <section className="chat-thread flex min-h-[410px] flex-col">
        {!conversationId ? <div className="m-auto max-w-sm p-8 text-center text-gray-500"><MessageCircle className="mx-auto mb-3 h-10 w-10 text-gray-300" /><p>Select a conversation to view messages.</p></div> : <>
          <header className="flex items-center gap-3 border-b border-gray-100 bg-white px-6 py-4">{selected && <><img src={ownerView(selected) ? avatarFor(partner(selected)) : selected.restaurantId.image || avatarFor(partner(selected))} alt="" className="chat-avatar chat-avatar--header" /><div className="min-w-0"><p className="truncate font-semibold text-slate-800">{ownerView(selected) ? nameFor(partner(selected), 'Customer') : selected.restaurantId.name}</p><p className="truncate text-xs text-gray-500">{ownerView(selected) ? `Regarding ${selected.restaurantId.name}` : selected.restaurantId.address}</p></div></>}</header>
          <div className="flex-1 space-y-4 overflow-y-auto p-6">{messages.length === 0 ? <p className="mt-10 text-center text-sm text-gray-500">Start the conversation.</p> : messages.map((message) => {
            const mine = isMine(message); const sender = typeof message.sender === 'string' ? undefined : message.sender;
            return <div key={message._id} className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>{!mine && <img src={avatarFor(sender)} alt={nameFor(sender)} className="chat-avatar chat-avatar--message" />}<div className={`max-w-[72%] rounded-2xl px-4 py-3 text-sm shadow-sm ${mine ? 'rounded-br-md bg-[#FF6B35] text-white' : 'rounded-bl-md border border-gray-100 bg-white text-slate-700'}`}><p className="break-words leading-5">{message.content}</p><p className={`mt-1.5 text-[10px] ${mine ? 'text-orange-100' : 'text-gray-400'}`}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div></div>;
          })}</div>
          <form onSubmit={sendMessage} className="chat-composer"><input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} placeholder="Write a message..." className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20" /><button disabled={sending || !draft.trim()} className="chat-send-button"><Send className="h-4 w-4" /><span>Send</span></button></form>
        </>}
      </section>
    </div>
  </div>;
};
