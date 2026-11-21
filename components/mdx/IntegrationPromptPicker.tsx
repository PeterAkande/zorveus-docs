'use client';

import { useId, useState } from 'react';
import { Check, ChevronDown, Copy, Download, FileText } from 'lucide-react';
import prompts from '../../lib/integration-prompts.json';

type PromptRoute = 'gateway' | 'business' | 'oauth';

const PROMPT_ROUTES: { value: PromptRoute; label: string }[] = [
  { value: 'gateway', label: 'Call AI models' },
  { value: 'business', label: 'Customer billing' },
  { value: 'oauth', label: 'User-funded apps' },
];

const PROMPT_DESCRIPTIONS: Record<PromptRoute, string> = {
  gateway:
    'Add AI requests to your app using a Zorveus API key.',
  business:
    'Give customers their own AI allowances and connect them to your paid plans.',
  oauth:
    'Let users connect their Zorveus accounts and pay for AI requests in your app.',
};

export function IntegrationPromptPicker() {
  const id = useId();
  const [route, setRoute] = useState<PromptRoute>('gateway');
  const [status, setStatus] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const promptMap = prompts as Record<PromptRoute, string>;
  const prompt = promptMap[route];
  const excerpt = prompt.split(/\n\s*\n/).find((paragraph) => !paragraph.startsWith('#')) ?? '';

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setStatus('Prompt copied. Paste it into your coding agent.');
    } catch {
      setCopied(false);
      setStatus('Copy failed. View the full prompt to copy it, or download the Markdown file.');
    }
  }

  return (
    <section className="zorveus-prompt-picker not-prose" aria-label="Integration prompt">
      <div className="zorveus-prompt-routes" role="radiogroup" aria-label="What do you want to build?">
        {PROMPT_ROUTES.map((option) => (
          <label key={option.value} className="zorveus-prompt-route" data-selected={route === option.value}>
            <input
              className="sr-only"
              type="radio"
              name={`${id}-route`}
              value={option.value}
              checked={route === option.value}
              aria-describedby={`${id}-description`}
              onChange={() => {
                setRoute(option.value);
                setStatus('');
                setCopied(false);
                setExpanded(false);
              }}
            />
            {option.label}
          </label>
        ))}
      </div>
      <p id={`${id}-description`} className="zorveus-prompt-description">{PROMPT_DESCRIPTIONS[route]}</p>

      <div className="zorveus-prompt-document">
        <div className="zorveus-prompt-toolbar">
          <span><FileText aria-hidden="true" />Prompt preview</span>
          <button type="button" className="zorveus-prompt-copy" onClick={copyPrompt}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy prompt'}
          </button>
        </div>
        <div id={`${id}-preview`}>
          {expanded ? (
            <textarea key={route} aria-label="Full integration prompt" readOnly value={prompt} />
          ) : (
            <p className="zorveus-prompt-excerpt">{excerpt}</p>
          )}
        </div>
        <div className="zorveus-prompt-footer">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={`${id}-preview`}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide full prompt' : 'View full prompt'}
            <ChevronDown aria-hidden="true" data-expanded={expanded} />
          </button>
          <a
            href={`/api/integration-prompt?route=${route}`}
            download={`zorveus-${route}-integration-prompt.md`}
          >
            <Download aria-hidden="true" />
            Download Markdown
          </a>
        </div>
      </div>
      <div role="status">{status}</div>
    </section>
  );
}
