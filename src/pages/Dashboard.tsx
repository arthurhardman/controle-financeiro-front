import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Container,
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
        setError(null);

        // Buscar transações e estatísticas
        const [transactionsResponse, statsResponse] = await Promise.all([
          transactionService.getTransactions(),
          transactionService.getStats()
        ]);

        // Verifica se transactionsResponse.transactions é um array
        const transactions = Array.isArray(transactionsResponse.transactions) 
          ? transactionsResponse.transactions as Transaction[]
          : [];

        // Verifica se statsResponse é um objeto
        const stats = statsResponse && typeof statsResponse === 'object'
          ? statsResponse
          : {
              totalIncome: 0,
              totalExpense: 0,
              balance: 0,
              monthlyIncome: 0,
              monthlyExpense: 0,
              monthlyBalance: 0
            };

        // Processa os dados para os gráficos
        const processedData = processMonthlyData(transactions);
        const processedCategoryData = processCategoryData(transactions);

        setMonthlyData(processedData);
        setCategoryData(processedCategoryData);
        setStats({
          totalIncome: parseFloat(stats.totalIncome) || 0,
          totalExpense: parseFloat(stats.totalExpense) || 0,
          balance: parseFloat(stats.balance) || 0,
          monthlyIncome: parseFloat(stats.monthlyIncome) || 0,
          monthlyExpense: parseFloat(stats.monthlyExpense) || 0,
          monthlyBalance: parseFloat(stats.monthlyBalance) || 0
        });
        setLoading(false);
      } catch (error: any) {
        setError(error.response?.data?.details || 'Erro ao carregar dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    let isMounted = true;
    if (isMounted) {
      fetchData();
    }
    return () => {
      isMounted = false;
    };
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
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      const expense = monthData
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      return {
        month: new Date(year, month).toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
        income,
        expense,
        balance: income - expense
      };
    });
  };

  const processCategoryData = (data: Transaction[]): CategoryData[] => {
    if (data.length === 0) {
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
        acc[curr.category] += parseFloat(curr.amount.toString());
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
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <div>{error}</div>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Cards de Resumo */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              background: 'linear-gradient(45deg, #059669 30%, #10B981 90%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(5, 150, 105, 0.2)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Receitas Totais
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {formatCurrency(stats.totalIncome)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              background: 'linear-gradient(45deg, #DC2626 30%, #EF4444 90%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(220, 38, 38, 0.2)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingDownIcon sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Despesas Totais
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {formatCurrency(stats.totalExpense)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              background: stats.balance >= 0 
                ? 'linear-gradient(45deg, #2563EB 30%, #3B82F6 90%)'
                : 'linear-gradient(45deg, #DC2626 30%, #EF4444 90%)',
              color: 'white',
              boxShadow: stats.balance >= 0 
                ? '0 4px 20px rgba(37, 99, 235, 0.2)'
                : '0 4px 20px rgba(220, 38, 38, 0.2)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalanceIcon sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Saldo
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {formatCurrency(stats.balance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Receitas vs Despesas */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                fontWeight: 600,
                color: '#1F2937',
                mb: 3
              }}>
                Receitas vs Despesas (Últimos 6 meses)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <RechartsTooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="income" 
                    name="Receitas" 
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="expense" 
                    name="Despesas" 
                    fill="#DC2626"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Despesas por Categoria */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                fontWeight: 600,
                color: '#1F2937',
                mb: 3
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
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{
                      paddingLeft: '20px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Saldo */}
        <Grid item xs={12}>
          <Card sx={{ 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                fontWeight: 600,
                color: '#1F2937',
                mb: 3
              }}>
                Saldo Mensal
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <RechartsTooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#2563EB', strokeWidth: 2 }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    name="Saldo" 
                    stroke="#2563EB" 
                    strokeWidth={2}
                    dot={{ 
                      fill: '#2563EB',
                      strokeWidth: 2,
                      r: 4
                    }}
                    activeDot={{ 
                      fill: '#2563EB',
                      strokeWidth: 2,
                      r: 6
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
} 