'use client';

import { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover';

export function InfoTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const trigger = useRef<HTMLButtonElement>(null);

  function cancelClose() {
    clearTimeout(closeTimer.current);
  }

  function show() {
    cancelClose();
    setOpen(true);
  }

  function scheduleClose() {
    cancelClose();
    if (!trigger.current?.matches(':focus-visible')) {
      closeTimer.current = setTimeout(() => setOpen(false), 150);
    }
  }

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <span className="zorveus-info-tooltip not-prose">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          ref={trigger}
          type="button"
          className="zorveus-info-trigger"
          aria-label={`About ${label}`}
          onPointerEnter={(event) => { if (event.pointerType === 'mouse') show(); }}
          onPointerLeave={scheduleClose}
          onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) show(); }}
          onBlur={() => { cancelClose(); setOpen(false); }}
        >
          <Info aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent
          className="zorveus-info-content not-prose"
          aria-label={`${label} help`}
          side="top"
          align="center"
          sideOffset={6}
          collisionPadding={16}
          onPointerEnter={cancelClose}
          onPointerLeave={scheduleClose}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          {children}
        </PopoverContent>
      </Popover>
    </span>
  );
}
