import { useState } from 'react'
import UploadZone from '../components/UploadZone.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { resizeImage } from '../utils/imageUtils.js'
import { processImage } from '../services/api.js'
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react'

export default function HomePage({ onAnalysisComplete }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return
    setIsAnalyzing(true)

    try {
      const resizedFile = await resizeImage(selectedFile, 1200)
      const result = await processImage(resizedFile)

      const resizedUrl = URL.createObjectURL(resizedFile)

      if (previewUrl) URL.revokeObjectURL(previewUrl)

      onAnalysisComplete(resizedUrl, result, resizedFile)

    } catch (err) {
      console.error(err)
      alert('❌ Analysis failed: ' + err.message + '\n\nMake sure the backend is running and GEMINI_API_KEY is set.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AI UI Assistant</h1>
          </div>
          <nav className="hidden md:flex items-center gap-x-8 text-sm font-medium text-zinc-400">
            <a href="https://github.com/VivekJariwala50/ai-ui-assistant" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </nav>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-x-2 bg-zinc-900/50 border border-zinc-800 text-zinc-300 text-xs font-semibold px-4 py-1.5 rounded-full backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            Powered by Gemini 2.5 Flash Vision
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Understand any UI.<br />Instantly.
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Upload a screenshot and let our AI assistant guide you. Get instant layout analysis and a conversational agent to help you navigate complex interfaces.
          </p>
        </div>

        {/* Main Upload / Preview Area */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800/50 rounded-3xl p-4 shadow-2xl transition-all duration-500">
            {!previewUrl ? (
              <UploadZone onFileSelect={handleFileSelect} />
            ) : (
              <div className="grid md:grid-cols-2 gap-8 p-6 items-center">
                <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950/50 relative group">
                  <img
                    src={previewUrl}
                    alt="UI Preview"
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => {
                        URL.revokeObjectURL(previewUrl)
                        setPreviewUrl(null)
                        setSelectedFile(null)
                      }}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      Change Image
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-center space-y-6 px-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold">Ready to analyze</h3>
                    <p className="text-zinc-400 text-sm">Our AI will process this screenshot in seconds.</p>
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full h-14 text-base font-semibold bg-white text-black hover:bg-zinc-200 rounded-2xl flex items-center justify-center gap-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-white/5"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-x-3">
                        <LoadingSpinner size="sm" />
                        <span>Analyzing layout...</span>
                      </div>
                    ) : (
                      <>
                        Start Analysis
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Footer */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center border-t border-zinc-800/50 pt-12">
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold">Ultra Fast</h3>
            <p className="text-sm text-zinc-400">Powered by Gemini 2.5 Flash for sub-second visual reasoning.</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold">Conversational</h3>
            <p className="text-sm text-zinc-400">Ask questions about the UI and get precise click guidance.</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-semibold">Secure</h3>
            <p className="text-sm text-zinc-400">Images are processed locally or securely via the Gemini API.</p>
          </div>
        </div>
      </div>
    </div>
  )
}