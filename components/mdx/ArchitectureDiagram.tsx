import React from 'react';
import { ThemedDiagram } from './ThemedDiagram';

const ARCHITECTURE_STEPS = [
  'Your application backend sends model requests with a Zorveus API key and customer external user ID.',
  'Zorveus gateway authorizes requests, reserves allowance, and settles usage.',
  'Model provider executes completions across OpenAI, Anthropic, or Gemini and returns responses through Zorveus.',
];

/** Shows the model request path from the application backend to providers. */
export function ArchitectureDiagram() {
  return (
    <ThemedDiagram
      ariaLabel="Zorveus architecture"
      nodes={[
        { title: 'Your backend', detail: 'API key + customer ID' },
        { title: 'Zorveus gateway', detail: 'Authorize, reserve, and settle', accent: true },
        { title: 'Model providers', detail: 'OpenAI, Anthropic, Gemini, and more' },
      ]}
      steps={ARCHITECTURE_STEPS}
      caption="Separate server-to-server path: your backend uses a service key for supported product-user reads, upserts, and credit grants by external user ID."
    />
  );
}
