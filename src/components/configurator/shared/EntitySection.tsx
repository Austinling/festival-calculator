import type { ReactNode } from "react";

interface EntitySectionProps {
  countText: string;
  addLabel: string;
  isOpen: boolean;
  onToggle: () => void;
  formContent: ReactNode;
  children: ReactNode;
}

export function EntitySection({
  countText,
  addLabel,
  isOpen,
  onToggle,
  formContent,
  children,
}: EntitySectionProps) {
  return (
    <div>
      <div className="mb-4 flex justify-between">
        <p className="text-sm text-slate-600">{countText}</p>
        <button
          onClick={onToggle}
          className="rounded-md bg-slate-900 px-3 py-1 text-sm font-medium text-white hover:bg-slate-800"
        >
          {addLabel}
        </button>
      </div>

      {isOpen && (
        <div className="mb-4 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          {formContent}
        </div>
      )}

      <div className="space-y-2">{children}</div>
    </div>
  );
}
