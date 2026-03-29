import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-[#0F0F0F]" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight">
            Find Your <span className="text-purple-400">Sound</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-8">
            探索台灣最優秀的音樂製作人，購買高品質伴奏，或聯絡製作人客製化編曲
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/beats"
              className="flex items-center justify-center gap-2 px-8 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-semibold transition-colors"
            >
              瀏覽伴奏 <ArrowRight size={18} />
            </Link>
            <Link
              href="/producers"
              className="flex items-center justify-center gap-2 px-8 py-3 bg-[#242424] hover:bg-[#2f2f2f] text-white rounded-xl font-semibold transition-colors border border-[#333]"
            >
              認識製作人
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-6">
        {[
          { emoji: '🎵', title: '試聽任何伴奏', desc: '所有伴奏均可免費試聽，找到最適合你的聲音' },
          { emoji: '🛒', title: '彈性授權方案', desc: 'Basic、Premium 或 Exclusive，選擇符合你需求的授權' },
          { emoji: '🎛️', title: '聯絡製作人', desc: '直接與製作人溝通，打造專屬於你的客製化編曲' },
        ].map((f) => (
          <div key={f.title} className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333]">
            <div className="text-3xl mb-3">{f.emoji}</div>
            <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
