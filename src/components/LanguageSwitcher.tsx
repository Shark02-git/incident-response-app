
import React from 'react';
import { useTranslation } from '../lib/i18n.tsx';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useTranslation();

    return (
        <div className="flex items-center justify-center gap-2 p-1 rounded-lg bg-slate-200">
            <button
                onClick={() => setLanguage('en')}
                aria-pressed={language === 'en'}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${language === 'en' ? 'bg-cyan-500 text-white' : 'text-slate-600 hover:bg-slate-300'}`}
            >
                EN
            </button>
            <button
                onClick={() => setLanguage('th')}
                aria-pressed={language === 'th'}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${language === 'th' ? 'bg-cyan-500 text-white' : 'text-slate-600 hover:bg-slate-300'}`}
            >
                TH
            </button>
        </div>
    );
};

export default LanguageSwitcher;