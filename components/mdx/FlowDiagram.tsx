import React from 'react';
import { ThemedDiagram } from './ThemedDiagram';

interface FlowDiagramProps {
  flow: 'stripe-credits' | 'resource-hierarchy';
}

const FLOW_CONFIG = {
  'stripe-credits': {
    ariaLabel: 'Stripe payment to Zorveus credit grant flow',
    lightSrc: '/diagrams/stripe-credits-light.jpg',
    darkSrc: '/diagrams/stripe-credits-dark.jpg',
    alt: 'Workflow diagram showing Customer Pays via Stripe Checkout, Stripe Webhook firing payment_intent.succeeded, Your Backend calling POST /credit-grants with an Idempotent Key, and Zorveus Ledger updating balance.',
    steps: [
      'Customer completes payment via Stripe Checkout.',
      'Stripe sends a payment_intent.succeeded webhook to your backend.',
      'Your backend calls POST /product-users/by-external-id/credit-grants using the payment ID as external_reference.',
      'Zorveus Ledger updates the customer allowance immediately.',
    ],
  },
  'resource-hierarchy': {
    ariaLabel: 'Zorveus resource hierarchy',
    lightSrc: '/diagrams/resource-hierarchy-light.jpg',
    darkSrc: '/diagrams/resource-hierarchy-dark.jpg',
    alt: 'Hierarchy diagram showing Organization linking to App Connection (Policies & Spend Limits), which defines Allowed Models, Monthly Cap, and API Keys.',
    steps: [
      'Organization owns the funding wallet and App identity.',
      'App Connection binds an App to a funding organization and sets Policies & Spend Limits.',
      'Allowed Models, Monthly Cap, and API Keys govern inference requests.',
    ],
  },
} as const;

/** Renders theme-matched workflow and hierarchy diagrams inside MDX pages. */
export function FlowDiagram({ flow }: FlowDiagramProps) {
  const config = FLOW_CONFIG[flow];
  return (
    <ThemedDiagram
      ariaLabel={config.ariaLabel}
      lightSrc={config.lightSrc}
      darkSrc={config.darkSrc}
      alt={config.alt}
      steps={[...config.steps]}
    />
  );
}
