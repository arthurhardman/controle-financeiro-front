import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Button,
} from '@mui/material';
import { authService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useLoading } from '../contexts/LoadingContext';

export default function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { setLoading } = useLoading();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    monthlyReport: true,
    darkMode: false,
    language: 'pt-BR',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const userData = await authService.getProfile();
        if (userData.settings) {
          setSettings(userData.settings);
        }
      } catch (err: any) {
        console.error('Erro ao carregar configurações:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      [name]: event.target.checked,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setLoading(true);
      await authService.updateSettings(settings);
    } catch (err: any) {
      console.error('Erro ao salvar configurações:', err);
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  return (
    <Box p={{ xs: 2, md: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Configurações
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Preferências
          </Typography>

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={handleChange('emailNotifications')}
                />
              }
              label="Notificações por Email"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Receba notificações sobre suas transações e metas por email
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.monthlyReport}
                  onChange={handleChange('monthlyReport')}
                />
              }
              label="Relatório Mensal"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Receba um relatório mensal com suas finanças
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={toggleDarkMode}
                />
              }
              label="Modo Escuro"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Ative o tema escuro para melhor visualização em ambientes com pouca luz
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
} 