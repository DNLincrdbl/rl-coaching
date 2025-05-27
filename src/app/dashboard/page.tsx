'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaPlayCircle, FaBook } from 'react-icons/fa';
import Link from 'next/link';
import StatsPanel from '@/components/dashboard/StatsPanel';
import SkillTracker from '@/components/dashboard/SkillTracker';
import ReplayAnalyzer from '@/components/dashboard/ReplayAnalyzer';
import { useAuth } from '@/contexts/AuthContext';

// Példa felhasználói adatok (később API-ból jönne)
const mockUserData = {
  name: 'Teszt Játékos',
  rank: 'Diamond II',
  nextSession: '2024-03-20 14:00',
  activeCourses: [
    { id: 1, name: 'Haladó Légi Irányítás', progress: 60 },
    { id: 2, name: 'Rotációs Alapok', progress: 30 }
  ],
  trainingPlan: [
    { id: 1, name: 'Légi labdavezetés', duration: '20 perc' },
    { id: 2, name: 'Fal melletti védekezés', duration: '15 perc' },
    { id: 3, name: 'Gyors kezdés gyakorlása', duration: '10 perc' }
  ]
};

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0F1C] pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Üdvözlő fejléc */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Üdvözöllek, {user?.displayName || mockUserData.name}!
          </h1>
          <p className="text-gray-400">
            Folytasd a fejlődést a következő szintre
          </p>
        </div>

        {/* Statisztikai kártyák */}
        <div className="mb-12">
          <StatsPanel />
        </div>

        {/* Aktív kurzusok és Edzésterv */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <FaPlayCircle className="text-blue-400" />
                Aktív Kurzusaid
              </h2>
              <Link 
                href="/courses"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Összes kurzus megtekintése →
              </Link>
            </div>
            <div className="space-y-6">
              {mockUserData.activeCourses.map(course => (
                <div key={course.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">{course.name}</span>
                    <span className="text-gray-400">{course.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaBook className="text-purple-400" />
              Mai Edzésterv
            </h2>
            <div className="space-y-4">
              {mockUserData.trainingPlan.map(exercise => (
                <motion.div
                  key={exercise.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <span className="text-white">{exercise.name}</span>
                  <span className="text-gray-400">{exercise.duration}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Skill Tracker */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Készségek és Fejlődés</h2>
          <SkillTracker />
        </div>

        {/* Replay Analyzer */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Replay Elemzés</h2>
          <ReplayAnalyzer />
        </div>
      </div>
    </div>
  );
} 