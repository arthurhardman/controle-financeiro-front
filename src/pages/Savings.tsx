import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  Alert,
  Grid,
  Collapse,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { savingService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useLoading } from '../contexts/LoadingContext';
import { LoadingButton } from '../components/LoadingButton';
import { SavingsListSkeleton } from '../components/SavingsSkeleton';
import { useNotification } from '../contexts/NotificationContext';
import { SelectChangeEvent } from '@mui/material';

const categories = [
  'Viagem',
  'Educação',
  'Moradia',
  'Veículo',
  'Investimento',
  'Outros',
];

const statuses = [
  { value: 'em_andamento', label: 'Em Andamento', color: 'warning' as const },
  { value: 'concluida', label: 'Concluída', color: 'success' as const },
  { value: 'cancelada', label: 'Cancelada', color: 'error' as const },
];

const getStatusLabel = (status: string) => {
  const statusObj = statuses.find(s => s.value === status);
  return statusObj?.label || status;
};

const getStatusColor = (status: string): 'warning' | 'success' | 'error' => {
  const statusObj = statuses.find(s => s.value === status);
  return statusObj?.color || 'warning';
};

interface Saving {
  id: number;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: 'em_andamento' | 'concluida' | 'cancelada';
  category: string;
}

interface FormData {
  description: string;
  targetAmount: string;
  targetDate: Date | null;
  category: string;
  status: 'em_andamento' | 'concluida' | 'cancelada';
}

interface AddAmountFormData {
  amount: string;
}

const initialFormData: FormData = {
  description: '',
  targetAmount: '',
  targetDate: null,
  category: '',
  status: 'em_andamento'
};

const initialAddAmountFormData: AddAmountFormData = {
  amount: '',
};

