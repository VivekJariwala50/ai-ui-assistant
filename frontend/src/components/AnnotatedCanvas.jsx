import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'

const AnnotatedCanvas = forwardRef(({ imageUrl, detections, selectedDetection, onSelect }, ref) => {
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const tooltipRef = useRef(null)
  const [displayScale, setDisplayScale] = useState(1)

  const drawDetections = (ctx, detectionsList, selected) => {
    ctx.save()
    detectionsList.forEach((det) => {
      const isSelected = selected &&
        selected.x === det.x && selected.y === det.y

      // Smart Color Coding
      let strokeColor, shadowColor;
      switch (det.type) {
        case 'primary_btn':
          strokeColor = '#ec4899'; // Pink for primary actions
          shadowColor = '#db2777';
          break;
        case 'social_btn':
        case 'button':
          strokeColor = '#3b82f6'; // Blue for standard buttons
          shadowColor = '#2563eb';
          break;
        case 'input':
          strokeColor = '#f59e0b'; // Amber for inputs
          shadowColor = '#d97706';
          break;
        default:
          strokeColor = '#10b981'; // Emerald for everything else (nav, icons)
          shadowColor = '#059669';
      }

      ctx.strokeStyle = strokeColor
      ctx.lineWidth = isSelected ? 6 : 3
      ctx.shadowColor = shadowColor
      ctx.shadowBlur = isSelected ? 20 : 0
      ctx.shadowOffsetY = isSelected ? 4 : 0

      // Draw rounded rectangle for a more SaaS-like feel
      ctx.beginPath();
      ctx.roundRect(det.x, det.y, det.width, det.height, 6);
      ctx.stroke();

      // Tiny label badge
      ctx.fillStyle = strokeColor
      ctx.beginPath();
      ctx.roundRect(det.x, det.y - 20, 30, 20, [4, 4, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 11px Inter, sans-serif'
      ctx.fillText(det.type.substring(0, 3).toUpperCase(), det.x + 4, det.y - 6)
    })
    ctx.restore()
  }

  const redraw = () => {
    const canvas = canvasRef.current
    if (!canvas || !imgRef.current) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(imgRef.current, 0, 0)
    drawDetections(ctx, detections, selectedDetection)
  }

  useEffect(() => {
    if (!imageUrl) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      imgRef.current = img

      // Keep full resolution for accurate coordinates
      canvas.width = img.width
      canvas.height = img.height

      // Responsive display size (max 900px wide)
      const maxDisplayWidth = 900
      let displayW = img.width
      let displayH = img.height
      if (img.width > maxDisplayWidth) {
        const ratio = maxDisplayWidth / img.width
        displayW = maxDisplayWidth
        displayH = Math.floor(img.height * ratio)
      }
      canvas.style.width = `${displayW}px`
      canvas.style.height = `${displayH}px`
      setDisplayScale(displayW / img.width)

      // Initial draw
      ctx.drawImage(img, 0, 0)
      drawDetections(ctx, detections, selectedDetection)

      // Mouse interaction (scaled to internal canvas coordinates)
      const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect()
        const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width)
        const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height)

        let hovered = null
        for (const det of detections) {
          if (
            mouseX >= det.x && mouseX <= det.x + det.width &&
            mouseY >= det.y && mouseY <= det.y + det.height
          ) {
            hovered = det
            break
          }
        }

        if (hovered) {
          canvas.style.cursor = 'pointer'
          if (tooltipRef.current) {
            tooltipRef.current.style.display = 'block'
            tooltipRef.current.style.left = `${e.clientX + 20}px`
            tooltipRef.current.style.top = `${e.clientY + 20}px`
            tooltipRef.current.innerHTML = `
              <div class="bg-zinc-900 border border-zinc-700 text-white px-5 py-4 rounded-3xl shadow-2xl max-w-[260px]">
                <div class="font-semibold text-blue-300">${hovered.suggestion}</div>
                <div class="text-xs text-zinc-400 mt-1">${hovered.reason}</div>
                <div class="flex justify-between text-[10px] mt-3 text-zinc-500">
                  <span>${hovered.text}</span>
                  <span>${Math.round(hovered.confidence * 100)}% confidence</span>
                </div>
              </div>
            `
          }
          onSelect(hovered)
        } else {
          canvas.style.cursor = 'default'
          if (tooltipRef.current) tooltipRef.current.style.display = 'none'
        }
      }

      const handleClick = (e) => {
        const rect = canvas.getBoundingClientRect()
        const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width)
        const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height)

        for (const det of detections) {
          if (
            mouseX >= det.x && mouseX <= det.x + det.width &&
            mouseY >= det.y && mouseY <= det.y + det.height
          ) {
            onSelect(det)
            return
          }
        }
      }

      canvas.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('click', handleClick)

      // Cleanup
      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('click', handleClick)
      }
    }

    img.src = imageUrl
  }, [imageUrl, detections])

  // Redraw when selection changes
  useEffect(() => {
    redraw()
  }, [selectedDetection])

  // Expose download method for parent
  useImperativeHandle(ref, () => ({
    downloadAnnotated: () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const link = document.createElement('a')
      link.download = 'ai-ui-assistant-annotated.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }))

  return (
    <div className="relative canvas-container">
      <canvas
        ref={canvasRef}
        className="rounded-3xl border border-zinc-700 bg-white max-w-full"
      />
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none hidden z-50"
      />
    </div>
  )
})

export default AnnotatedCanvas