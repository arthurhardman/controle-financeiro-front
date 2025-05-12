import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { authService } from '../services/api';
import { useLoading } from '../contexts/LoadingContext';

export default function Profile() {
  const { setLoading } = useLoading();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await authService.getProfile();
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          name: userData.name,
          email: userData.email,
        }));
        setPhoto(userData.photo ? `http://localhost:3001${userData.photo}` : null);
      } catch (err) {
        setError('Erro ao carregar dados do perfil');
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      setSaving(true);
      const data: any = {
        name: formData.name,
      };

      if (formData.currentPassword && formData.newPassword) {
        data.currentPassword = formData.currentPassword;
        data.newPassword = formData.newPassword;
      }

      await authService.updateProfile(data);
      setSuccess('Perfil atualizado com sucesso!');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      setPhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <Box p={{ xs: 2, md: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Perfil
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                onChange={handlePhotoChange}
              />
              <label htmlFor="photo-upload">
                <IconButton
                  component="span"
                  sx={{ position: 'relative', mb: 2 }}
                >
                  <Avatar
                    src={photo || undefined}
                    sx={{ width: 120, height: 120 }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'primary.main',
                      borderRadius: '50%',
                      p: 0.5,
                    }}
                  >
                    <PhotoCameraIcon sx={{ color: 'white' }} />
                  </Box>
                </IconButton>
              </label>
              {photoFile && (
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="secondary"
                    disabled={uploading}
                    onClick={async () => {
                      if (!photoFile) return;
                      setUploading(true);
                      const formData = new FormData();
                      formData.append('photo', photoFile);
                      try {
                        const res = await fetch('http://localhost:3001/api/auth/photo', {
                          method: 'POST',
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                          },
                          body: formData,
                        });
                        const data = await res.json();
                        if (data.photo) {
                          setPhoto(`http://localhost:3001${data.photo}`);
                          setSuccess('Foto atualizada com sucesso!');
                          await authService.updateProfile({ photo: data.photo });
                          setUser((prev: any) => ({ ...prev, photo: data.photo }));
                          setPhotoFile(null);
                        }
                      } catch (err) {
                        setError('Erro ao enviar foto');
                      } finally {
                        setUploading(false);
                      }
                    }}
                  >
                    {uploading ? 'Enviando...' : 'Salvar Foto'}
                  </Button>
                </Box>
              )}
              <Typography variant="h6" mt={2}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Informações Pessoais
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nome"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Alterar Senha
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Senha Atual"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nova Senha"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirmar Nova Senha"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={saving}
                    >
                      {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 