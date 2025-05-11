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

export default function Profile() {
  const [loading, setLoading] = useState(true);
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
      await authService.updateProfile({
        name: formData.name,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
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
        Perfil
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box position="relative" display="inline-block">
                <Avatar
                  src={photo || undefined}
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    bgcolor: 'primary.main',
                    objectFit: 'cover',
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="upload-photo-profile"
                  type="file"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setPhotoFile(e.target.files[0]);
                      setPhoto(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
                <label htmlFor="upload-photo-profile">
                  <IconButton
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'background.paper' },
                    }}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                </label>
              </Box>
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
              <Typography variant="h6" gutterBottom>
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

              <form onSubmit={handleSubmit}>
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
                      label="E-mail"
                      name="email"
                      value={formData.email}
                      disabled
                      helperText="O e-mail não pode ser alterado"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Alterar Senha
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Senha Atual"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required={!!formData.newPassword}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Nova Senha"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirmar Nova Senha"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={!!formData.newPassword && formData.newPassword !== formData.confirmPassword}
                      helperText={
                        formData.newPassword && formData.newPassword !== formData.confirmPassword
                          ? 'As senhas não coincidem'
                          : ''
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={saving}
                      sx={{ mt: 2 }}
                    >
                      {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 