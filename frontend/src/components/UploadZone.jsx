import { useState, useRef } from 'react'

export default function UploadZone({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) onFileSelect(file)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) onFileSelect(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border-4 border-dashed rounded-3xl p-16 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[420px]
        ${isDragging 
          ? 'border-blue-500 bg-blue-500/10 scale-105' 
          : 'border-zinc-700 hover:border-blue-400 hover:bg-zinc-900/50'}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v-4m0 0l4 4m-4-4l4-4m12 0v4m0 0l-4-4m4 4l-4 4" />
        </svg>
      </div>

      <h2 className="text-3xl font-semibold mb-3">Drop your UI screenshot here</h2>
      <p className="text-zinc-400 max-w-xs mb-8">or</p>

      <button
        onClick={() => fileInputRef.current.click()}
        className="px-10 py-5 bg-white text-zinc-900 font-semibold text-lg rounded-3xl hover:scale-105 transition flex items-center gap-x-3 shadow-lg"
      >
        <span>Select from computer</span>
      </button>

      <div className="mt-10 text-xs text-zinc-500 flex items-center gap-6">
        <div>PNG • JPG • WebP</div>
        <div>Local processing • No data leaves your machine</div>
      </div>
    </div>
  )
}