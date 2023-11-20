import React, {createContext, useContext, useState, useMemo} from 'react';
import {baseTheme, darkTheme} from './theme';

const ThemeContext = createContext({
  theme: baseTheme,
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({children, isDarkMode}) => {
  const [theme, setTheme] = useState(isDarkMode ? darkTheme : baseTheme);

  const contextValue = useMemo(() => {
    return {theme, setTheme};
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
