'use client';

import React, { useState } from 'react';
import { useKeyContext } from '../context/KeyContext';
import { Send, Play, Check, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface ApiRunnerProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  defaultHeaders?: Record<string, string>;
  defaultBody?: string;
  defaultParams?: Record<string, string>;
  authType?: 'api_key' | 'inference_key' | 'service_key' | 'dashboard_session';
}

export function ApiRunner({
  method = 'POST',
  path = '/v1/chat/completions',
  defaultHeaders,
  defaultBody,
  defaultParams,
  authType = 'api_key',
}: ApiRunnerProps) {
  const { apiKey, serviceKey } = useKeyContext();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bodyText, setBodyText] = useState(
    defaultBody ||
      JSON.stringify(
        {
          model: 'openai/gpt-4.1-mini',
          messages: [{ role: 'user', content: 'Hello Zorveus!' }],
        },
        null,
        2
      )
  );
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const authHeaderValue =
    authType === 'service_key' ? `Bearer ${serviceKey}` : `Bearer ${apiKey}`;

  const handleSend = async () => {
    setLoading(true);
    setErrorMsg(null);
    setResponseStatus(null);
    setResponseBody(null);

    const baseUrl = 'https://api.zorveus.com';
    const targetUrl = `${baseUrl}${path}`;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: authHeaderValue,
        ...(defaultHeaders || {}),
      };

      const res = await fetch(targetUrl, {
        method,
        headers,
        body: method !== 'GET' ? bodyText : undefined,
      });

      setResponseStatus(res.status);
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        resHeaders[k] = v;
      });
      setResponseHeaders(resHeaders);

      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setResponseBody(JSON.stringify(json, null, 2));
      } catch {
        setResponseBody(text);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message || 'Failed to reach API endpoint');
      } else {
        setErrorMsg('Network error connecting to API');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-zorveus-border bg-zorveus-dark shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between border-b border-zorveus-border bg-zorveus-card/80 px-4 py-3 text-left transition-colors hover:bg-zinc-900/60"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded bg-mint/10 text-mint border border-mint/20"
            style={{ width: '24px', height: '24px', minWidth: '24px' }}
          >
            <Play style={{ width: '12px', height: '12px' }} />
          </div>
          <span className="text-xs font-semibold text-zinc-100">Try It Out Live</span>
          <span className="font-mono text-xs text-zinc-400">
            {method} {path}
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="text-xs">{isOpen ? 'Hide runner' : 'Open runner'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <div>
              Target: <strong className="font-mono text-zinc-200">https://api.zorveus.com{path}</strong>
            </div>
            <div className="font-mono text-[11px] text-mint">
              Auth: {authType === 'service_key' ? 'Service Key' : 'API Key'}
            </div>
          </div>

          {method !== 'GET' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Request Body (JSON)</label>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-zorveus-border bg-zorveus-card p-3 font-mono text-xs text-zinc-100 placeholder-zinc-500 focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint"
                spellCheck={false}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-zinc-500">
              * Live requests authenticate with your inserted test key.
            </div>
            <button
              onClick={handleSend}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-mint px-4 py-2 text-xs font-semibold text-zinc-950 transition-all hover:bg-mint-dark disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>

          {/* Response output */}
          {(responseStatus !== null || errorMsg) && (
            <div className="mt-4 rounded-lg border border-zorveus-border bg-zinc-950/80 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-2">
                <span className="font-semibold text-zinc-300">Response</span>
                {responseStatus !== null && (
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                    }`}
                  >
                    HTTP {responseStatus}
                  </span>
                )}
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 text-xs text-rose-400 py-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {responseBody && (
                <pre className="max-h-64 overflow-y-auto text-xs font-mono text-zinc-200 bg-zinc-900/50 p-2.5 rounded border border-zinc-800">
                  {responseBody}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
