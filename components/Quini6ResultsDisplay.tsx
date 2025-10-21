import React, { useEffect } from 'react';
import { Quini6Result, Quini6GameMode, GroundingChunk } from '../types';
import NumberDisplay from './NumberDisplay';

interface Quini6ResultsDisplayProps {
  results: Quini6Result;
  userNumbers: number[];
  sources: GroundingChunk[];
}

interface ResultSectionProps {
    title: Quini6GameMode;
    winningNumbers: number[];
    userNumbers: number[];
}

const playPrizeSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (!audioContext) return;
  if (audioContext.state === 'suspended') audioContext.resume();
  const playNote = (freq: number, start: number, dur: number) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.3, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.00001, start + dur);
    osc.start(start);
    osc.stop(start + dur);
  };
  const now = audioContext.currentTime;
  playNote(783.99, now, 0.15);
  playNote(1046.50, now + 0.1, 0.15);
  playNote(1318.51, now + 0.2, 0.2);
};

const ResultSection: React.FC<ResultSectionProps> = ({ title, winningNumbers, userNumbers }) => {
    const matchedNumbers = userNumbers.filter(num => winningNumbers.includes(num));
    const matchCount = matchedNumbers.length;

    const getPrizeInfo = () => {
        let message = `${matchCount} ${matchCount === 1 ? 'Acierto' : 'Aciertos'}`;
        let isPrize = false;

        switch (title) {
            case Quini6GameMode.Revancha:
                if (matchCount === 6) {
                    message = "¡Premio Mayor! Consultar con tu Agente.";
                    isPrize = true;
                }
                break;
            case Quini6GameMode.SiempreSale:
            case Quini6GameMode.TradicionalPrimer:
            case Quini6GameMode.TradicionalSegundo:
                if (matchCount >= 4) {
                    message = "¡Posible Premio! Consultar con tu Agente.";
                    isPrize = true;
                }
                break;
        }
        return { message, isPrize };
    };

    const { message, isPrize } = getPrizeInfo();

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between items-center">
                <h3 className="text-2xl font-bold text-amber-400">{title}</h3>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full text-center ${
                    isPrize ? 'bg-green-500/20 text-green-300' : 'bg-gray-600/50 text-gray-300'
                }`}>
                    {message}
                </span>
            </div>
            
            <div>
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Números Ganadores</p>
                <div className="grid grid-cols-6 gap-2">
                    {winningNumbers.map(num => <NumberDisplay key={`${title}-win-${num}`} number={num} />)}
                </div>
            </div>

            <div>
                 <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Tus Números y Aciertos</p>
                <div className="grid grid-cols-6 gap-2">
                    {userNumbers.map(num => (
                        <NumberDisplay key={`${title}-user-${num}`} number={num} isMatched={winningNumbers.includes(num)} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const Quini6ResultsDisplay: React.FC<Quini6ResultsDisplayProps> = ({ results, userNumbers, sources }) => {

  useEffect(() => {
    const getMatchCount = (winningNumbers: number[]): number => {
        return userNumbers.filter(num => winningNumbers.includes(num)).length;
    };
    
    const hasPrize = 
      (getMatchCount(results.tradicionalPrimer.numbers) >= 4) ||
      (getMatchCount(results.tradicionalSegundo.numbers) >= 4) ||
      (getMatchCount(results.revancha.numbers) === 6) ||
      (getMatchCount(results.siempreSale.numbers) >= 4) ||
      (getMatchCount(results.premioExtra.numbers) >= 5); // Assuming 5 is the minimum for a prize

    if (hasPrize) {
      playPrizeSound();
    }
  }, [results, userNumbers]);

  const premioExtraMatches = userNumbers.filter(num => results.premioExtra.numbers.includes(num));

  // Logic to find and mark duplicate numbers for Premio Extra display
  const allWinningNumbersForExtra = [
    ...results.tradicionalPrimer.numbers,
    ...results.tradicionalSegundo.numbers,
    ...results.revancha.numbers
  ];

  const numberCounts = allWinningNumbersForExtra.reduce((acc, num) => {
    acc[num] = (acc[num] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-6 animate-fade-in">
        <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold">Resultados del Sorteo N°{results.drawNumber}</h2>
            {results.drawDate && (
                <p className="text-lg text-gray-400 mt-1">
                    Fecha: {new Date(results.drawDate + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
            )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
            <ResultSection title={Quini6GameMode.TradicionalPrimer} winningNumbers={results.tradicionalPrimer.numbers} userNumbers={userNumbers} />
            <ResultSection title={Quini6GameMode.TradicionalSegundo} winningNumbers={results.tradicionalSegundo.numbers} userNumbers={userNumbers} />
            <ResultSection title={Quini6GameMode.Revancha} winningNumbers={results.revancha.numbers} userNumbers={userNumbers} />
            <ResultSection title={Quini6GameMode.SiempreSale} winningNumbers={results.siempreSale.numbers} userNumbers={userNumbers} />
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between items-center">
                <h3 className="text-2xl font-bold text-amber-400">{Quini6GameMode.PremioExtra}</h3>
                 <span className={`px-3 py-1 text-sm font-semibold rounded-full text-center ${
                    premioExtraMatches.length >= 5 ? 'bg-green-500/20 text-green-300' : 'bg-gray-600/50 text-gray-300'
                }`}>
                    {premioExtraMatches.length} {premioExtraMatches.length === 1 ? 'Acierto' : 'Aciertos'}
                </span>
            </div>
            
            <div>
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Pozo de Números (repetidos tachados)</p>
                <div className="flex flex-wrap gap-2">
                    {allWinningNumbersForExtra.map((num, index) => (
                        <NumberDisplay
                            key={`pe-win-${num}-${index}`}
                            number={num}
                            isStrikethrough={numberCounts[num] > 1}
                        />
                    ))}
                </div>
            </div>

            <div>
                 <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Tus Números y Aciertos en el Pozo Final</p>
                <div className="flex flex-wrap gap-2">
                    {userNumbers.map(num => (
                        <NumberDisplay key={`pe-user-${num}`} number={num} isMatched={results.premioExtra.numbers.includes(num)} />
                    ))}
                </div>
            </div>
        </div>

        {sources && sources.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700 mt-6">
                <h3 className="text-xl font-bold text-gray-300 mb-3 text-center">Fuentes de Datos</h3>
                <ul className="space-y-2 list-disc list-inside">
                {sources.map((source, index) => (
                    source.web && (
                    <li key={index} className="text-sm truncate">
                        <a
                        href={source.web.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 underline transition-colors"
                        title={source.web.title || source.web.uri}
                        >
                        {source.web.title || source.web.uri}
                        </a>
                    </li>
                    )
                ))}
                </ul>
            </div>
        )}
    </div>
  );
};

export default Quini6ResultsDisplay;