import { Progress } from 'antd';
import React from 'react';
import '../resources/analytics.css';
import { Bar, Pie, Line } from 'react-chartjs-2'; // Added Line
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement, // Added for Line chart
  LineElement,  // Added for Line chart
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement, // Added for Line chart
  LineElement,  // Added for Line chart
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = ({ transactions }) => {
  let totalTransactions = transactions.length
  let totalIncomeTransactions = transactions.filter(
    (transaction) => transaction.type === 'income'
  )
  let totalExpenseTransactions = transactions.filter(
    (transaction) => transaction.type === 'expense'
  )
  let totalIncomeTransactionsPercentage =
    (totalIncomeTransactions.length / totalTransactions) * 100

  let totalExpenseTransactionsPercentage =
    (totalExpenseTransactions.length / totalTransactions) * 100
  let totalTurnover = transactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  )
  let totalIncomeTurnover = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((acc, transaction) => acc + transaction.amount, 0)
  let totalExpenseTurnover = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((acc, transaction) => acc + transaction.amount, 0)
  let totalIncomeTurnoverPercentage =
    (totalIncomeTurnover / totalTurnover) * 100
  let totalExpenseTurnoverPercentage =
    (totalExpenseTurnover / totalTurnover) * 100
  let categories = [
    'salary',
    'self-employment',
    'investment',
    'food',
    'entertainment',
    'travel',
    'education',
    'medical',
    'tax',
  ]

  totalIncomeTransactionsPercentage = Number.isNaN(
    totalIncomeTransactionsPercentage
  )
    ? 0
    : totalIncomeTransactionsPercentage

  totalExpenseTransactionsPercentage = Number.isNaN(
    totalExpenseTransactionsPercentage
  )
    ? 0
    : totalExpenseTransactionsPercentage

  totalIncomeTurnoverPercentage = Number.isNaN(totalIncomeTurnoverPercentage)
    ? 0
    : totalIncomeTurnoverPercentage

  totalExpenseTurnoverPercentage = Number.isNaN(totalExpenseTurnoverPercentage)
    ? 0
    : totalExpenseTurnoverPercentage

  const categoryChartData = {
    labels: categories,
    datasets: [
      {
        label: 'Income',
        data: categories.map((category) =>
          transactions
            .filter(
              (t) => t.type === 'income' && t.category === category
            )
            .reduce((acc, t) => acc + t.amount, 0)
        ),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expense',
        data: categories.map((category) =>
          transactions
            .filter(
              (t) => t.type === 'expense' && t.category === category
            )
            .reduce((acc, t) => acc + t.amount, 0)
        ),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Income vs Expense by Category',
      },
    },
  };

  const expenseCategories = Array.from(new Set(transactions.filter(t => t.type === 'expense').map(t => t.category)));
  const expenseCategoryData = {
    labels: expenseCategories,
    datasets: [
      {
        label: 'Expenses by Category',
        data: expenseCategories.map(category =>
          transactions
            .filter(t => t.type === 'expense' && t.category === category)
            .reduce((acc, t) => acc + t.amount, 0)
        ),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)',
          'rgba(83, 102, 255, 0.7)',
          'rgba(40, 159, 64, 0.7)',
          'rgba(210, 99, 132, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(40, 159, 64, 1)',
          'rgba(210, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Expense Distribution by Category',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed);
            }
            return label;
          }
        }
      }
    },
  };
  // --- Trend Chart Data Preparation ---
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const trendData = {
    labels: [],
    income: [],
    expense: [],
  };

  if (sortedTransactions.length > 0) {
    const monthlyData = {}; // { 'YYYY-MM': { income: X, expense: Y } }

    sortedTransactions.forEach(t => {
      const monthYear = t.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthlyData[monthYear].income += t.amount;
      } else {
        monthlyData[monthYear].expense += t.amount;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort();

    sortedMonths.forEach(month => {
      trendData.labels.push(month);
      trendData.income.push(monthlyData[month].income);
      trendData.expense.push(monthlyData[month].expense);
    });
  }


  const lineChartData = {
    labels: trendData.labels,
    datasets: [
      {
        label: 'Total Income',
        data: trendData.income,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
        fill: true,
      },
      {
        label: 'Total Expense',
        data: trendData.expense,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Income vs Expense Trend',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  // --- End of Trend Chart Data Preparation ---

  return (
    <div className='analytics'>
      {/* Total Transactions and Total Turnover */}
      <div className='row mt-3'>
        <div className='col-md-4'>
          <div className='transactions-count'>
            <h4>Total Transactions : {totalTransactions}</h4>
            <hr />
            <h5>Income : {totalIncomeTransactions.length}</h5>
            <h5>Expense : {totalExpenseTransactions.length}</h5>

            <div className='progress-bars'>
              <Progress
                className='mx-3 my-1'
                type='circle'
                strokeColor='green'
                percent={totalIncomeTransactionsPercentage.toFixed(0)}
              />

              <Progress
                className='mx-3 my-1'
                type='circle'
                strokeColor='red'
                percent={totalExpenseTransactionsPercentage.toFixed(0)}
              />
            </div>
          </div>
        </div>

        <div className='col-md-4'>
          <div className='transactions-count'>
            <h4>Total Money : {totalTurnover}</h4>
            <hr />
            <h5>Income : {totalIncomeTurnover}</h5>
            <h5>Expense : {totalExpenseTurnover}</h5>

            <div className='progress-bars'>
              <Progress
                className='mx-3 my-1'
                type='circle'
                strokeColor='green'
                percent={totalIncomeTurnoverPercentage.toFixed(0)}
              />

              <Progress
                className='mx-3 my-1'
                type='circle'
                strokeColor='red'
                percent={totalExpenseTurnoverPercentage.toFixed(0)}
              />
            </div>
          </div>
        </div>
      </div>

      <hr />

      {/* Category-wise income and expense */}
      <div className='row mt-3'>
        <div className='col-md-6'>
          <div className='income-category-analysis'>
            <h4>Income - Category Wise</h4>
            {categories.map((category) => {
              const amount = transactions
                .filter(
                  (transaction) =>
                    transaction.type === 'income' &&
                    transaction.category === category
                )
                .reduce((acc, transaction) => acc + transaction.amount, 0)

              return (
                amount > 0 && (
                  <div className='category-card' key={category}>
                    <h5>{category}</h5>
                    <Progress
                      percent={((amount / totalIncomeTurnover) * 100).toFixed(
                        0
                      )}
                    />
                  </div>
                )
              )
            })}
          </div>
        </div>

        <div className='col-md-6'>
          <div className='expense-category-analysis'>
            <h4>Expense - Category Wise</h4>
            {categories.map((category) => {
              const amount = transactions
                .filter(
                  (transaction) =>
                    transaction.type === 'expense' &&
                    transaction.category === category
                )
                .reduce((acc, transaction) => acc + transaction.amount, 0)

              return (
                amount > 0 && (
                  <div className='category-card' key={category}>
                    <h5>{category}</h5>
                    <Progress
                      percent={((amount / totalExpenseTurnover) * 100).toFixed(
                        0
                      )}
                    />
                  </div>
                )
              )
            })}
          </div>
        </div>
      </div>

      <hr />

      {/* Category wise Bar Chart */}
      <div className='row mt-3'>
        <div className='col-md-12'>
          <div className='category-chart-container'>
            <h4>Category Breakdown</h4>
            <Bar options={chartOptions} data={categoryChartData} />
          </div>
        </div>
      </div>

      <hr />

      {/* Expense Category Pie Chart */}
      <div className='row mt-3'>
        <div className='col-md-6 offset-md-3'> {/* Centering the pie chart */}
          <div className='category-chart-container'>
            <h4>Expense Breakdown</h4>
            {totalExpenseTurnover > 0 ? (
              <Pie options={pieChartOptions} data={expenseCategoryData} />
            ) : (
              <p>No expense data available for pie chart.</p>
            )}
          </div>
        </div>
      </div>

      <hr />

      {/* Monthly Trend Line Chart */}
      <div className='row mt-3'>
        <div className='col-md-12'>
          <div className='category-chart-container'>
            <h4>Income & Expense Trend (Monthly)</h4>
            {trendData.labels.length > 0 ? (
              <Line options={lineChartOptions} data={lineChartData} />
            ) : (
              <p>Not enough data to display monthly trend.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
