'use client';

import React, { useState, useEffect, ReactNode, Children, isValidElement } from 'react';
import { useKeyContext } from '../context/KeyContext';

interface CodeGroupProps {
  children: ReactNode;
  titles?: string[];
  label?: string;
}

export function CodeGroup({ children, titles, label = "Client SDK / Framework:" }: CodeGroupProps) {
  const { activeLanguage, setActiveLanguage } = useKeyContext();
  const [selectedIndex, setSelectedIndex] = useState(0);

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
    if (!activeLanguage) return;
    const langLower = activeLanguage.toLowerCase();

    // 1. Try exact title match
    let matchingIdx = tabs.findIndex((t) => t.toLowerCase() === langLower);

    // 2. Try substring match if exact match not found
    if (matchingIdx === -1) {
      matchingIdx = tabs.findIndex((t) => t.toLowerCase().includes(langLower) || langLower.includes(t.toLowerCase()));
    }

    if (matchingIdx !== -1) {
      setSelectedIndex(matchingIdx);
    }
  }, [activeLanguage, tabs]);

  const handleSelectOption = (idx: number) => {
    setSelectedIndex(idx);
    if (tabs[idx]) {
      setActiveLanguage(tabs[idx]);
    }
  };

  const currentChild = rawChildren[selectedIndex] || rawChildren[0];

  return (
    <div className="my-6 space-y-2">
      {/* Selector Bar */}
      <div className="zorveus-selector-bar">
        <span className="zorveus-selector-label">
          {label}
        </span>

        <div className="zorveus-select-control">
          <select
            aria-label={label}
            value={selectedIndex}
            onChange={(e) => handleSelectOption(Number(e.target.value))}
            className="zorveus-select"
          >
            {tabs.map((tab, idx) => (
              <option key={idx} value={idx}>{tab}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="zorveus-codegroup-content overflow-hidden rounded-xl border border-zorveus-border bg-zorveus-dark shadow-md">
        <div className="p-4 overflow-x-auto text-sm font-mono text-zinc-100">
          {currentChild}
        </div>
      </div>
    </div>
  );
}
