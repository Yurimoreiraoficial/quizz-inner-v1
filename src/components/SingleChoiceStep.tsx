import { OptionCard } from "./OptionCard";

interface SingleChoiceStepProps<T extends string> {
  question: string;
  options: { value: T; label: string }[];
  selectedValue?: T;
  onSelect: (value: T, label: string) => void;
}

// Avança automaticamente é responsabilidade do parent (após onSelect)
export function SingleChoiceStep<T extends string>({
  question, options, selectedValue, onSelect,
}: SingleChoiceStepProps<T>) {
  return (
    <div className="flex flex-col">
      <h1 className="text-[26px] sm:text-[28px] leading-[1.15] font-bold text-foreground text-balance">
        {question}
      </h1>

      <div className="mt-6 flex flex-col gap-2">
        {options.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            selected={selectedValue === opt.value}
            onClick={() => onSelect(opt.value, opt.label)}
          />
        ))}
      </div>
    </div>
  );
}
