'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FaVideo, 
  FaSearch,
  FaPlay,
  FaStar,
  FaFilter
} from 'react-icons/fa';

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  duration: string;
  category: string;
}

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; stars: number }> = {
  beginner: { label: 'Kezdő', color: 'text-green-400 bg-green-400/10', stars: 1 },
  intermediate: { label: 'Közepes', color: 'text-yellow-400 bg-yellow-400/10', stars: 2 },
  advanced: { label: 'Haladó', color: 'text-orange-400 bg-orange-400/10', stars: 3 },
  expert: { label: 'Szakértő', color: 'text-red-400 bg-red-400/10', stars: 4 },
};

const TUTORIALS: Tutorial[] = [
  // Aerials
  { id: 't1', title: 'Basic Aerial', description: 'Aerial alapok és időzítés', difficulty: 'beginner', duration: '8:30', category: 'Aerial' },
  { id: 't2', title: 'Fast Aerial', description: 'Gyors felszállás technikája', difficulty: 'intermediate', duration: '10:15', category: 'Aerial' },
  { id: 't3', title: 'Air Roll Aerial', description: 'Air roll használata aerial közben', difficulty: 'advanced', duration: '12:00', category: 'Aerial' },
  { id: 't4', title: 'Double Jump Aerial', description: 'Dupla ugrás optimalizálás', difficulty: 'intermediate', duration: '9:45', category: 'Aerial' },
  
  // Wall plays
  { id: 't5', title: 'Wall Hit Basics', description: 'Fal menti labdakezelés', difficulty: 'beginner', duration: '7:20', category: 'Wall Play' },
  { id: 't6', title: 'Wall to Air Dribble', description: 'Falról air dribble indítás', difficulty: 'advanced', duration: '14:30', category: 'Wall Play' },
  { id: 't7', title: 'Wall Shot Accuracy', description: 'Pontos lövések falról', difficulty: 'intermediate', duration: '11:00', category: 'Wall Play' },
  
  // Dribbling
  { id: 't8', title: 'Ground Dribble', description: 'Földi labdavezetés alapjai', difficulty: 'beginner', duration: '10:00', category: 'Dribbling' },
  { id: 't9', title: 'Flicks', description: 'Front flip, side flip flick', difficulty: 'intermediate', duration: '12:30', category: 'Dribbling' },
  { id: 't10', title: '45 Degree Flick', description: '45 fokos flick technika', difficulty: 'intermediate', duration: '8:45', category: 'Dribbling' },
  { id: 't11', title: 'Musty Flick', description: 'Musty flick lépésről lépésre', difficulty: 'advanced', duration: '15:00', category: 'Dribbling' },
  { id: 't12', title: 'Breezi Flick', description: 'Breezi flick tutorial', difficulty: 'expert', duration: '18:00', category: 'Dribbling' },
  
  // Mechanics
  { id: 't13', title: 'Half Flip', description: 'Half flip megtanulása', difficulty: 'beginner', duration: '6:00', category: 'Mechanics' },
  { id: 't14', title: 'Wave Dash', description: 'Wave dash használata', difficulty: 'intermediate', duration: '8:00', category: 'Mechanics' },
  { id: 't15', title: 'Speed Flip', description: 'Speed flip technika', difficulty: 'advanced', duration: '12:00', category: 'Mechanics' },
  { id: 't16', title: 'Ceiling Shot', description: 'Ceiling shot alapok', difficulty: 'advanced', duration: '14:00', category: 'Mechanics' },
  { id: 't17', title: 'Flip Reset', description: 'Flip reset megszerzése', difficulty: 'expert', duration: '20:00', category: 'Mechanics' },
  { id: 't18', title: 'Double Tap', description: 'Double tap technika', difficulty: 'advanced', duration: '13:00', category: 'Mechanics' },
  
  // Defense
  { id: 't19', title: 'Positioning Basics', description: 'Védekezési pozíció alapok', difficulty: 'beginner', duration: '10:00', category: 'Defense' },
  { id: 't20', title: 'Shadow Defense', description: 'Shadow defense technika', difficulty: 'intermediate', duration: '15:00', category: 'Defense' },
  { id: 't21', title: 'Saving Shots', description: 'Védések különböző helyzetekben', difficulty: 'beginner', duration: '12:00', category: 'Defense' },
  
  // Rotation
  { id: 't22', title: '2v2 Rotation', description: '2v2 rotáció alapok', difficulty: 'beginner', duration: '18:00', category: 'Rotation' },
  { id: 't23', title: '3v3 Rotation', description: '3v3 rotáció alapok', difficulty: 'beginner', duration: '20:00', category: 'Rotation' },
  { id: 't24', title: 'Advanced Rotation', description: 'Haladó rotációs minták', difficulty: 'advanced', duration: '25:00', category: 'Rotation' },
  
  // Boost
  { id: 't25', title: 'Boost Management', description: 'Boost hatékony használata', difficulty: 'beginner', duration: '10:00', category: 'Boost' },
  { id: 't26', title: 'Boost Starving', description: 'Ellenfél boost megvonása', difficulty: 'intermediate', duration: '12:00', category: 'Boost' },
  { id: 't27', title: 'Small Pad Routes', description: 'Kis boost útvonalak', difficulty: 'intermediate', duration: '14:00', category: 'Boost' },
  
  // Kickoffs
  { id: 't28', title: 'Basic Kickoff', description: 'Kickoff alapok', difficulty: 'beginner', duration: '8:00', category: 'Kickoff' },
  { id: 't29', title: 'Speed Flip Kickoff', description: 'Speed flip kickoff', difficulty: 'advanced', duration: '12:00', category: 'Kickoff' },
  { id: 't30', title: 'Fake Kickoff', description: 'Fake kickoff stratégiák', difficulty: 'intermediate', duration: '10:00', category: 'Kickoff' },
];

