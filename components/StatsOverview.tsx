import React from 'react';
import { Stats } from '../types';
import { Box } from 'lucide-react';

interface StatsOverviewProps {
  stats: Stats;
  labels: {
    total: string;
    stat1: string;
    stat2: string;
    stat3: string;
  };
  icons: {
    stat1: React.ReactNode;
    stat2: React.ReactNode;
    stat3: React.ReactNode;
  };
}

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}> = ({ title, value, icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${colorClass}`}>
      {icon}
    </div>
  </div>
);

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, labels, icons }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title={labels.total}
        value={stats.total}
        icon={<Box className="w-6 h-6 text-blue-600" />}
        colorClass="bg-blue-50"
      />
      <StatCard
        title={labels.stat1}
        value={stats.stat1}
        icon={icons.stat1}
        colorClass="bg-emerald-50"
      />
      <StatCard
        title={labels.stat2}
        value={stats.stat2}
        icon={icons.stat2}
        colorClass="bg-amber-50"
      />
      <StatCard
        title={labels.stat3}
        value={stats.stat3}
        icon={icons.stat3}
        colorClass="bg-indigo-50"
      />
    </div>
  );
};