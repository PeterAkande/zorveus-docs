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
    <div className="zorveus-tabs">
      <div className="zorveus-tabs-list not-prose">
        {tabLabels.map((label, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={idx}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedIndex(idx)}
              className="zorveus-tabs-trigger"
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="zorveus-tabs-content">
        {rawChildren[selectedIndex]}
      </div>
    </div>
  );
}

export function Tab({ title, children }: { title?: string; value?: string; label?: string; children: ReactNode }) {
  return <div>{children}</div>;
}
