'use client';

import React from 'react';
import { CodeBlock, Pre, type CodeBlockProps } from 'fumadocs-ui/components/codeblock';
import { useKeyContext } from '../context/KeyContext';
import { replaceKeysInNode } from '../../lib/key-replace.mjs';

type CodePreProps = Omit<CodeBlockProps, 'ref'>;

/** Wraps MDX code blocks to inject keys from KeyContext in real time. */
export function CodePre({ children, ...props }: CodePreProps) {
  const { apiKey, serviceKey, clientId } = useKeyContext();

  const processedChildren = replaceKeysInNode(children, {
    zrv_your_api_key: apiKey,
    zrv_svc_your_service_key: serviceKey,
    zrv_client_your_client_id: clientId,
  });

  return (
    <CodeBlock {...props}>
      <Pre>{processedChildren}</Pre>
    </CodeBlock>
  );
}

