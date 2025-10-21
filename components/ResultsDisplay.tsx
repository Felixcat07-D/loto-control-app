

import React, { useEffect } from 'react';
// FIX: Replaced GameMode with LotoPlusGameMode as it is the correct exported enum from types.
import { LotteryResult, LotoPlusGameMode, GroundingChunk } from '../types';
import NumberDisplay from './NumberDisplay';

interface ResultsDisplayProps {
  results: LotteryResult;
  userNumbers: number[];
  userPlusNumber: number;
  sources: GroundingChunk[];
}

interface ResultSectionProps {
    title: LotoPlusGameMode;
    winningNumbers: number[];
    userNumbers: number[];
}

/**
 * Plays a short, pleasant chime sound for winning notifications.
 * Uses the Web Audio API to avoid needing external audio files.
 */
const playPrizeSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (!audioContext) {
    console.warn("Web Audio API is not supported in this browser.");
    return;
  }
  // Resume context if it was suspended by browser policies (requires user interaction)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const playNote = (frequency: number, startTime: number, duration: number) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'triangle'; // A softer, more pleasant tone than sine
    oscillator.frequency.setValueAtTime(frequency, startTime);
    
    // A simple ADSR-like envelope for a "plink" sound
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.00001, startTime + duration); // Decay/Release

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  const now = audioContext.currentTime;
  // A quick, happy-sounding arpeggio
  playNote(783.99, now, 0.15); // G5
  playNote(1046.50, now + 0.1, 0.15); // C6
  playNote(1318.51, now + 0.2, 0.2); // E6
};


const ResultSection: React.FC<ResultSectionProps> = ({ title, winningNumbers, userNumbers }) => {
    const matchedNumbers = userNumbers.filter(num => winningNumbers.includes(num));
    const matchCount = matchedNumbers.length;

    const getPrizeInfo = () => {
        let message = `${matchCount} ${matchCount === 1 ? 'Acierto' : 'Aciertos'}`;
        let isPrize = false;

        switch (title) {
            case LotoPlusGameMode.Tradicional:
            case LotoPlusGameMode.Match:
            case LotoPlusGameMode.SaleOSale:
                if (matchCount >= 4) { // 4, 5, or 6 matches
                    message = "¡Posible Premio! Consultar con tu Agente de Lotería.";
                    isPrize = true;
                }
                break;
            case LotoPlusGameMode.Desquite:
                if (matchCount === 6) {
                    message = "¡Posible Premio! Consultar con tu Agente de Lotería.";
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
                    {winningNumbers.map(num => <NumberDisplay key={num} number={num} />)}
                </div>
            </div>

            <div>
                 <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Tus Números y Aciertos</p>
                <div className="grid grid-cols-6 gap-2">
                    {userNumbers.map(num => (
                        <NumberDisplay key={num} number={num} isMatched={winningNumbers.includes(num)} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, userNumbers, userPlusNumber, sources }) => {
  const didMatchPlus = results.plus === userPlusNumber;

  useEffect(() => {
    const getMatchCount = (winningNumbers: number[]): number => {
        return userNumbers.filter(num => winningNumbers.includes(num)).length;
    };

    const hasPrizeInMode = (mode: LotoPlusGameMode, winningNumbers: number[]): boolean => {
        const matchCount = getMatchCount(winningNumbers);
        switch (mode) {
            case LotoPlusGameMode.Tradicional:
            case LotoPlusGameMode.Match:
            case LotoPlusGameMode.SaleOSale:
                return matchCount >= 4;
            case LotoPlusGameMode.Desquite:
                return matchCount === 6;
            default:
                return false;
        }
    };
    
    const hasAnyPrize =
      didMatchPlus ||
      hasPrizeInMode(LotoPlusGameMode.Tradicional, results.tradicional.numbers) ||
      hasPrizeInMode(LotoPlusGameMode.Match, results.match.numbers) ||
      hasPrizeInMode(LotoPlusGameMode.Desquite, results.desquite.numbers) ||
      hasPrizeInMode(LotoPlusGameMode.SaleOSale, results.saleOSale.numbers);

    if (hasAnyPrize) {
      playPrizeSound();
    }
  }, [results, userNumbers, userPlusNumber, didMatchPlus]);


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
        
        <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-2xl font-bold text-amber-400">Número Plus</h3>
            <div className="flex items-center gap-4">
                <div>
                    <p className="text-xs text-center text-gray-400 mb-1">Plus Ganador</p>
                    <NumberDisplay number={results.plus} isPlus />
                </div>
                <div>
                    <p className="text-xs text-center text-gray-400 mb-1">Tu Plus</p>
                    <NumberDisplay number={userPlusNumber} isMatched={didMatchPlus} isPlus />
                </div>
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                didMatchPlus ? 'bg-green-500/20 text-green-300' : 'bg-gray-600/50 text-gray-300'
            }`}>
                {didMatchPlus ? '¡Acertaste el Plus!' : 'No hubo acierto'}
            </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <ResultSection title={LotoPlusGameMode.Tradicional} winningNumbers={results.tradicional.numbers} userNumbers={userNumbers} />
            <ResultSection title={LotoPlusGameMode.Match} winningNumbers={results.match.numbers} userNumbers={userNumbers} />
            <ResultSection title={LotoPlusGameMode.Desquite} winningNumbers={results.desquite.numbers} userNumbers={userNumbers} />
            <ResultSection title={LotoPlusGameMode.SaleOSale} winningNumbers={results.saleOSale.numbers} userNumbers={userNumbers} />
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

export default ResultsDisplay;