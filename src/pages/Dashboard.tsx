import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { transactionService } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { savingService } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface Transaction {
  id: string;
  amount: number;
  type: 'receita' | 'despesa';
  date: string;
  category: string;
  description: string;
}

interface ChartData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

interface Stats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyBalance: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface MonthData {
  month: number;
  year: number;
}

interface Saving {
  id: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: 'active' | 'completed' | 'cancelled';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        padding: '10px', 
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}>
        <p style={{ margin: 0 }}>{`Mês: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: '5px 0', color: entry.color }}>
            {`${entry.name}: ${formatCurrency(entry.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [savingsData, setSavingsData] = useState<Saving[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    monthlyBalance: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transactionsResponse, statsResponse, savingsResponse] = await Promise.all([
          transactionService.list({ limit: 5 }),
          transactionService.getStats(),
          savingService.getAll()
        ]);

        const transactions = transactionsResponse.transactions || [];
        setStats(statsResponse);
        setSavingsData(savingsResponse || []);

        // Processar dados mensais
        const monthlyData = processMonthlyData(transactions);
        setMonthlyData(monthlyData);

        // Processar dados de categoria
        const categoryData = processCategoryData(transactions);
        setCategoryData(categoryData);

      } catch (error) {
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processMonthlyData = (data: Transaction[]): ChartData[] => {
    const months: MonthData[] = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        month: date.getMonth(),
        year: date.getFullYear()
      });
    }

    return months.map(({ month, year }) => {
      const monthData = data.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });

      const income = monthData
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = monthData
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        month: new Date(year, month).toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
        income,
        expense,
        balance: income - expense
      };
    });
  };

  const processCategoryData = (data: Transaction[]): CategoryData[] => {
    if (!data || data.length === 0) {
      return [
        { name: 'Sem dados', value: 1 }
      ];
    }

    const categories = data
      .filter(t => t.type === 'despesa')
      .reduce((acc: Record<string, number>, curr) => {
        if (!acc[curr.category]) {
          acc[curr.category] = 0;
        }
        acc[curr.category] += Number(curr.amount);
        return acc;
      }, {});

    return Object.entries(categories)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress color="primary" size={48} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Card sx={{ p: 4, background: 'linear-gradient(90deg, #FDE68A 0%, #FCA5A5 100%)', color: '#B91C1C', borderRadius: 4, boxShadow: 3 }}>
          <Typography variant="h6">{error}</Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, md: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
        Dashboard
      </Typography>

      {/* Resumo Financeiro */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            p: 2,
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(37,99,235,0.12)',
            background: 'linear-gradient(135deg, #F8FAFC 60%, #F1F5F9 100%)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUpIcon color="success" />
              <Typography variant="subtitle2" color="text.secondary">
                Receitas
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
              {formatCurrency(stats.totalIncome)}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            p: 2,
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(37,99,235,0.12)',
            background: 'linear-gradient(135deg, #F8FAFC 60%, #F1F5F9 100%)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingDownIcon color="error" />
              <Typography variant="subtitle2" color="text.secondary">
                Despesas
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
              {formatCurrency(stats.totalExpense)}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            p: 2,
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(37,99,235,0.12)',
            background: 'linear-gradient(135deg, #F8FAFC 60%, #F1F5F9 100%)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AccountBalanceIcon color="primary" />
              <Typography variant="subtitle2" color="text.secondary">
                Saldo
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {formatCurrency(stats.balance)}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={2}>
        {/* Gráfico de Receitas vs Despesas e Saldo Mensal */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card sx={{ 
                boxShadow: '0 4px 16px rgba(37,99,235,0.12)',
                borderRadius: 2,
                overflow: 'hidden',
                p: 2,
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 2,
                    fontSize: { xs: '1rem', sm: '1.1rem' }
                  }}>
                    Receitas vs Despesas (Últimos 6 meses)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData} barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280', fontSize: 13 }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280', fontSize: 13 }}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <RechartsTooltip 
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 13 }} />
                      <Bar 
                        dataKey="income" 
                        name="Receitas" 
                        fill="#10B981"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar 
                        dataKey="expense" 
                        name="Despesas" 
                        fill="#DC2626"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ 
                boxShadow: '0 4px 16px rgba(37,99,235,0.12)',
                borderRadius: 2,
                overflow: 'hidden',
                p: 2,
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 2,
                    fontSize: { xs: '1rem', sm: '1.1rem' }
                  }}>
                    Saldo Mensal
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280', fontSize: 13 }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280', fontSize: 13 }}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <RechartsTooltip 
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#2563EB', strokeWidth: 2 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 13 }} />
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        name="Saldo" 
                        stroke="#2563EB" 
                        strokeWidth={3}
                        dot={{ 
                          fill: '#2563EB',
                          strokeWidth: 2,
                          r: 5
                        }}
                        activeDot={{ 
                          fill: '#2563EB',
                          strokeWidth: 2,
                          r: 7
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Gráfico de Despesas por Categoria e Progressão das Metas */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card sx={{ 
                boxShadow: '0 4px 16px rgba(37,99,235,0.12)',
                borderRadius: 2,
                overflow: 'hidden',
                p: 2,
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 2,
                    fontSize: { xs: '1rem', sm: '1.1rem' }
                  }}>
                    Despesas por Categoria
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                          fontSize: 13
                        }}
                      />
                      <Legend 
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{
                          paddingLeft: '20px',
                          fontSize: 13
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ 
                boxShadow: '0 4px 16px rgba(37,99,235,0.12)',
                borderRadius: 2,
                overflow: 'hidden',
                p: 2,
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 2,
                    fontSize: { xs: '1rem', sm: '1.1rem' }
                  }}>
                    Progressão das Metas
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {savingsData.map((saving) => {
                      const progress = (saving.currentAmount / saving.targetAmount) * 100;
                      return (
                        <Box key={saving.id}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              {saving.description}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {progress.toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(37,99,235,0.08)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                backgroundColor: '#2563EB',
                              },
                            }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(saving.currentAmount)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(saving.targetAmount)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
} 