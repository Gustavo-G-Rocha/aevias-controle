import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronRight, CheckCircle2, XCircle, Loader2, Wrench } from 'lucide-react';

const isFailed = (tc) => {
  if (['failed', 'error'].includes(tc.status)) return true;
  try {
    const r = typeof tc.results === 'string' ? JSON.parse(tc.results) : tc.results;
    if (r && r.success === false) return true;
  } catch { /* raw string */ }
  return typeof tc.results === 'string' && /error|failed/i.test(tc.results);
};

const ToolCallDisplay = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);
  const running = ['pending', 'running', 'in_progress'].includes(toolCall.status);
  const failed = !running && isFailed(toolCall);
  const proj = toolCall.display_projection;
  const hideDetails = proj?.hide_details && proj?.details_redacted;
  const label = running ? (proj?.active_label || `Consultando ${toolCall.name}...`)
    : failed ? (proj?.error_label || `Falha em ${toolCall.name}`)
    : (proj?.label || toolCall.name);
  const Icon = running ? Loader2 : failed ? XCircle : CheckCircle2;
  return (
    <div className="mt-2 text-xs rounded-md border px-2 py-1.5" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-muted)' }}>
      <button type="button" className="flex items-center gap-1.5 w-full text-left" onClick={() => !hideDetails && setExpanded(!expanded)}>
        <Wrench className="w-3 h-3 shrink-0" style={{ color: 'var(--color-text-subtle)' }} />
        <span className="flex-1 truncate" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
        <Icon className={`w-3.5 h-3.5 shrink-0 ${running ? 'animate-spin' : ''}`} style={{ color: failed ? 'var(--color-danger)' : running ? 'var(--color-text-subtle)' : 'var(--color-success)' }} />
        {!hideDetails && <ChevronRight className={`w-3 h-3 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} style={{ color: 'var(--color-text-subtle)' }} />}
      </button>
      {expanded && !hideDetails && (
        <pre className="mt-1.5 whitespace-pre-wrap break-all max-h-40 overflow-y-auto" style={{ color: 'var(--color-text-muted)' }}>
          {toolCall.arguments_string}
          {toolCall.results ? `\n→ ${typeof toolCall.results === 'string' ? toolCall.results : JSON.stringify(toolCall.results, null, 2)}` : ''}
        </pre>
      )}
    </div>
  );
};

export default function AuditorMessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[85%] rounded-2xl px-4 py-2.5" style={isUser
        ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }
        : { backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
        {message.content && (isUser
          ? <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          : <ReactMarkdown className="text-sm prose prose-sm max-w-none dark:prose-invert">{message.content}</ReactMarkdown>)}
        {message.tool_calls?.map((tc, idx) => <ToolCallDisplay key={idx} toolCall={tc} />)}
      </div>
    </div>
  );
}