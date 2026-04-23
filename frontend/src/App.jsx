import { useState } from 'react'
import HomePage from './pages/HomePage.jsx'
import ResultPage from './pages/ResultPage.jsx'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [imageUrl, setImageUrl] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)

  const handleAnalysisComplete = (url, result, file) => {
    setImageUrl(url)
    setImageFile(file)
    setAnalysisResult(result)
    setCurrentPage('result')
  }

  const handleBack = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setCurrentPage('home')
    setImageUrl(null)
    setDetections([])
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {currentPage === 'home' ? (
        <HomePage onAnalysisComplete={handleAnalysisComplete} />
      ) : (
        <ResultPage
          imageUrl={imageUrl}
          imageFile={imageFile}
          analysisResult={analysisResult}
          onBack={handleBack}
        />
      )}
    </div>
  )
}

export default App