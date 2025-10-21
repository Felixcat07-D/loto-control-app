import React, { forwardRef } from 'react';

interface NumberInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  maxLength: number;
  isPlus?: boolean;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, onKeyDown, placeholder, maxLength, isPlus = false }, ref) => {
    const sizeClasses = isPlus
      ? 'w-14 h-14 sm:w-16 sm:h-16 text-xl sm:text-2xl'
      : 'w-full aspect-square text-2xl sm:text-3xl';
    
    return (
      <input
        ref={ref}
        type="tel"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        pattern="\d*"
        className={`bg-gray-800 border-2 border-gray-600 rounded-lg text-center font-bold text-white transition-all duration-200 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 ${sizeClasses}`}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';

export default NumberInput;