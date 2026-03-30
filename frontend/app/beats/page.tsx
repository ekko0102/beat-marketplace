'use client';
import { useEffect, useState } from 'react';
import { Search, LayoutGrid, List, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getBeats, Beat } from '@/lib/api';
import BeatCard from '@/components/BeatCard';
import AudioPlayer from '@/components/AudioPlayer';

const GENRES = ['Trap', 'R&B', 'Pop', 'Hip-Hop', 'Lo-fi', 'Drill', 'Afrobeats', 'EDM', 'House', 'Jazz'];
const MOODS  = ['Dark', 'Chill', 'Aggressive', 'Happy', 'Romantic', 'Melancholic', 'Motivational', 'Energetic'];
const SORTS  = [
  { value: 'newest',     label: '最新上架' },
  { value: 'plays',      label: '最多播放' },
  { value: 'price_asc',  label: '價格由低到高' },
  { value: 'price_desc', label: '價格由高到低' },
];

type ViewMode = 'grid' | 'list';

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-sm font-semibold text-white">
        {title}
        {open ? <ChevronUp size={14} style={{ color: '#555' }} /> : <ChevronDown size={14} style={{ color: '#555' }} />}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

export default function BeatsPage() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('list');
  const [q, setQ] = useState('');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [bpmMin, setBpmMin] = useState('');
  const [bpmMax, setBpmMax] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sort, setSort] = useState('newest');

  const fetch = async (overrides?: Record<string, string>) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { sort, ...overrides };
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
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [genre, mood, sort]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetch(); };
  const clearAll = () => { setGenre(''); setMood(''); setBpmMin(''); setBpmMax(''); setPriceMin(''); setPriceMax(''); setQ(''); };
  const hasFilters = genre || mood || bpmMin || bpmMax || priceMin || priceMax || q;

  return (
    <div className="pt-16 min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Left Sidebar ──────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto"
        style={{ borderRight: '1px solid rgba(255,255,255,0.05)', background: 'var(--bg-secondary)' }}>
        <div className="p-4 space-y-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8888aa' }}>篩選條件</span>
            {hasFilters && (
              <button onClick={clearAll} className="text-xs flex items-center gap-1 transition-colors hover:text-white" style={{ color: '#f87171' }}>
                <X size={10} /> 清除
              </button>
            )}
          </div>

          <FilterSection title="排序">
            <div className="space-y-1">
              {SORTS.map((s) => (
                <button key={s.value} onClick={() => setSort(s.value)}
                  className="w-full text-left text-sm px-2.5 py-2 rounded-lg transition-all"
                  style={{
                    background: sort === s.value ? 'rgba(124,58,237,0.2)' : 'transparent',
                    color: sort === s.value ? '#a78bfa' : '#8888aa',
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="曲風">
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((g) => (
                <button key={g} onClick={() => setGenre(genre === g ? '' : g)}
                  className="text-xs px-2.5 py-1 rounded-md transition-all"
                  style={{
                    background: genre === g ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
                    color: genre === g ? '#a78bfa' : '#8888aa',
                    border: genre === g ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
                  }}>
                  {g}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="情緒" defaultOpen={false}>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <button key={m} onClick={() => setMood(mood === m ? '' : m)}
                  className="text-xs px-2.5 py-1 rounded-md transition-all"
                  style={{
                    background: mood === m ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
                    color: mood === m ? '#a78bfa' : '#8888aa',
                    border: mood === m ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
                  }}>
                  {m}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="BPM" defaultOpen={false}>
            <div className="flex gap-2 items-center">
              <input type="number" value={bpmMin} onChange={(e) => setBpmMin(e.target.value)}
                placeholder="最低" min={40} max={300}
                className="w-full px-2.5 py-2 rounded-lg text-white text-xs focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <span style={{ color: '#444' }}>—</span>
              <input type="number" value={bpmMax} onChange={(e) => setBpmMax(e.target.value)}
                placeholder="最高" min={40} max={300}
                className="w-full px-2.5 py-2 rounded-lg text-white text-xs focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
            <button onClick={() => fetch()} className="mt-2 w-full text-xs py-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#888' }}>套用</button>
          </FilterSection>

          <FilterSection title="價格 (NT$)" defaultOpen={false}>
            <div className="flex gap-2 items-center">
              <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)}
                placeholder="最低"
                className="w-full px-2.5 py-2 rounded-lg text-white text-xs focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <span style={{ color: '#444' }}>—</span>
              <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
                placeholder="最高"
                className="w-full px-2.5 py-2 rounded-lg text-white text-xs focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
            <button onClick={() => fetch()} className="mt-2 w-full text-xs py-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#888' }}>套用</button>
          </FilterSection>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="sticky top-16 z-30 px-4 py-3 flex items-center gap-3"
          style={{ background: 'rgba(5,5,8,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex">
            <div className="relative flex-1 max-w-sm">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#555' }} />
              <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="搜尋伴奏、製作人..."
                className="w-full pl-8 pr-3 py-2 rounded-lg text-white text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }} />
            </div>
          </form>

          {/* Stats */}
          <span className="hidden sm:block text-sm shrink-0" style={{ color: '#8888aa' }}>
            {loading ? '…' : `${total} 首`}
          </span>

          {/* Mobile filters button */}
          <button className="lg:hidden text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: '#888' }}>
            篩選
          </button>

          {/* View toggle */}
          <div className="flex items-center rounded-lg overflow-hidden shrink-0"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <button onClick={() => setView('list')}
              className="px-2.5 py-1.5 transition-all"
              style={{ background: view === 'list' ? 'rgba(124,58,237,0.35)' : 'transparent', color: view === 'list' ? '#a78bfa' : '#555' }}>
              <List size={14} />
            </button>
            <button onClick={() => setView('grid')}
              className="px-2.5 py-1.5 transition-all"
              style={{ background: view === 'grid' ? 'rgba(124,58,237,0.35)' : 'transparent', color: view === 'grid' ? '#a78bfa' : '#555' }}>
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>

        {/* Beat list / grid */}
        <div className="p-4">
          {loading ? (
            view === 'list' ? (
              <div className="space-y-1.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: '#0f0f16' }} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl animate-pulse" style={{ background: '#0f0f16' }} />
                ))}
              </div>
            )
          ) : beats.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-4">🎵</p>
              <p className="text-white font-semibold">沒有找到伴奏</p>
              {hasFilters && <button onClick={clearAll} className="mt-3 text-sm text-purple-400 hover:underline">清除篩選</button>}
            </div>
          ) : view === 'list' ? (
            <div className="space-y-1">
              {beats.map((beat, i) => <BeatCard key={beat.id} beat={beat} view="list" index={i + 1} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {beats.map((beat) => <BeatCard key={beat.id} beat={beat} view="grid" />)}
            </div>
          )}
        </div>
      </div>

      <AudioPlayer />
    </div>
  );
}
