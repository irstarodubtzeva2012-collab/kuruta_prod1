// ─────────────────────────────────────────────────────────────────
// KURUTA Admin — Dashboard Page
// ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-[#F5F5F0] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
            <span className="text-[#FF6B35] font-bold text-lg font-display">K</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] font-display">
              KURUTA Admin
            </h1>
            <p className="text-sm text-[#666]">Панель модерации</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#E5E5E5] rounded-xl p-6 bg-white">
            <p className="text-sm text-[#666] mb-1">Заявки на модерацию</p>
            <p className="text-3xl font-bold text-[#1A1A1A] font-display">0</p>
          </div>
          <div className="border border-[#E5E5E5] rounded-xl p-6 bg-white">
            <p className="text-sm text-[#666] mb-1">Споры</p>
            <p className="text-3xl font-bold text-[#1A1A1A] font-display">0</p>
          </div>
          <div className="border border-[#E5E5E5] rounded-xl p-6 bg-white">
            <p className="text-sm text-[#666] mb-1">Выплаты на проверке</p>
            <p className="text-3xl font-bold text-[#1A1A1A] font-display">0</p>
          </div>
        </div>
      </div>
    </main>
  );
}
