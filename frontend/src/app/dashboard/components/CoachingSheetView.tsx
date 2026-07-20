'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaPen,
  FaCheck,
  FaTimes,
  FaGlobe,
  FaLock,
  FaPlus,
  FaTrash,
  FaExclamationTriangle,
} from 'react-icons/fa';
import {
  CoachingSheet,
  RATING_TOPICS,
  RATING_COLOR_META,
  RatingColor,
  RatingTopicId,
  TopicRating,
  SheetTimestamp,
  formatTimestamp,
} from '@/lib/data/coaching';
import { resolveVideoUrl } from '@/lib/api';

interface Props {
  sheet: CoachingSheet;
  /** When true, shows coach editing controls. */
  editable?: boolean;
  /** Start directly in editing mode (used by the admin evaluation flow). */
  startEditing?: boolean;
  /** Label of the save button (defaults to "Mentés"). */
  saveLabel?: string;
  /** When true, hides the "Mégse" button (e.g. evaluation modal has its own close). */
  hideCancel?: boolean;
  /** When true, hides the internal header row (title/date/save) — host provides its own. */
  hideHeader?: boolean;
  /** Tailwind max-height class for the timestamps list. */
  timestampsMaxHeightClass?: string;
  /** When true, the whole view is laid out to fit its container height (no page scroll). */
  fitViewport?: boolean;
  onChange?: (sheet: CoachingSheet) => void;
  onTogglePublish?: (published: boolean) => void;
  /** Called on save when hideHeader is used (host renders the save button). */
  onSaveRef?: (save: () => void) => void;
}

const COLOR_CYCLE: RatingColor[] = ['green', 'orange', 'red'];

