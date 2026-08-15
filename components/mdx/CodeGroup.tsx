'use client';

import React, { useState, useEffect, ReactNode, Children, isValidElement } from 'react';
import { useKeyContext } from '../context/KeyContext';
import { Check, Copy } from 'lucide-react';

interface CodeGroupProps {
  children: ReactNode;
  titles?: string[];
}

export function CodeGroup({ children, titles }: CodeGroupProps) {
  const { apiKey, serviceKey, clientId, activeLanguage, setActiveLanguage } = useKeyContext();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const rawChildren = Children.toArray(children).filter(Boolean);

  // Extract titles from props, data-title, title, or code filename/language
  const tabs = rawChildren.map((child, idx) => {
    if (titles && titles[idx]) return titles[idx];
    if (isValidElement(child)) {
      const props = child.props as Record<string, unknown>;
      if (typeof props.title === 'string') return props.title;
      if (typeof props['data-title'] === 'string') return props['data-title'];
      if (typeof props.filename === 'string') return props.filename;
      if (typeof props['data-language'] === 'string') return props['data-language'];
    }
    return `Tab ${idx + 1}`;
  });

  // Sync selected index with active persistent language if title matches
  useEffect(() => {
    const langLower = activeLanguage.toLowerCase();
    const matchingIdx = tabs.findIndex((t) => {
      const tLower = t.toLowerCase();
      if (langLower.includes('python') && tLower.includes('python')) return true;
      if (langLower.includes('curl') && (tLower.includes('curl') || tLower.includes('bash') || tLower.includes('sh'))) return true;
      if (langLower.includes('typescript') && (tLower.includes('typescript') || tLower.includes('ts'))) return true;
      if (langLower.includes('javascript') && (tLower.includes('javascript') || tLower.includes('js') || tLower.includes('node'))) return true;
      if (langLower.includes('go') && tLower.includes('go')) return true;
      if (langLower.includes('rust') && tLower.includes('rust')) return true;
      return false;
    });
    if (matchingIdx !== -1) {
      setSelectedIndex(matchingIdx);
    }
  }, [activeLanguage, tabs]);

  const handleTabClick = (idx: number, title: string) => {
    setSelectedIndex(idx);
    setActiveLanguage(title);
  };

  // Helper to extract text from React element tree and replace placeholder keys
  const extractText = (node: unknown): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (!node) return '';
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (isValidElement(node)) {
      const props = node.props as { children?: unknown };
      return extractText(props.children);
    }
    return '';
  };

  const currentChild = rawChildren[selectedIndex] || rawChildren[0];

  const handleCopy = () => {
    let rawText = extractText(currentChild);
    if (apiKey !== 'zrv_your_inference_key') {
      rawText = rawText.replace(/zrv_your_inference_key/g, apiKey);
    }
    if (serviceKey !== 'zrv_service_your_service_key') {
      rawText = rawText.replace(/zrv_service_your_service_key/g, serviceKey);
    }
    if (clientId !== 'zrv_client_your_client_id') {
      rawText = rawText.replace(/zrv_client_your_client_id/g, clientId);
    }

    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-zorveus-border bg-zorveus-dark shadow-md">
      {/* Header bar with tabs & actions */}
      <div className="flex items-center justify-between border-b border-zorveus-border bg-zorveus-card/80 px-3 py-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                onClick={() => handleTabClick(idx, tab)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-zinc-800/90 text-mint font-semibold shadow-xs border border-mint/20'
                    : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                }`}
              >
                <span>{tab}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleCopy}
          title="Copy code"
          className="flex items-center gap-1.5 rounded-md border border-zorveus-border bg-zorveus-dark/60 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-mint" />
              <span className="text-mint text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="p-4 overflow-x-auto text-sm font-mono text-zinc-100">
        {currentChild}
      </div>
    </div>
  );
}
