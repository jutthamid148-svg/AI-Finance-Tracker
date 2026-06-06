import { motion } from 'framer-motion'

const shimmer = {
  animate: { backgroundPosition: ['200% 0', '-200% 0'] },
  transition: { duration: 1.8, repeat: Infinity, ease: 'linear' },
}

function SkeletonBase({ className = '' }: { className?: string }) {
  return (
    <motion.div
      {...shimmer}
      className={`rounded-xl ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '400% 100%',
      }}
    />
  )
}

export function SkeletonStatCard() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/6 space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonBase className="h-3 w-20" />
        <SkeletonBase className="w-9 h-9 rounded-xl" />
      </div>
      <SkeletonBase className="h-7 w-32" />
      <SkeletonBase className="h-2.5 w-24" />
    </div>
  )
}

export function SkeletonChart({ height = 'h-48' }: { height?: string }) {
  return (
    <div className={`glass rounded-2xl p-5 border border-white/6 ${height} flex flex-col gap-3`}>
      <SkeletonBase className="h-3 w-28" />
      <div className="flex-1 flex items-end gap-2 pt-2">
        {[65, 45, 80, 55, 90, 70, 85].map((h, i) => (
          <motion.div
            key={i}
            {...shimmer}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${h}%`,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)',
              backgroundSize: '400% 100%',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function SkeletonListItem() {
  return (
    <div className="glass rounded-xl px-4 py-3 border border-white/5 flex items-center gap-3">
      <SkeletonBase className="w-9 h-9 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <SkeletonBase className="h-2.5 w-32" />
        <SkeletonBase className="h-2 w-20" />
      </div>
      <SkeletonBase className="h-3 w-16" />
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><SkeletonChart height="h-64" /></div>
        <SkeletonChart height="h-64" />
      </div>
      {/* Recent transactions */}
      <div className="glass rounded-2xl p-5 border border-white/6 space-y-3">
        <SkeletonBase className="h-3 w-36 mb-4" />
        {Array(5).fill(0).map((_, i) => <SkeletonListItem key={i} />)}
      </div>
    </div>
  )
}

export function SkeletonExpenses() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      <div className="glass rounded-2xl p-5 border border-white/6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <SkeletonBase className="h-3 w-28" />
          <SkeletonBase className="h-8 w-24 rounded-xl" />
        </div>
        {Array(7).fill(0).map((_, i) => <SkeletonListItem key={i} />)}
      </div>
    </div>
  )
}

export function SkeletonAIInsights() {
  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      {/* AI Prediction Center */}
      <div className="glass rounded-2xl p-6 border border-primary/20 space-y-4" style={{ background: 'rgba(99,102,241,0.04)' }}>
        <SkeletonBase className="h-4 w-48" />
        <SkeletonBase className="h-16 w-64 mx-auto rounded-2xl" />
        <div className="grid grid-cols-3 gap-3">
          {Array(3).fill(0).map((_, i) => <SkeletonBase key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonChart height="h-64" />
        <SkeletonChart height="h-64" />
      </div>
    </div>
  )
}
