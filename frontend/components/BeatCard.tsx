'use client';
import { Play, Pause, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { Beat } from '@/lib/api';
import { usePlayerStore, useCartStore } from '@/lib/store';
import { incrementPlay } from '@/lib/api';

interface Props {
  beat: Beat;
}

export default function BeatCard({ beat }: Props) {
  const { currentTrack, isPlaying, play, pause, resume } = usePlayerStore();
  const addItem = useCartStore((s) => s.addItem);

  const isCurrentTrack = currentTrack?.id === beat.id;
  const isActive = isCurrentTrack && isPlaying;

  const handlePlay = () => {
    if (isCurrentTrack) {
      isPlaying ? pause() : resume();
    } else {
      incrementPlay(beat.id).catch(() => {});
      play({
        id: beat.id,
        title: beat.title,
        producerName: beat.producer.name,
        coverUrl: beat.cover_url || null,
        previewUrl: beat.preview_url,
        genre: beat.genre,
        bpm: beat.bpm,
      });
    }
  };

  const cheapestLicense = beat.licenses?.filter((l) => l.is_available).sort((a, b) => a.price - b.price)[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cheapestLicense) return;
    addItem({
      beatId: beat.id,
      licenseId: cheapestLicense.id,
      beatTitle: beat.title,
      producerName: beat.producer.name,
      coverUrl: beat.cover_url || null,
      licenseType: cheapestLicense.type,
      price: cheapestLicense.price,
    });
  };

  return (
    <div
      className={`group rounded-xl overflow-hidden bg-[#1A1A1A] border transition-all cursor-pointer
        ${isCurrentTrack ? 'border-purple-500' : 'border-[#333] hover:border-[#555]'}
        hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40`}
      onClick={handlePlay}
    >
      {/* Cover */}
      <div className="relative aspect-square bg-[#111]">
        {beat.cover_url ? (
          <Image
            src={`http://localhost:4000${beat.cover_url}`}
            alt={beat.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-purple-950">
            <span className="text-4xl">🎵</span>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center shadow-lg">
            {isActive
              ? <Pause size={20} fill="white" className="text-white" />
              : <Play size={20} fill="white" className="text-white ml-0.5" />
            }
          </div>
        </div>

        {/* Sold out badge */}
        {beat.is_sold_out && (
          <div className="absolute top-2 right-2 bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded">
            Sold Out
          </div>
        )}

        {/* Now playing indicator */}
        {isCurrentTrack && (
          <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Playing
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-white truncate text-sm">{beat.title}</h3>
        <p className="text-xs text-gray-400 truncate mt-0.5">{beat.producer.name}</p>

        <div className="flex flex-wrap gap-1 mt-2">
          {beat.genre && (
            <span className="text-xs bg-[#2a2a2a] text-gray-300 px-1.5 py-0.5 rounded">{beat.genre}</span>
          )}
          {beat.bpm && (
            <span className="text-xs bg-[#2a2a2a] text-gray-300 px-1.5 py-0.5 rounded">{beat.bpm} BPM</span>
          )}
          {beat.key && (
            <span className="text-xs bg-[#2a2a2a] text-gray-300 px-1.5 py-0.5 rounded">{beat.key}</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          {cheapestLicense ? (
            <span className="text-purple-400 font-bold text-sm">
              NT${cheapestLicense.price.toLocaleString()}
            </span>
          ) : (
            <span className="text-gray-500 text-sm">免費展示</span>
          )}

          {cheapestLicense && !beat.is_sold_out && (
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1 text-xs bg-purple-700 hover:bg-purple-600 text-white px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <ShoppingCart size={12} />
              加入購物車
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
