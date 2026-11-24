import { DocsPage } from 'fumadocs-ui/layouts/notebook/page';
import { DocsNotFound } from '@/components/layout/DocsNotFound';

export default function NotFound() {
  return (
    <DocsPage
      full
      breadcrumb={{ enabled: false }}
      footer={{ enabled: false }}
      tableOfContent={{ enabled: false }}
      tableOfContentPopover={{ enabled: false }}
    >
      <DocsNotFound />
    </DocsPage>
  );
}
