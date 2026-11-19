import React from 'react';

interface ThemedDiagramProps {
  ariaLabel: string;
  lightSrc: string;
  darkSrc: string;
  alt: string;
  steps: string[];
  caption?: string;
}

/** Renders theme-matched light and dark diagram images with screen-reader step fallback. */
export function ThemedDiagram({
  ariaLabel,
  lightSrc,
  darkSrc,
  alt,
  steps,
  caption,
}: ThemedDiagramProps) {
  return (
    <figure className="zorveus-architecture not-prose" aria-label={ariaLabel}>
      <div className="zorveus-diagram-frame">
        <img
          src={lightSrc}
          alt={alt}
          className="zorveus-diagram-img zorveus-diagram-light"
          loading="lazy"
        />
        <img
          src={darkSrc}
          alt=""
          aria-hidden="true"
          className="zorveus-diagram-img zorveus-diagram-dark"
          loading="lazy"
        />
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

