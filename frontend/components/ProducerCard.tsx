import Link from 'next/link';
import Image from 'next/image';
import { Producer } from '@/lib/api';
import { Music, ArrowUpRight } from 'lucide-react';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #7c3aed, #4f46e5)',
  'linear-gradient(135deg, #db2777, #9333ea)',
  'linear-gradient(135deg, #0ea5e9, #6366f1)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
];

interface Props { producer: Producer; }

export default function ProducerCard({ producer }: Props) {
  const gradientIndex = producer.name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  const avatarGradient = AVATAR_GRADIENTS[gradientIndex];

  return (
    <Link href={`/producers/${producer.id}`}
      className="card-hover group block rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #16162a 0%, #0f0f1a 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Banner */}
      <div className="relative h-28 overflow-hidden">
        <div className="absolute inset-0" style={{ background: avatarGradient, opacity: 0.35 }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(124,58,237,0.3) 0%, transparent 70%)' }} />
        {producer.avatar_url && (
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${producer.avatar_url}`}
            alt={producer.name} fill className="object-cover opacity-30 group-hover:opacity-40 transition-opacity"
          />
        )}
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          style={{ background: 'rgba(124,58,237,0.6)', backdropFilter: 'blur(8px)' }}>
          <ArrowUpRight size={14} className="text-white" />
        </div>
      </div>

      {/* Avatar overlap */}
      <div className="px-4 -mt-7 pb-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 mb-3"
          style={{ borderColor: '#0f0f1a', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          {producer.avatar_url ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${producer.avatar_url}`}
              alt={producer.name} width={56} height={56} className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl font-black text-white"
              style={{ background: avatarGradient }}>
              {producer.name[0].toUpperCase()}
            </div>
          )}
        </div>

        <h3 className="font-bold text-white text-base leading-tight">{producer.name}</h3>

        {producer.bio && (
          <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: '#8888aa' }}>
            {producer.bio}
          </p>
        )}

        {producer.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {producer.genres.slice(0, 3).map((g) => (
              <span key={g} className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>
                {g}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: '#666' }}>
          <Music size={11} />
          <span>{producer.beat_count ?? 0} 首作品</span>
        </div>
      </div>
    </Link>
  );
}
