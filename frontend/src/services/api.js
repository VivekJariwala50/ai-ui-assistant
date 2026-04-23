const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const processImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/process/analyze`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to analyze image')
  }

  return response.json()
}

export const chatUI = async (file, history, query) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('history', JSON.stringify(history))
  formData.append('query', query)

  const response = await fetch(`${API_BASE}/process/chat`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to chat with AI')
  }

  return response.json()
}