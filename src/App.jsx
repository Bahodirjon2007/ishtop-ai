import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function App() {
  const [jobs, setJobs] = useState([])
  const [resumes, setResumes] = useState([])
  const [activeTab, setActiveTab] = useState('jobs')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('job') // 'job', 'resume', 'view_job', 'view_resume'
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Yangi vakansiya formasi
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    type: 'IT',
    description: ''
  })

  // Yangi rezyume formasi
  const [newResume, setNewResume] = useState({
    full_name: '',
    title: '',
    skills: '',
    experience: '',
    contact: ''
  })

  useEffect(() => {
    fetchJobs()
    fetchResumes()
  }, [])

  async function fetchJobs() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error('Vakansiyalarni yuklashda xatolik:', error)
    else setJobs(data || [])
  }

  async function fetchResumes() {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error('Rezyumelarni yuklashda xatolik:', error)
    else setResumes(data || [])
  }

  // Vakansiya saqlash
  async function handleAddJob(e) {
    e.preventDefault()
    if (!newJob.title || !newJob.company) {
      alert('Iltimos, vakansiya nomi va kompaniyani kiriting!')
      return
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert([newJob])
      .select()

    if (error) {
      alert('Xatolik yuz berdi: ' + error.message)
    } else {
      alert('Vakansiya muvaffaqiyatli saqlandi!')
      setJobs([data[0], ...jobs])
      setNewJob({ title: '', company: '', location: '', salary: '', type: 'IT', description: '' })
      setShowModal(false)
    }
  }

  // Rezyume saqlash
  async function handleAddResume(e) {
    e.preventDefault()
    if (!newResume.full_name || !newResume.title) {
      alert('Iltimos, ismingiz va mutaxassisligingizni kiriting!')
      return
    }

    const { data, error } = await supabase
      .from('resumes')
      .insert([newResume])
      .select()

    if (error) {
      alert('Xatolik yuz berdi: ' + error.message)
    } else {
      alert('Rezyume muvaffaqiyatli saqlandi!')
      setResumes([data[0], ...resumes])
      setNewResume({ full_name: '', title: '', skills: '', experience: '', contact: '' })
      setShowModal(false)
    }
  }

  // Vakansiya o'chirish
  async function handleDeleteJob(id) {
    if (!window.confirm("Rostdan ham ushbu vakansiyani o'chirmoqchimisiz?")) return
    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (error) {
      alert("O'chirishda xatolik: " + error.message)
    } else {
      setJobs(jobs.filter(j => j.id !== id))
      setShowModal(false)
    }
  }

  // Rezyume o'chirish
  async function handleDeleteResume(id) {
    if (!window.confirm("Rostdan ham ushbu rezyumeni o'chirmoqchimisiz?")) return
    const { error } = await supabase.from('resumes').delete().eq('id', id)
    if (error) {
      alert("O'chirishda xatolik: " + error.message)
    } else {
      setResumes(resumes.filter(r => r.id !== id))
      setShowModal(false)
    }
  }

  const filteredJobs = jobs.filter(j => 
    j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredResumes = resumes.filter(r => 
    r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.skills?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              IshTop AI
            </span>
            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
              O'zbekiston AI Portali
            </span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => { setModalType('job'); setShowModal(true) }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-lg transition shadow-lg shadow-blue-500/20"
            >
              + E'lon Berish
            </button>
            <button 
              onClick={() => { setModalType('resume'); setShowModal(true) }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium border border-slate-700 rounded-lg transition"
            >
              + Rezyume Qo'shish
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Bilimingizga Mos Haqiqiy Ishni AI Yordamida Toping
          </h1>
          <p className="text-slate-400 text-lg mb-6">
            Ish o'rinlari va rezyumelar Supabase bazasi bilan real vaqtda bog'langan.
          </p>

          {/* Search Box */}
          <div className="flex gap-2 max-w-xl mx-auto bg-slate-800 p-2 rounded-xl border border-slate-700 shadow-xl">
            <input 
              type="text" 
              placeholder="Kasb, ko'nikma yoki kalit so'z..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 text-white outline-none placeholder-slate-500"
            />
            <button className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-medium transition">
              Qidirish
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`px-6 py-2.5 rounded-xl font-medium transition ${
              activeTab === 'jobs' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Vakansiyalar ({filteredJobs.length})
          </button>
          <button 
            onClick={() => setActiveTab('resumes')}
            className={`px-6 py-2.5 rounded-xl font-medium transition ${
              activeTab === 'resumes' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Rezyumelar ({filteredResumes.length})
          </button>
        </div>

        {/* Content List */}
        {activeTab === 'jobs' ? (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredJobs.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-slate-500 bg-slate-800/40 rounded-2xl border border-slate-800">
                Hozircha vakansiyalar yo'q. Birinchi bo'lib e'lon joylang!
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div 
                  key={job.id} 
                  onClick={() => { setSelectedItem(job); setModalType('view_job'); setShowModal(true); }}
                  className="bg-slate-800/60 p-5 rounded-xl border border-slate-700 hover:border-blue-500 cursor-pointer transition duration-200 hover:scale-[1.01] shadow-md hover:shadow-blue-500/10 group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition">{job.title}</h3>
                      <p className="text-blue-400 text-sm font-medium">{job.company}</p>
                    </div>
                    {job.salary && (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-semibold">
                        {job.salary}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{job.description || "Tavsif berilmagan."}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-700/50 pt-3">
                    <span>📍 {job.location || "O'zbekiston"}</span>
                    <span className="text-blue-400 font-medium group-hover:underline">Batafsil кўриш →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredResumes.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-slate-500 bg-slate-800/40 rounded-2xl border border-slate-800">
                Hozircha rezyumelar yo'q. Birinchi bo'lib rezyume qo'shing!
              </div>
            ) : (
              filteredResumes.map((resume) => (
                <div 
                  key={resume.id} 
                  onClick={() => { setSelectedItem(resume); setModalType('view_resume'); setShowModal(true); }}
                  className="bg-slate-800/60 p-5 rounded-xl border border-slate-700 hover:border-indigo-500 cursor-pointer transition duration-200 hover:scale-[1.01] shadow-md group"
                >
                  <h3 className="text-xl font-semibold text-white group-hover:text-indigo-400 transition">{resume.full_name}</h3>
                  <p className="text-indigo-400 text-sm font-medium mb-2">{resume.title}</p>
                  {resume.skills && (
                    <p className="text-slate-300 text-xs mb-3 bg-slate-900/50 p-2 rounded border border-slate-800">
                      <strong>Ko'nikmalar:</strong> {resume.skills}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-700/50 pt-3">
                    <span>📞 {resume.contact || "Mavjud emas"}</span>
                    <span className="text-indigo-400 font-medium group-hover:underline">Batafsil кўриш →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Modal windows */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold p-1"
            >
              ✕
            </button>

            {/* VAKANSIYA KO'RISH */}
            {modalType === 'view_job' && selectedItem && (
              <div>
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded border border-blue-500/20 font-semibold mb-3 inline-block">
                  Vakansiya Tafsilotlari
                </span>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedItem.title}</h2>
                <p className="text-blue-400 font-medium mb-4">{selectedItem.company}</p>

                <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Maosh:</span>
                    <span className="text-emerald-400 font-semibold">{selectedItem.salary || "Kelimshiladi"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Joylashuv:</span>
                    <span className="text-white">{selectedItem.location || "O'zbekiston"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">E'lon sanasi:</span>
                    <span className="text-slate-300">{new Date(selectedItem.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Tavsif</h4>
                  <p className="text-slate-200 text-sm leading-relaxed bg-slate-900/30 p-3 rounded-lg border border-slate-800 whitespace-pre-line">
                    {selectedItem.description || "Tavsif ko'rsatilmadi."}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => alert("Murojaatingiz qabul qilindi!")} 
                    className="flex-1 bg-blue-600 hover:bg-blue-500 py-2.5 rounded-lg font-semibold transition"
                  >
                    Topshirish (Apply)
                  </button>
                  <button 
                    onClick={() => handleDeleteJob(selectedItem.id)} 
                    className="px-4 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-lg font-medium transition"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            )}

            {/* REZYUME KO'RISH */}
            {modalType === 'view_resume' && selectedItem && (
              <div>
                <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded border border-indigo-500/20 font-semibold mb-3 inline-block">
                  Rezyume Tafsilotlari
                </span>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedItem.full_name}</h2>
                <p className="text-indigo-400 font-medium mb-4">{selectedItem.title}</p>

                <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Ko'nikmalar:</span>
                    <span className="text-white font-medium">{selectedItem.skills || "Noma'lum"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Aloqa:</span>
                    <span className="text-blue-400 font-semibold">{selectedItem.contact || "Mavjud emas"}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Tajriba va Ma'lumot</h4>
                  <p className="text-slate-200 text-sm leading-relaxed bg-slate-900/30 p-3 rounded-lg border border-slate-800 whitespace-pre-line">
                    {selectedItem.experience || "Ma'lumot kiritilmagan."}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => alert(`Aloqa: ${selectedItem.contact}`)} 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-2.5 rounded-lg font-semibold transition"
                  >
                    Bog'lanish
                  </button>
                  <button 
                    onClick={() => handleDeleteResume(selectedItem.id)} 
                    className="px-4 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-lg font-medium transition"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            )}

            {/* VAKANSIYA QO'SHISH FORMALARI */}
            {modalType === 'job' && (
              <>
                <h2 className="text-2xl font-bold mb-4 text-white">Yangi Vakansiya Joylash</h2>
                <form onSubmit={handleAddJob} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Vakansiya Nomi *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Masalan: Frontend Dasturchi"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Kompaniya Nomi *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Masalan: IT Park"
                        value={newJob.company}
                        onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Hudud</label>
                      <input 
                        type="text" 
                        placeholder="Toshkent, Farg'ona..."
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Maosh</label>
                    <input 
                      type="text" 
                      placeholder="Masalan: 10,000,000 UZS"
                      value={newJob.salary}
                      onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Batafsil Tavsif</label>
                    <textarea 
                      rows="3"
                      placeholder="Ish sharoiti va talablar..."
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-500 py-2.5 rounded-lg font-semibold transition"
                  >
                    Supabase Bazaga Saqlash
                  </button>
                </form>
              </>
            )}

            {/* REZYUME QO'SHISH FORMALARI */}
            {modalType === 'resume' && (
              <>
                <h2 className="text-2xl font-bold mb-4 text-white">Rezyume Qo'shish</h2>
                <form onSubmit={handleAddResume} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Ism Familiya *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ali Valiyev"
                      value={newResume.full_name}
                      onChange={(e) => setNewResume({ ...newResume, full_name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Mutaxassislik (Kasb) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Masalan: Buxgalter, React Dasturchi"
                      value={newResume.title}
                      onChange={(e) => setNewResume({ ...newResume, title: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Ko'nikmalar (Skillar)</label>
                    <input 
                      type="text" 
                      placeholder="1C, Excel, React, JavaScript..."
                      value={newResume.skills}
                      onChange={(e) => setNewResume({ ...newResume, skills: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Tajriba va Ma'lumot</label>
                    <textarea 
                      rows="2"
                      placeholder="Qaysi sohada qancha vaqt ishlagansiz..."
                      value={newResume.experience}
                      onChange={(e) => setNewResume({ ...newResume, experience: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Aloqa (Telefon / Telegram)</label>
                    <input 
                      type="text" 
                      placeholder="+998 90 123 45 67 / @username"
                      value={newResume.contact}
                      onChange={(e) => setNewResume({ ...newResume, contact: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-500 py-2.5 rounded-lg font-semibold transition"
                  >
                    Rezyumeni Saqlash
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}