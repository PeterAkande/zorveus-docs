'use client';

import { useState } from 'react';
import prompts from '../../lib/integration-prompts.json';

export function IntegrationPromptPicker() {
  const [route, setRoute] = useState<'business' | 'oauth'>('business');
  const [status, setStatus] = useState('');

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompts[route]);
      setStatus('Prompt copied. Paste it into your coding agent.');
    } catch {
      setStatus('Copy failed. Download the prompt or copy it from the preview.');
    }
  }

  return (
    <section className="zorveus-prompt-picker not-prose" aria-label="Integration prompt">
      <label htmlFor="integration-route">Choose your integration route</label>
      <select id="integration-route" value={route} onChange={(event) => {
        setRoute(event.target.value as 'business' | 'oauth');
        setStatus('');
      }}>
        <option value="business">Business: your product pays for customer AI usage</option>
        <option value="oauth">Developer OAuth: users connect their own Zorveus accounts</option>
      </select>
      <p>{route === 'business'
        ? 'Includes per-user attribution, plan-specific keys, allowance settings, optional billing and credit grants, and webhooks.'
        : 'Includes dashboard registration, consent, PKCE, user-scoped inference tokens, disconnection, and reauthorization.'}</p>
      <div className="zorveus-prompt-actions">
        <button type="button" onClick={copyPrompt}>Copy {route === 'business' ? 'Business' : 'OAuth'} prompt</button>
        <a href={`/api/integration-prompt?route=${route}`} download={`zorveus-${route}-integration-prompt.md`}>Download Markdown</a>
      </div>
      <div role="status">{status}</div>
      <details key={route}>
        <summary>Preview the full prompt</summary>
        <textarea aria-label="Full integration prompt" readOnly value={prompts[route]} />
      </details>
    </section>
  );
}
