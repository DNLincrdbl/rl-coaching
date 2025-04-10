'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaChartLine, FaCalendar, FaPlayCircle, FaBook } from 'react-icons/fa';
import Link from 'next/link';

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

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0A0F1C] pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Üdvözlő fejléc */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Üdvözöllek, {mockUserData.name}!
          </h1>
          <p className="text-gray-400">
            Folytasd a fejlődést a következő szintre
          </p>
        </div>

        {/* Statisztikai kártyák */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <FaTrophy className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Jelenlegi Rank</p>
                <h3 className="text-xl font-bold text-white">{mockUserData.rank}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <FaCalendar className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Következő Edzés</p>
                <h3 className="text-xl font-bold text-white">
                  {new Date(mockUserData.nextSession).toLocaleDateString('hu-HU', {
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Aktív kurzusok */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
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
          </div>

          {/* Mai edzésterv */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
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
          </div>
        </div>

        {/* Ajánlott videók/gyakorlatok */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Ajánlott Gyakorlatok</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(id => (
              <motion.div
                key={id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 rounded-xl overflow-hidden border border-white/10"
              >
                <div className="aspect-video bg-gray-800" />
                <div className="p-4">
                  <h3 className="text-white font-medium mb-2">Gyakorlat #{id}</h3>
                  <p className="text-gray-400 text-sm">
                    Részletes leírás és instrukciók a gyakorlathoz...
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 