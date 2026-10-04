'use client';

import React from 'react';
import { useKeyContext } from '../context/KeyContext';
import { Key, RotateCcw, Check, Copy, Eye, EyeOff } from 'lucide-react';

interface KeyInserterProps {
  type?: 'api' | 'inference' | 'service' | 'client';
  label?: string;
  placeholder?: string;
}

export function KeyInserter({ type = 'api', label, placeholder }: KeyInserterProps) {
  const { apiKey, setApiKey, serviceKey, setServiceKey, clientId, setClientId } = useKeyContext();
  const [copied, setCopied] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);
  const [copyError, setCopyError] = React.useState(false);
  const inputId = React.useId();
  const isApi = type === 'api' || type === 'inference';
  const value = isApi ? apiKey : type === 'service' ? serviceKey : clientId;
  const setValue = isApi ? setApiKey : type === 'service' ? setServiceKey : setClientId;
  const defaultPlaceholder = isApi ? 'zrv_your_api_key' : type === 'service' ? 'zrv_svc_your_service_key' : 'zrv_client_your_client_id';
  const isCustom = value !== defaultPlaceholder;
  const title = label || (isApi ? 'API key' : type === 'service' ? 'Service key' : 'Client ID');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyError(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <div className="zorveus-key-toolbar not-prose">
      <div className="zorveus-key-label">
        <Key aria-hidden="true" />
        <div>
          <label htmlFor={inputId}>{title}</label>
          <p id={`${inputId}-help`}>Optional key for interactive API requests. Stored in memory only.</p>
        </div>
      </div>
      <div className="zorveus-key-controls">
        <input
          id={inputId}
          type={revealed || type === 'client' ? 'text' : 'password'}
          value={isCustom ? value : ''}
          placeholder={placeholder || defaultPlaceholder}
          onChange={(event) => { setValue(event.target.value || defaultPlaceholder); setCopied(false); setCopyError(false); }}
          aria-describedby={`${inputId}-help`}
          spellCheck={false}
          autoComplete="off"
        />
        {type !== 'client' && (
          <button type="button" className="zorveus-icon-button" onClick={() => setRevealed(!revealed)} aria-label={revealed ? 'Hide key' : 'Show key'} aria-pressed={revealed} title={revealed ? 'Hide key' : 'Show key'}>
            {revealed ? <EyeOff /> : <Eye />}
          </button>
        )}
        {isCustom && (
          <button type="button" className="zorveus-icon-button" onClick={() => { setValue(defaultPlaceholder); setCopied(false); setCopyError(false); }} aria-label="Reset key" title="Reset key">
            <RotateCcw />
          </button>
        )}
        <button type="button" className="zorveus-icon-button" onClick={handleCopy} aria-label={copied ? 'Key copied' : 'Copy key'} title={copied ? 'Copied' : 'Copy key'} disabled={!isCustom}>
          {copied ? <Check /> : <Copy />}
        </button>
      </div>
      <span className={copyError ? 'zorveus-key-error' : 'sr-only'} role="status">{copyError ? 'Could not copy. Select the key and copy it manually.' : copied ? 'Key copied.' : ''}</span>
    </div>
  );
}
