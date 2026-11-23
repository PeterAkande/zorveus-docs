import React from 'react';
import { ThemedDiagram } from './ThemedDiagram';

interface FlowDiagramProps {
  flow: 'payment-credits' | 'resource-hierarchy' | 'plan-keys';
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

const PLAN_EXAMPLES = [
  { plan: 'Starter', price: '$5/month subscription', key: 'ZORVEUS_STARTER_KEY', allowance: '$2/month' },
  { plan: 'Pro', price: '$20/month subscription', key: 'ZORVEUS_PRO_KEY', allowance: '$10/month' },
] as const;

/** Renders payment and resource flows with readable, responsive text. */
export function FlowDiagram({ flow }: FlowDiagramProps) {
  if (flow === 'plan-keys') {
    return (
      <figure className="zorveus-architecture not-prose" aria-label="How your backend selects a plan key">
        <div className="zorveus-diagram-frame" aria-hidden="true">
          <p className="zorveus-plan-key-heading">Your backend reads the customer's saved plan</p>
          <div className="zorveus-plan-key-paths">
            {PLAN_EXAMPLES.map((example) => (
              <div className="zorveus-plan-key-row" key={example.plan}>
                <div className="zorveus-plan-key-node">
                  <span className="zorveus-diagram-title">{example.plan} plan</span>
                  <span>{example.price}</span>
                </div>
                <span className="zorveus-plan-key-arrow">→</span>
                <div className="zorveus-plan-key-node" data-accent>
                  <span className="zorveus-diagram-title">{example.plan} key</span>
                  <code>{example.key}</code>
                </div>
                <span className="zorveus-plan-key-arrow">→</span>
                <div className="zorveus-plan-key-node">
                  <span className="zorveus-diagram-title">{example.allowance}</span>
                  <span>AI allowance per customer</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <ol className="sr-only">
          <li>Your backend looks up the signed-in customer's subscription in your database.</li>
          <li>A Starter customer pays $5 per month. Your backend uses the Starter key, configured with a separate $2 monthly AI allowance for each customer.</li>
          <li>A Pro customer pays $20 per month. Your backend uses the Pro key, configured with a separate $10 monthly AI allowance for each customer.</li>
        </ol>
        <figcaption>Example plans. Choose the matching key for requests and balance reads. Keep the customer's ID the same when their plan changes.</figcaption>
      </figure>
    );
  }

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
