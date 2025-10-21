import React from 'react';

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7m-4 14l7-7-7 7" />
    </svg>
);

const TicketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 5V3a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v2" />
    <path d="M18 11.5V13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-1.5" />
    <path d="M18 8.5V7a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1.5" />
    <path d="M12 17.5V21" />
    <path d="M8 3v18" />
    <path d="M16 3v18" />
    <path d="M20 7H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Z" />
    <path d="M8.5 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
    <path d="M19.5 17.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
  </svg>
);

interface HeaderProps {
    title: string;
    subtitle: string;
    onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onBack }) => {
  return (
    <header className="relative text-center py-6 md:py-8 border-b border-gray-700">
      {onBack && (
          <button 
            onClick={onBack} 
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            aria-label="Volver"
          >
              <BackIcon />
          </button>
      )}
      <div className="flex items-center justify-center gap-4">
        <TicketIcon />
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
          {title}
        </h1>
      </div>
      <p className="mt-3 text-lg text-gray-400">{subtitle}</p>
    </header>
  );
};

export default Header;