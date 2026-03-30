'use client';
import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X, LayoutGrid, List } from 'lucide-react';
import { getBeats, Beat } from '@/lib/api';
import BeatCard from '@/components/BeatCard';
import AudioPlayer from '@/components/AudioPlayer';

const GENRES = ['Trap', 'R&B', 'Pop', 'Hip-Hop', 'Lo-fi', 'Drill', 'Afrobeats', 'C-Pop', 'EDM', 'House', 'Jazz'];
const MOODS = ['Dark', 'Chill', 'Aggressive', 'Happy', 'Romantic', 'Melancholic', 'Motivational', 'Energetic', 'Sad'];

type ViewMode = 'grid' | 'list';

export default function BeatsPage() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<ViewMode>('grid');

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
      <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-5">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="text-2xl font-black text-white">伴奏市集</h1>
              <p className="text-sm mt-0.5" style={{ color: '#8888aa' }}>
                {total > 0 ? `共 ${total} 首伴奏` : '探索所有伴奏'}
              </p>
            </div>
            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={() => setView('grid')}
                className="p-2 rounded-lg transition-all"
                style={{ background: view === 'grid' ? 'rgba(124,58,237,0.4)' : 'transparent', color: view === 'grid' ? '#a78bfa' : '#555' }}>
                <LayoutGrid size={15} />
              </button>
              <button onClick={() => setView('list')}
                className="p-2 rounded-lg transition-all"
                style={{ background: view === 'list' ? 'rgba(124,58,237,0.4)' : 'transparent', color: view === 'list' ? '#a78bfa' : '#555' }}>
                <List size={15} />
              </button>
            </div>
          </div>

          {/* Search + filter bar */}
          <div className="flex gap-2">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#666' }} />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="搜尋標題、製作人..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
              <button type="submit"
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'rgba(124,58,237,0.7)', border: '1px solid rgba(124,58,237,0.4)' }}>
                搜尋
              </button>
            </form>

            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: showFilters ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                border: showFilters ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color: showFilters ? '#a78bfa' : '#888',
              }}>
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">篩選</span>
              {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
            </button>

            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#aaa' }}>
              <option value="newest">最新</option>
              <option value="plays">最熱門</option>
              <option value="price_asc">價格↑</option>
              <option value="price_desc">價格↓</option>
            </select>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-3 p-4 rounded-2xl space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs mb-2 font-medium" style={{ color: '#8888aa' }}>曲風</p>
                  <div className="flex flex-wrap gap-1.5">
                    {GENRES.map((g) => (
                      <button key={g} onClick={() => setGenre(genre === g ? '' : g)}
                        className="text-xs px-2.5 py-1 rounded-lg transition-all"
                        style={{
                          background: genre === g ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.05)',
                          color: genre === g ? '#a78bfa' : '#888',
                          border: genre === g ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
                        }}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs mb-2 font-medium" style={{ color: '#8888aa' }}>情緒</p>
                  <div className="flex flex-wrap gap-1.5">
                    {MOODS.map((m) => (
                      <button key={m} onClick={() => setMood(mood === m ? '' : m)}
                        className="text-xs px-2.5 py-1 rounded-lg transition-all"
                        style={{
                          background: mood === m ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.05)',
                          color: mood === m ? '#a78bfa' : '#888',
                          border: mood === m ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
                        }}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs mb-2 font-medium" style={{ color: '#8888aa' }}>BPM</p>
                  <div className="flex gap-2 items-center">
                    <input type="number" value={bpmMin} onChange={(e) => setBpmMin(e.target.value)}
                      placeholder="最低" min={40} max={300}
                      className="w-full px-2.5 py-2 rounded-lg text-white text-xs focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <span style={{ color: '#555' }}>—</span>
                    <input type="number" value={bpmMax} onChange={(e) => setBpmMax(e.target.value)}
                      placeholder="最高" min={40} max={300}
                      className="w-full px-2.5 py-2 rounded-lg text-white text-xs focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                  </div>
                </div>
                <div>
                  <p className="text-xs mb-2 font-medium" style={{ color: '#8888aa' }}>價格 (NT$)</p>
                  <div className="flex gap-2 items-center">
                    <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="最低"
                      className="w-full px-2.5 py-2 rounded-lg text-white text-xs focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <span style={{ color: '#555' }}>—</span>
                    <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="最高"
                      className="w-full px-2.5 py-2 rounded-lg text-white text-xs focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                  </div>
                </div>
              </div>
              {hasFilters && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: '#f87171' }}>
                  <X size={12} /> 清除所有篩選
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Beat content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl animate-pulse" style={{ background: '#13131e' }} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#13131e' }} />
              ))}
            </div>
          )
        ) : beats.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-4xl mb-4">🎵</div>
            <p className="text-white font-semibold">沒有找到符合條件的伴奏</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-3 text-sm text-purple-400 hover:underline">
                清除篩選
              </button>
            )}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {beats.map((beat) => <BeatCard key={beat.id} beat={beat} view="grid" />)}
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* List header */}
            <div className="hidden md:grid grid-cols-[44px_16px_1fr_100px_80px_48px_120px] gap-3 px-4 pb-2 text-xs font-medium" style={{ color: '#555' }}>
              <span />
              <span />
              <span>標題</span>
              <span>曲風</span>
              <span className="text-right">BPM</span>
              <span className="text-center">Key</span>
              <span className="text-right">價格</span>
            </div>
            {beats.map((beat) => <BeatCard key={beat.id} beat={beat} view="list" />)}
          </div>
        )}
      </div>

      <AudioPlayer />
    </div>
  );
}
