'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/solid';

// Skill kategóriák és azok részletes leírása
const skillCategories = [
  {
    name: 'Mechanikai Készségek',
    skills: [
      { name: 'Fast Aerial', progress: 85, completed: true },
      { name: 'Wall to Air Dribble', progress: 60, completed: false },
      { name: 'Flip Reset', progress: 30, completed: false },
      { name: 'Speed Flip', progress: 45, completed: false },
    ],
  },
  {
    name: 'Játékértés',
    skills: [
      { name: 'Rotáció', progress: 90, completed: true },
      { name: 'Boost Management', progress: 75, completed: true },
      { name: 'Positioning', progress: 70, completed: false },
      { name: 'Field Awareness', progress: 65, completed: false },
    ],
  },
  {
    name: 'Csapatjáték',
    skills: [
      { name: 'Passing Play', progress: 80, completed: true },
      { name: 'Team Communication', progress: 70, completed: false },
      { name: 'Defensive Rotation', progress: 85, completed: true },
      { name: 'Kickoff Strategy', progress: 90, completed: true },
    ],
  },
];

// Achievement rendszer
const achievements = [
  {
    title: 'Aerial Master',
    description: 'Teljesíts 100 aerial gólt',
    progress: 75,
    reward: '500 XP',
    icon: '🚀',
  },
  {
    title: 'Save Specialist',
    description: 'Érj el 50 epic save-et',
    progress: 90,
    reward: '300 XP',
    icon: '🛡️',
  },
  {
    title: 'Team Player',
    description: 'Szerezz 200 assistot',
    progress: 60,
    reward: '400 XP',
    icon: '🤝',
  },
];

export default function SkillTracker() {
  return (
    <div className="space-y-8">
      {/* Skill Progression */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {skillCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-4">{category.name}</h3>
            <div className="space-y-4">
              {category.skills.map((skill, skillIndex) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {skill.completed ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <LockClosedIcon className="w-5 h-5 text-gray-500" />
                      )}
                      <span className="text-sm text-gray-200">{skill.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-400">
                      {skill.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.progress}%` }}
                      transition={{ duration: 1, delay: skillIndex * 0.1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-bold text-white mb-6">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.title}
              className="bg-white/5 rounded-xl p-4 border border-white/10"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">
                    {achievement.description}
                  </p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-gray-200">{achievement.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${achievement.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-yellow-500">
                    Reward: {achievement.reward}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Gyakorlási Terv */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-bold text-white mb-4">Mai Gyakorlási Terv</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl">
              🎯
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">
                Air Dribble Practice
              </h4>
              <p className="text-sm text-gray-400">
                20 perc gyakorlás a wall to air dribble workshop pályán
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-2xl">
              🎮
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">
                Ranked 2v2 Session
              </h4>
              <p className="text-sm text-gray-400">
                5 meccs, fókusz: rotáció és positioning
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-2xl">
              🔄
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">
                Speed Flip Training
              </h4>
              <p className="text-sm text-gray-400">
                15 perc speed flip gyakorlás egyéni edzésen
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 