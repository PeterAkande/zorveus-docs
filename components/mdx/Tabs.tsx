'use client';

import React, { useState, ReactNode, Children, isValidElement } from 'react';

interface TabsProps {
  items?: string[];
  children: ReactNode;
  defaultValue?: string;
}

export function Tabs({ items, children, defaultValue }: TabsProps) {
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

  return (
    <div className="my-6 rounded-xl border border-zorveus-border bg-zorveus-dark overflow-hidden">
      <div className="flex border-b border-zorveus-border bg-zorveus-card/80 px-2 pt-2 gap-1 overflow-x-auto">
        {tabLabels.map((label, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-t-lg transition-all border-b-2 ${
                isSelected
                  ? 'border-mint bg-zinc-800/80 text-mint font-semibold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
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
