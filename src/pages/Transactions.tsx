import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Chip,
  InputAdornment,
  Collapse,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { transactionService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useLoading } from '../contexts/LoadingContext';
import { useNotification } from '../contexts/NotificationContext';
import { LoadingButton } from '../components/LoadingButton';
import { TransactionListSkeleton } from '../components/TransactionSkeleton';

const categories = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer',
  'Vestuário',
  'Outros',
];

const types = [
  { value: 'receita', label: 'Receita', icon: TrendingUpIcon, color: 'success' },
  { value: 'despesa', label: 'Despesa', icon: TrendingDownIcon, color: 'error' },
];

const statuses = [
  { value: 'pendente', label: 'Pendente', color: 'warning' },
  { value: 'concluida', label: 'Concluída', color: 'success' },
  { value: 'cancelada', label: 'Cancelada', color: 'error' },
];

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  date: string;
  status: 'pendente' | 'concluida' | 'cancelada';
  observations?: string;
}

interface FormData {
  description: string;
  amount: string;
  type: 'receita' | 'despesa';
  category: string;
  date: Date | null;
  status: 'pendente' | 'concluida' | 'cancelada';
  observations: string;
}

const initialFormData: FormData = {
  description: '',
  amount: '',
  type: 'despesa',
  category: '',
  date: new Date(),
  status: 'pendente',
  observations: '',
};

export default function Transactions() {
  const { setLoading } = useLoading();
  const { showSuccess } = useNotification();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLocalLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    try {
      setLocalLoading(true);
      const response = await transactionService.list({
        search: searchTerm,
        category: selectedCategory,
        type: selectedType,
        status: selectedStatus,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        page: page + 1,
        limit: rowsPerPage,
      });
      setTransactions(response.transactions || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      setError('Erro ao carregar transações');
      console.error('Erro ao carregar transações:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [searchTerm, selectedCategory, selectedType, selectedStatus, startDate, endDate, page, rowsPerPage]);

  const handleOpenDialog = () => {
    setFormData(initialFormData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setSelectedTransaction(null);
  };

  const handleOpenEditDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: new Date(transaction.date),
      status: transaction.status,
      observations: transaction.observations || '',
    });
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setOpenDeleteDialog(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date?.toISOString() || new Date().toISOString(),
      };

      if (openEditDialog && selectedTransaction) {
        await transactionService.update(selectedTransaction.id, data);
        showSuccess('Transação atualizada com sucesso!');
      } else {
        await transactionService.create(data);
        showSuccess('Transação criada com sucesso!');
      }

      handleCloseDialog();
      fetchTransactions();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTransaction) return;

    try {
      setLoading(true);
      await transactionService.delete(selectedTransaction.id);
      showSuccess('Transação excluída com sucesso!');
      handleCloseDialog();
      fetchTransactions();
    } catch (err: any) {
      setError('Erro ao excluir transação');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box p={{ xs: 2, md: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
          Transações
        </Typography>
        <TransactionListSkeleton />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, md: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexDirection={{ xs: 'column', sm: 'row' }} gap={{ xs: 2, sm: 0 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
          Transações
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
              boxShadow: '0 2px 4px rgba(37,99,235,0.12)',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(37,99,235,0.16)',
              }
            }}
          >
            Nova Transação
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
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Buscar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={selectedType}
                    label="Tipo"
                    onChange={(e) => setSelectedType(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {types.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    label="Status"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {statuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
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
                    slotProps={{ textField: { fullWidth: true, sx: { borderRadius: 2 } } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Final"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{ textField: { fullWidth: true, sx: { borderRadius: 2 } } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Collapse>

      {/* Tabela de Transações */}
      <Card sx={{ 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
        overflow: 'hidden',
      }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Categoria</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Data</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => {
                const status = statuses.find((s) => s.value === transaction.status);

                return (
                  <TableRow 
                    key={transaction.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(37,99,235,0.04)',
                        transition: 'background-color 0.2s'
                      }
                    }}
                  >
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={types.find(t => t.value === transaction.type)?.label}
                        color={types.find(t => t.value === transaction.type)?.color as any}
                        size="small"
                        icon={React.createElement(types.find(t => t.value === transaction.type)?.icon as any)}
                        sx={{
                          borderRadius: 2,
                        }}
                      />
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Chip
                        label={status?.label}
                        color={status?.color as any}
                        size="small"
                        sx={{
                          borderRadius: 2,
                          color: status?.color === 'warning' ? '#fff' : undefined,
                          backgroundColor: status?.color === 'warning' ? '#f59e42' : undefined,
                          '& .MuiChip-label': {
                            color: status?.color === 'warning' ? '#fff' : undefined,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditDialog(transaction)}
                        sx={{ 
                          mr: 1,
                          '&:hover': {
                            backgroundColor: 'rgba(37,99,235,0.1)',
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDeleteDialog(transaction)}
                        sx={{ 
                          '&:hover': {
                            backgroundColor: 'rgba(220,38,38,0.1)',
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Card>

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
          {openEditDialog ? 'Editar Transação' : 'Nova Transação'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Descrição"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              fullWidth
              required
              sx={{ borderRadius: 3 }}
            />
            <TextField
              label="Valor"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">R$</InputAdornment>
                ),
              }}
              sx={{ borderRadius: 3 }}
            />
            <FormControl fullWidth required>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={formData.type}
                label="Tipo"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as 'receita' | 'despesa',
                  })
                }
                sx={{ borderRadius: 3 }}
              >
                {types.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={formData.category}
                label="Categoria"
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                sx={{ borderRadius: 3 }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <DatePicker
                label="Data"
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                slotProps={{ textField: { fullWidth: true, required: true, sx: { borderRadius: 3 } } }}
              />
            </LocalizationProvider>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'pendente' | 'concluida' | 'cancelada',
                  })
                }
                sx={{ borderRadius: 3 }}
              >
                {statuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Observações"
              value={formData.observations}
              onChange={(e) =>
                setFormData({ ...formData, observations: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
              sx={{ borderRadius: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              borderRadius: 3,
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>
          <LoadingButton
            onClick={handleSubmit}
            variant="contained"
            loading={loading}
            loadingText="Salvando..."
            sx={{ 
              borderRadius: 3,
              fontWeight: 600,
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
            Tem certeza que deseja excluir a transação "{selectedTransaction?.description}"?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              borderRadius: 3,
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="contained" 
            color="error"
            sx={{ 
              borderRadius: 3,
              fontWeight: 600,
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