export default function Savings() {
  const { setLoading } = useLoading();
  const { showError, showSuccess } = useNotification();
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLocalLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddAmountDialog, setOpenAddAmountDialog] = useState(false);
  const [selectedSaving, setSelectedSaving] = useState<Saving | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [addAmountFormData, setAddAmountFormData] = useState<AddAmountFormData>(initialAddAmountFormData);
  const [page] = useState(0);
  const [rowsPerPage] = useState(10);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const fetchSavings = async () => {
    try {
      const response = await savingService.list({
        page: page + 1,
        limit: rowsPerPage,
      });
      setSavings(response.savings);
    } catch (err: any) {
      showError('Erro ao carregar metas de economia');
      console.error('Erro ao carregar metas de economia:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, [page, rowsPerPage]);

  const handleOpenDialog = () => {
    setFormData(initialFormData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setOpenAddAmountDialog(false);
    setSelectedSaving(null);
    setAddAmountFormData(initialAddAmountFormData);
  };

  const handleOpenEditDialog = (saving: Saving) => {
    setFormData({
      description: saving.description,
      targetAmount: saving.targetAmount.toString(),
      targetDate: new Date(saving.deadline),
      category: saving.category,
      status: saving.status as 'em_andamento' | 'concluida' | 'cancelada',
    });
    setSelectedSaving(saving);
    setOpenEditDialog(true);
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (saving: Saving) => {
    setSelectedSaving(saving);
    setOpenDeleteDialog(true);
  };

  const handleOpenAddAmountDialog = (saving: Saving) => {
    setSelectedSaving(saving);
    setOpenAddAmountDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.description,
        description: formData.description,
        targetAmount: parseFloat(formData.targetAmount),
        deadline: formData.targetDate?.toISOString() || new Date().toISOString(),
        category: formData.category,
        status: formData.status,
      };

      if (selectedSaving) {
        await savingService.update(selectedSaving.id, { ...data, name: formData.description });
        showSuccess('Meta atualizada com sucesso!');
      } else {
        await savingService.create(data);
        showSuccess('Meta criada com sucesso!');
      }

      handleCloseDialog();
      fetchSavings();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar meta');
    }
  };

  const handleAddAmount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaving) return;

    try {
      await savingService.addAmount(selectedSaving.id, parseFloat(addAmountFormData.amount));
      handleCloseDialog();
      fetchSavings();
    } catch (err: any) {
      setError('Erro ao adicionar valor');
    }
  };

  const handleDelete = async () => {
    if (!selectedSaving) return;

    setLoading(true);
    try {
      await savingService.delete(selectedSaving.id);
      handleCloseDialog();
      fetchSavings();
      showSuccess('Meta excluída com sucesso!');
    } catch (err: any) {
      setError('Erro ao excluir meta de economia');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      status: event.target.value as 'em_andamento' | 'concluida' | 'cancelada'
    }));
  };

  if (loading) {
    return (
      <Box p={{ xs: 2, md: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
          Poupanças
        </Typography>
        <SavingsListSkeleton />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, md: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexDirection={{ xs: 'column', sm: 'row' }} gap={{ xs: 2, sm: 0 }}>
        <Typography variant="h4" sx={{ 
          fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }, 
          fontWeight: 700, 
          color: 'primary.main', 
          letterSpacing: 1 
        }}>
          Poupanças
        </Typography>
        <Box display="flex" gap={2} width={{ xs: '100%', sm: 'auto' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ 
              width: { xs: '50%', sm: 'auto' },
              borderRadius: 2,
              fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              boxShadow: '0 2px 4px rgba(37,99,235,0.08)',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(37,99,235,0.12)',
              }
            }}
          >
            Filtros
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ 
              width: { xs: '50%', sm: 'auto' },
              borderRadius: 2,
              fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              boxShadow: '0 2px 4px rgba(37,99,235,0.12)',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(37,99,235,0.16)',
              }
            }}
          >
            Nova Poupança
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <Collapse in={showFilters}>
        <Card sx={{ 
          mb: 3, 
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
          background: 'linear-gradient(135deg, #F8FAFC 60%, #F1F5F9 100%)',
        }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Buscar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    label="Status"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    sx={{ 
                      borderRadius: 2,
                      '& .MuiSelect-select': {
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Todos</MenuItem>
                    {statuses.map((status) => (
                      <MenuItem key={status.value} value={status.value} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Inicial"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true, 
                        sx: { 
                          borderRadius: 2,
                          '& .MuiInputLabel-root': {
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          },
                          '& .MuiInputBase-input': {
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }
                        } 
                      } 
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Final"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true, 
                        sx: { 
                          borderRadius: 2,
                          '& .MuiInputLabel-root': {
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          },
                          '& .MuiInputBase-input': {
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }
                        } 
                      } 
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Collapse>

      {/* Lista de Metas */}
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        {savings.map((saving) => (
          <Grid item xs={12} sm={6} md={4} key={saving.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-4px)' },
                  boxShadow: { xs: '0 2px 8px rgba(37,99,235,0.1)', sm: '0 8px 24px rgba(37,99,235,0.15)' },
                },
                borderRadius: { xs: 1, sm: 2 },
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #F8FAFC 60%, #F1F5F9 100%)',
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: { xs: '0.875rem', sm: '1.1rem' },
                    lineHeight: 1.3,
                  }}>
                    {saving.description}
                  </Typography>
                  <Chip
                    label={getStatusLabel(saving.status)}
                    color={getStatusColor(saving.status)}
                    size="small"
                    sx={{ 
                      fontWeight: 500,
                      borderRadius: 1,
                      height: 20,
                      fontSize: { xs: '0.625rem', sm: '0.75rem' },
                      color: saving.status === 'em_andamento' ? '#fff' : undefined,
                      backgroundColor: saving.status === 'em_andamento' ? '#f59e42' : undefined,
                      '& .MuiChip-label': {
                        color: saving.status === 'em_andamento' ? '#fff' : undefined,
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Meta
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: 'primary.main',
                    fontSize: { xs: '0.875rem', sm: '1.25rem' }
                  }}>
                    {formatCurrency(saving.targetAmount)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Atual
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: 'success.main',
                    fontSize: { xs: '0.875rem', sm: '1.25rem' }
                  }}>
                    {formatCurrency(saving.currentAmount)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Progresso
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(saving.currentAmount / saving.targetAmount) * 100}
                    sx={{
                      height: { xs: 4, sm: 6 },
                      borderRadius: 4,
                      backgroundColor: 'rgba(37,99,235,0.08)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: '#2563EB',
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    mt: 0.5, 
                    display: 'block',
                    fontSize: { xs: '0.625rem', sm: '0.75rem' }
                  }}>
                    {((saving.currentAmount / saving.targetAmount) * 100).toFixed(1)}% concluído
                  </Typography>
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Prazo
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '1rem' }
                  }}>
                    {formatDate(saving.deadline)}
                  </Typography>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  mt: 'auto',
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AttachMoneyIcon />}
                    onClick={() => handleOpenAddAmountDialog(saving)}
                    sx={{ 
                      flex: 1,
                      borderRadius: 1,
                      textTransform: 'none',
                      fontWeight: 500,
                      py: { xs: 0.75, sm: 0.5 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    Adicionar
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenEditDialog(saving)}
                    sx={{ 
                      flex: 1,
                      borderRadius: 1,
                      textTransform: 'none',
                      fontWeight: 500,
                      py: { xs: 0.75, sm: 0.5 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    Editar
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDeleteDialog(saving)}
                    sx={{ 
                      borderRadius: 1,
                      color: 'error.main',
                      alignSelf: { xs: 'flex-end', sm: 'center' },
                      padding: { xs: 0.5, sm: 0.75 },
                      '&:hover': {
                        backgroundColor: 'error.light',
                        color: 'error.contrastText',
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Diálogo de Criação/Edição */}
      <Dialog
        open={openDialog || openEditDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(37,99,235,0.15)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: 'primary.main' }}>
          {openEditDialog ? 'Editar Poupança' : 'Nova Poupança'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Descrição"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              sx={{ borderRadius: 2 }}
            />
            <TextField
              label="Valor Meta"
              type="number"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              fullWidth
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              sx={{ borderRadius: 2 }}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <DatePicker
                label="Data Limite"
                value={formData.targetDate}
                onChange={(newValue) => setFormData({ ...formData, targetDate: newValue })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { borderRadius: 2 }
                  }
                }}
              />
            </LocalizationProvider>
            <FormControl fullWidth required>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={formData.category}
                label="Categoria"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={handleStatusChange}
                sx={{ borderRadius: 2 }}
              >
                {statuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button 
            onClick={handleCloseDialog}
            fullWidth={false}
            sx={{ 
              borderRadius: 3,
              fontWeight: 600,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Cancelar
          </Button>
          <LoadingButton
            onClick={handleSubmit}
            variant="contained"
            loading={loading}
            loadingText="Salvando..."
            fullWidth={false}
            sx={{ 
              borderRadius: 3,
              fontWeight: 600,
              width: { xs: '100%', sm: 'auto' },
              boxShadow: '0 2px 8px rgba(37,99,235,0.15)',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(37,99,235,0.25)',
              }
            }}
          >
            Salvar
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(37,99,235,0.15)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: 'error.main' }}>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a poupança "{selectedSaving?.description}"?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button 
            onClick={handleCloseDialog}
            fullWidth={false}
            sx={{ 
              borderRadius: 3,
              fontWeight: 600,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="contained" 
            color="error"
            fullWidth={false}
            sx={{ 
              borderRadius: 3,
              fontWeight: 600,
              width: { xs: '100%', sm: 'auto' },
              boxShadow: '0 2px 8px rgba(220,38,38,0.15)',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(220,38,38,0.25)',
              }
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Adicionar Valor */}
      <Dialog
        open={openAddAmountDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(37,99,235,0.15)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: 'primary.main' }}>
          Adicionar Valor
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Valor"
              type="number"
              value={addAmountFormData.amount}
              onChange={(e) => setAddAmountFormData({ ...addAmountFormData, amount: e.target.value })}
              fullWidth
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              sx={{ borderRadius: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button 
            onClick={handleCloseDialog}
            fullWidth={false}
            sx={{ 
              borderRadius: 3,
              fontWeight: 600,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Cancelar
          </Button>
          <LoadingButton
            onClick={handleAddAmount}
            variant="contained"
            loading={loading}
            loadingText="Adicionando..."
            fullWidth={false}
            sx={{ 
              borderRadius: 3,
              fontWeight: 600,
              width: { xs: '100%', sm: 'auto' },
              boxShadow: '0 2px 8px rgba(37,99,235,0.15)',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(37,99,235,0.25)',
              }
            }}
          >
            Adicionar
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 2,
            borderRadius: 3,
            boxShadow: '0 4px 24px rgba(220,38,38,0.08)',
          }}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
} 