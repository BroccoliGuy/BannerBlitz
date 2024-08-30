import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [limit, setLimit] = useState('');
  const [answers, setAnswers] = useState([]);

  return (
    <AppContext.Provider value={{ limit, setLimit, answers, setAnswers }}>
      {children}
    </AppContext.Provider>
  );
};
