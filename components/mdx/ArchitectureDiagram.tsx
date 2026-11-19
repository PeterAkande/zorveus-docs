import React from 'react';
import { ThemedDiagram } from './ThemedDiagram';

const ARCHITECTURE_STEPS = [
  'Zorveus dashboard configures apps, policies, caps, and provider credentials.',
  'Your application backend sends model requests with a Zorveus API key and customer external user ID through Zorveus Gateway (Authorize, Reserve, Settle).',
  'Model provider executes completions across OpenAI, Anthropic, or Gemini and returns responses through Zorveus.',
];

/** Renders the Zorveus architecture diagram with theme-matched light and dark assets. */
export function ArchitectureDiagram() {
  return (
    <ThemedDiagram
      ariaLabel="Zorveus architecture"
      lightSrc="/diagrams/architecture-light.jpg"
      darkSrc="/diagrams/architecture-dark.jpg"
      alt="Zorveus architecture showing Zorveus Dashboard configuring policies, Your Backend sending Inference requests and Service Key calls through Zorveus Gateway (Authorize, Reserve, Settle) to OpenAI, Anthropic, and Gemini."
      steps={ARCHITECTURE_STEPS}
      caption="Separate server-to-server path: your backend uses a service key for supported product-user reads, upserts, and credit grants by external user ID."
    />
  );
}
