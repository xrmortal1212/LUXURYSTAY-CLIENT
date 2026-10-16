import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

const palettes = {
  admin: { colors: ['#285b45', '#78a487', '#bdd7c3', '#a7b5aa'], soft: 'rgba(40, 91, 69, 0.12)' },
  manager: { colors: ['#456447', '#829976', '#b7c7a8', '#d4ddc9'], soft: 'rgba(69, 100, 71, 0.12)' },
  receptionist: { colors: ['#315d78', '#6591ad', '#9fc0d1', '#c5dbe5'], soft: 'rgba(49, 93, 120, 0.12)' },
  housekeeping: { colors: ['#16796f', '#51a69a', '#91cec3', '#c4e6df'], soft: 'rgba(22, 121, 111, 0.12)' }
};

const DashboardChart = ({ type = 'bar', labels, datasets, theme = 'admin', height = 250 }) => {
  const palette = palettes[theme] || palettes.admin;
  const hasData = datasets.some(dataset => dataset.data.some(value => Number(value) > 0));

  if (!labels.length || !hasData) {
    return <div className="dash-chart-empty">No chart data available yet.</div>;
  }

  const chartData = {
    labels,
    datasets: datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || (type === 'doughnut'
        ? palette.colors
        : type === 'line' ? palette.soft : palette.colors[index % palette.colors.length]),
      borderColor: dataset.borderColor || (type === 'doughnut' ? '#ffffff' : palette.colors[index % palette.colors.length]),
      borderWidth: type === 'doughnut' ? 2 : 1,
      borderRadius: type === 'bar' ? 5 : undefined,
      fill: type === 'line',
      tension: type === 'line' ? 0.35 : undefined,
      pointRadius: type === 'line' ? 3 : undefined,
      pointHoverRadius: type === 'line' ? 5 : undefined
    }))
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: datasets.length > 1 || type === 'doughnut',
        position: 'bottom',
        labels: { color: '#728077', boxWidth: 9, boxHeight: 9, usePointStyle: true, padding: 16, font: { size: 10 } }
      },
      tooltip: { intersect: false, mode: 'index' }
    },
    scales: type === 'doughnut' ? {} : {
      x: { grid: { display: false }, ticks: { color: '#728077', maxRotation: 0, autoSkip: true, font: { size: 10 } } },
      y: { beginAtZero: true, grid: { color: '#edf0ed' }, ticks: { color: '#728077', precision: 0, font: { size: 10 } } }
    }
  };
  const Chart = type === 'line' ? Line : type === 'doughnut' ? Doughnut : Bar;
  const summary = datasets.map(dataset => `${dataset.label}: ${dataset.data.join(', ')}`).join('; ');

  return (
    <div className="dash-chart" style={{ height }} role="img" aria-label={`${labels.join(', ')}. ${summary}`}>
      <Chart data={chartData} options={options} />
    </div>
  );
};

export default DashboardChart;
