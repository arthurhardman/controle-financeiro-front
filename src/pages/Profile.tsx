import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  IconButton,
  Fade,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { useNotification } from '../contexts/NotificationContext';
import { authService } from '../services/api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { setLoading } = useLoading();
  const { showError, showSuccess } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const response = await authService.uploadPhoto(file);
      setUser(response.user);
      showSuccess('Foto atualizada com sucesso!');
    } catch (error) {
      showError('Erro ao atualizar foto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      showError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const data: any = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.currentPassword && formData.newPassword) {
        data.currentPassword = formData.currentPassword;
        data.newPassword = formData.newPassword;
      }

      const response = await authService.updateProfile(data);
      setUser(response.user);
      showSuccess('Perfil atualizado com sucesso!');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      showError('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Fade in timeout={700}>
        <Paper elevation={8} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 5, boxShadow: '0 8px 32px rgba(37,99,235,0.10)', background: 'linear-gradient(135deg, #F3F4F6 60%, #DBEAFE 100%)', width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative', mb: 1 }}>
              <Avatar
                src={user?.photoUrl}
                sx={{ width: 110, height: 110, mb: 1, border: '4px solid #2563EB', boxShadow: '0 2px 12px rgba(37,99,235,0.10)' }}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                onChange={handlePhotoChange}
              />
              <label htmlFor="photo-upload">
                <IconButton
                  color="primary"
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    border: '2px solid #2563EB',
                    boxShadow: 2,
                  }}
                >
                  <PhotoCamera fontSize="medium" />
                </IconButton>
              </label>
            </Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 1 }} gutterBottom>
              Perfil
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nome"
              name="name"
              value={formData.name}
              onChange={handleChange}
              sx={{ borderRadius: 3, mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              sx={{ borderRadius: 3, mb: 2 }}
            />

            <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600, color: 'primary.main' }}>
              Alterar Senha
            </Typography>

            <TextField
              margin="normal"
              fullWidth
              label="Senha Atual"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              sx={{ borderRadius: 3, mb: 2 }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Nova Senha"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              sx={{ borderRadius: 3, mb: 2 }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Confirmar Nova Senha"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              sx={{ borderRadius: 3, mb: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, borderRadius: 3, fontWeight: 700, fontSize: 18, boxShadow: '0 2px 8px rgba(37,99,235,0.10)' }}
            >
              Salvar Alterações
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
} 