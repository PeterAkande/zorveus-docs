'use client';

import React from 'react';
import { useKeyContext } from '../context/KeyContext';
import { Key, RotateCcw, Check, Copy } from 'lucide-react';

interface KeyInserterProps {
  type?: 'inference' | 'service' | 'client';
  label?: string;
  placeholder?: string;
}

export function KeyInserter({
  type = 'inference',
  label,
  placeholder,
}: KeyInserterProps) {
  const { apiKey, setApiKey, serviceKey, setServiceKey, clientId, setClientId } = useKeyContext();
  const [copied, setCopied] = React.useState(false);

  const value = type === 'inference' ? apiKey : type === 'service' ? serviceKey : clientId;
  const setValue = type === 'inference' ? setApiKey : type === 'service' ? setServiceKey : setClientId;
  const defaultPlaceholder =
    type === 'inference'
      ? 'zrv_your_inference_key'
      : type === 'service'
      ? 'zrv_svc_your_service_key'
      : 'zrv_client_your_client_id';

  const isCustom = value !== defaultPlaceholder;

  const handleReset = () => {
    setValue(defaultPlaceholder);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{ padding: '14px 16px' }}
      className="my-5 rounded-xl border border-[#222226] bg-[#121214] flex flex-col gap-2.5 shadow-xs"
    >
      {/* Row 1: Key Icon (26px, icon 12px) + Title + Pill Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            style={{ width: '26px', height: '26px', minWidth: '26px' }}
            className="flex items-center justify-center rounded-md border border-[#4DFFB4]/25 bg-[#4DFFB4]/10 text-[#4DFFB4]"
          >
            <Key style={{ width: '12px', height: '12px' }} />
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '13px' }} className="font-semibold text-zinc-100">
              {label || (type === 'inference' ? 'Inference Key Tester' : 'Service Key Inserter')}
            </span>
            <span
              style={{
                fontSize: '9px',
                lineHeight: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
              className="inline-flex items-center font-mono font-semibold text-[#4DFFB4] bg-[#4DFFB4]/12 border border-[#4DFFB4]/30 uppercase tracking-wider"
            >
              Interactive
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Subtitle */}
      <div
        style={{ fontSize: '12px', marginTop: '1px', marginBottom: '2px' }}
        className="text-zinc-400 font-normal leading-tight m-0"
      >
        Paste your Zorveus key to dynamically update all code snippets below.
      </div>

      {/* Row 3: Input Field + Compact Buttons (30px, icon 12px) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={isCustom ? value : ''}
            placeholder={placeholder || defaultPlaceholder}
            onChange={(e) => setValue(e.target.value || defaultPlaceholder)}
            style={{ padding: '6px 10px', fontSize: '12px', height: '30px' }}
            className="w-full rounded-lg border border-[#222226] bg-[#0A0A0B] font-mono text-zinc-100 placeholder:text-zinc-600 transition-colors focus:border-[#4DFFB4]/50 focus:outline-none focus:ring-1 focus:ring-[#4DFFB4]/30"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        {isCustom && (
          <button
            onClick={handleReset}
            title="Reset to default placeholder"
            style={{ width: '30px', height: '30px' }}
            className="flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100"
          >
            <RotateCcw style={{ width: '12px', height: '12px' }} />
          </button>
        )}

        <button
          onClick={handleCopy}
          title="Copy current key"
          style={{ width: '30px', height: '30px' }}
          className="flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-[#4DFFB4]"
        >
          {copied ? (
            <Check style={{ width: '12px', height: '12px' }} className="text-[#4DFFB4]" />
          ) : (
            <Copy style={{ width: '12px', height: '12px' }} />
          )}
        </button>
      </div>
    </div>
  );
}
