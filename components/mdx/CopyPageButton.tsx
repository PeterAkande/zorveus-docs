'use client';

import React, { useState } from 'react';
import { Copy, Check, Loader2, FileText } from 'lucide-react';

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

  const activeStyle: React.CSSProperties = {
    color: '#4DFFB4',
    backgroundColor: 'rgba(77, 255, 180, 0.15)',
    border: '2px solid #4DFFB4',
    fontWeight: 700,
    boxShadow: '0 0 6px rgba(77, 255, 180, 0.12)',
  };

  const inactiveStyle: React.CSSProperties = {
    color: '#D4D4D8',
    backgroundColor: '#18181B',
    border: '1px solid #3F3F46',
    fontWeight: 600,
    boxShadow: 'none',
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.75rem',
    fontSize: '0.8rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.15s ease-in-out',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };

  return (
    <button
      onClick={handleCopyPage}
      title="Copy page as Markdown"
      style={{
        ...baseStyle,
        ...(copied ? activeStyle : inactiveStyle),
      }}
    >
      {loading ? (
        <>
          <Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" />
          <span>Copying...</span>
        </>
      ) : copied ? (
        <>
          <Check style={{ width: '12px', height: '12px', color: '#4DFFB4' }} />
          <span>Page Copied</span>
        </>
      ) : (
        <>
          <FileText style={{ width: '12px', height: '12px' }} />
          <span>Copy Page</span>
        </>
      )}
    </button>
  );
}
