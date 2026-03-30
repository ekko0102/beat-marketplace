'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Music, Image as ImageIcon, Plus, Trash2, Check, AlertCircle, LogOut } from 'lucide-react';
import { api, getBeats, Beat } from '@/lib/api';

const GENRES = ['Trap', 'R&B', 'Pop', 'Hip-Hop', 'Lo-fi', 'Drill', 'Afrobeats', 'EDM', 'House', 'Jazz'];
const MOODS = ['Dark', 'Chill', 'Aggressive', 'Happy', 'Romantic', 'Melancholic', 'Motivational', 'Energetic'];
const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm'];

interface LicenseInput { type: 'basic' | 'premium' | 'exclusive'; price: string; }

const defaultLicenses: LicenseInput[] = [
  { type: 'basic', price: '800' },
  { type: 'premium', price: '1500' },
  { type: 'exclusive', price: '5000' },
];

const LICENSE_INFO = {
  basic:     { label: 'Basic', desc: 'MP3 + 有限發行', color: '#60a5fa' },
  premium:   { label: 'Premium', desc: 'WAV + MP3 + 無限發行', color: '#a78bfa' },
  exclusive: { label: 'Exclusive', desc: '所有格式 + 獨家買斷', color: '#fbbf24' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [producerName, setProducerName] = useState('');
  const [myBeats, setMyBeats] = useState<Beat[]>([]);
  const [tab, setTab] = useState<'beats' | 'upload'>('beats');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [type, setType] = useState<'beat' | 'showcase'>('beat');
  const [licenses, setLicenses] = useState<LicenseInput[]>(defaultLicenses);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    const name = localStorage.getItem('producerName');
    if (name) setProducerName(name);

    // Fetch producer's beats
    const producerId = localStorage.getItem('producerId');
    if (producerId) {
      getBeats({ producer_id: producerId, limit: 50 }).then((d) => setMyBeats(d.beats)).catch(() => {});
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('producerName');
    localStorage.removeItem('producerId');
    router.push('/');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) { setError('請選擇音訊檔案'); return; }
    if (!title.trim()) { setError('請填寫標題'); return; }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('preview', audioFile);
    if (coverFile) formData.append('cover', coverFile);
    formData.append('title', title);
    formData.append('type', type);
    if (genre) formData.append('genre', genre);
    if (mood) formData.append('mood', mood);
    if (bpm) formData.append('bpm', bpm);
    if (key) formData.append('key', key);
    if (type === 'beat') {
      formData.append('licenses', JSON.stringify(
        licenses.filter(l => l.price).map(l => ({
          type: l.type,
          price: parseInt(l.price),
          file_formats: l.type === 'basic' ? ['MP3'] : l.type === 'premium' ? ['WAV', 'MP3'] : ['WAV', 'MP3', 'Stems'],
        }))
      ));
    }

    try {
      await api.post('/beats', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
      setTitle(''); setGenre(''); setMood(''); setBpm(''); setKey('');
      setAudioFile(null); setCoverFile(null);
      setLicenses(defaultLicenses);
      if (audioRef.current) audioRef.current.value = '';
      if (coverRef.current) coverRef.current.value = '';
      setTimeout(() => { setSuccess(false); setTab('beats'); }, 2000);

      const producerId = localStorage.getItem('producerId');
      if (producerId) getBeats({ producer_id: producerId, limit: 50 }).then((d) => setMyBeats(d.beats));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || '上傳失敗，請再試一次');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen" style={{ background: '#080810' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">製作人後台</h1>
            {producerName && <p className="text-sm mt-0.5" style={{ color: '#8888aa' }}>歡迎回來，{producerName}</p>}
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#8888aa', border: '1px solid rgba(255,255,255,0.08)' }}>
            <LogOut size={14} /> 登出
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-0">
          {([['beats', `我的作品 (${myBeats.length})`], ['upload', '上傳新 Beat']] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all"
              style={{
                color: tab === t ? '#fff' : '#8888aa',
                borderBottom: tab === t ? '2px solid #7c3aed' : '2px solid transparent',
                background: 'transparent',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── My Beats Tab ─────────────────── */}
        {tab === 'beats' && (
          <div>
            {myBeats.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🎵</div>
                <p className="text-white font-semibold mb-2">還沒有作品</p>
                <p className="text-sm mb-6" style={{ color: '#8888aa' }}>上傳你的第一首 Beat 開始賺錢吧！</p>
                <button onClick={() => setTab('upload')}
                  className="btn-glow inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold">
                  <Plus size={16} /> 上傳第一首 Beat
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myBeats.map((beat) => (
                  <div key={beat.id} className="rounded-2xl overflow-hidden"
                    style={{ background: 'linear-gradient(160deg,#16162a,#0f0f1a)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="aspect-video relative flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.4),#0a0a14)' }}>
                      <Music size={32} style={{ color: '#a78bfa', opacity: 0.5 }} />
                      <div className="absolute top-2 right-2">
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: beat.type === 'beat' ? 'rgba(124,58,237,0.3)' : 'rgba(16,185,129,0.3)', color: beat.type === 'beat' ? '#a78bfa' : '#34d399' }}>
                          {beat.type === 'beat' ? '販售' : '展示'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="font-bold text-white text-sm truncate">{beat.title}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: '#8888aa' }}>
                        {beat.genre && <span>{beat.genre}</span>}
                        {beat.bpm && <span>· {beat.bpm} BPM</span>}
                        <span>· {beat.play_count} 播放</span>
                      </div>
                      {beat.licenses?.length > 0 && (
                        <div className="mt-2 text-xs font-semibold" style={{ color: '#a78bfa' }}>
                          NT${Math.min(...beat.licenses.map(l => l.price)).toLocaleString()} 起
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Upload Tab ───────────────────── */}
        {tab === 'upload' && (
          <form onSubmit={handleUpload} className="max-w-2xl space-y-6">
            {success && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                <Check size={16} /> 上傳成功！
              </div>
            )}
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Type */}
            <div>
              <label className="text-sm font-medium text-white block mb-3">類型</label>
              <div className="flex gap-3">
                {(['beat', 'showcase'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: type === t ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${type === t ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      color: type === t ? '#a78bfa' : '#8888aa',
                    }}>
                    {t === 'beat' ? '🛒 販售伴奏' : '🎵 展示作品集'}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio file */}
            <div>
              <label className="text-sm font-medium text-white block mb-3">
                音訊檔案 <span style={{ color: '#f87171' }}>*</span>
              </label>
              <label className="flex flex-col items-center justify-center gap-3 py-8 rounded-2xl cursor-pointer transition-all"
                style={{
                  background: audioFile ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `2px dashed ${audioFile ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)'}`,
                }}>
                <Music size={28} style={{ color: audioFile ? '#a78bfa' : '#8888aa' }} />
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: audioFile ? '#a78bfa' : '#fff' }}>
                    {audioFile ? audioFile.name : '點擊選擇音訊檔案'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#8888aa' }}>MP3、WAV、FLAC（最大 200MB）</p>
                </div>
                <input ref={audioRef} type="file" accept="audio/*" className="hidden"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            {/* Cover image */}
            <div>
              <label className="text-sm font-medium text-white block mb-3">封面圖片（選填）</label>
              <label className="flex items-center gap-4 px-5 py-4 rounded-xl cursor-pointer transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${coverFile ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                <ImageIcon size={20} style={{ color: '#8888aa' }} />
                <span className="text-sm" style={{ color: coverFile ? '#a78bfa' : '#8888aa' }}>
                  {coverFile ? coverFile.name : '選擇封面圖（JPG、PNG）'}
                </span>
                <input ref={coverRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium text-white block mb-2">標題 <span style={{ color: '#f87171' }}>*</span></label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required
                placeholder="Beat 標題" maxLength={100}
                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            {/* Genre / Mood / BPM / Key */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white block mb-2">曲風</label>
                <select value={genre} onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: genre ? '#fff' : '#8888aa' }}>
                  <option value="">選擇曲風</option>
                  {GENRES.map(g => <option key={g} value={g} style={{ background: '#16162a' }}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-white block mb-2">情緒</label>
                <select value={mood} onChange={(e) => setMood(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: mood ? '#fff' : '#8888aa' }}>
                  <option value="">選擇情緒</option>
                  {MOODS.map(m => <option key={m} value={m} style={{ background: '#16162a' }}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-white block mb-2">BPM</label>
                <input type="number" value={bpm} onChange={(e) => setBpm(e.target.value)}
                  placeholder="例：140" min={40} max={300}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="text-sm font-medium text-white block mb-2">音調</label>
                <select value={key} onChange={(e) => setKey(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: key ? '#fff' : '#8888aa' }}>
                  <option value="">選擇音調</option>
                  {KEYS.map(k => <option key={k} value={k} style={{ background: '#16162a' }}>{k}</option>)}
                </select>
              </div>
            </div>

            {/* Licenses (only for beat type) */}
            {type === 'beat' && (
              <div>
                <label className="text-sm font-medium text-white block mb-3">授權方案定價</label>
                <div className="space-y-3">
                  {licenses.map((lic, i) => {
                    const info = LICENSE_INFO[lic.type];
                    return (
                      <div key={lic.type} className="flex items-center gap-4 px-4 py-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex-1">
                          <div className="text-sm font-semibold" style={{ color: info.color }}>{info.label}</div>
                          <div className="text-xs mt-0.5" style={{ color: '#8888aa' }}>{info.desc}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm" style={{ color: '#8888aa' }}>NT$</span>
                          <input type="number" value={lic.price}
                            onChange={(e) => { const n = [...licenses]; n[i].price = e.target.value; setLicenses(n); }}
                            className="w-24 px-3 py-2 rounded-lg text-white text-sm text-right focus:outline-none"
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                            min={0} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button type="submit" disabled={uploading}
              className="w-full btn-glow flex items-center justify-center gap-2 py-4 text-white font-bold rounded-2xl text-base disabled:opacity-50">
              {uploading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 上傳中...</>
              ) : (
                <><Upload size={18} /> 上傳 Beat</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
