/**
 * Resize image client-side before upload for performance + consistent coords
 * @param {File} file - Original image file
 * @param {number} maxDim - Maximum dimension (width or height)
 * @returns {Promise<File>} Resized file (same aspect ratio)
 */
export const resizeImage = (file, maxDim = 1200) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target.result
      img.onload = () => {
        let { width, height } = img

        if (Math.max(width, height) > maxDim) {
          const scale = maxDim / Math.max(width, height)
          width = Math.floor(width * scale)
          height = Math.floor(height * scale)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Canvas toBlob failed'))
            const resizedFile = new File([blob], file.name, {
              type: file.type || 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(resizedFile)
          },
          file.type || 'image/jpeg',
          0.92
        )
      }
      img.onerror = () => reject(new Error('Image load failed'))
    }

    reader.onerror = () => reject(new Error('FileReader failed'))
    reader.readAsDataURL(file)
  })
}