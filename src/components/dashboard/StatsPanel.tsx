'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import { FaClock, FaTrophy, FaChartLine, FaGamepad, FaCalendar } from 'react-icons/fa';

// Regisztráljuk a Chart.js komponenseket
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type RankKey = 'Champion 1' | 'Champion 2' | 'Champion 3' | 'Grand Champion 1' | 'Grand Champion 2' | 'Grand Champion 3';
type RankMMRValue = { min: number; max: number; color: string; textColor: string };

// Rank MMR értékek és színek
const rankMMRValues: Record<RankKey, RankMMRValue> = {
  'Champion 1': { 
    min: 1195, 
    max: 1275,
    color: 'from-blue-600 to-blue-800',
    textColor: 'text-blue-500'
  },
  'Champion 2': { 
    min: 1275, 
    max: 1355,
    color: 'from-blue-700 to-blue-900',
    textColor: 'text-blue-600'
  },
  'Champion 3': { 
    min: 1355, 
    max: 1435,
    color: 'from-blue-800 to-indigo-900',
    textColor: 'text-blue-700'
  },
  'Grand Champion 1': { 
    min: 1435, 
    max: 1515,
    color: 'from-red-600 to-red-800',
    textColor: 'text-red-500'
  },
  'Grand Champion 2': { 
    min: 1515, 
    max: 1595,
    color: 'from-red-700 to-red-900',
    textColor: 'text-red-600'
  },
  'Grand Champion 3': { 
    min: 1595, 
    max: 1675,
    color: 'from-red-800 to-purple-900',
    textColor: 'text-red-700'
  },
};

const divisions = [1, 2, 3, 4];

const statsData = [
  {
    icon: FaClock,
    label: 'Játékidő',
    value: '156 óra',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: FaTrophy,
    label: 'Nyert meccsek',
    value: '342',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: FaChartLine,
    label: 'Win Rate',
    value: '64%',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: FaGamepad,
    label: 'Meccsek száma',
    value: '534',
    color: 'from-red-500 to-red-600',
  },
];

type MMRChartData = ChartData<'line', number[], string>;

export default function StatsPanel() {
  const [startRank, setStartRank] = useState<RankKey>('Champion 3');
  const [startDivision, setStartDivision] = useState(4);
  const [endRank, setEndRank] = useState<RankKey>('Grand Champion 1');
  const [endDivision, setEndDivision] = useState(1);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-06-01');
  const [mmrData, setMmrData] = useState<MMRChartData>({
    labels: [],
    datasets: [{
      label: 'MMR Változás',
      data: [],
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.5)',
      tension: 0.4,
    }]
  });

  // MMR számítás
  const calculateMMR = (rank: RankKey, division: number) => {
    const baseMMR = rankMMRValues[rank].min;
    const divisionRange = (rankMMRValues[rank].max - rankMMRValues[rank].min) / 4;
    return baseMMR + (division - 1) * divisionRange;
  };

  // MMR adatok generálása
  useEffect(() => {
    const startMMR = calculateMMR(startRank, startDivision);
    const endMMR = calculateMMR(endRank, endDivision);
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const monthDiff = (endDateObj.getMonth() - startDateObj.getMonth()) + 
      (12 * (endDateObj.getFullYear() - startDateObj.getFullYear()));
    
    const labels: string[] = [];
    const data: number[] = [];
    const mmrDiff = endMMR - startMMR;
    
    for (let i = 0; i <= monthDiff; i++) {
      const currentDate = new Date(startDateObj);
      currentDate.setMonth(startDateObj.getMonth() + i);
      labels.push(currentDate.toLocaleString('hu-HU', { month: 'short' }));
      
      // Progresszív MMR növekedés szimulálása
      const progress = i / monthDiff;
      const currentMMR = startMMR + (mmrDiff * Math.pow(progress, 2));
      data.push(Math.round(currentMMR));
    }

    setMmrData({
      labels,
      datasets: [{
        label: 'MMR Változás',
        data,
        borderColor: startRank.includes('Grand Champion') ? 'rgb(239, 68, 68)' : 'rgb(37, 99, 235)',
        backgroundColor: startRank.includes('Grand Champion') ? 'rgba(239, 68, 68, 0.5)' : 'rgba(37, 99, 235, 0.5)',
        tension: 0.4,
      }]
    });
  }, [startRank, startDivision, endRank, endDivision, startDate, endDate]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(255, 255, 255)',
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
    },
  };

  const getRankStyle = (rank: RankKey) => {
    const isGC = rank.includes('Grand Champion');
    return {
      optionClass: `${rankMMRValues[rank].textColor} font-semibold`,
      iconClass: `bg-gradient-to-br ${rankMMRValues[rank].color}`,
    };
  };

  return (
    <div className="space-y-6">
      {/* Statisztikai kártyák */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <h3 className="text-xl font-bold text-white">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MMR Grafikon és Rang választó */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white/5 rounded-2xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-bold text-white mb-6">MMR Progression</h2>
          <div className="h-[300px]">
            <Line data={mmrData} options={options} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 rounded-2xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-bold text-white mb-6">Rang Beállítások</h2>
          
          {/* Kezdő rang */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Kezdő Rang</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={startRank}
                onChange={(e) => setStartRank(e.target.value as RankKey)}
                className="bg-white/5 border border-white/10 rounded-lg p-2 text-white"
              >
                {Object.keys(rankMMRValues).map(rank => {
                  const { optionClass } = getRankStyle(rank as RankKey);
                  return (
                    <option key={rank} value={rank} className={optionClass}>
                      {rank}
                    </option>
                  );
                })}
              </select>
              <select
                value={startDivision}
                onChange={(e) => setStartDivision(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg p-2 text-white"
              >
                {divisions.map(div => (
                  <option key={div} value={div}>Division {div}</option>
                ))}
              </select>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
            />
          </div>

          {/* Cél rang */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Cél Rang</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={endRank}
                onChange={(e) => setEndRank(e.target.value as RankKey)}
                className="bg-white/5 border border-white/10 rounded-lg p-2 text-white"
              >
                {Object.keys(rankMMRValues).map(rank => {
                  const { optionClass } = getRankStyle(rank as RankKey);
                  return (
                    <option key={rank} value={rank} className={optionClass}>
                      {rank}
                    </option>
                  );
                })}
              </select>
              <select
                value={endDivision}
                onChange={(e) => setEndDivision(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg p-2 text-white"
              >
                {divisions.map(div => (
                  <option key={div} value={div}>Division {div}</option>
                ))}
              </select>
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
            />
          </div>

          <div className="text-sm text-gray-400">
            <p>Várható MMR növekedés:</p>
            <p className="text-white font-bold mt-1">
              {Math.round(calculateMMR(endRank, endDivision) - calculateMMR(startRank, startDivision))} pont
            </p>
          </div>
        </motion.div>
      </div>

      {/* Rank információk */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-xl font-bold text-white mb-4">Rank Információk</h2>
        <div className="flex items-center gap-4">
          <div className={`w-20 h-20 ${getRankStyle(endRank).iconClass} rounded-lg flex items-center justify-center`}>
            <FaTrophy className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className={`text-2xl font-bold ${getRankStyle(endRank).optionClass}`}>
              {endRank} Division {endDivision}
            </h3>
            <p className="text-gray-400">
              Várható elérés: {new Date(endDate).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 