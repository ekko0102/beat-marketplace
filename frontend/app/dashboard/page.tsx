'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload, Music, Image as ImageIcon, Plus, Trash2, Check, AlertCircle,
  LogOut, Pencil, User, X, Camera, Link as LinkIcon,
} from 'lucide-react';
import Image from 'next/image';
import { api, getBeats, Beat, Producer, getProducer, updateProducer, uploadAvatar, deleteBeat, updateBeat } from '@/lib/api';

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

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');

function mediaUrl(url?: string | null) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [producerId, setProducerId] = useState('');
  const [producerName, setProducerName] = useState('');
  const [myBeats, setMyBeats] = useState<Beat[]>([]);
  const [tab, setTab] = useState<'beats' | 'upload' | 'profile'>('beats');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  // Upload form
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [type, setType] = useState<'beat' | 'showcase'>('beat');
  const [licenses, setLicenses] = useState<LicenseInput[]>(defaultLicenses);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Edit beat modal
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editMood, setEditMood] = useState('');
  const [editBpm, setEditBpm] = useState('');
  const [editKey, setEditKey] = useState('');
  const [editLicenses, setEditLicenses] = useState<LicenseInput[]>(defaultLicenses);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Profile
  const [profile, setProfile] = useState<Partial<Producer>>({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const refreshBeats = (pid: string) =>
    getBeats({ producer_id: pid, limit: 50 }).then((d) => setMyBeats(d.beats)).catch(() => {});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    const pid = localStorage.getItem('producerId') || '';
    const name = localStorage.getItem('producerName') || '';
    setProducerId(pid);
    setProducerName(name);
    if (pid) {
      refreshBeats(pid);
      getProducer(pid).then((p) => {
        setProfile(p);
        if (p.avatar_url) setAvatarPreview(mediaUrl(p.avatar_url));
      }).catch(() => {});
    }
  }, [router]);

  const handleLogout = () => {
    ['token', 'producerName', 'producerId'].forEach((k) => localStorage.removeItem(k));
    router.push('/');
  };

  // ── Upload ──────────────────────────────────────
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) { setError('請選擇音訊檔案'); return; }
    if (!title.trim()) { setError('請填寫標題'); return; }
    setUploading(true); setError('');

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
          type: l.type, price: parseInt(l.price),
          file_formats: l.type === 'basic' ? ['MP3'] : l.type === 'premium' ? ['WAV', 'MP3'] : ['WAV', 'MP3', 'Stems'],
        }))
      ));
    }

    try {
      await api.post('/beats', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
      setTitle(''); setGenre(''); setMood(''); setBpm(''); setKey('');
      setAudioFile(null); setCoverFile(null); setLicenses(defaultLicenses);
      if (audioRef.current) audioRef.current.value = '';
      if (coverRef.current) coverRef.current.value = '';
      setTimeout(() => { setSuccess(false); setTab('beats'); }, 1500);
      refreshBeats(producerId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || '上傳失敗，請再試一次');
    } finally {
      setUploading(false);
    }
  };

  // ── Delete beat ──────────────────────────────────
  const handleDelete = async (beatId: string, beatTitle: string) => {
    if (!confirm(`確定要刪除「${beatTitle}」？`)) return;
    try {
      await deleteBeat(beatId);
      setMyBeats((prev) => prev.filter((b) => b.id !== beatId));
    } catch {
      alert('刪除失敗');
    }
  };

  // ── Open edit modal ──────────────────────────────
  const openEdit = (beat: Beat) => {
    setEditingBeat(beat);
    setEditTitle(beat.title);
    setEditGenre(beat.genre || '');
    setEditMood(beat.mood || '');
    setEditBpm(beat.bpm?.toString() || '');
    setEditKey(beat.key || '');
    setEditCoverFile(null);
    const lics: LicenseInput[] = defaultLicenses.map((d) => {
      const found = beat.licenses?.find((l) => l.type === d.type);
      return { type: d.type, price: found ? found.price.toString() : d.price };
    });
    setEditLicenses(lics);
  };

  const handleEditSave = async () => {
    if (!editingBeat) return;
    setEditSaving(true);
    const form = new FormData();
    form.append('title', editTitle);
    if (editGenre) form.append('genre', editGenre);
    if (editMood) form.append('mood', editMood);
    if (editBpm) form.append('bpm', editBpm);
    if (editKey) form.append('key', editKey);
    if (editCoverFile) form.append('cover', editCoverFile);
    if (editingBeat.type === 'beat') {
      form.append('licenses', JSON.stringify(editLicenses.map((l) => ({ type: l.type, price: parseInt(l.price) }))));
    }
    try {
      await updateBeat(editingBeat.id, form);
      setEditingBeat(null);
      refreshBeats(producerId);
    } catch {
      alert('儲存失敗');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Profile save ─────────────────────────────────
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      if (avatarFile) {
        const res = await uploadAvatar(producerId, avatarFile);
        setProfile((p) => ({ ...p, avatar_url: res.avatar_url }));
      }
      await updateProducer(producerId, {
        name: profile.name,
        bio: profile.bio,
        genres: profile.genres,
        contact_email: profile.contact_email,
        years_experience: profile.years_experience,
        social_links: profile.social_links,
        credits: profile.credits,
      });
      setProfileSuccess(true);
      if (profile.name) { localStorage.setItem('producerName', profile.name); setProducerName(profile.name); }
      setTimeout(() => setProfileSuccess(false), 2500);
    } catch {
      alert('儲存失敗');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Social links helper
  const socialKeys = ['instagram', 'youtube', 'soundcloud', 'twitter'];
  const updateSocial = (key: string, val: string) =>
    setProfile((p) => ({ ...p, social_links: { ...(p.social_links || {}), [key]: val } }));

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

        <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-0">
          {([
            ['beats', `我的作品 (${myBeats.length})`],
            ['upload', '上傳新 Beat'],
            ['profile', '個人資料'],
          ] as const).map(([t, label]) => (
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
                      {beat.cover_url ? (
                        <Image src={mediaUrl(beat.cover_url)!} alt={beat.title} fill className="object-cover" />
                      ) : (
                        <Music size={32} style={{ color: '#a78bfa', opacity: 0.5 }} />
                      )}
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
                        <div className="mt-1 text-xs font-semibold" style={{ color: '#a78bfa' }}>
                          NT${Math.min(...beat.licenses.map(l => l.price)).toLocaleString()} 起
                        </div>
                      )}
                      {/* Edit / Delete buttons */}
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => openEdit(beat)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}>
                          <Pencil size={11} /> 編輯
                        </button>
                        <button onClick={() => handleDelete(beat.id, beat.title)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
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
                  <p className="text-xs mt-1" style={{ color: '#8888aa' }}>MP3、WAV（最大 200MB）</p>
                </div>
                <input ref={audioRef} type="file" accept="audio/*" className="hidden"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
              </label>
            </div>

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

            <div>
              <label className="text-sm font-medium text-white block mb-2">標題 <span style={{ color: '#f87171' }}>*</span></label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required
                placeholder="Beat 標題" maxLength={100}
                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                ['曲風', genre, setGenre, GENRES, '選擇曲風'],
                ['情緒', mood, setMood, MOODS, '選擇情緒'],
              ].map(([label, val, setter, opts, placeholder]) => (
                <div key={label as string}>
                  <label className="text-sm font-medium text-white block mb-2">{label as string}</label>
                  <select value={val as string} onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl text-sm focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: val ? '#fff' : '#8888aa' }}>
                    <option value="">{placeholder as string}</option>
                    {(opts as string[]).map(o => <option key={o} value={o} style={{ background: '#16162a' }}>{o}</option>)}
                  </select>
                </div>
              ))}
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
              {uploading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 上傳中...</>
                : <><Upload size={18} /> 上傳 Beat</>}
            </button>
          </form>
        )}

        {/* ── Profile Tab ──────────────────── */}
        {tab === 'profile' && (
          <form onSubmit={handleProfileSave} className="max-w-2xl space-y-6">
            {profileSuccess && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                <Check size={16} /> 資料已儲存！
              </div>
            )}

            {/* Avatar */}
            <div>
              <label className="text-sm font-medium text-white block mb-3">大頭照</label>
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                    {avatarPreview ? (
                      <Image src={avatarPreview} alt="avatar" width={80} height={80} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">
                        {producerName[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                    style={{ background: '#7c3aed' }}>
                    <Camera size={12} className="text-white" />
                    <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{producerName}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#8888aa' }}>點擊相機圖示更換照片</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-white block mb-2">製作人名稱</label>
              <input value={profile.name || ''} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="你的藝名" maxLength={100}
                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            {/* Bio */}
            <div>
              <label className="text-sm font-medium text-white block mb-2">自我介紹</label>
              <textarea value={profile.bio || ''} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                placeholder="介紹自己的風格、背景、創作理念…" rows={4} maxLength={500}
                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            {/* Genres */}
            <div>
              <label className="text-sm font-medium text-white block mb-3">擅長曲風</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => {
                  const selected = profile.genres?.includes(g);
                  return (
                    <button key={g} type="button"
                      onClick={() => setProfile((p) => ({
                        ...p,
                        genres: selected
                          ? (p.genres || []).filter((x) => x !== g)
                          : [...(p.genres || []), g],
                      }))}
                      className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                      style={{
                        background: selected ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${selected ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.1)'}`,
                        color: selected ? '#a78bfa' : '#8888aa',
                      }}>
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact email */}
            <div>
              <label className="text-sm font-medium text-white block mb-2">聯絡 Email（公開顯示）</label>
              <input value={profile.contact_email || ''} onChange={(e) => setProfile((p) => ({ ...p, contact_email: e.target.value }))}
                type="email" placeholder="合作詢問用的 Email（可與登入 Email 不同）"
                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            {/* Years experience */}
            <div>
              <label className="text-sm font-medium text-white block mb-2">製作年資</label>
              <input value={profile.years_experience || ''} onChange={(e) => setProfile((p) => ({ ...p, years_experience: parseInt(e.target.value) || 0 }))}
                type="number" placeholder="幾年" min={0} max={50}
                className="w-40 px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            {/* Social links */}
            <div>
              <label className="text-sm font-medium text-white block mb-3">社群連結</label>
              <div className="space-y-3">
                {socialKeys.map((sk) => (
                  <div key={sk} className="flex items-center gap-3">
                    <div className="w-24 text-xs capitalize" style={{ color: '#8888aa' }}>{sk}</div>
                    <input value={(profile.social_links as Record<string,string>)?.[sk] || ''}
                      onChange={(e) => updateSocial(sk, e.target.value)}
                      placeholder={`https://${sk}.com/...`}
                      className="flex-1 px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={profileSaving}
              className="w-full btn-glow flex items-center justify-center gap-2 py-3.5 text-white font-bold rounded-2xl text-sm disabled:opacity-50">
              {profileSaving
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 儲存中...</>
                : <><Check size={16} /> 儲存個人資料</>}
            </button>
          </form>
        )}
      </div>

      {/* ── Edit Beat Modal ───────────────── */}
      {editingBeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-lg rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            style={{ background: '#13131e', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">編輯 Beat</h2>
              <button onClick={() => setEditingBeat(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                <X size={16} style={{ color: '#8888aa' }} />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-white block mb-2">標題</label>
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-white block mb-2">曲風</label>
                <select value={editGenre} onChange={(e) => setEditGenre(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: editGenre ? '#fff' : '#8888aa' }}>
                  <option value="">選擇曲風</option>
                  {GENRES.map(g => <option key={g} value={g} style={{ background: '#16162a' }}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-white block mb-2">情緒</label>
                <select value={editMood} onChange={(e) => setEditMood(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: editMood ? '#fff' : '#8888aa' }}>
                  <option value="">選擇情緒</option>
                  {MOODS.map(m => <option key={m} value={m} style={{ background: '#16162a' }}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-white block mb-2">BPM</label>
                <input type="number" value={editBpm} onChange={(e) => setEditBpm(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="text-sm font-medium text-white block mb-2">音調</label>
                <select value={editKey} onChange={(e) => setEditKey(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: editKey ? '#fff' : '#8888aa' }}>
                  <option value="">選擇音調</option>
                  {KEYS.map(k => <option key={k} value={k} style={{ background: '#16162a' }}>{k}</option>)}
                </select>
              </div>
            </div>

            {/* Cover */}
            <div>
              <label className="text-sm font-medium text-white block mb-2">更換封面圖（選填）</label>
              <label className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${editCoverFile ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
                <ImageIcon size={16} style={{ color: '#8888aa' }} />
                <span className="text-sm" style={{ color: editCoverFile ? '#a78bfa' : '#8888aa' }}>
                  {editCoverFile ? editCoverFile.name : '選擇新封面圖'}
                </span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => setEditCoverFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            {/* Licenses */}
            {editingBeat.type === 'beat' && (
              <div>
                <label className="text-sm font-medium text-white block mb-3">修改定價</label>
                <div className="space-y-2">
                  {editLicenses.map((lic, i) => {
                    const info = LICENSE_INFO[lic.type];
                    return (
                      <div key={lic.type} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex-1 text-sm font-semibold" style={{ color: info.color }}>{info.label}</div>
                        <span className="text-xs" style={{ color: '#8888aa' }}>NT$</span>
                        <input type="number" value={lic.price}
                          onChange={(e) => { const n = [...editLicenses]; n[i].price = e.target.value; setEditLicenses(n); }}
                          className="w-24 px-3 py-1.5 rounded-lg text-white text-sm text-right focus:outline-none"
                          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                          min={0} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditingBeat(null)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#8888aa', border: '1px solid rgba(255,255,255,0.08)' }}>
                取消
              </button>
              <button type="button" onClick={handleEditSave} disabled={editSaving}
                className="flex-1 btn-glow py-3 text-white rounded-2xl text-sm font-bold disabled:opacity-50">
                {editSaving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
