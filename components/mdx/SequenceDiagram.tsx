'use client';

import React, { useState } from 'react';
import { RotateCcw, ChevronRight } from 'lucide-react';

interface StepDetail {
  from: string;
  to: string;
  label: string;
  description: string;
  type?: 'request' | 'response' | 'internal';
}

interface DiagramFlow {
  title: string;
  participants: string[];
  steps: StepDetail[];
}

const predefinedFlows: Record<string, DiagramFlow> = {
  'inference-lifecycle': {
    title: 'Inference Request & Billing Lifecycle',
    participants: ['Client App', 'Zorveus Gateway', 'Policy & Caps', 'Model Provider', 'Wallet / Ledger'],
    steps: [
      {
        from: 'Client App',
        to: 'Zorveus Gateway',
        label: '1. POST /v1/chat/completions (Bearer zrv_...)',
        description: 'Client calls OpenAI-compatible endpoint with API key and optional product-user metadata.',
        type: 'request',
      },
      {
        from: 'Zorveus Gateway',
        to: 'Policy & Caps',
        label: '2. Resolve Connection & Check Caps',
        description: 'Gateway checks active app connection, allowed model wildcards, remaining caps, and product-user credits.',
        type: 'internal',
      },
      {
        from: 'Policy & Caps',
        to: 'Wallet / Ledger',
        label: '3. Pre-flight Fund Reservation',
        description: 'For wallet-funded requests, estimated tokens/cost are reserved from the organization balance.',
        type: 'internal',
      },
      {
        from: 'Zorveus Gateway',
        to: 'Model Provider',
        label: '4. Route to Upstream Provider',
        description: 'Gateway injects Zorveus-managed or BYOK decrypted credentials and streams request to provider.',
        type: 'request',
      },
      {
        from: 'Model Provider',
        to: 'Zorveus Gateway',
        label: '5. Stream Completion / Response',
        description: 'Model streams tokens back through Zorveus gateway with full response chunks.',
        type: 'response',
      },
      {
        from: 'Zorveus Gateway',
        to: 'Wallet / Ledger',
        label: '6. Settle Usage & Record Event',
        description: 'Actual input/output tokens and provider costs are calculated. Reserved balance is settled and usage event recorded.',
        type: 'internal',
      },
      {
        from: 'Zorveus Gateway',
        to: 'Client App',
        label: '7. Final Response Delivered',
        description: 'Client receives completed stream/response without awareness of underlying multi-provider mechanics.',
        type: 'response',
      },
    ],
  },
  'oauth-pkce': {
    title: 'OAuth 2.0 Authorization Code with PKCE Flow',
    participants: ['User Browser', 'Developer App Backend', 'Zorveus Auth Server', 'Zorveus Consent UI'],
    steps: [
      {
        from: 'Developer App Backend',
        to: 'User Browser',
        label: '1. Generate code_verifier & challenge',
        description: 'App creates cryptographic code_verifier, hashes it with SHA-256 to create code_challenge, and sets state.',
        type: 'internal',
      },
      {
        from: 'User Browser',
        to: 'Zorveus Auth Server',
        label: '2. GET /oauth/authorize?...',
        description: 'Browser navigates to Zorveus with client_id, redirect_uri, scope, code_challenge, and state.',
        type: 'request',
      },
      {
        from: 'Zorveus Auth Server',
        to: 'Zorveus Consent UI',
        label: '3. Display Consent Screen',
        description: 'User logs in, selects funding organization, reviews requested model scopes and spending cap boundaries.',
        type: 'internal',
      },
      {
        from: 'User Browser',
        to: 'Developer App Backend',
        label: '4. Redirect with code & state',
        description: 'Upon approval, Zorveus redirects user browser back to exact registered redirect_uri with short-lived authorization code.',
        type: 'response',
      },
      {
        from: 'Developer App Backend',
        to: 'Zorveus Auth Server',
        label: '5. POST /oauth/token (Exchange)',
        description: 'App backend submits authorization code + plaintext code_verifier + client credentials to exchange for tokens.',
        type: 'request',
      },
      {
        from: 'Zorveus Auth Server',
        to: 'Developer App Backend',
        label: '6. Issue Scoped Inference Token',
        description: 'Zorveus verifies code_verifier against code_challenge and issues a scoped inference token (`zrv_...`).',
        type: 'response',
      },
    ],
  },
};

export function SequenceDiagram({ flow = 'inference-lifecycle' }: { flow?: string }) {
  const data = predefinedFlows[flow] || predefinedFlows['inference-lifecycle'];
  const [activeStep, setActiveStep] = useState(0);

  const nextStep = () => {
    setActiveStep((prev) => (prev + 1) % data.steps.length);
  };

  const resetFlow = () => {
    setActiveStep(0);
  };

  const currentStep = data.steps[activeStep];

  return (
    <div
      style={{ padding: '18px 20px' }}
      className="my-8 rounded-xl border border-[#222226] bg-[#0A0A0B] shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#222226] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4DFFB4] animate-pulse" />
            <h4 className="font-semibold text-zinc-100 text-xs tracking-tight">{data.title}</h4>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 font-normal">
            Step {activeStep + 1} of {data.steps.length}: Click next or select a step below to inspect the interaction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetFlow}
            title="Reset flow"
            style={{ width: '30px', height: '30px' }}
            className="flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <RotateCcw style={{ width: '12px', height: '12px' }} />
          </button>
          <button
            onClick={nextStep}
            style={{ height: '30px', padding: '0 12px' }}
            className="flex items-center gap-1.5 rounded-md border border-[#4DFFB4]/30 bg-[#4DFFB4]/10 text-xs font-semibold text-[#4DFFB4] hover:bg-[#4DFFB4]/20 transition-all cursor-pointer"
          >
            <span>Next Step</span>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
          </button>
        </div>
      </div>

      {/* Participants row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-4">
        {data.participants.map((p, idx) => {
          const isParticipantActive = currentStep.from === p || currentStep.to === p;
          return (
            <div
              key={idx}
              className={`rounded-md border px-2.5 py-1.5 text-center text-xs font-medium transition-all ${
                isParticipantActive
                  ? 'border-[#4DFFB4] bg-[#4DFFB4]/10 text-[#4DFFB4] font-semibold'
                  : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400'
              }`}
            >
              {p}
            </div>
          );
        })}
      </div>

      {/* Active step highlight box */}
      <div
        style={{ padding: '14px 16px' }}
        className="rounded-xl border border-zinc-800 bg-[#121214] mb-3"
      >
        <div className="flex items-start gap-3">
          <div
            style={{ width: '22px', height: '22px', minWidth: '22px' }}
            className="flex shrink-0 items-center justify-center rounded-full bg-[#4DFFB4]/10 border border-[#4DFFB4]/30 text-[#4DFFB4] text-[11px] font-bold"
          >
            {activeStep + 1}
          </div>
          <div>
            <div className="font-mono text-xs font-semibold text-[#4DFFB4]">{currentStep.label}</div>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed font-normal">{currentStep.description}</p>
            <div className="flex items-center gap-3 mt-2 font-mono text-[11px] text-zinc-500">
              <span>
                From: <strong className="text-zinc-300">{currentStep.from}</strong>
              </span>
              <span>➔</span>
              <span>
                To: <strong className="text-zinc-300">{currentStep.to}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini step timeline dots */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        {data.steps.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveStep(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === activeStep ? 'w-5 bg-[#4DFFB4]' : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
            }`}
            title={`Go to step ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
