import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  timestamp?: string;
  rightSlot?: ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  timestamp,
  rightSlot,
}: PageHeaderProps) {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 pt-8 pb-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          )}
          {timestamp && (
            <p className="mt-1 text-xs text-slate-500">{timestamp}</p>
          )}
        </div>
        {rightSlot && (
          <div className="flex items-center gap-3 shrink-0">{rightSlot}</div>
        )}
      </div>
    </section>
  );
}
