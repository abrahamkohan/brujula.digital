interface Props {
  children: React.ReactNode;
  pulse?: boolean;
}

export default function SectionLabel({ children, pulse }: Props) {
  return (
    <div className="flex items-center gap-3 mb-5">
      {pulse && (
        <span className="w-2 h-2 rounded-full bg-[#C96442] animate-pulse shrink-0" />
      )}
      <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight">
        {children}
      </h2>
      <div className="flex-1 h-px bg-[#D4D2C9]/50" />
    </div>
  );
}
