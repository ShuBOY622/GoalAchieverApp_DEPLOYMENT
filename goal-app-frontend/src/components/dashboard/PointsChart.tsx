import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { MotionCard } from '../common/MotionCard';

interface PointData {
  date: string;
  points: number;
  dailyPoints: number;
}

interface PointsChartProps {
  data: PointData[];
  chartType?: 'line' | 'area';
}

export const PointsChart: React.FC<PointsChartProps> = ({ 
  data, 
  chartType = 'area' 
}) => {
  const totalPoints = data.reduce((sum, item) => sum + item.dailyPoints, 0);
  const averageDaily = data.length > 0 ? totalPoints / data.length : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{`Date: ${label}`}</p>
          <p className="text-blue-600">
            {`Total Points: ${payload[0].value}`}
          </p>
          {payload[1] && (
            <p className="text-green-600">
              {`Daily Points: ${payload[1].value}`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartType === 'area') {
      return (
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="points"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorPoints)"
          />
        </AreaChart>
      );
    }

    return (
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="date" 
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="points"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#1d4ed8' }}
        />
        <Line
          type="monotone"
          dataKey="dailyPoints"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
          strokeDasharray="5 5"
        />
      </LineChart>
    );
  };

  return (
    <MotionCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="mr-2 text-blue-600" />
          Points Progress
        </h3>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Earned</p>
            <p className="text-lg font-bold text-blue-600">{totalPoints}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Daily Average</p>
            <p className="text-lg font-bold text-green-600">{averageDaily.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
            <p>No data available yet</p>
            <p className="text-sm">Complete goals to see your progress</p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ResponsiveContainer width="100%" height={300}>
            {renderChart()}
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Cumulative Points</span>
        </div>
        {chartType === 'line' && (
          <div className="flex items-center">
            <div className="w-3 h-1 bg-green-500 mr-2" style={{ borderStyle: 'dashed' }}></div>
            <span className="text-gray-600">Daily Points</span>
          </div>
        )}
      </div>
    </MotionCard>
  );
};
