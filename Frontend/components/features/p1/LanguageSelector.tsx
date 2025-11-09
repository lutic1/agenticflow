'use client';

import { useState } from 'react';
import { useMultiLanguage } from '@/hooks/use-p1-features';
import { Loader2, Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
  presentationId: string;
}

export function LanguageSelector({ presentationId }: LanguageSelectorProps) {
  const { languages, isLoading, translate } = useMultiLanguage(presentationId);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showDropdown, setShowDropdown] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  const currentLanguage = languages?.find((l) => l.code === selectedLanguage);

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    translate(langCode);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium">{currentLanguage?.name || 'English'}</span>
      </button>

      {showDropdown && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
              Select Language
            </div>
            <div className="space-y-1">
              {languages?.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    selectedLanguage === language.code
                      ? 'bg-blue-50 text-blue-900'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm">{language.name}</span>
                  {selectedLanguage === language.code && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
