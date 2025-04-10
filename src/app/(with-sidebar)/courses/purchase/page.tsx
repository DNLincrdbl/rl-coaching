'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaClock, FaBook, FaChartLine, FaChevronDown } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';

const ranks = [
  {
    id: 'ssl',
    name: 'Supersonic Legend',
    icon: '🏆',
    color: 'from-yellow-500 to-yellow-600',
    borderColor: 'border-yellow-500/20',
    hoverBorderColor: 'hover:border-yellow-500/40',
    iconColor: 'text-yellow-500',
    buttonGradient: 'from-yellow-500 to-yellow-600',
    glowColor: 'shadow-yellow-500/20',
    price: '150,000 Ft',
    description: 'A legmagasabb szintű coaching szolgáltatás',
    features: [
      {
        icon: FaTrophy,
        title: 'Profi Coaching',
        description: 'Napi 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Flexibilis Időpontok',
        description: '24/7 elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Egyedi Tanterv',
        description: 'Személyre szabott fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Részletes statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'gc3',
    name: 'Grand Champion III',
    icon: '🏆',
    color: 'from-red-600 to-red-800',
    borderColor: 'border-red-500/20',
    hoverBorderColor: 'hover:border-red-500/40',
    iconColor: 'text-red-500',
    buttonGradient: 'from-red-600 to-red-800',
    glowColor: 'shadow-red-500/20',
    price: '120,000 Ft',
    description: 'Haladó szintű coaching a Grand Champion III-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Haladó Coaching',
        description: 'Heti 3 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'gc2',
    name: 'Grand Champion II',
    icon: '🏆',
    color: 'from-red-500 to-red-700',
    borderColor: 'border-red-500/20',
    hoverBorderColor: 'hover:border-red-500/40',
    iconColor: 'text-red-500',
    buttonGradient: 'from-red-500 to-red-700',
    glowColor: 'shadow-red-500/20',
    price: '100,000 Ft',
    description: 'Haladó szintű coaching a Grand Champion II-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Haladó Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'gc1',
    name: 'Grand Champion I',
    icon: '🏆',
    color: 'from-red-400 to-red-600',
    borderColor: 'border-red-500/20',
    hoverBorderColor: 'hover:border-red-500/40',
    iconColor: 'text-red-500',
    buttonGradient: 'from-red-400 to-red-600',
    glowColor: 'shadow-red-500/20',
    price: '80,000 Ft',
    description: 'Haladó szintű coaching a Grand Champion I-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Haladó Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'c3',
    name: 'Champion III',
    icon: '🏆',
    color: 'from-blue-600 to-blue-800',
    borderColor: 'border-blue-500/20',
    hoverBorderColor: 'hover:border-blue-500/40',
    iconColor: 'text-blue-500',
    buttonGradient: 'from-blue-600 to-blue-800',
    glowColor: 'shadow-blue-500/20',
    price: '70,000 Ft',
    description: 'Középszintű coaching a Champion III-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Középszintű Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'c2',
    name: 'Champion II',
    icon: '🏆',
    color: 'from-blue-500 to-blue-700',
    borderColor: 'border-blue-500/20',
    hoverBorderColor: 'hover:border-blue-500/40',
    iconColor: 'text-blue-500',
    buttonGradient: 'from-blue-500 to-blue-700',
    glowColor: 'shadow-blue-500/20',
    price: '60,000 Ft',
    description: 'Középszintű coaching a Champion II-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Középszintű Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'c1',
    name: 'Champion I',
    icon: '🏆',
    color: 'from-blue-400 to-blue-600',
    borderColor: 'border-blue-500/20',
    hoverBorderColor: 'hover:border-blue-500/40',
    iconColor: 'text-blue-500',
    buttonGradient: 'from-blue-400 to-blue-600',
    glowColor: 'shadow-blue-500/20',
    price: '50,000 Ft',
    description: 'Középszintű coaching a Champion I-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Középszintű Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'd3',
    name: 'Diamond III',
    icon: '💎',
    color: 'from-purple-600 to-purple-800',
    borderColor: 'border-purple-500/20',
    hoverBorderColor: 'hover:border-purple-500/40',
    iconColor: 'text-purple-500',
    buttonGradient: 'from-purple-600 to-purple-800',
    glowColor: 'shadow-purple-500/20',
    price: '40,000 Ft',
    description: 'Kezdő szintű coaching a Diamond III-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Kezdő Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'd2',
    name: 'Diamond II',
    icon: '💎',
    color: 'from-purple-500 to-purple-700',
    borderColor: 'border-purple-500/20',
    hoverBorderColor: 'hover:border-purple-500/40',
    iconColor: 'text-purple-500',
    buttonGradient: 'from-purple-500 to-purple-700',
    glowColor: 'shadow-purple-500/20',
    price: '35,000 Ft',
    description: 'Kezdő szintű coaching a Diamond II-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Kezdő Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'd1',
    name: 'Diamond I',
    icon: '💎',
    color: 'from-purple-400 to-purple-600',
    borderColor: 'border-purple-500/20',
    hoverBorderColor: 'hover:border-purple-500/40',
    iconColor: 'text-purple-500',
    buttonGradient: 'from-purple-400 to-purple-600',
    glowColor: 'shadow-purple-500/20',
    price: '30,000 Ft',
    description: 'Kezdő szintű coaching a Diamond I-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Kezdő Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'p3',
    name: 'Platinum III',
    icon: '⭐',
    color: 'from-green-600 to-green-800',
    borderColor: 'border-green-500/20',
    hoverBorderColor: 'hover:border-green-500/40',
    iconColor: 'text-green-500',
    buttonGradient: 'from-green-600 to-green-800',
    glowColor: 'shadow-green-500/20',
    price: '25,000 Ft',
    description: 'Kezdő szintű coaching a Platinum III-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Kezdő Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'p2',
    name: 'Platinum II',
    icon: '⭐',
    color: 'from-green-500 to-green-700',
    borderColor: 'border-green-500/20',
    hoverBorderColor: 'hover:border-green-500/40',
    iconColor: 'text-green-500',
    buttonGradient: 'from-green-500 to-green-700',
    glowColor: 'shadow-green-500/20',
    price: '20,000 Ft',
    description: 'Kezdő szintű coaching a Platinum II-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Kezdő Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'p1',
    name: 'Platinum I',
    icon: '⭐',
    color: 'from-green-400 to-green-600',
    borderColor: 'border-green-500/20',
    hoverBorderColor: 'hover:border-green-500/40',
    iconColor: 'text-green-500',
    buttonGradient: 'from-green-400 to-green-600',
    glowColor: 'shadow-green-500/20',
    price: '15,000 Ft',
    description: 'Kezdő szintű coaching a Platinum I-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Kezdő Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'g3',
    name: 'Gold III',
    icon: '🌟',
    color: 'from-yellow-600 to-yellow-800',
    borderColor: 'border-yellow-500/20',
    hoverBorderColor: 'hover:border-yellow-500/40',
    iconColor: 'text-yellow-500',
    buttonGradient: 'from-yellow-600 to-yellow-800',
    glowColor: 'shadow-yellow-500/20',
    price: '12,000 Ft',
    description: 'Kezdő szintű coaching a Gold III-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Kezdő Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'g2',
    name: 'Gold II',
    icon: '🌟',
    color: 'from-yellow-500 to-yellow-700',
    borderColor: 'border-yellow-500/20',
    hoverBorderColor: 'hover:border-yellow-500/40',
    iconColor: 'text-yellow-500',
    buttonGradient: 'from-yellow-500 to-yellow-700',
    glowColor: 'shadow-yellow-500/20',
    price: '10,000 Ft',
    description: 'Kezdő szintű coaching a Gold II-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Kezdő Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'g1',
    name: 'Gold I',
    icon: '🌟',
    color: 'from-yellow-400 to-yellow-600',
    borderColor: 'border-yellow-500/20',
    hoverBorderColor: 'hover:border-yellow-500/40',
    iconColor: 'text-yellow-500',
    buttonGradient: 'from-yellow-400 to-yellow-600',
    glowColor: 'shadow-yellow-500/20',
    price: '8,000 Ft',
    description: 'Kezdő szintű coaching a Gold I-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Kezdő Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 's3',
    name: 'Silver III',
    icon: '🥈',
    color: 'from-gray-600 to-gray-800',
    borderColor: 'border-gray-500/20',
    hoverBorderColor: 'hover:border-gray-500/40',
    iconColor: 'text-gray-500',
    buttonGradient: 'from-gray-600 to-gray-800',
    glowColor: 'shadow-gray-500/20',
    price: '6,000 Ft',
    description: 'Kezdő szintű coaching a Silver III-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Kezdő Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 's2',
    name: 'Silver II',
    icon: '🥈',
    color: 'from-gray-500 to-gray-700',
    borderColor: 'border-gray-500/20',
    hoverBorderColor: 'hover:border-gray-500/40',
    iconColor: 'text-gray-500',
    buttonGradient: 'from-gray-500 to-gray-700',
    glowColor: 'shadow-gray-500/20',
    price: '5,000 Ft',
    description: 'Kezdő szintű coaching a Silver II-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Kezdő Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 's1',
    name: 'Silver I',
    icon: '🥈',
    color: 'from-gray-400 to-gray-600',
    borderColor: 'border-gray-500/20',
    hoverBorderColor: 'hover:border-gray-500/40',
    iconColor: 'text-gray-500',
    buttonGradient: 'from-gray-400 to-gray-600',
    glowColor: 'shadow-gray-500/20',
    price: '4,000 Ft',
    description: 'Kezdő szintű coaching a Silver I-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Kezdő Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'b3',
    name: 'Bronze III',
    icon: '🥉',
    color: 'from-orange-600 to-orange-800',
    borderColor: 'border-orange-500/20',
    hoverBorderColor: 'hover:border-orange-500/40',
    iconColor: 'text-orange-500',
    buttonGradient: 'from-orange-600 to-orange-800',
    glowColor: 'shadow-orange-500/20',
    price: '3,000 Ft',
    description: 'Kezdő szintű coaching a Bronze III-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Kezdő Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'b2',
    name: 'Bronze II',
    icon: '🥉',
    color: 'from-orange-500 to-orange-700',
    borderColor: 'border-orange-500/20',
    hoverBorderColor: 'hover:border-orange-500/40',
    iconColor: 'text-orange-500',
    buttonGradient: 'from-orange-500 to-orange-700',
    glowColor: 'shadow-orange-500/20',
    price: '2,500 Ft',
    description: 'Kezdő szintű coaching a Bronze II-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Kezdő Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
  {
    id: 'b1',
    name: 'Bronze I',
    icon: '🥉',
    color: 'from-orange-400 to-orange-600',
    borderColor: 'border-orange-500/20',
    hoverBorderColor: 'hover:border-orange-500/40',
    iconColor: 'text-orange-500',
    buttonGradient: 'from-orange-400 to-orange-600',
    glowColor: 'shadow-orange-500/20',
    price: '2,000 Ft',
    description: 'Kezdő szintű coaching a Bronze I-ig',
    features: [
      {
        icon: FaTrophy,
        title: 'Kezdő Coaching',
        description: 'Heti 2 óra személyes coaching',
      },
      {
        icon: FaClock,
        title: 'Rugalmas Időpontok',
        description: 'Heti 5 nap elérhetőség',
      },
      {
        icon: FaBook,
        title: 'Strukturált Tanterv',
        description: 'Részletes fejlesztési terv',
      },
      {
        icon: FaChartLine,
        title: 'Teljesítmény Követés',
        description: 'Heti statisztikák és elemzések',
      },
    ],
  },
];

export default function PurchaseCourses() {
  const [expandedRank, setExpandedRank] = useState<string | null>(null);
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const { addItem, items } = useCart();

  const filteredRanks = filter === 'all' ? ranks : ranks.filter(rank => {
    if (filter === 'beginner') {
      return ['b1', 'b2', 'b3', 's1', 's2', 's3', 'g1', 'g2', 'g3'].includes(rank.id);
    }
    if (filter === 'intermediate') {
      return ['p1', 'p2', 'p3', 'd1', 'd2', 'd3'].includes(rank.id);
    }
    if (filter === 'advanced') {
      return ['c1', 'c2', 'c3'].includes(rank.id);
    }
    if (filter === 'pro') {
      return ['gc1', 'gc2', 'gc3', 'ssl'].includes(rank.id);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0F1C] pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Kurzusok</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Válaszd ki a megfelelő kurzust a fejlődésedhez
          </p>
        </div>

        {/* Szűrők */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-[#0A0F1C]'
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            Összes
          </button>
          <button
            onClick={() => setFilter('beginner')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
              filter === 'beginner'
                ? 'bg-white text-[#0A0F1C]'
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            Kezdő
          </button>
          <button
            onClick={() => setFilter('intermediate')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
              filter === 'intermediate'
                ? 'bg-white text-[#0A0F1C]'
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            Középszintű
          </button>
          <button
            onClick={() => setFilter('advanced')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
              filter === 'advanced'
                ? 'bg-white text-[#0A0F1C]'
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            Haladó
          </button>
          <button
            onClick={() => setFilter('pro')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
              filter === 'pro'
                ? 'bg-white text-[#0A0F1C]'
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            Pro
          </button>
        </div>

        {/* Rank kártyák */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRanks.map((rank) => (
            <motion.div
              key={rank.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white/5 rounded-2xl p-6 border ${rank.borderColor} hover:${rank.hoverBorderColor} transition-colors`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${rank.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {rank.icon}
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${rank.iconColor}`}>
                    {rank.name}
                  </h3>
                  <p className="text-gray-400">{rank.description}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {rank.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <feature.icon className={`w-5 h-5 ${rank.iconColor}`} />
                    <div>
                      <p className="text-white font-medium">{feature.title}</p>
                      <p className="text-sm text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-white">{rank.price}</span>
                  <button
                    onClick={() => setExpandedRank(expandedRank === rank.id ? null : rank.id)}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <FaChevronDown className={`w-5 h-5 transition-transform ${expandedRank === rank.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <AnimatePresence>
                  {expandedRank === rank.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4">
                        <p className="text-gray-400">
                          A kurzus tartalma:
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-gray-300">
                            <span className="w-2 h-2 bg-white/20 rounded-full" />
                            Személyes coaching órák
                          </li>
                          <li className="flex items-center gap-2 text-gray-300">
                            <span className="w-2 h-2 bg-white/20 rounded-full" />
                            Replay elemzések
                          </li>
                          <li className="flex items-center gap-2 text-gray-300">
                            <span className="w-2 h-2 bg-white/20 rounded-full" />
                            Mechanikai gyakorlatok
                          </li>
                          <li className="flex items-center gap-2 text-gray-300">
                            <span className="w-2 h-2 bg-white/20 rounded-full" />
                            Stratégiai elemzések
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const isInCart = items.some(item => item.rank === rank.name);
                    if (!isInCart) {
                      addItem({
                        id: rank.id,
                        name: rank.name,
                        price: rank.price,
                        rank: rank.name,
                        features: rank.features.map(f => f.title)
                      });
                    }
                  }}
                  className={`w-full mt-8 py-4 bg-gradient-to-r cursor-pointer ${
                    items.some(item => item.rank === rank.name)
                      ? 'from-green-500 to-green-600'
                      : rank.buttonGradient
                  } rounded-xl font-medium text-white hover:shadow-lg hover:${
                    items.some(item => item.rank === rank.name)
                      ? 'shadow-green-500/20'
                      : rank.glowColor
                  } transition-all`}
                >
                  {items.some(item => item.rank === rank.name)
                    ? 'A kosárban'
                    : 'Kosárba rakom'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 