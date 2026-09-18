

export interface GoldSwitchProps {
  isSelected: boolean;
  onValueChange: (isSelected: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
}

export const GoldSwitch: React.FC<GoldSwitchProps> = ({
  isSelected,
  onValueChange,
  label,
  description,
  className = '',
}) => {
  return (
    <label className={`flex items-center justify-between cursor-pointer gap-4 select-none ${className}`}>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium text-[#F8FAFC]">{label}</span>}
          {description && <span className="text-xs text-[#94A3B8]">{description}</span>}
        </div>
      )}
      <div
        onClick={() => onValueChange(!isSelected)}
        className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out cursor-pointer transition-colors ${
          isSelected ? 'bg-gradient-to-r from-[#D6A84F] to-[#F3C969]' : 'bg-[rgba(255,255,255,0.12)]'
        }`}
      >
        <div
          className={`bg-[#080808] w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
            isSelected ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
    </label>
  );
};
