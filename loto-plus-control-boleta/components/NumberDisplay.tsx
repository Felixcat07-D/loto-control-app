import React from 'react';

interface NumberDisplayProps {
  number: number | string;
  isMatched?: boolean;
  isPlus?: boolean;
  isStrikethrough?: boolean;
}

const NumberDisplay: React.FC<NumberDisplayProps> = ({ number, isMatched = false, isPlus = false, isStrikethrough = false }) => {
  const baseClasses = 'flex items-center justify-center font-bold rounded-full transition-all duration-300';
  
  const sizeClasses = isPlus
    ? 'w-12 h-12 text-xl'
    : 'w-12 h-12 md:w-14 md:h-14 text-2xl';

  // Determine color classes based on priority: strikethrough > matched > plus > default
  const colorClasses = isStrikethrough
    ? 'bg-gray-800 text-gray-500' // A distinct "disabled" or "duplicate" look
    : isMatched
    ? 'bg-green-500 text-white shadow-lg ring-2 ring-white/50'
    : isPlus
    ? 'bg-amber-500 text-gray-900'
    : 'bg-gray-700 text-white';

  const textStrikethrough = isStrikethrough ? 'line-through' : '';

  return (
    <div className={`${baseClasses} ${sizeClasses} ${colorClasses}`}>
      <span className={textStrikethrough}>
        {String(number).padStart(isPlus ? 1 : 2, '0')}
      </span>
    </div>
  );
};

export default NumberDisplay;