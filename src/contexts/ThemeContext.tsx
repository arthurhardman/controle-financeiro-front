import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { authService } from '../services/api';

interface ThemeContextData {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextData>({
  darkMode: false,
  toggleDarkMode: () => {},
});

// Hook personalizado para usar o tema
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Componente provedor do tema
function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Inicializa o tema com o valor do localStorage
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('darkMode');
      console.log('Tema carregado do localStorage:', savedTheme);
      return savedTheme ? JSON.parse(savedTheme) : false;
    }
    return false;
  });

  // Sincroniza o tema com o localStorage
  useEffect(() => {
    console.log('Salvando tema no localStorage:', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Tenta sincronizar com as configurações do usuário em segundo plano
  useEffect(() => {
    const syncWithUserSettings = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Não tente sincronizar se não estiver autenticado
        return;
      }
      try {
        const userData = await authService.getProfile();
        console.log('Configurações do usuário:', userData.settings);
        
        // Só atualiza as configurações do usuário se o localStorage estiver vazio
        const savedTheme = localStorage.getItem('darkMode');
        if (!savedTheme && userData.settings?.darkMode !== undefined) {
          console.log('Usando tema das configurações do usuário:', userData.settings.darkMode);
          setDarkMode(userData.settings.darkMode);
        } else {
          // Se temos um tema no localStorage, atualiza as configurações do usuário
          console.log('Atualizando configurações do usuário com tema do localStorage:', darkMode);
          await authService.updateSettings({
            emailNotifications: true,
            monthlyReport: true,
            darkMode: darkMode,
            language: 'pt-BR',
          });
        }
      } catch (error) {
        console.error('Erro ao sincronizar tema com configurações do usuário:', error);
      }
    };

    syncWithUserSettings();
  }, []);

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    console.log('Alternando tema para:', newDarkMode);
    setDarkMode(newDarkMode);

    try {
      await authService.updateSettings({
        emailNotifications: true,
        monthlyReport: true,
        darkMode: newDarkMode,
        language: 'pt-BR',
      });
      console.log('Tema atualizado nas configurações do usuário');
    } catch (error) {
      console.error('Erro ao atualizar tema nas configurações:', error);
    }
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2563eb',
        light: '#60a5fa',
        dark: '#1d4ed8',
      },
      secondary: {
        main: '#7c3aed',
        light: '#a78bfa',
        dark: '#5b21b6',
      },
      success: {
        main: '#059669',
        light: '#34d399',
        dark: '#047857',
      },
      error: {
        main: '#dc2626',
        light: '#f87171',
        dark: '#b91c1c',
      },
      background: {
        default: darkMode ? '#111827' : '#f8fafc',
        paper: darkMode ? '#1f2937' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            padding: '8px 16px',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: darkMode 
              ? '0 1px 3px 0 rgb(0 0 0 / 0.3)'
              : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            '&:hover': {
              boxShadow: darkMode
                ? '0 4px 6px -1px rgb(0 0 0 / 0.3)'
                : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: darkMode
              ? '0 1px 3px 0 rgb(0 0 0 / 0.3)'
              : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export { ThemeProvider, useTheme }; 