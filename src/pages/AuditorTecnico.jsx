import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ShieldCheck, Loader2, Plus } from 'lucide-react';
import AuditorMessageBubble from '@/components/agente-auditor/AuditorMessageBubble';

const AGENT_NAME = 'auditor_tecnico';

export default function AuditorTecnico() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const startConversation = useCallback(async () => {
    setLoading(true);
    const conv = await base44.agents.createConversation({
      agent_name: AGENT_NAME,
      metadata: { name: 'Auditoria Técnica', description: 'Conversa com o Auditor Técnico' },
    });
    setConversation(conv);
    setMessages(conv.messages || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Retoma a conversa mais recente do usuário ou cria uma nova.
    (async () => {
      const list = await base44.agents.listConversations({ agent_name: AGENT_NAME });
      if (list && list.length > 0) {
        const conv = await base44.agents.getConversation(list[0].id);
        setConversation(conv);
        setMessages(conv.messages || []);
        setLoading(false);
      } else {
        await startConversation();
      }
    })();
  }, [startConversation]);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsubscribe();
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending || !conversation) return;
    setInput('');
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content });
    } finally {
      setSending(false);
    }
  };

  const lastMsg = messages[messages.length - 1];
  const agentWorking = sending || (lastMsg && lastMsg.role === 'user');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-secondary-subtle)' }}>
          <ShieldCheck className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-heading font-bold text-base" style={{ color: 'var(--color-text)' }}>Auditor Técnico</h1>
          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>Verificação de conformidade de ensaios e checklists</p>
        </div>
        <Button variant="outline" size="sm" onClick={startConversation} disabled={loading}>
          <Plus className="w-4 h-4 mr-1" /> Nova conversa
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-text-subtle)' }} /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 px-6">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-secondary)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Olá! Sou o Auditor Técnico.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Posso verificar se ensaios estão dentro das faixas granulométricas, apontar valores suspeitos e resumir não conformidades. Ex.: "Verifique a conformidade do último ensaio CAUQ da obra X".
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => <AuditorMessageBubble key={idx} message={msg} />)
        )}
        {agentWorking && !loading && (
          <div className="flex items-center gap-2 text-xs px-1" style={{ color: 'var(--color-text-subtle)' }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analisando...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t shrink-0" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Pergunte sobre a conformidade de um ensaio..."
            rows={1}
            className="resize-none min-h-[44px] max-h-32"
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={!input.trim() || sending || loading} className="h-11 w-11 p-0 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}