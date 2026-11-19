'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type Payer = 'product' | 'users';

interface FlowNode {
  title: string;
  subtitle: string;
}

interface Recommendation {
  title: string;
  workspace: string;
  credentials: string;
  summary: string;
  href: string;
  ctaLabel: string;
  nodes: [FlowNode, FlowNode, FlowNode];
}

const RECOMMENDATIONS: Record<Payer, Recommendation> = {
  product: {
    title: 'Direct API and SaaS gateway',
    workspace: 'Business organization',
    credentials: 'API key (zrv_...)',
    summary:
      'Your app or backend calls models through one unified API funded by your Business wallet. Add customer IDs anytime to track per-user spend or enforce allowances.',
    href: '/getting-started/startup-quickstart',
    ctaLabel: 'Open API quickstart',
    nodes: [
      { title: 'Your app or backend', subtitle: 'Bearer zrv_...' },
      { title: 'Zorveus gateway', subtitle: 'Routes models, bills org' },
      { title: 'AI models', subtitle: '850+ supported models' },
    ],
  },
  users: {
    title: 'Connectable app with OAuth 2.0 PKCE',
    workspace: 'Developer organization',
    credentials: 'Client ID (zrv_client_...) and scoped user access token',
    summary:
      'End users authorize your app with Zorveus, choose their own spending limit, and pay from their own accounts.',
    href: '/getting-started/oauth-app-quickstart',
    ctaLabel: 'Open OAuth quickstart',
    nodes: [
      { title: 'User browser', subtitle: 'OAuth sign-in' },
      { title: 'Zorveus gateway', subtitle: 'Checks cap, bills user' },
      { title: 'AI models', subtitle: '850+ supported models' },
    ],
  },
};

const BOX_X = [20, 277, 534] as const;
const ARROW_X = [
  [226, 272],
  [483, 529],
] as const;

function ArchitectureSchematic({
  nodes,
  title,
}: {
  nodes: [FlowNode, FlowNode, FlowNode];
  title: string;
}) {
  return (
    <div className="zorveus-decision-diagram">
      <svg
        viewBox="0 0 760 140"
        className="zorveus-decision-svg"
        role="img"
        aria-label={`${title} request flow diagram`}
      >
        {nodes.map((node, index) => {
          const x = BOX_X[index];
          const centerX = x + 103;
          const isGateway = index === 1;
          return (
            <g key={`${node.title}-${index}`}>
              <rect
                x={x}
                y="28"
                width="206"
                height="84"
                rx="10"
                fill="var(--docs-bg)"
                stroke={isGateway ? 'var(--docs-border-strong)' : 'var(--docs-border)'}
                strokeWidth={isGateway ? '1.25' : '1'}
              />
              <text
                x={centerX}
                y="63"
                textAnchor="middle"
                fill="var(--docs-heading)"
                fontSize="14.5"
                fontWeight="600"
                fontFamily="var(--font-sans)"
              >
                {node.title}
              </text>
              <text
                x={centerX}
                y="85"
                textAnchor="middle"
                fill="var(--docs-muted)"
                fontSize="12"
                fontFamily="var(--font-sans)"
              >
                {node.subtitle}
              </text>
            </g>
          );
        })}

        {ARROW_X.map(([startX, endX]) => (
          <g key={startX}>
            <line
              x1={startX}
              y1="70"
              x2={endX}
              y2="70"
              stroke="var(--docs-connector)"
              strokeWidth="1.25"
            />
            <path
              d={`M${endX - 5} 65 L${endX + 2} 70 L${endX - 5} 75`}
              fill="none"
              stroke="var(--docs-connector)"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Editorial selector helping developers pick the right Zorveus integration path. */
export function IntegrationDecisionGuide() {
  const [payer, setPayer] = useState<Payer>('product');
  const recommendation = RECOMMENDATIONS[payer];

  return (
    <section className="zorveus-decision-guide not-prose" aria-label="Integration path selector">
      <div className="zorveus-decision-controls">
        <div className="zorveus-decision-row">
          <span id="payer-label" className="zorveus-decision-label">
            Who pays for requests?
          </span>
          <div className="zorveus-segmented" role="radiogroup" aria-labelledby="payer-label">
            <button
              type="button"
              role="radio"
              aria-checked={payer === 'product'}
              className="zorveus-segmented-btn"
              onClick={() => setPayer('product')}
            >
              My app or backend pays
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={payer === 'users'}
              className="zorveus-segmented-btn"
              onClick={() => setPayer('users')}
            >
              My users pay
            </button>
          </div>
        </div>
      </div>

      <div className="zorveus-decision-result" aria-live="polite">
        <div className="zorveus-decision-header">
          <h3>{recommendation.title}</h3>
          <p>{recommendation.summary}</p>
        </div>

        <ArchitectureSchematic nodes={recommendation.nodes} title={recommendation.title} />

        <div className="zorveus-decision-footer">
          <dl className="zorveus-decision-specs">
            <div>
              <dt>Workspace</dt>
              <dd>{recommendation.workspace}</dd>
            </div>
            <div>
              <dt>Credentials</dt>
              <dd>{recommendation.credentials}</dd>
            </div>
          </dl>
          <Link href={recommendation.href} className="zorveus-decision-cta">
            {recommendation.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
