'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  FaGraduationCap, 
  FaPlay,
  FaPause,
  FaCheck,
  FaChevronRight,
  FaChevronLeft,
  FaExpand,
  FaCompress,
  FaVolumeUp,
  FaVolumeMute,
  FaTimes
} from 'react-icons/fa';
import { useRLM } from '@/contexts/RLMContext';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'bronze-plat' | 'dia-gc' | 'gc2-ssl' | 'mental';
  lessons: Lesson[];
}

// Placeholder video - a valós implementációban ezek lesznek az igazi videó URL-ek
const PLACEHOLDER_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const COURSES: Course[] = [
  {
    id: 'bronze-plat',
    title: 'Bronze - Platinum Kurzus',
    description: 'Alapok elsajátítása, rotáció, pozícionálás és mechanikák kezdőknek.',
    image: '/kurzus-bronz-plat.jpg',
    category: 'bronze-plat',
    lessons: [
      { id: 'bp-1', title: 'Bevezetés és alapok', duration: '15:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'bp-2', title: 'Autó irányítás alapjai', duration: '20:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'bp-3', title: 'Boost menedzsment', duration: '18:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'bp-4', title: 'Rotáció alapjai 2v2', duration: '25:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'bp-5', title: 'Rotáció alapjai 3v3', duration: '25:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'bp-6', title: 'Védekezés alapjai', duration: '22:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'bp-7', title: 'Támadás alapjai', duration: '22:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'bp-8', title: 'Egyszerű aerial-ök', duration: '20:00', videoUrl: PLACEHOLDER_VIDEO },
    ],
  },
  {
    id: 'dia-gc',
    title: 'Diamond - Grand Champion Kurzus',
    description: 'Haladó mechanikák, csapat koordináció és játékolvasás fejlesztése.',
    image: '/kurzus-dia-gc.jpg',
    category: 'dia-gc',
    lessons: [
      { id: 'dg-1', title: 'Haladó aerial kontrol', duration: '25:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'dg-2', title: 'Fast aerial technika', duration: '20:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'dg-3', title: 'Air roll használata', duration: '30:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'dg-4', title: 'Backboard olvasás', duration: '22:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'dg-5', title: 'Double tap alapok', duration: '28:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'dg-6', title: 'Flip reset bevezető', duration: '25:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'dg-7', title: 'Haladó rotáció', duration: '30:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'dg-8', title: 'Shadow defense', duration: '25:00', videoUrl: PLACEHOLDER_VIDEO },
    ],
  },
  {
    id: 'gc2-ssl',
    title: 'Grand Champion 2 - SSL Kurzus',
    description: 'Pro szintű mechanikák, játékelemzés és versenyfelkészülés.',
    image: '/kurzus-gc2-ssl.jpg',
    category: 'gc2-ssl',
    lessons: [
      { id: 'gs-1', title: 'Pro szintű air roll', duration: '35:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'gs-2', title: 'Ceiling shots mastery', duration: '30:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'gs-3', title: 'Reset variációk', duration: '35:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'gs-4', title: 'Musty és breezi', duration: '30:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'gs-5', title: 'Team play koordináció', duration: '40:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'gs-6', title: 'Replay elemzés módszertan', duration: '45:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'gs-7', title: 'Mentális felkészülés meccsre', duration: '25:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'gs-8', title: 'Verseny stratégiák', duration: '35:00', videoUrl: PLACEHOLDER_VIDEO },
    ],
  },
  {
    id: 'mental',
    title: 'Mentál Kurzus',
    description: 'Tilt kezelés, koncentráció fejlesztés és versenyhelyzetek kezelése.',
    image: '/kurzus-mentál.jpg',
    category: 'mental',
    lessons: [
      { id: 'm-1', title: 'Mi a tilt és honnan jön?', duration: '20:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'm-2', title: 'Tilt megelőzése', duration: '25:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'm-3', title: 'Tilt kezelése játék közben', duration: '22:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'm-4', title: 'Koncentráció fejlesztés', duration: '25:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'm-5', title: 'Versenyhelyzetek kezelése', duration: '30:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'm-6', title: 'Teammate kommunikáció', duration: '20:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'm-7', title: 'Célok kitűzése', duration: '18:00', videoUrl: PLACEHOLDER_VIDEO },
      { id: 'm-8', title: 'Hosszútávú fejlődés', duration: '25:00', videoUrl: PLACEHOLDER_VIDEO },
    ],
  },
];

function CourseCard({ course, progress, onSelect }: { 
  course: Course; 
  progress: number;
  onSelect: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
      className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden cursor-pointer hover:border-orange-500/30 transition-all"
    >
      {/* Image */}
      <div className="relative aspect-video">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Progress indicator */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
            <FaPlay className="w-6 h-6 text-white ml-1" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {course.lessons.length} lecke
          </span>
          {progress > 0 ? (
            <span className="text-sm text-orange-400 font-medium">
              {progress}% kész
            </span>
          ) : (
            <span className="text-sm text-gray-500">Még nem kezdted el</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function VideoPlayer({ 
  lesson, 
  onComplete, 
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  lessonNumber,
  totalLessons
}: {
  lesson: Lesson;
  onComplete: () => void;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  lessonNumber: number;
  totalLessons: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Prevent background scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      } else {
        videoContainerRef.current.requestFullscreen?.();
      }
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    onComplete();
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center"
      style={{ height: '100vh', width: '100vw' }}
      onClick={onClose}
    >
      {/* Dark backdrop - clicking this closes */}
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/90" style={{ height: '100vh', width: '100vw' }} />
      
      {/* Video container - clicking this doesn't close */}
      <motion.div 
        ref={videoContainerRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-5xl mx-4 rounded-2xl overflow-hidden bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
      >
        {/* Close button - always visible */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <FaTimes className="w-5 h-5 text-white" />
        </button>

        {/* Video */}
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            src={lesson.videoUrl}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnd}
            onClick={togglePlay}
          />
          
          {/* Center play button when paused */}
          <AnimatePresence>
            {!isPlaying && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={togglePlay}
              >
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 hover:scale-110 transition-all shadow-lg shadow-orange-500/30">
                  <FaPlay className="w-7 h-7 text-white ml-1" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom controls overlay */}
          <motion.div 
            initial={false}
            animate={{ opacity: showControls || !isPlaying ? 1 : 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-16"
          >
            {/* Lesson info */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-orange-400 text-sm font-medium">Lecke {lessonNumber}/{totalLessons}</span>
                <h3 className="text-white font-bold">{lesson.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onPrev}
                  disabled={!hasPrev}
                  className={`p-2 rounded-lg transition-colors ${
                    hasPrev ? 'bg-white/10 hover:bg-white/20 text-white' : 'text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    hasNext ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-white/10 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Következő
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-1 bg-white/20 rounded-full mb-3 cursor-pointer group">
              <div 
                className="absolute h-full bg-orange-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${progressPercent}%`, marginLeft: '-6px' }}
              />
            </div>

            {/* Bottom control row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isPlaying ? (
                    <FaPause className="w-5 h-5 text-white" />
                  ) : (
                    <FaPlay className="w-5 h-5 text-white" />
                  )}
                </button>
                
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMuted ? (
                    <FaVolumeMute className="w-5 h-5 text-white" />
                  ) : (
                    <FaVolumeUp className="w-5 h-5 text-white" />
                  )}
                </button>
                
                <span className="text-sm text-white/70 font-medium">
                  {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
                </span>
              </div>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FaExpand className="w-5 h-5 text-white" />
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CourseDetail({ course, progress, onBack, onUpdateProgress }: {
  course: Course;
  progress: number;
  onBack: () => void;
  onUpdateProgress: (lessonIndex: number) => void;
}) {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const completedLessons = Math.floor((progress / 100) * course.lessons.length);

  const handleLessonComplete = () => {
    if (selectedLesson !== null) {
      onUpdateProgress(selectedLesson);
    }
  };

  const handleNextLesson = () => {
    if (selectedLesson !== null && selectedLesson < course.lessons.length - 1) {
      setSelectedLesson(selectedLesson + 1);
    }
  };

  const handlePrevLesson = () => {
    if (selectedLesson !== null && selectedLesson > 0) {
      setSelectedLesson(selectedLesson - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedLesson !== null && (
          <VideoPlayer
            lesson={course.lessons[selectedLesson]}
            onComplete={handleLessonComplete}
            onClose={() => setSelectedLesson(null)}
            onNext={handleNextLesson}
            onPrev={handlePrevLesson}
            hasNext={selectedLesson < course.lessons.length - 1}
            hasPrev={selectedLesson > 0}
            lessonNumber={selectedLesson + 1}
            totalLessons={course.lessons.length}
          />
        )}
      </AnimatePresence>

      {/* Back button */}
      <button
        onClick={onBack}
        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        <FaChevronLeft className="w-4 h-4" />
        Vissza a kurzusokhoz
      </button>

      {/* Course Header */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="aspect-[21/9] relative">
          <Image
            src={course.image}
            alt={course.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
          <p className="text-gray-300 mb-4">{course.description}</p>
          
          {/* Progress bar */}
          <div className="max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">{completedLessons}/{course.lessons.length} lecke</span>
              <span className="text-orange-400 font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Leckék</h2>
        </div>
        
        <div className="divide-y divide-white/5">
          {course.lessons.map((lesson, index) => {
            const isCompleted = index < completedLessons;
            const isCurrent = index === completedLessons;
            
            return (
              <motion.button
                key={lesson.id}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                onClick={() => setSelectedLesson(index)}
                className="w-full p-4 flex items-center gap-4 text-left transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-500'
                    : isCurrent
                    ? 'bg-orange-500'
                    : 'bg-white/10'
                }`}>
                  {isCompleted ? (
                    <FaCheck className="w-4 h-4 text-white" />
                  ) : (
                    <FaPlay className="w-4 h-4 text-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-medium ${isCompleted ? 'text-gray-400' : 'text-white'}`}>
                    {lesson.title}
                  </h3>
                  <span className="text-sm text-gray-500">{lesson.duration}</span>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isCompleted 
                    ? 'bg-green-500/20 text-green-400' 
                    : isCurrent 
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-white/10 text-gray-400'
                }`}>
                  {isCompleted ? 'Kész' : isCurrent ? 'Folytatás' : 'Lejátszás'}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const { profile, updateCourseProgress } = useRLM();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const getCourseProgress = (courseId: string) => {
    const courseProgress = profile.courseProgress.find(c => c.courseId === courseId);
    return courseProgress?.progress || 0;
  };

  const handleUpdateProgress = (courseId: string, lessonIndex: number) => {
    const course = COURSES.find(c => c.id === courseId);
    if (!course) return;
    
    const newProgress = Math.min(100, Math.round(((lessonIndex + 1) / course.lessons.length) * 100));
    updateCourseProgress(courseId, newProgress);
  };

  if (selectedCourse) {
    return (
      <CourseDetail
        course={selectedCourse}
        progress={getCourseProgress(selectedCourse.id)}
        onBack={() => setSelectedCourse(null)}
        onUpdateProgress={(lessonIndex) => handleUpdateProgress(selectedCourse.id, lessonIndex)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaGraduationCap className="text-orange-500" />
          Kurzusok
        </h1>
        <p className="text-gray-400 mt-1">Tanulj a strukturált kurzusokból és fejlődj szintről szintre</p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {COURSES.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <CourseCard
              course={course}
              progress={getCourseProgress(course.id)}
              onSelect={() => setSelectedCourse(course)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
