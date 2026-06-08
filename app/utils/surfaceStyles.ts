export type SurfaceVariant = 'panel' | 'card' | 'subtle'

export function surfaceClasses(variant: SurfaceVariant = 'panel') {
  const base = 'isolate border [contain:layout_paint]'
  if (variant === 'card') {
    return [
      base,
      'rounded-xl border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(241,248,253,0.58))] text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),inset_0_-1px_0_rgba(15,23,42,0.04),0_18px_48px_rgba(30,64,175,0.10)] transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.78),inset_0_-1px_0_rgba(15,23,42,0.04),0_22px_54px_rgba(30,64,175,0.14)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(30,41,59,0.76),rgba(6,16,24,0.56))] dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.2),0_18px_48px_rgba(0,0,0,0.28)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.2),0_22px_54px_rgba(0,0,0,0.34)]'
    ]
  }
  if (variant === 'subtle') {
    return [
      base,
      'rounded-xl border-white/45 bg-white/35 shadow-lg shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10'
    ]
  }
  return [
    base,
    'rounded-2xl border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(241,248,253,0.58))] text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),inset_0_-1px_0_rgba(15,23,42,0.04),0_18px_48px_rgba(30,64,175,0.10)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(30,41,59,0.76),rgba(6,16,24,0.56))] dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.2),0_18px_48px_rgba(0,0,0,0.28)]'
  ]
}
