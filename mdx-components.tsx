import type { MDXComponents } from 'mdx/types';
import defaultComponents from 'fumadocs-ui/mdx';
import { Callout } from '@/components/mdx/Callout';
import { Steps, Step } from '@/components/mdx/Steps';
import { Tabs, Tab } from '@/components/mdx/Tabs';
import { CodeGroup } from '@/components/mdx/CodeGroup';
import { CardGroup, Card } from '@/components/mdx/Card';
import { ParamField } from '@/components/mdx/ParamField';
import { ResponseField } from '@/components/mdx/ResponseField';
import { Badge } from '@/components/mdx/Badge';
import { ApiEndpoint } from '@/components/mdx/ApiEndpoint';
import { KeyInserter } from '@/components/mdx/KeyInserter';
import { SequenceDiagram } from '@/components/mdx/SequenceDiagram';
import { ApiRunner } from '@/components/mdx/ApiRunner';
import { PageFeedback } from '@/components/mdx/PageFeedback';

export function useMDXComponents(components: MDXComponents = {}): MDXComponents {
  return {
    ...defaultComponents,
    ...components,
    // Custom Zorveus Zero Lock-In Components with top priority
    Callout,
    Steps,
    Step,
    Tabs,
    Tab,
    CodeGroup,
    CardGroup,
    Card,
    ParamField,
    ResponseField,
    Badge,
    ApiEndpoint,
    KeyInserter,
    SequenceDiagram,
    ApiRunner,
    PageFeedback,
    RequestExample: ({ children }: { children: React.ReactNode }) => (
      <div className="request-example my-4">{children}</div>
    ),
    ResponseExample: ({ children }: { children: React.ReactNode }) => (
      <div className="response-example my-4">{children}</div>
    ),
  };
}
