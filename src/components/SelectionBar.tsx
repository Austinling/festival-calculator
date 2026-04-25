type SelectionOption = {
  label: string;
  value: string;
};

type SelectionBarProps = {
  id: string;
  label: string;
  value: string;
  options: SelectionOption[];
  onChange: (value: string) => void;
};

export function SelectionBar({
  id,
  label,
  value,
  options,
  onChange,
}: SelectionBarProps) {
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
