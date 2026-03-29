import Link from 'next/link';
import Image from 'next/image';
import { Producer } from '@/lib/api';
import { Music } from 'lucide-react';

interface Props {
  producer: Producer;
}

export default function ProducerCard({ producer }: Props) {
  return (
    <Link
      href={`/producers/${producer.id}`}
      className="group block rounded-xl overflow-hidden bg-[#1A1A1A] border border-[#333] hover:border-purple-500/50
                 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40"
    >
      {/* Avatar */}
      <div className="relative h-32 bg-gradient-to-br from-purple-900 to-[#111]">
        {producer.avatar_url ? (
          <Image
            src={`http://localhost:4000${producer.avatar_url}`}
            alt={producer.name}
            fill
            className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
          />
        ) : null}
        <div className="absolute inset-0 flex items-end p-3">
          <div className="w-14 h-14 rounded-full bg-purple-800 border-2 border-[#1A1A1A] overflow-hidden flex items-center justify-center">
            {producer.avatar_url ? (
              <Image
                src={`http://localhost:4000${producer.avatar_url}`}
                alt={producer.name}
                width={56} height={56}
                className="object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">{producer.name[0]}</span>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 pt-2">
        <h3 className="font-semibold text-white">{producer.name}</h3>
        {producer.bio && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{producer.bio}</p>
        )}

        {/* Genre tags */}
        {producer.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {producer.genres.slice(0, 3).map((g) => (
              <span key={g} className="text-xs bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded">
                {g}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
          <Music size={12} />
          <span>{producer.beat_count ?? 0} 首作品</span>
        </div>
      </div>
    </Link>
  );
}
