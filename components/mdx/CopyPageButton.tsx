'use client';

import React, { useState } from 'react';
import { Check, Loader2, FileText } from 'lucide-react';

interface CopyPageButtonProps {
  slug?: string[];
}

export function CopyPageButton({ slug }: CopyPageButtonProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopyPage = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const slugPath = slug ? slug.join('/') : '';
      const response = await fetch(`/api/raw-doc?slug=${encodeURIComponent(slugPath)}`);
      if (!response.ok) throw new Error('Failed to load raw markdown');
      const text = await response.text();

      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy page markdown:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCopyPage}
        title="Copy page as Markdown for an LLM"
        type="button"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors cursor-pointer bg-transparent border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          color: copied ? 'var(--docs-accent)' : 'var(--docs-muted)',
        }}
      >
        {loading ? (
          <>
            <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" aria-hidden="true" />
            <span>Copying...</span>
          </>
        ) : copied ? (
          <>
            <Check style={{ width: '13px', height: '13px', color: 'var(--docs-accent)' }} aria-hidden="true" />
            <span>Copied for LLM</span>
          </>
        ) : (
          <>
            <FileText style={{ width: '13px', height: '13px' }} aria-hidden="true" />
            <span>Copy for LLM</span>
          </>
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Page copied as Markdown.' : ''}
      </span>
    </>
  );
}
