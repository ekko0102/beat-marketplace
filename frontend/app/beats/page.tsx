'use client';
import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { getBeats, Beat } from '@/lib/api';
import BeatCard from '@/components/BeatCard';

const GENRES = ['Trap', 'R&B', 'Pop', 'Hip-Hop', 'Lo-fi', 'Drill', 'Afrobeats', 'C-Pop', 'K-Pop', 'EDM', 'House', 'Jazz'];
const MOODS = ['Dark', 'Chill', 'Aggressive', 'Happy', 'Romantic', 'Melancholic', 'Motivational', 'Dreamy', 'Energetic', 'Sad'];

export default function BeatsPage() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [q, setQ] = useState('');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [bpmMin, setBpmMin] = useState('');
  const [bpmMax, setBpmMax] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchBeats = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { sort };
      if (q) params.q = q;
      if (genre) params.genre = genre;
      if (mood) params.mood = mood;
      if (bpmMin) params.bpm_min = bpmMin;
      if (bpmMax) params.bpm_max = bpmMax;
      if (priceMin) params.price_min = priceMin;
      if (priceMax) params.price_max = priceMax;

      const data = await getBeats(params);
      setBeats(data.beats);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBeats(); }, [genre, mood, sort]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchBeats(); };
  const clearFilters = () => { setGenre(''); setMood(''); setBpmMin(''); setBpmMax(''); setPriceMin(''); setPriceMax(''); setQ(''); };
  const hasFilters = genre || mood || bpmMin || bpmMax || priceMin || priceMax || q;

  return (
    <div className="pt-16 min-h-screen" style={{ background: '#080810' }}>
      {/* Header */}
      <div className="border-b px-4 py-6" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">伴奏市集</h1>
          <div className="flex gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="搜尋標題、標籤、製作人..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <button type="submit" className="px-4 py-2.5 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors">
                搜尋
              </button>
            </form>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: showFilters ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
                border: showFilters ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.1)',
                color: showFilters ? '#a78bfa' : '#aaa',
              }}
            >
              <SlidersHorizontal size={16} /> 篩選
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc' }}
            >
              <option value="newest">最新上架</option>
              <option value="plays">最多播放</option>
              <option value="price_asc">價格低到高</option>
              <option value="price_desc">價格高到低</option>
            </select>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-4 p-4 rounded-2xl space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Genre */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">曲風</label>
                  <div className="flex flex-wrap gap-1.5">
                    {GENRES.map((g) => (
                      <button key={g} onClick={() => setGenre(genre === g ? '' : g)}
                        className={`text-xs px-2 py-1 rounded-md transition-colors ${genre === g ? 'bg-purple-600 text-white' : 'bg-[#333] text-gray-300 hover:bg-[#444]'}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">情緒</label>
                  <div className="flex flex-wrap gap-1.5">
                    {MOODS.map((m) => (
                      <button key={m} onClick={() => setMood(mood === m ? '' : m)}
                        className={`text-xs px-2 py-1 rounded-md transition-colors ${mood === m ? 'bg-purple-600 text-white' : 'bg-[#333] text-gray-300 hover:bg-[#444]'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BPM */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">BPM 範圍</label>
                  <div className="flex gap-2 items-center">
                    <input type="number" value={bpmMin} onChange={(e) => setBpmMin(e.target.value)} placeholder="最低" min={40} max={300}
                      className="w-full px-2 py-1.5 bg-[#333] border border-[#444] rounded text-white text-sm focus:outline-none focus:border-purple-500" />
                    <span className="text-gray-500">~</span>
                    <input type="number" value={bpmMax} onChange={(e) => setBpmMax(e.target.value)} placeholder="最高" min={40} max={300}
                      className="w-full px-2 py-1.5 bg-[#333] border border-[#444] rounded text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">價格 (NT$)</label>
                  <div className="flex gap-2 items-center">
                    <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="最低"
                      className="w-full px-2 py-1.5 bg-[#333] border border-[#444] rounded text-white text-sm focus:outline-none focus:border-purple-500" />
                    <span className="text-gray-500">~</span>
                    <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="最高"
                      className="w-full px-2 py-1.5 bg-[#333] border border-[#444] rounded text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">共 {total} 個結果</span>
                {hasFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                    <X size={12} /> 清除篩選
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Beat Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-[#1A1A1A] animate-pulse" />
            ))}
          </div>
        ) : beats.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">🎵</p>
            <p>沒有找到符合條件的伴奏</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {beats.map((beat) => <BeatCard key={beat.id} beat={beat} />)}
          </div>
        )}
      </div>
    </div>
  );
}
