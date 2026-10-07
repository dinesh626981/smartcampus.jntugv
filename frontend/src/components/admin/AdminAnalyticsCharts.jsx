import React from 'react';
import PropTypes from 'prop-types';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Card from '../ui/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const M3_CHART_PALETTE = [
  '#0B57D0', // Google Blue
  '#146C2E', // Success Green
  '#B06000', // Warning Gold
  '#00796B', // Teal
  '#7B1FA2', // Purple
  '#B3261E', // Coral Red
  '#4285F4', // Light Blue
  '#5B6475', // Slate
  '#34A853', // Emerald
  '#EA4335', // Crimson
];

/**
 * Analytics charts grid displaying department volume and category distribution.
 */
export const AdminAnalyticsCharts = ({ statsData }) => {
  // Chart 1: Category Distribution Doughnut
  const categorySummary = statsData?.category_summary || statsData?.category_distribution || {};
  const categoryKeys = Object.keys(categorySummary);
  const categoryValues = Object.values(categorySummary);

  const categoryDoughnutData = {
    labels: categoryKeys.length > 0 ? categoryKeys : ['No data'],
    datasets: [
      {
        data: categoryValues.length > 0 ? categoryValues : [1],
        backgroundColor: M3_CHART_PALETTE.slice(0, Math.max(categoryKeys.length, 1)),
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Figtree', size: 12 },
          color: '#444746',
          boxWidth: 12,
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: '#1E1F20',
        titleFont: { family: 'Figtree', size: 12 },
        bodyFont: { family: 'Figtree', size: 12 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    cutout: '65%',
  };

  // Chart 2: Issues by Department Bar Chart
  const deptSummary = statsData?.department_summary || statsData?.department_distribution || {};
  const deptKeys = Object.keys(deptSummary);
  const deptValues = Object.values(deptSummary);

  const departmentBarData = {
    labels: deptKeys,
    datasets: [
      {
        label: 'Tickets',
        data: deptValues,
        backgroundColor: '#0B57D0',
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E1F20',
        titleFont: { family: 'Figtree', size: 12 },
        bodyFont: { family: 'Figtree', size: 12 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Figtree', size: 11 }, color: '#444746' },
      },
      y: {
        beginAtZero: true,
        ticks: { font: { family: 'Figtree', size: 11 }, color: '#444746', precision: 0 },
        grid: { color: '#E2E5EB' },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Department Volume Bar Chart */}
      <div className="lg:col-span-7">
        <Card
          title="Issue volume by campus division"
          subtitle="Current active complaints allocated per department"
        >
          <div className="h-64 pt-2">
            {deptKeys.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[var(--md-sys-color-on-surface-variant)] italic">
                No department distribution data available.
              </div>
            ) : (
              <Bar data={departmentBarData} options={barOptions} />
            )}
          </div>
        </Card>
      </div>

      {/* Category Breakdown Doughnut */}
      <div className="lg:col-span-5">
        <Card
          title="Category distribution"
          subtitle="Grievance breakdown across physical infrastructure"
        >
          <div className="h-64 pt-2">
            {categoryKeys.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[var(--md-sys-color-on-surface-variant)] italic">
                No category distribution data available.
              </div>
            ) : (
              <Doughnut data={categoryDoughnutData} options={doughnutOptions} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

AdminAnalyticsCharts.propTypes = {
  statsData: PropTypes.object,
};

export default AdminAnalyticsCharts;
