'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFilter, FaSearch, FaPlay, FaShoppingCart } from 'react-icons/fa';
import Link from 'next/link';

const mockCourses = [
  {
    id: 1,
    title: 'Rocket League Alapok',
    description: 'Ismerd meg a játék alapvető mechanikáit és stratégiáit.',
    progress: 75,
    instructor: 'Pro Player',
    duration: '8 óra',
    difficulty: 'Kezdő',
    category: 'Alapok',
    videos: [
      {
        id: 1,
        title: 'Bevezetés a Rocket League-be',
        duration: '15:00',
      },
      {
        id: 2,
        title: 'Alapvető Mechanikák',
        duration: '20:00',
      },
    ],
  },
  {
    id: 2,
    title: 'Haladó Mechanikák',
    description: 'Fejleszd készségeidet a haladó mechanikákkal.',
    progress: 30,
    instructor: 'Pro Player',
    duration: '12 óra',
    difficulty: 'Haladó',
    category: 'Mechanikák',
    videos: [
      {
        id: 3,
        title: 'Aerial Kontrol',
        duration: '25:00',
      },
      {
        id: 4,
        title: 'Dribbling Technikák',
        duration: '30:00',
      },
    ],
  },
];

export default function MyCourses() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || course.difficulty.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#0A0F1C] pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Kurzusaim</h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6">
            Fejleszd készségeidet a professzionális kurzusokkal
          </p>
          <Link
            href="/courses/purchase"
            className="inline-flex items-center gap-2 bg-white text-[#0A0F1C] px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <FaShoppingCart className="w-5 h-5" />
            Új kurzus vásárlása
          </Link>
        </div>

        {/* Keresés és szűrés */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Keresés kurzusokban..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/20"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 cursor-pointer"
            >
              <option value="all">Összes szint</option>
              <option value="kezdő">Kezdő</option>
              <option value="haladó">Haladó</option>
              <option value="pro">Pro</option>
            </select>
          </div>
        </div>

        {/* Kurzusok grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaPlay className="w-16 h-16 text-white/40" />
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <span className="bg-white/10 px-2 py-1 rounded-full">
                      {course.difficulty}
                    </span>
                    <span className="bg-white/10 px-2 py-1 rounded-full">
                      {course.duration}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-gray-400 mb-4">{course.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{course.instructor}</span>
                    <span>•</span>
                    <span>{course.category}</span>
                  </div>
                  <div className="text-sm text-white">
                    {course.progress}% teljesítve
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                  <div
                    className="bg-white rounded-full h-2"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <button
                  onClick={() => setSelectedCourse(course.id)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Folytatás
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Video Player Section */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0A0F1C] rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              <div className="flex">
                {/* Video Player */}
                <div className="flex-1 p-6">
                  <div className="aspect-video bg-black rounded-xl mb-4 flex items-center justify-center">
                    {selectedVideo ? (
                      <div className="text-white text-center">
                        <FaPlay className="w-16 h-16 mx-auto mb-4 text-white/40" />
                        <h3 className="text-xl font-bold">
                          {mockCourses.find(c => c.id === selectedCourse)?.videos.find(v => v.id === selectedVideo)?.title}
                        </h3>
                        <p className="text-gray-400 mt-2">
                          {mockCourses.find(c => c.id === selectedCourse)?.videos.find(v => v.id === selectedVideo)?.duration}
                        </p>
                      </div>
                    ) : (
                      <div className="text-white text-center">
                        <FaPlay className="w-16 h-16 mx-auto mb-4 text-white/40" />
                        <h3 className="text-xl font-bold">Válassz egy videót</h3>
                        <p className="text-gray-400 mt-2">A videó részleteit itt láthatod</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video List */}
                <div className="w-80 border-l border-white/10 overflow-y-auto">
                  <div className="p-4">
                    <h4 className="text-white font-medium mb-4">Videók</h4>
                    <div className="space-y-2">
                      {mockCourses
                        .find(c => c.id === selectedCourse)
                        ?.videos.map((video) => (
                          <button
                            key={video.id}
                            onClick={() => setSelectedVideo(video.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                              selectedVideo === video.id
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="w-24 h-14 rounded-lg bg-white/5 flex items-center justify-center">
                              <FaPlay className="w-6 h-6 text-white/40" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-medium">{video.title}</p>
                              <p className="text-xs text-gray-400">{video.duration}</p>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 