'use client';

import React from 'react';
import { FaBookOpen, FaVideo, FaProjectDiagram, FaBolt, FaGift } from 'react-icons/fa';

export default function GuidePage() {
  return (
    <div className="space-y-8 rlm-fade-up max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaBookOpen className="text-orange-500" /> Útmutató
        </h1>
        <p className="text-gray-400 mt-1">Replay beküldés, aréna zoom, jutalom átvétel, heti küldetések.</p>
      </div>

      <section className="rlm-card p-6 space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FaVideo className="text-orange-400" /> Replay fájl beküldése
        </h2>
        <ol className="list-decimal list-inside text-gray-300 space-y-2 text-sm leading-relaxed">
          <li>Rocket League-ben mentsd el a replayt (Replay → Save).</li>
          <li>Exportálj egy rövid, jól látható klipet (mp4 / webm / mov, max 200 MB).</li>
          <li>A Profil oldalon kattints a „Replay beküldése elemzésre” gombra.</li>
          <li>Írd meg, mire figyeljen Zoli, és jelezd, ha Discordon is beszélnétek.</li>
          <li>Az elemzés 72 órán belül elkészül. Értesítést + emailt kapsz, ha kész a sheet.</li>
        </ol>
        <p className="text-xs text-gray-500">
          RLM+ jár havonta 1 elemzés. Extra kredit 5.990 Ft, a kreditek a fiókodon gyűlnek. Nincs naptáras élő coaching — a coaching a replay elemzés.
        </p>
      </section>

      <section className="rlm-card p-6 space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FaProjectDiagram className="text-orange-400" /> Aréna
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Kattints egy golyóra: a fa oda zoomol, a feladat a jobb oldalon jelenik meg, balra a mini térkép.
          A térképen másik node-ra nyomva oda ugrasz. Escape vagy „Teljes fa” zoomol ki.
        </p>
        <p className="text-gray-300 text-sm leading-relaxed">
          Beküldés után Zoli bírál. Elfogadás után a jutalom <strong className="text-white">nem automatikus</strong> —
          vedd át az Arénában (<FaGift className="inline text-yellow-400" />). Akkor jár az XP és a rank badge csillagokkal.
          Az előző hónap küldetései nem ismétlődnek a poolban.
        </p>
      </section>

      <section className="rlm-card p-6 space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FaBolt className="text-yellow-400" /> Heti küldetések
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Minden héten 5 küldetés. Egyet rerollolhatsz. A teljesítés XP-t ad, a speciális küldetés RLM+ extra replay kreditet is.
          Ha mind az 5 kész, bónusz XP jár.
        </p>
      </section>
    </div>
  );
}
