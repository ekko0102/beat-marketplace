'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Music, Mail, ExternalLink, Calendar, Star, Link2 } from 'lucide-react';
import { getProducer, Producer, Beat } from '@/lib/api';
import BeatCard from '@/components/BeatCard';
import AudioPlayer from '@/components/AudioPlayer';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');

function mediaUrl(url?: string | null) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #7c3aed, #4f46e5)',
  'linear-gradient(135deg, #db2777, #9333ea)',
  'linear-gradient(135deg, #0ea5e9, #6366f1)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
];

type ProducerDetail = Producer & { beats: Beat[]; showcase: Beat[] };

export default function ProducerPage() {
  const { id } = useParams<{ id: string }>();
  const [producer, setProducer] = useState<ProducerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'beats' | 'showcase'>('beats');

  useEffect(() => {
    if (!id) return;
    getProducer(id)
      .then((data) => setProducer(data as ProducerDetail))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-16 min-h-screen" style={{ background: '#080810' }}>
        <div className="h-48 animate-pulse" style={{ background: '#16162a' }} />
        <div className="max-w-5xl mx-auto px-4 -mt-12 pb-8">
          <div className="w-24 h-24 rounded-3xl animate-pulse mb-4" style={{ background: '#1a1a2e' }} />
          <div className="w-48 h-6 rounded animate-pulse mb-2" style={{ background: '#1a1a2e' }} />
          <div className="w-72 h-4 rounded animate-pulse" style={{ background: '#1a1a2e' }} />
        </div>
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="pt-32 text-center min-h-screen" style={{ background: '#080810' }}>
        <p className="text-gray-400">找不到此製作人</p>
        <Link href="/producers" className="mt-4 inline-block text-purple-400 hover:underline">回製作人列表</Link>
      </div>
    );
  }

  const gradientIndex = producer.name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  const avatarGradient = AVATAR_GRADIENTS[gradientIndex];
  const avatarUrl = mediaUrl(producer.avatar_url);
  const socialLinks = producer.social_links as Record<string, string> | null;
  const credits = producer.credits as { artist: string; song: string; year?: number }[] | null;

  return (
    <div className="min-h-screen" style={{ background: '#080810' }}>
      {/* Banner */}
      <div className="relative h-52 overflow-hidden">
        <div className="absolute inset-0" style={{ background: avatarGradient, opacity: 0.3 }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(124,58,237,0.4) 0%, transparent 70%)' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Avatar + name row */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 mb-6">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 shrink-0"
            style={{ borderColor: '#080810', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
            {avatarUrl ? (
              <Image src={avatarUrl} alt={producer.name} width={96} height={96} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white"
                style={{ background: avatarGradient }}>
                {producer.name[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 pb-1">
            <h1 className="text-2xl font-black text-white leading-tight">{producer.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              {producer.years_experience ? (
                <span className="flex items-center gap-1 text-xs" style={{ color: '#8888aa' }}>
                  <Calendar size={11} /> {producer.years_experience} 年經驗
                </span>
              ) : null}
              <span className="flex items-center gap-1 text-xs" style={{ color: '#8888aa' }}>
                <Music size={11} /> {producer.beats?.length ?? 0} 首伴奏
              </span>
              {producer.contact_email && (
                <a href={`mailto:${producer.contact_email}`}
                  className="flex items-center gap-1 text-xs transition-colors hover:text-purple-400"
                  style={{ color: '#a78bfa' }}>
                  <Mail size={11} /> 聯絡合作
                </a>
              )}
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-2 pb-1">
            {(['instagram', 'youtube', 'soundcloud', 'twitter'] as const).map((key) =>
              socialLinks?.[key] ? (
                <a key={key} href={socialLinks[key]} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  title={key}>
                  <Link2 size={14} style={{ color: '#a78bfa' }} />
                </a>
              ) : null
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 pb-24">
          {/* Left: bio + genres + credits */}
          <div className="space-y-5">
            {producer.bio && (
              <div className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#8888aa' }}>關於我</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#c8c8dd' }}>{producer.bio}</p>
              </div>
            )}

            {producer.genres?.length > 0 && (
              <div className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#8888aa' }}>擅長曲風</h3>
                <div className="flex flex-wrap gap-2">
                  {producer.genres.map((g) => (
                    <span key={g} className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {credits && credits.length > 0 && (
              <div className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#8888aa' }}>合作 Credits</h3>
                <div className="space-y-2">
                  {credits.map((c, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Star size={11} className="shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
                      <div className="text-sm" style={{ color: '#c8c8dd' }}>
                        <span className="font-semibold text-white">{c.artist}</span>
                        {c.song && <span style={{ color: '#8888aa' }}> — {c.song}</span>}
                        {c.year && <span className="text-xs ml-1" style={{ color: '#666' }}>{c.year}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: beats */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 mb-5 p-1 rounded-xl inline-flex"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              {(['beats', 'showcase'] as const).map((t) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: activeTab === t ? 'rgba(124,58,237,0.4)' : 'transparent',
                    color: activeTab === t ? '#fff' : '#8888aa',
                  }}>
                  {t === 'beats' ? `伴奏 (${producer.beats?.length ?? 0})` : `作品集 (${producer.showcase?.length ?? 0})`}
                </button>
              ))}
            </div>

            {activeTab === 'beats' && (
              producer.beats?.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {producer.beats.map((b) => (
                    <BeatCard key={b.id} beat={{ ...b, producer: { id: producer.id, name: producer.name, avatar_url: producer.avatar_url } }} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Music size={32} className="mx-auto mb-3 opacity-30" />
                  <p>還沒有上架伴奏</p>
                </div>
              )
            )}

            {activeTab === 'showcase' && (
              producer.showcase?.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {producer.showcase.map((b) => (
                    <BeatCard key={b.id} beat={{ ...b, producer: { id: producer.id, name: producer.name, avatar_url: producer.avatar_url } }} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Music size={32} className="mx-auto mb-3 opacity-30" />
                  <p>還沒有展示作品</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <AudioPlayer />
    </div>
  );
}
