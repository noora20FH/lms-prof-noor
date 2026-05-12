export default function ProfessorDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-[#0F172B]">Dashboard Professor</h1>
        <p className="text-gray-600 mt-2">Selamat datang kembali, Prof. Noor 👋</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Mata Kuliah</p>
          <p className="text-5xl font-semibold text-[#0D542B] mt-2">5</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Mahasiswa Aktif</p>
          <p className="text-5xl font-semibold text-[#0D542B] mt-2">87</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Tugas Pending</p>
          <p className="text-5xl font-semibold text-[#0D542B] mt-2">12</p>
        </div>
      </div>
    </div>
  );
}