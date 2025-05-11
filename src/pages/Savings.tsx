import { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { savingService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const categories = [
  'Viagem',
  'Educação',
  'Moradia',
  'Veículo',
  'Investimento',
  'Outros',
];

const statuses = [
  { value: 'em_andamento', label: 'Em Andamento', color: 'warning' },
  { value: 'concluida', label: 'Concluída', color: 'success' },
  { value: 'cancelada', label: 'Cancelada', color: 'error' },
];

interface Saving {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  status: 'em_andamento' | 'concluida' | 'cancelada';
  description?: string;
}

interface FormData {
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: Date | null;
  category: string;
  description: string;
}

interface AddAmountFormData {
  amount: string;
}

const initialFormData: FormData = {
  name: '',
  targetAmount: '',
  currentAmount: '0',
  deadline: null,
  category: '',
  description: '',
};

const initialAddAmountFormData: AddAmountFormData = {
  amount: '',
};

export default function Savings() {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddAmountDialog, setOpenAddAmountDialog] = useState(false);
  const [selectedSaving, setSelectedSaving] = useState<Saving | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [addAmountFormData, setAddAmountFormData] = useState<AddAmountFormData>(initialAddAmountFormData);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchSavings = async () => {
    try {
      const response = await savingService.list({
        page: page + 1,
        limit: rowsPerPage,
      });
      setSavings(response.savings);
      setTotal(response.total);
    } catch (err) {
      console.error('Erro ao carregar metas de economia:', err);
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
    setSelectedSaving(saving);
    setFormData({
      name: saving.name,
      targetAmount: saving.targetAmount.toString(),
      currentAmount: saving.currentAmount.toString(),
      deadline: new Date(saving.deadline),
      category: saving.category,
      description: saving.description || '',
    });
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (saving: Saving) => {
    setSelectedSaving(saving);
    setOpenDeleteDialog(true);
  };

  const handleOpenAddAmountDialog = (saving: Saving) => {
    setSelectedSaving(saving);
    setOpenAddAmountDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
        deadline: formData.deadline?.toISOString() || new Date().toISOString(),
      };

      if (openEditDialog && selectedSaving) {
        await savingService.update(selectedSaving.id, data);
      } else {
        await savingService.create(data);
      }

      handleCloseDialog();
      fetchSavings();
    } catch (err) {
      console.error('Erro ao salvar meta de economia:', err);
      // TODO: Mostrar mensagem de erro para o usuário
    }
  };

  const handleAddAmount = async () => {
    if (!selectedSaving) return;

    try {
      await savingService.addAmount(selectedSaving.id, parseFloat(addAmountFormData.amount));
      handleCloseDialog();
      fetchSavings();
    } catch (err) {
      console.error('Erro ao adicionar valor:', err);
      // TODO: Mostrar mensagem de erro para o usuário
    }
  };

  const handleDelete = async () => {
    if (!selectedSaving) return;

    try {
      await savingService.delete(selectedSaving.id);
      handleCloseDialog();
      fetchSavings();
    } catch (err) {
      console.error('Erro ao excluir meta de economia:', err);
      // TODO: Mostrar mensagem de erro para o usuário
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Metas de Economia</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Nova Meta
        </Button>
      </Box>

      {/* Lista de Metas */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Meta</TableCell>
                <TableCell>Atual</TableCell>
                <TableCell>Progresso</TableCell>
                <TableCell>Prazo</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {savings.map((saving) => {
                const status = statuses.find((s) => s.value === saving.status);
                const progress = calculateProgress(saving.currentAmount, saving.targetAmount);

                return (
                  <TableRow key={saving.id}>
                    <TableCell>{saving.name}</TableCell>
                    <TableCell>{formatCurrency(saving.targetAmount)}</TableCell>
                    <TableCell>{formatCurrency(saving.currentAmount)}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{ flexGrow: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {progress.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(saving.deadline)}</TableCell>
                    <TableCell>{saving.category}</TableCell>
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
                        onClick={() => handleOpenAddAmountDialog(saving)}
                        disabled={saving.status !== 'em_andamento'}
                      >
                        <AddCircleIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEditDialog(saving)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(saving)}
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
          {openEditDialog ? 'Editar Meta' : 'Nova Meta'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Nome"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Valor Alvo"
              type="number"
              value={formData.targetAmount}
              onChange={(e) =>
                setFormData({ ...formData, targetAmount: e.target.value })
              }
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">R$</InputAdornment>
                ),
              }}
            />
            {openEditDialog && (
              <TextField
                label="Valor Atual"
                type="number"
                value={formData.currentAmount}
                onChange={(e) =>
                  setFormData({ ...formData, currentAmount: e.target.value })
                }
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">R$</InputAdornment>
                  ),
                }}
              />
            )}
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <DatePicker
                label="Prazo"
                value={formData.deadline}
                onChange={(date) => setFormData({ ...formData, deadline: date })}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
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
            <TextField
              label="Descrição"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
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

      {/* Diálogo de Adicionar Valor */}
      <Dialog
        open={openAddAmountDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Adicionar Valor</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Typography variant="body2" color="text.secondary">
              Meta: {selectedSaving?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Valor Atual: {formatCurrency(selectedSaving?.currentAmount || 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Valor Alvo: {formatCurrency(selectedSaving?.targetAmount || 0)}
            </Typography>
            <TextField
              label="Valor a Adicionar"
              type="number"
              value={addAmountFormData.amount}
              onChange={(e) =>
                setAddAmountFormData({ amount: e.target.value })
              }
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">R$</InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleAddAmount} variant="contained" color="primary">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a meta "{selectedSaving?.name}"?
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