export default function CoachingSheetView({
  sheet,
  editable = false,
  startEditing = false,
  saveLabel = 'Mentés',
  hideCancel = false,
  hideHeader = false,
  timestampsMaxHeightClass = 'max-h-96',
  fitViewport = false,
  onChange,
  onTogglePublish,
  onSaveRef,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const noteRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTopic, setActiveTopic] = useState<RatingTopicId | null>(null);
  const [isEditing, setIsEditing] = useState(startEditing);
  const [draft, setDraft] = useState<CoachingSheet>(sheet);
  const [videoError, setVideoError] = useState(false);
  const [focusTsId, setFocusTsId] = useState<string | null>(null);

  useEffect(() => {
    setDraft(sheet);
  }, [sheet]);

  useEffect(() => {
    if (!focusTsId) return;
    const el = noteRefs.current[focusTsId];
    el?.focus();
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    setFocusTsId(null);
  }, [focusTsId]);

  const current = isEditing ? draft : sheet;

  const safePlay = () => {
    videoRef.current?.play?.().catch(() => {/* ignore autoplay/source rejections */});
  };

  const seekTo = (time: number, topic?: RatingTopicId) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      safePlay();
      setIsPlaying(true);
    }
    if (topic) setActiveTopic(topic);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else safePlay();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    videoRef.current?.requestFullscreen?.();
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  // --- Editing helpers ---
  const cycleRating = (topic: RatingTopicId) => {
    setDraft((d) => ({
      ...d,
      ratings: d.ratings.map((r) => {
        if (r.topic !== topic) return r;
        const idx = COLOR_CYCLE.indexOf(r.color as RatingColor);
        const next = COLOR_CYCLE[(idx + 1) % COLOR_CYCLE.length];
        return { ...r, color: next };
      }),
    }));
  };

  const updateRatingMistake = (topic: RatingTopicId, value: string) => {
    setDraft((d) => ({
      ...d,
      ratings: d.ratings.map((r) => (r.topic === topic ? { ...r, biggestMistake: value } : r)),
    }));
  };

  const addTimestamp = () => {
    const ts: SheetTimestamp = {
      id: `ts-${Date.now()}`,
      time: Math.floor(currentTime),
      topic: activeTopic ?? 'positioning',
      note: '',
    };
    setDraft((d) => ({ ...d, timestamps: [...d.timestamps, ts].sort((a, b) => a.time - b.time) }));
    setFocusTsId(ts.id);
  };

  const updateTimestamp = (id: string, patch: Partial<SheetTimestamp>) => {
    setDraft((d) => ({
      ...d,
      timestamps: d.timestamps.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  };

  const removeTimestamp = (id: string) => {
    setDraft((d) => ({ ...d, timestamps: d.timestamps.filter((t) => t.id !== id) }));
  };

  const saveEdits = () => {
    onChange?.(draft);
    setIsEditing(false);
  };

  useEffect(() => {
    onSaveRef?.(saveEdits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, onSaveRef]);

  const cancelEdits = () => {
    setDraft(sheet);
    setIsEditing(false);
  };

  const ratingFor = (topic: RatingTopicId): TopicRating =>
    current.ratings.find((r) => r.topic === topic) ?? { topic, color: 'neutral' };

  return (
    <div className={fitViewport ? 'h-full flex flex-col gap-4 min-h-0' : 'space-y-6'}>
      {/* Header row */}
      {!hideHeader && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {isEditing ? (
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xl font-bold text-white w-full"
            />
          ) : (
            <h2 className="text-2xl font-bold text-white">{current.title}</h2>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {new Date(current.createdAt).toLocaleDateString('hu-HU')} · {current.authorName} · {current.authorRank}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onTogglePublish && !isEditing && (
            <button
              onClick={() => onTogglePublish(!current.published)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                current.published
                  ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                  : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              {current.published ? <FaGlobe className="w-4 h-4" /> : <FaLock className="w-4 h-4" />}
              {current.published ? 'Publikálva' : 'Publikálás'}
            </button>
          )}
          {editable && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
            >
              <FaPen className="w-3.5 h-3.5" /> Szerkesztés
            </button>
          )}
          {isEditing && (
            <>
              {!hideCancel && (
                <button onClick={cancelEdits} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white/5 text-gray-300 border border-white/10">
                  <FaTimes className="w-3.5 h-3.5" /> Mégse
                </button>
              )}
              <button onClick={saveEdits} className="rlm-btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                <FaCheck className="w-3.5 h-3.5" /> {saveLabel}
              </button>
            </>
          )}
        </div>
      </div>
      )}

      <div className={fitViewport ? 'flex-1 min-h-0 flex flex-col lg:flex-row gap-6' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}>
        {/* Video + timeline */}
        <div className={fitViewport ? 'flex-1 min-h-0 flex flex-col gap-4' : 'lg:col-span-2 space-y-4'}>
          <div className={`relative rounded-2xl overflow-hidden bg-black border border-white/10 ${fitViewport ? 'flex-1 min-h-0 flex items-center justify-center' : ''}`}>
            <video
              ref={videoRef}
              src={resolveVideoUrl(current.videoUrl)}
              className={fitViewport ? 'w-full h-full object-contain' : 'w-full aspect-video'}
              onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
              onLoadedMetadata={() => { setVideoError(false); if (videoRef.current) setDuration(videoRef.current.duration); }}
              onEnded={() => setIsPlaying(false)}
              onError={() => setVideoError(true)}
              onClick={togglePlay}
            />
            {videoError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/85 text-center p-6">
                <FaExclamationTriangle className="w-8 h-8 text-orange-400" />
                <p className="text-white font-medium">A videó nem tölthető be.</p>
                <p className="text-xs text-gray-400 max-w-sm">
                  Ellenőrizd, hogy fut-e a backend, és hogy a feltöltött fájl támogatott formátumú (mp4, webm).
                </p>
              </div>
            )}
            {!isPlaying && !videoError && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="w-16 h-16 bg-orange-500/90 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <FaPlay className="w-6 h-6 text-white ml-1" />
                </span>
              </button>
            )}

            {/* Controls bar */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
              {/* Timeline with topic markers */}
              <div className="relative h-2 bg-white/20 rounded-full mb-3 group">
                <div className="absolute h-full bg-orange-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  aria-label="Videó idővonal"
                />
                {/* Markers */}
                {duration > 0 &&
                  current.timestamps.map((ts) => {
                    const color = ratingFor(ts.topic).color;
                    return (
                      <button
                        key={ts.id}
                        onClick={() => seekTo(ts.time, ts.topic)}
                        title={`${formatTimestamp(ts.time)} — ${RATING_TOPICS.find((t) => t.id === ts.topic)?.label}`}
                        className="absolute -top-1 w-1.5 h-4 rounded-full -translate-x-1/2 hover:scale-125 transition-transform"
                        style={{
                          left: `${(ts.time / duration) * 100}%`,
                          background: RATING_COLOR_META[color].hex,
                          boxShadow: `0 0 8px ${RATING_COLOR_META[color].hex}`,
                        }}
                      />
                    );
                  })}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-lg">
                    {isPlaying ? <FaPause className="w-4 h-4 text-white" /> : <FaPlay className="w-4 h-4 text-white" />}
                  </button>
                  <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-lg">
                    {isMuted ? <FaVolumeMute className="w-4 h-4 text-white" /> : <FaVolumeUp className="w-4 h-4 text-white" />}
                  </button>
                  <span className="text-xs text-white/70">
                    {formatTimestamp(currentTime)} / {formatTimestamp(duration)}
                  </span>
                </div>
                <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-lg">
                  <FaExpand className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Prominent add-comment button (editing) */}
          {isEditing && (
            <button
              onClick={addTimestamp}
              className="w-full rlm-btn-primary flex items-center justify-center gap-2 py-3 text-sm font-semibold"
            >
              <FaPlus className="w-3.5 h-3.5" />
              Megjegyzés hozzáadása ehhez az időponthoz ({formatTimestamp(currentTime)})
            </button>
          )}

          {/* Summary */}
          <div className={`rlm-card p-5 ${fitViewport ? 'flex-shrink-0' : ''}`}>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Összegzés</h3>
            {isEditing ? (
              <textarea
                value={draft.summary}
                onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                rows={fitViewport ? 2 : 3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-200"
              />
            ) : (
              <p className="text-gray-300 leading-relaxed">{current.summary}</p>
            )}
          </div>
        </div>

        {/* Ratings + timestamps */}
        <div className={fitViewport ? 'w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-4 min-h-0' : 'space-y-6'}>
          {/* Topic ratings */}
          <div className={`rlm-card p-5 ${fitViewport ? 'flex-shrink-0 overflow-y-auto rlm-scroll max-h-[45%]' : ''}`}>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Értékelés</h3>
            <div className="space-y-3">
              {RATING_TOPICS.map((topic) => {
                const rating = ratingFor(topic.id);
                const meta = RATING_COLOR_META[rating.color];
                const isActive = activeTopic === topic.id;
                return (
                  <div
                    key={topic.id}
                    className={`rounded-xl border p-3 transition-all ${
                      isActive ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/5 bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => setActiveTopic(isActive ? null : topic.id)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex-shrink-0 ${meta.css}`}
                          aria-label={meta.label}
                        />
                        <div>
                          <p className="text-white font-medium text-sm">{topic.label}</p>
                          <p className="text-xs text-gray-500">{meta.label}</p>
                        </div>
                      </button>
                      {isEditing && (
                        <button
                          onClick={() => cycleRating(topic.id)}
                          className="text-xs px-2 py-1 rounded-md bg-white/10 text-gray-300 hover:bg-white/20"
                        >
                          Szín
                        </button>
                      )}
                    </div>

                    {/* Biggest mistake for orange/red */}
                    {(rating.color === 'orange' || rating.color === 'red') && (
                      <div className="mt-2 pl-7">
                        {isEditing ? (
                          <input
                            value={rating.biggestMistake ?? ''}
                            onChange={(e) => updateRatingMistake(topic.id, e.target.value)}
                            placeholder="Legnagyobb hiba..."
                            className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-gray-200"
                          />
                        ) : (
                          rating.biggestMistake && (
                            <p className="text-xs text-gray-400 italic flex items-start gap-1.5">
                              <FaExclamationTriangle className="w-3 h-3 text-orange-400 mt-0.5 flex-shrink-0" />
                              {rating.biggestMistake}
                            </p>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timestamps */}
          <div className={`rlm-card p-5 ${fitViewport ? 'flex-1 flex flex-col min-h-0' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Kulcspillanatok</h3>
              {isEditing && (
                <button onClick={addTimestamp} className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-orange-500/20 text-orange-400">
                  <FaPlus className="w-3 h-3" /> {formatTimestamp(currentTime)}
                </button>
              )}
            </div>
            <div className={`space-y-2 overflow-y-auto rlm-scroll pr-1 ${fitViewport ? 'flex-1' : timestampsMaxHeightClass}`}>
              {current.timestamps.length === 0 && (
                <p className="text-sm text-gray-500">
                  {isEditing
                    ? 'Állítsd meg a videót egy hibánál, majd kattints a „Megjegyzés hozzáadása” gombra.'
                    : 'Nincs megjelölt pillanat.'}
                </p>
              )}
              {current.timestamps.map((ts) => {
                const topicMeta = RATING_TOPICS.find((t) => t.id === ts.topic)!;
                const color = ratingFor(ts.topic).color;
                return (
                  <motion.div
                    key={ts.id}
                    layout
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => seekTo(ts.time, ts.topic)}
                        className="flex items-center gap-2 text-sm font-mono text-orange-400 hover:text-orange-300"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: RATING_COLOR_META[color].hex }}
                        />
                        {formatTimestamp(ts.time)}
                      </button>
                      {isEditing ? (
                        <select
                          value={ts.topic}
                          onChange={(e) => updateTimestamp(ts.id, { topic: e.target.value as RatingTopicId })}
                          className="ml-auto bg-white/5 border border-white/10 rounded-md text-xs text-gray-200 px-1 py-0.5"
                        >
                          {RATING_TOPICS.map((t) => (
                            <option key={t.id} value={t.id} className="bg-[#0D1321]">{t.label}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => seekTo(ts.time, ts.topic)}
                          className="ml-auto text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 hover:bg-white/20"
                        >
                          {topicMeta.label}
                        </button>
                      )}
                      {isEditing && (
                        <button onClick={() => removeTimestamp(ts.id)} className="text-gray-500 hover:text-red-400">
                          <FaTrash className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <textarea
                        ref={(el) => { noteRefs.current[ts.id] = el; }}
                        value={ts.note}
                        onChange={(e) => updateTimestamp(ts.id, { note: e.target.value })}
                        rows={2}
                        placeholder="Mit látsz ezen a ponton? Mit csináljon másképp?"
                        className="mt-2 w-full bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-gray-200 placeholder-gray-600"
                      />
                    ) : (
                      <p className="mt-1.5 text-sm text-gray-300 leading-snug">{ts.note}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
