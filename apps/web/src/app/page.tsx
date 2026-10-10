// ─────────────────────────────────────────────────────────────────
// KURUTA Web — Home Page
// ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <div className="w-16 h-16 bg-[#1A1A1A] rounded-2xl flex items-center justify-center mx-auto mb-8">
          <span className="text-[#FF6B35] font-bold text-2xl font-display">K</span>
        </div>
        <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4 font-display">
          KURUTA
        </h1>
        <p className="text-lg text-[#666] mb-8">
          Маркетплейс рекламных размещений
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="border border-[#E5E5E5] rounded-xl p-6 bg-white">
            <h2 className="font-semibold text-[#1A1A1A] mb-2">Направление A</h2>
            <p className="text-sm text-[#666]">Задания для амбассадоров</p>
          </div>
          <div className="border border-[#E5E5E5] rounded-xl p-6 bg-white">
            <h2 className="font-semibold text-[#1A1A1A] mb-2">Направление B</h2>
            <p className="text-sm text-[#666]">Рекламные места</p>
          </div>
        </div>
      </div>
    </main>
  );
}
