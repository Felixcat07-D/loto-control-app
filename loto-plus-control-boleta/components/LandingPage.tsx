import React from 'react';

interface LandingPageProps {
  onSelect: (view: 'loto' | 'quini') => void;
}

const GameCard: React.FC<{ title: string; description: string; onClick: () => void }> = ({ title, description, onClick }) => (
    <div
        onClick={onClick}
        className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-700 text-center cursor-pointer transition-all duration-300 transform hover:scale-105 hover:border-amber-400"
    >
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">{title}</h2>
        <p className="mt-2 text-gray-400">{description}</p>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-gray-900 bg-gradient-to-br from-gray-900 to-slate-800 font-sans flex flex-col items-center justify-center">
        <main className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white mb-4">
                Control de Boletas de Lotería
            </h1>
            <p className="text-xl text-gray-400 mb-12">
                Selecciona el juego que deseas verificar.
            </p>
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                <GameCard 
                    title="Loto Plus" 
                    description="Controla tu boleta de Loto Plus, Match, Desquite y Sale o Sale."
                    onClick={() => onSelect('loto')} 
                />
                <GameCard 
                    title="Quini 6" 
                    description="Controla tu boleta de Quini 6, Tradicional, Segunda, Revancha y Siempre Sale."
                    onClick={() => onSelect('quini')} 
                />
            </div>
        </main>
         <footer className="text-center py-4 text-gray-500 text-sm absolute bottom-0">
            <p>Esto es un simulador. Por favor, verifique los resultados en las fuentes oficiales de la lotería.</p>
        </footer>
    </div>
  );
};

export default LandingPage;