const CATEGORIES = Array.from(new Set(TUTORIALS.map(t => t.category)));

function DifficultyStars({ difficulty }: { difficulty: Difficulty }) {
  const config = DIFFICULTY_CONFIG[difficulty];
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4].map(star => (
        <FaStar 
          key={star} 
          className={`w-3 h-3 ${star <= config.stars ? 'text-yellow-400' : 'text-gray-600'}`} 
        />
      ))}
    </div>
  );
}

function TutorialCard({ tutorial, index }: { tutorial: Tutorial; index: number }) {
  const config = DIFFICULTY_CONFIG[tutorial.difficulty];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 rounded-xl border border-white/10 overflow-hidden cursor-pointer hover:border-orange-500/30 transition-all group"
    >
      {/* Thumbnail placeholder */}
      <div className="aspect-video bg-gradient-to-br from-white/5 to-white/10 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
            <FaPlay className="w-5 h-5 text-white ml-0.5" />
          </div>
        </div>
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
          {tutorial.duration}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
            {config.label}
          </span>
          <DifficultyStars difficulty={tutorial.difficulty} />
        </div>
        <h3 className="font-medium text-white mb-1">{tutorial.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-1">{tutorial.description}</p>
      </div>
    </motion.div>
  );
}

export default function TutorialsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  const filteredTutorials = useMemo(() => {
    return TUTORIALS.filter(tutorial => {
      const matchesSearch = search === '' || 
        tutorial.title.toLowerCase().includes(search.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = !selectedCategory || tutorial.category === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || tutorial.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [search, selectedCategory, selectedDifficulty]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaVideo className="text-orange-500" />
          Tutoriálok
        </h1>
        <p className="text-gray-400 mt-1">Tanulj specifikus mechanikákat és technikákat</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Keress tutoriált..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
          />
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <FaFilter className="text-gray-500" />
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                !selectedCategory
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Mind
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Nehézség:</span>
            {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedDifficulty === diff
                    ? DIFFICULTY_CONFIG[diff].color.replace('/10', '')
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {DIFFICULTY_CONFIG[diff].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-gray-400 text-sm">
        {filteredTutorials.length} tutoriál találva
      </p>

      {/* Tutorials Grid */}
      {filteredTutorials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTutorials.map((tutorial, index) => (
            <TutorialCard key={tutorial.id} tutorial={tutorial} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
          <FaVideo className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">Nincs találat</h3>
          <p className="text-gray-500">Próbálj más keresési feltételeket!</p>
        </div>
      )}
    </div>
  );
}
