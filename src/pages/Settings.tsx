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
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { authService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    monthlyReport: true,
    darkMode: false,
    language: 'pt-BR',
  });
  const [user, setUser] = useState<any>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const userData = await authService.getProfile();
        if (userData.settings) {
          setSettings(userData.settings);
        }
        setUser(userData);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erro ao carregar configurações');
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
      setError(null);
      setSuccess(null);

      await authService.updateSettings(settings);
      setSuccess('Configurações salvas com sucesso!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, md: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
        Configurações
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notificações
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={handleChange('emailNotifications')}
                color="primary"
              />
            }
            label="Receber notificações por e-mail"
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.monthlyReport}
                onChange={handleChange('monthlyReport')}
                color="primary"
              />
            }
            label="Receber relatório mensal"
          />

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Aparência
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                color="primary"
              />
            }
            label="Modo escuro"
          />

          <Box mt={3}>
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