export default function StudentDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-[#0F172B]">Halo, Noora! 🎓</h1>
        <p className="text-gray-600 mt-2">Selamat belajar di LMS Prof Noor</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Mata Kuliah yang Diikuti</h2>
        {/* nanti kita isi data real dari API */}
      </div>
    </div>
  );
}