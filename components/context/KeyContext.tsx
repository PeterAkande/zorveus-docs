'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface KeyContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  serviceKey: string;
  setServiceKey: (key: string) => void;
  clientId: string;
  setClientId: (id: string) => void;
  activeLanguage: string;
  setActiveLanguage: (lang: string) => void;
}

const KeyContext = createContext<KeyContextType>({
  apiKey: 'zrv_your_inference_key',
  setApiKey: () => {},
  serviceKey: 'zrv_service_your_service_key',
  setServiceKey: () => {},
  clientId: 'zrv_client_your_client_id',
  setClientId: () => {},
  activeLanguage: 'python',
  setActiveLanguage: () => {},
});

const STORAGE_LANG_KEY = 'zorveus_docs_lang_pref';

export function KeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState('zrv_your_inference_key');
  const [serviceKey, setServiceKey] = useState('zrv_service_your_service_key');
  const [clientId, setClientId] = useState('zrv_client_your_client_id');
  const [activeLanguage, setActiveLanguageState] = useState('python');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_LANG_KEY);
      if (savedLang) {
        setActiveLanguageState(savedLang);
      }
    } catch {
      // LocalStorage access may be restricted
    }
  }, []);

  const setActiveLanguage = (lang: string) => {
    setActiveLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch {
      // Ignore
    }
  };

  return (
    <KeyContext.Provider
      value={{
        apiKey,
        setApiKey,
        serviceKey,
        setServiceKey,
        clientId,
        setClientId,
        activeLanguage,
        setActiveLanguage,
      }}
    >
      {children}
    </KeyContext.Provider>
  );
}

export function useKeyContext() {
  return useContext(KeyContext);
}
