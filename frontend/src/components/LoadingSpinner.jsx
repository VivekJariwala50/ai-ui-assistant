export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-8 text-lg font-medium text-blue-300">Analyzing UI...</p>
      <p className="text-xs text-zinc-400 mt-1 max-w-[260px] text-center">
        Edge detection • Contour analysis • Text heuristics • Suggestion ranking
      </p>
    </div>
  )
}