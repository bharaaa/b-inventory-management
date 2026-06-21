import React from 'react';

export function CommandGroup({ heading, children }: { heading: string, children: React.ReactNode }) {
  // Only render if there are children (results)
  if (!React.Children.count(children)) return null;

  return (
    <div className="mb-4 last:mb-0">
      <div className="px-4 py-2 text-xs font-semibold tracking-wider text-[var(--text-tertiary)] uppercase">
        {heading}
      </div>
      <div className="flex flex-col gap-1 px-2">
        {children}
      </div>
    </div>
  );
}
