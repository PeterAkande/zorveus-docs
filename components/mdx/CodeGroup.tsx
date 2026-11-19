'use client';

import React, { useState, useEffect, ReactNode, Children, isValidElement } from 'react';
import { useKeyContext } from '../context/KeyContext';
import { replaceKeysInNode } from '../../lib/key-replace.mjs';

interface CodeGroupProps {
  children: ReactNode;
  titles?: string[];
  label?: string;
}

export function CodeGroup({ children, titles }: CodeGroupProps) {
  const { activeLanguage, setActiveLanguage, apiKey, serviceKey, clientId } = useKeyContext();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const rawChildren = Children.toArray(children).filter(Boolean);

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

  useEffect(() => {
    if (!activeLanguage) return;
    const langLower = activeLanguage.toLowerCase();

    let matchingIdx = tabs.findIndex((t) => t.toLowerCase() === langLower);
    if (matchingIdx === -1) {
      matchingIdx = tabs.findIndex(
        (t) => t.toLowerCase().includes(langLower) || langLower.includes(t.toLowerCase())
      );
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

  const processedChild = replaceKeysInNode(currentChild, {
    zrv_your_api_key: apiKey,
    zrv_svc_your_service_key: serviceKey,
    zrv_client_your_client_id: clientId,
  });

  return (
    <div className="zorveus-tabs not-prose my-6 zorveus-codegroup">
      <div className="zorveus-tabs-list" role="tablist">
        {tabs.map((tab, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-pressed={isSelected}
              onClick={() => handleSelectOption(idx)}
              className="zorveus-tabs-trigger"
            >
              {tab}
            </button>
          );
        })}
      </div>
      <div className="zorveus-tabs-content">
        {processedChild}
      </div>
    </div>
  );
}
