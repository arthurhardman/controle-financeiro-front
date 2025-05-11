import { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { transactionService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
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
    } catch (err) {
      setError('Erro ao carregar transações');
      console.error('Erro ao carregar transações:', err);
    } finally {
      setLoading(false);
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
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date?.toISOString() || new Date().toISOString(),
      };

      if (openEditDialog && selectedTransaction) {
        await transactionService.update(selectedTransaction.id, data);
      } else {
        await transactionService.create(data);
      }

      handleCloseDialog();
      fetchTransactions();
    } catch (err) {
      console.error('Erro ao salvar transação:', err);
      // TODO: Mostrar mensagem de erro para o usuário
    }
  };

  const handleDelete = async () => {
    if (!selectedTransaction) return;

    try {
      await transactionService.delete(selectedTransaction.id);
      handleCloseDialog();
      fetchTransactions();
    } catch (err) {
      console.error('Erro ao excluir transação:', err);
      // TODO: Mostrar mensagem de erro para o usuário
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Transações</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Nova Transação
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
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
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Categoria"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={selectedType}
                  label="Tipo"
                  onChange={(e) => setSelectedType(e.target.value)}
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
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
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label="Data Inicial"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label="Data Final"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela de Transações */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Descrição</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => {
                const type = types.find((t) => t.value === transaction.type);
                const status = statuses.find((s) => s.value === transaction.status);
                const TypeIcon = type?.icon;

                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {TypeIcon && <TypeIcon color={type.color as any} />}
                        <Typography
                          color={transaction.type === 'receita' ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={type?.label}
                        color={type?.color as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Chip
                        label={status?.label}
                        color={status?.color as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEditDialog(transaction)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(transaction)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count}`
          }
        />
      </Card>

      {/* Diálogo de Criação/Edição */}
      <Dialog
        open={openDialog || openEditDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
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
                slotProps={{ textField: { fullWidth: true, required: true } }}
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
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a transação "{selectedTransaction?.description}"?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 