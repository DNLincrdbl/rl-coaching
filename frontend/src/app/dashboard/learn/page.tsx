'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  FaGraduationCap,
  FaVideo,
  FaPlay,
  FaCheck,
  FaChevronLeft,
  FaSearch,
  FaStar,
  FaTimes,
  FaLayerGroup,
} from 'react-icons/fa';
import { useRLM } from '@/contexts/RLMContext';
import {
  COURSES,
  Course,
  Lesson,
  TUTORIALS,
  Tutorial,
  TUTORIAL_CATEGORIES,
} from '@/lib/data/learn';

type Section = 'courses' | 'tutorials';

/** 5-star rating row. */
function Stars({ value, color = 'text-yellow-400' }: { value: number; color?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar key={s} className={`w-3 h-3 ${s <= value ? color : 'text-gray-700'}`} />
      ))}
    </div>
  );
}

function VideoModal({ title, url, onClose }: { title: string; url: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="rlm-card w-full max-w-4xl overflow-hidden"
      >
        <div className="relative aspect-video bg-black">
          <video src={url} controls autoPlay className="w-full h-full" />
          <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/60 rounded-full hover:bg-black/80">
            <FaTimes className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CourseDetail({ course, progress, onBack, onWatch }: {
  course: Course;
  progress: number;
  onBack: () => void;
  onWatch: (lesson: Lesson, index: number) => void;
}) {
  const completedLessons = Math.floor((progress / 100) * course.lessons.length);
  return (
    <div className="space-y-6 rlm-fade-up">
      <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2">
        <FaChevronLeft className="w-4 h-4" /> Vissza a kurzusokhoz
      </button>

      <div className="relative rounded-2xl overflow-hidden">
        <div className="aspect-[21/9] relative">
          <Image src={course.image} alt={course.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
          <p className="text-gray-300 mb-4">{course.description}</p>
          <div className="max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">{completedLessons}/{course.lessons.length} videó</span>
              <span className="text-orange-400 font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="rlm-card overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Videók</h2>
        </div>
        <div className="divide-y divide-white/5">
          {course.lessons.map((lesson, index) => {
            const isCompleted = index < completedLessons;
            return (
              <button
                key={lesson.id}
                onClick={() => onWatch(lesson, index)}
                className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500' : lesson.isIntro ? 'bg-blue-500' : 'bg-white/10'
                }`}>
                  {isCompleted ? <FaCheck className="w-4 h-4 text-white" /> : <FaPlay className="w-4 h-4 text-white ml-0.5" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white flex items-center gap-2">
                    {lesson.title}
                    {lesson.isIntro && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">Bemutató</span>}
                  </h3>
                  <span className="text-sm text-gray-500">{lesson.duration}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function LearnPage() {
  const { profile, updateCourseProgress } = useRLM();
  const [section, setSection] = useState<Section>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [video, setVideo] = useState<{ title: string; url: string } | null>(null);

  // Tutorials filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const filteredTutorials = useMemo(() => {
    return TUTORIALS.filter((t) => {
      const matchesSearch =
        search === '' ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !category || t.category === category;
      return matchesSearch && matchesCat;
    });
  }, [search, category]);

  const getCourseProgress = (id: string) => profile.courseProgress.find((c) => c.courseId === id)?.progress || 0;

  const handleWatch = (course: Course, lesson: Lesson, index: number) => {
    setVideo({ title: lesson.title, url: lesson.videoUrl });
    const newProgress = Math.min(100, Math.round(((index + 1) / course.lessons.length) * 100));
    if (newProgress > getCourseProgress(course.id)) updateCourseProgress(course.id, newProgress);
  };

  return (
    <div className="space-y-6 rlm-fade-up">
      <AnimatePresence>
        {video && <VideoModal title={video.title} url={video.url} onClose={() => setVideo(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaGraduationCap className="text-orange-500" /> Kurzusok & Tutoriálok
        </h1>
        <p className="text-gray-400 mt-1">Strukturált kurzusok és bármikor elérhető tutoriálok egy helyen.</p>
      </div>

      {/* Section switch */}
      <div className="flex items-center gap-1 rlm-card !rounded-xl p-1 w-fit">
        <button
          onClick={() => { setSection('courses'); setSelectedCourse(null); }}
          className={`px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
            section === 'courses' ? 'rlm-btn-primary' : 'text-gray-400 hover:text-white'
          }`}
        >
          <FaLayerGroup className="w-4 h-4" /> Kurzusok
        </button>
        <button
          onClick={() => setSection('tutorials')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
            section === 'tutorials' ? 'rlm-btn-primary' : 'text-gray-400 hover:text-white'
          }`}
        >
          <FaVideo className="w-4 h-4" /> Tutoriálok
        </button>
      </div>

      {section === 'courses' ? (
        selectedCourse ? (
          <CourseDetail
            course={selectedCourse}
            progress={getCourseProgress(selectedCourse.id)}
            onBack={() => setSelectedCourse(null)}
            onWatch={(lesson, index) => handleWatch(selectedCourse, lesson, index)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COURSES.map((course, i) => {
              const progress = getCourseProgress(course.id);
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedCourse(course)}
                  className="rlm-card rlm-card-hover overflow-hidden cursor-pointer"
                >
                  <div className="relative aspect-video">
                    <Image src={course.image} alt={course.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    {progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{course.lessons.length} videó</span>
                      <span className={progress > 0 ? 'text-orange-400 font-medium' : 'text-gray-500'}>
                        {progress > 0 ? `${progress}% kész` : 'Még nem kezdted el'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )
      ) : (
        <div className="space-y-5">
          {/* Search + categories */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Keress tutoriált... (pl. Fast Aerial)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rlm-card !rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!category ? 'rlm-btn-primary' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              Mind
            </button>
            {TUTORIAL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(category === cat ? null : cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${category === cat ? 'rlm-btn-primary' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <p className="text-gray-400 text-sm">{filteredTutorials.length} tutoriál</p>

          {filteredTutorials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTutorials.map((t: Tutorial, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setVideo({ title: t.title, url: t.videoUrl })}
                  className="rlm-card rlm-card-hover overflow-hidden cursor-pointer group"
                >
                  <div className="aspect-video bg-gradient-to-br from-white/5 to-white/10 relative flex items-center justify-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaPlay className="w-5 h-5 text-white ml-0.5" />
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs text-white">{t.duration}</span>
                    <span className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-gray-300">{t.category}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-1">{t.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-1 mb-3">{t.description}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Nehézség</span>
                        <Stars value={t.difficulty} color="text-yellow-400" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Ranked hasznosság</span>
                        <Stars value={t.ranked} color="text-orange-400" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rlm-card">
              <FaVideo className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nincs találat. Próbálj más keresést!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
