import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import LotteryInputForm from '../components/LotteryInputForm';
import Quini6ResultsDisplay from '../components/Quini6ResultsDisplay';
// FIX: Removed direct client-side API call to improve security and fix error.
import { Quini6Result, GroundingChunk } from '../types';
import { quini6PreloadedDraws } from '../data/quini6PreloadedData';
import { fetchQuini6Results } from '../services/quini6Service';

interface Quini6AppProps {
    onBack: () => void;
}

const Quini6App: React.FC<Quini6AppProps> = ({ onBack }) => {
  const [drawNumber, setDrawNumber] = useState<string>('');
  const [userNumbers, setUserNumbers] = useState<string[]>(Array(6).fill(''));
  
  const [lotteryResults, setLotteryResults] = useState<Quini6Result | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [cache, setCache] = useState<Map<string, { results: Quini6Result; sources: GroundingChunk[] }>>(() => {
    const preloadedMap = new Map<string, { results: Quini6Result; sources: GroundingChunk[] }>();
    quini6PreloadedDraws.forEach(draw => {
      preloadedMap.set(draw.drawNumber.toString(), { results: draw, sources: [] });
    });

    try {
      const savedCache = localStorage.getItem('quini6Cache');
      if (savedCache) {
        const parsedEntries = JSON.parse(savedCache);
        if (Array.isArray(parsedEntries)) {
          const localStorageMap = new Map<string, { results: Quini6Result; sources: GroundingChunk[] }>(parsedEntries);
          localStorageMap.forEach((value, key) => {
            if (typeof key === 'string') {
              preloadedMap.set(key, value);
            }
          });
        }
      }
    } catch (e) {
      console.error("Failed to parse Quini 6 cache from localStorage", e);
    }
    
    return preloadedMap;
  });

  useEffect(() => {
    try {
      const cacheEntries = Array.from(cache.entries());
      localStorage.setItem('quini6Cache', JSON.stringify(cacheEntries));
    } catch (e) {
      console.error("Failed to save Quini 6 cache to localStorage", e);
    }
  }, [cache]);

  useEffect(() => {
    setLotteryResults(null);
    setError(null);
    setSources([]);
  }, [drawNumber, userNumbers]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setLotteryResults(null);
    setSources([]);

    if (cache.has(drawNumber)) {
      console.log(`Cargando sorteo Quini 6 #${drawNumber} desde la base de datos de la app (cache).`);
      const cachedData = cache.get(drawNumber)!;
      setLotteryResults(cachedData.results);
      setSources(cachedData.sources);
      setIsLoading(false);
      return;
    }
    
    try {
      // FIX: Replaced direct API call with a call to the secure serverless function via the service.
      const { results, sources } = await fetchQuini6Results(drawNumber);
      
      setLotteryResults(results);
      setSources(sources);
      setCache(prevCache => new Map(prevCache).set(drawNumber, { results, sources }));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUserNumbers(Array(6).fill(''));
    setLotteryResults(null);
    setSources([]);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const parsedUserNumbers = userNumbers.map(n => parseInt(n, 10)).filter(n => !isNaN(n));
  const latestDraws = Array.from(cache.values())
    .map(item => item.results)
    .sort((a, b) => b.drawNumber - a.drawNumber)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-900 bg-gradient-to-br from-gray-900 to-slate-800 font-sans">
      <main className="container mx-auto px-4 py-8">
        <Header 
            title="Quini 6 Control Boleta"
            subtitle="¡Ingresa los datos de tu boleta para ver si sos un ganador!"
            onBack={onBack}
        />
        <div className="max-w-2xl mx-auto mt-8">
          <LotteryInputForm
            drawNumber={drawNumber}
            setDrawNumber={setDrawNumber}
            userNumbers={userNumbers}
            setUserNumbers={setUserNumbers}
            userPlusNumber="" // Not used in Quini 6
            setUserPlusNumber={() => {}} // Not used in Quini 6
            onSubmit={handleSubmit}
            isLoading={isLoading}
            showPlusNumber={false}
            latestDraws={latestDraws}
          />
        </div>

        {error && (
            <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-500/20 border border-red-500 text-red-300 rounded-lg text-center animate-fade-in">
                <p className="font-bold">Error al Verificar Resultados</p>
                <p>{error}</p>
            </div>
        )}
        
        {lotteryResults && parsedUserNumbers.length === 6 && (
            <>
                <Quini6ResultsDisplay
                    results={lotteryResults} 
                    userNumbers={parsedUserNumbers}
                    sources={sources}
                />
                <div className="max-w-2xl mx-auto mt-8 flex justify-center">
                    <button
                        onClick={handleReset}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                        Realizar Nueva Consulta
                    </button>
                </div>
            </>
        )}
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Esto es un simulador. Por favor, verifique los resultados en las fuentes oficiales de la lotería.</p>
      </footer>
    </div>
  );
};

export default Quini6App;