import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import LotoPlusApp from './pages/LotoPlusApp';
import Quini6App from './pages/Quini6App';

type View = 'landing' | 'loto' | 'quini';

const App: React.FC = () => {
    const [view, setView] = useState<View>('landing');

    const renderView = () => {
        switch (view) {
            case 'loto':
                return <LotoPlusApp onBack={() => setView('landing')} />;
            case 'quini':
                return <Quini6App onBack={() => setView('landing')} />;
            case 'landing':
            default:
                return <LandingPage onSelect={setView} />;
        }
    };

    return <>{renderView()}</>;
};

export default App;