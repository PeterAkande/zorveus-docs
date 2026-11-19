import React from 'react';
import { ThemedDiagram } from './ThemedDiagram';

interface FlowDiagramProps {
  flow: 'payment-credits' | 'resource-hierarchy';
}

const FLOW_CONFIG = {
  'payment-credits': {
    ariaLabel: 'Payment to Zorveus credit grant flow',
    nodes: [
      { title: 'Customer', detail: 'Completes a payment' },
      { title: 'Payment provider', detail: 'Sends a payment webhook' },
      { title: 'Your backend', detail: 'Verifies payment and grants credits' },
      { title: 'Zorveus', detail: 'Updates customer credits', accent: true },
    ],
    caption: 'Use the payment ID as external_reference so retries do not grant duplicate credits.',
    steps: [
      'Customer completes a payment through your payment provider.',
      'The payment provider sends a successful-payment webhook to your backend, which verifies the event.',
      'Your backend calls POST /product-users/by-external-id/credit-grants using the payment ID as external_reference.',
      'Zorveus records the credit grant and updates the customer credit balance.',
    ],
  },
  'resource-hierarchy': {
    ariaLabel: 'Zorveus resource hierarchy',
    nodes: [
      { title: 'Organization + app', detail: 'Funding wallet and product identity' },
      { title: 'App Connection', detail: 'Allowed models and spending limits', accent: true },
      { title: 'API key', detail: 'Authenticates model requests' },
    ],
    caption: 'An app connection binds your app to the organization funding its AI usage.',
    steps: [
      'Organization owns the funding wallet and App identity.',
      'App Connection binds an App to a funding organization and sets Policies & Spend Limits.',
      'Allowed Models, Monthly Cap, and API Keys govern inference requests.',
    ],
  },
} as const;

/** Renders payment and resource flows with readable, responsive text. */
export function FlowDiagram({ flow }: FlowDiagramProps) {
  const config = FLOW_CONFIG[flow];
  return (
    <ThemedDiagram
      ariaLabel={config.ariaLabel}
      nodes={[...config.nodes]}
      steps={[...config.steps]}
      caption={config.caption}
    />
  );
}
