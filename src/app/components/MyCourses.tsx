'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaCheck, FaLock, FaTrophy, FaClock, FaBook, FaChartLine } from 'react-icons/fa';
import VideoPlayer from './VideoPlayer';
import Link from 'next/link';

// Példa kurzus adatok (később API-ból jönne)
const mockCourses = [
  {
    id: 1,
    title: 'Haladó Légi Irányítás',
    description: 'Tökéletesítsd a légi mechanikáidat és irányításodat',
    progress: 60,
    thumbnailUrl: '/course1-thumb.jpg',
    instructor: 'JusTZoly',
    duration: '8 óra',
    difficulty: 'Haladó',
    category: 'Mechanika',
    videos: [
      {
        id: 1,
        title: 'Légi labdavezetés alapjai',
        description: 'Megtanuljuk a légi labdavezetés alapvető technikáit',
        videoUrl: '/videos/air-dribble-basics.mp4',
        thumbnailUrl: '/thumbnails/air-dribble-basics.jpg',
        duration: '25 perc',
        isCompleted: true
      },
      {
        id: 2,
        title: 'Haladó légi irányítás',
        description: 'Részletes útmutató a haladó légi irányításhoz',
        videoUrl: '/videos/advanced-air-control.mp4',
        thumbnailUrl: '/thumbnails/advanced-air-control.jpg',
        duration: '30 perc',
        isCompleted: false
      }
    ]
  },
  {
    id: 2,
    title: 'Rotációs Alapok',
    description: 'Alapvető rotációs stratégiák és pozicionálás',
    progress: 30,
    thumbnailUrl: '/course2-thumb.jpg',
    instructor: 'JusTZoly',
    duration: '6 óra',
    difficulty: 'Kezdő',
    category: 'Stratégia',
    videos: [
      {
        id: 3,
        title: 'Rotációs alapelvek',
        description: 'Megtanuljuk a hatékony rotáció alapjait',
        videoUrl: '/videos/rotation-basics.mp4',
        thumbnailUrl: '/thumbnails/rotation-basics.jpg',
        duration: '20 perc',
        isCompleted: true
      }
    ]
  }
];

export default function MyCourses() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  const currentCourse = mockCourses.find(course => course.id === selectedCourse);
  const currentVideo = currentCourse?.videos.find(video => video.id === selectedVideo);

  return (
    <div className="min-h-screen bg-[#0A0F1C] pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Kurzusaim</h1>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white hover:bg-white/10 transition-all"
            >
              Szűrés
            </motion.button>
            <Link href="/courses/purchase">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white hover:opacity-90 transition-all"
              >
                Új kurzus böngészése
              </motion.button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kurzus lista */}
          <div className="lg:col-span-1 space-y-6">
            {mockCourses.map(course => (
              <motion.div
                key={course.id}
                whileHover={{ scale: 1.02 }}
                className={`bg-white/5 rounded-xl p-6 border ${
                  selectedCourse === course.id ? 'border-blue-500' : 'border-white/10'
                } cursor-pointer transition-all hover:bg-white/10`}
                onClick={() => setSelectedCourse(course.id)}
              >
                <div className="aspect-video bg-gray-800 rounded-lg mb-4 overflow-hidden relative group">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <FaClock className="w-4 h-4" />
                      <span>{course.duration}</span>
                      <span className="mx-2">•</span>
                      <span>{course.difficulty}</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{course.description}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Haladás</span>
                    <span className="text-white font-medium">{course.progress}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Videó lejátszó és lista */}
          <div className="lg:col-span-2 space-y-6">
            {currentCourse ? (
              <>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  {currentVideo ? (
                    <>
                      <VideoPlayer
                        videoUrl={currentVideo.videoUrl}
                        title={currentVideo.title}
                        description={currentVideo.description}
                        thumbnailUrl={currentVideo.thumbnailUrl}
                      />
                      <div className="mt-6">
                        <h2 className="text-2xl font-bold text-white mb-2">{currentVideo.title}</h2>
                        <p className="text-gray-400">{currentVideo.description}</p>
                        <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <FaClock className="w-4 h-4" />
                            <span>{currentVideo.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaBook className="w-4 h-4" />
                            <span>{currentCourse.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaChartLine className="w-4 h-4" />
                            <span>{currentCourse.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="aspect-video bg-black rounded-2xl flex items-center justify-center">
                      <p className="text-gray-400">Válassz egy videót a lejátszáshoz</p>
                    </div>
                  )}
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-6">Leckék</h2>
                  <div className="space-y-4">
                    {currentCourse.videos.map(video => (
                      <motion.div
                        key={video.id}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                          selectedVideo === video.id
                            ? 'bg-blue-500/20 border-blue-500'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        } border`}
                        onClick={() => setSelectedVideo(video.id)}
                      >
                        <div className="relative w-32 h-20 bg-gray-800 rounded-lg overflow-hidden group">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          {video.isCompleted && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                              <FaCheck className="w-6 h-6 text-green-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium mb-1">{video.title}</h3>
                          <p className="text-gray-400 text-sm">{video.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <FaClock className="w-4 h-4" />
                              <span>{video.duration}</span>
                            </div>
                            {video.isCompleted ? (
                              <div className="flex items-center gap-2 text-green-400">
                                <FaCheck className="w-4 h-4" />
                                <span>Teljesítve</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <FaPlay className="w-4 h-4" />
                                <span>Folyamatban</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white/5 rounded-2xl p-12 border border-white/10 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <FaPlay className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Válassz egy kurzust</h2>
                <p className="text-gray-400 max-w-md">
                  Válaszd ki az egyik kurzust a listából a tartalom megtekintéséhez és a tanulás megkezdéséhez.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 