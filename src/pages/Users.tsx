import { useEffect, useState } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  photo?: string;
  createdAt: string;
}

const roles = [
  { value: 'admin', label: 'Administrador' },
  { value: 'visitante', label: 'Visitante' },
];

export default function Users() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'visitante' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    loadUsers();
  }, [user]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.list();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar usuários');
      showError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (u: User) => {
    setEditUser(u);
    setEditForm({ name: u.name, role: u.role });
  };

  const handleCloseEdit = () => {
    setEditUser(null);
    setEditForm({ name: '', role: 'visitante' });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const updatedUser = await userService.update(editUser.id, { 
        name: editForm.name, 
        role: editForm.role 
      });
      setUsers(users => users.map(u => u.id === editUser.id ? updatedUser : u));
      showSuccess('Usuário atualizado com sucesso!');
      handleCloseEdit();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao salvar alterações';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Box p={3}><Alert severity="error">Acesso restrito a administradores.</Alert></Box>
    );
  }

  return (
    <Box p={{ xs: 2, md: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
        Usuários do Sistema
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={2}>
          {users.map(u => (
            <Grid item xs={12} sm={6} md={4} key={u.id}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(37,99,235,0.10)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar src={u.photo} alt={u.name} sx={{ width: 48, height: 48 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{u.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Perfil: <b>{u.role === 'admin' ? 'Administrador' : 'Visitante'}</b>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Cadastro: {format(new Date(u.createdAt), 'dd/MM/yyyy HH:mm')}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenEdit(u)}
                    sx={{ borderRadius: 2, fontWeight: 600, mt: 1 }}
                  >
                    Editar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog open={!!editUser} onClose={handleCloseEdit} maxWidth="xs" fullWidth>
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Nome"
            name="name"
            value={editForm.name}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            select
            label="Perfil"
            name="role"
            value={editForm.role}
            onChange={handleEditChange}
            fullWidth
          >
            {roles.map(r => (
              <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 