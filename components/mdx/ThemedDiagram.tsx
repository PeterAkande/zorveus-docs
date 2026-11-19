import React from 'react';

interface ThemedDiagramProps {
  ariaLabel: string;
  nodes: { title: string; detail: string; accent?: boolean }[];
  steps: string[];
  caption?: string;
}

/** Renders compact diagrams with live text and the current documentation theme. */
export function ThemedDiagram({
  ariaLabel,
  nodes,
  steps,
  caption,
}: ThemedDiagramProps) {
  return (
    <figure className="zorveus-architecture not-prose" aria-label={ariaLabel}>
      <div className="zorveus-diagram-frame" aria-hidden="true">
        <div className="zorveus-diagram-flow" data-columns={nodes.length}>
          {nodes.map((node) => (
            <div className="zorveus-diagram-node" data-accent={node.accent || undefined} key={node.title}>
              <span className="zorveus-diagram-title">{node.title}</span>
              <span>{node.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <ol className="sr-only">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

