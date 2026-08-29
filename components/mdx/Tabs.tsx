'use client';

import React, { useState, ReactNode, Children, isValidElement } from 'react';

interface TabsProps {
  items?: string[];
  children: ReactNode;
  defaultValue?: string;
  plain?: boolean;
}

export function Tabs({ items, children, defaultValue, plain }: TabsProps) {
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
    padding: '0.5rem 1.15rem',
    fontSize: '0.875rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.15s ease-in-out',
    whiteSpace: 'nowrap',
  };

  if (plain) {
    return (
      <div style={{ margin: '1.5rem 0', width: '100%' }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #27272A',
          paddingBottom: '0.75rem',
          marginBottom: '1.75rem',
          overflowX: 'auto',
        }}>
          {tabLabels.map((label, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                style={{
                  ...baseStyle,
                  ...(isSelected ? activeStyle : inactiveStyle),
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div style={{ width: '100%' }}>
          {rawChildren[selectedIndex]}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      margin: '1.5rem 0',
      borderRadius: '0.75rem',
      border: '1px solid #222226',
      backgroundColor: '#0A0A0B',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    }}>
      <div style={{
        display: 'flex',
        gap: '0.375rem',
        borderBottom: '1px solid #222226',
        backgroundColor: '#0E0E10',
        padding: '0.5rem',
        overflowX: 'auto',
      }}>
        {tabLabels.map((label, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              style={{
                ...baseStyle,
                padding: '0.375rem 0.875rem',
                fontSize: '0.8rem',
                ...(isSelected ? activeStyle : inactiveStyle),
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div style={{ padding: '1rem', fontSize: '0.875rem', color: '#D4D4D8' }}>
        {rawChildren[selectedIndex]}
      </div>
    </div>
  );
}

export function Tab({ title, children }: { title?: string; value?: string; label?: string; children: ReactNode }) {
  return <div>{children}</div>;
}
