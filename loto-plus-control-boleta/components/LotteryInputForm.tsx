import React, { useRef, createRef } from 'react';
import NumberInput from './NumberInput';

interface LotteryInputFormProps {
  drawNumber: string;
  setDrawNumber: (value: string) => void;
  userNumbers: string[];
  setUserNumbers: (numbers: string[]) => void;
  userPlusNumber: string;
  setUserPlusNumber: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  showPlusNumber?: boolean;
}

const LotteryInputForm: React.FC<LotteryInputFormProps> = ({
  drawNumber,
  setDrawNumber,
  userNumbers,
  setUserNumbers,
  userPlusNumber,
  setUserPlusNumber,
  onSubmit,
  isLoading,
  showPlusNumber = true,
}) => {
  const numberInputsRef = useRef<React.RefObject<HTMLInputElement>[]>(
    Array(6).fill(null).map(() => createRef<HTMLInputElement>())
  );
  const plusInputRef = useRef<HTMLInputElement>(null);
  const drawNumberInputRef = useRef<HTMLInputElement>(null);

  const handleDrawNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (/^\d{0,4}$/.test(value)) {
      setDrawNumber(value);
      if (value.length === 4) {
        numberInputsRef.current[0].current?.focus();
      }
    }
  };

  const handleNumberChange = (index: number, value: string) => {
    if (/^\d{0,2}$/.test(value)) {
      const newNumbers = [...userNumbers];
      
      // Basic validation for numbers 0-45
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 45) {
          return;
      }

      // Prevent duplicate numbers
      if (value.length > 0) {
        const isDuplicate = userNumbers.some((num, i) => {
            if (i === index || num === '' || value === '') return false;
            return parseInt(num, 10) === parseInt(value, 10);
        });

        if (isDuplicate) {
            newNumbers[index] = ''; // Clear the invalid (duplicate) input
            setUserNumbers(newNumbers);
            return; // Stop processing
        }
      }

      newNumbers[index] = value;
      setUserNumbers(newNumbers);

      if (value.length === 2 && index < 5) {
        numberInputsRef.current[index + 1].current?.focus();
      } else if (value.length === 2 && index === 5 && showPlusNumber) {
        plusInputRef.current?.focus();
      }
    }
  };

  const handlePlusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (/^\d{0,1}$/.test(value)) {
      setUserPlusNumber(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && userNumbers[index] === '' && index > 0) {
      numberInputsRef.current[index - 1].current?.focus();
    } else if (e.key === 'Backspace' && userNumbers[index] === '' && index === 0) {
        drawNumberInputRef.current?.focus();
    }
  };
    
  const handlePlusKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && userPlusNumber === '') {
        numberInputsRef.current[5].current?.focus();
    }
  }

  const isFormComplete = drawNumber.length === 4 && userNumbers.every(n => n.length > 0) && (!showPlusNumber || userPlusNumber.length === 1);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-gray-700">
      <div className="space-y-6">
        <div>
          <label htmlFor="draw-number" className="block text-base sm:text-lg font-medium text-gray-300 mb-3 text-center">Número de Sorteo</label>
          <input
            ref={drawNumberInputRef}
            id="draw-number"
            type="tel"
            value={drawNumber}
            onChange={handleDrawNumberChange}
            placeholder="4 dígitos"
            maxLength={4}
            className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg text-center py-3 text-xl font-bold text-white transition-all duration-200 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
        <div>
          <label className="block text-base sm:text-lg font-medium text-gray-300 mb-3 text-center">Tus 6 Números (00-45)</label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {userNumbers.map((num, i) => (
              <NumberInput
                key={i}
                ref={numberInputsRef.current[i]}
                value={num}
                onChange={(e) => handleNumberChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                placeholder="00"
                maxLength={2}
              />
            ))}
          </div>
        </div>
        {showPlusNumber && (
            <div>
                <label className="block text-base sm:text-lg font-medium text-gray-300 mb-3 text-center">Número Plus (0-9)</label>
                <div className="flex justify-center">
                <NumberInput
                        ref={plusInputRef}
                        value={userPlusNumber}
                        onChange={handlePlusChange}
                        onKeyDown={handlePlusKeyDown}
                        placeholder="0"
                        maxLength={1}
                        isPlus
                    />
                </div>
            </div>
        )}
      </div>
      <button
        onClick={onSubmit}
        disabled={!isFormComplete || isLoading}
        className="mt-8 w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verificando...
          </>
        ) : (
          'Controlar mi Boleta'
        )}
      </button>
    </div>
  );
};

export default LotteryInputForm;