'use client';

import React, { useState, ReactNode, Children, isValidElement } from 'react';

interface TabsProps {
  items?: string[];
  children: ReactNode;
  defaultValue?: string;
  plain?: boolean;
  label?: string;
}

export function Tabs({ items, children, defaultValue, plain, label = "Platform / Framework:" }: TabsProps) {
  const rawChildren = Children.toArray(children).filter(Boolean);

  const tabLabels = items || rawChildren.map((child, idx) => {
    if (isValidElement(child)) {
      const props = child.props as Record<string, unknown>;
      if (typeof props.title === 'string') return props.title;
      if (typeof props.value === 'string') return props.value;
      if (typeof props.label === 'string') return props.label;
    }
    return `Option ${idx + 1}`;
  });

  const defaultIndex = defaultValue ? Math.max(0, tabLabels.indexOf(defaultValue)) : 0;
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex !== -1 ? defaultIndex : 0);

  if (plain) {
    return (
      <div className="my-6 w-full space-y-4">
        {/* Selector Bar */}
        <div className="zorveus-selector-bar">
          <span className="zorveus-selector-label">
            {label}
          </span>

          <div className="zorveus-select-control">
            <select
              aria-label={label}
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
              className="zorveus-select"
            >
              {tabLabels.map((tab, idx) => (
                <option key={idx} value={idx}>{tab}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full">
          {rawChildren[selectedIndex]}
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-xl border border-zorveus-border bg-zorveus-dark overflow-hidden shadow-md">
      <div className="flex border-b border-zorveus-border bg-zinc-950 p-2 gap-1.5 overflow-x-auto">
        {tabLabels.map((label, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer outline-none focus:outline-none ${
                isSelected
                  ? 'bg-mint/15 text-mint border border-mint/40 shadow-[0_0_6px_rgba(77,255,180,0.12)]'
                  : 'bg-zinc-900/60 text-zinc-300 hover:text-mint hover:bg-zinc-800/60 border border-zinc-800/60'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="p-4 text-sm text-zinc-300">
        {rawChildren[selectedIndex]}
      </div>
    </div>
  );
}

export function Tab({ title, children }: { title?: string; value?: string; label?: string; children: ReactNode }) {
  return <div>{children}</div>;
}
