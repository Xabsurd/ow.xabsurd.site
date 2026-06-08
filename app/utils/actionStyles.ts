export type ActionVariant = 'glass' | 'primary' | 'hero'
export type ActionSize = 'compact' | 'md' | 'hero'

export function actionClasses(options: {
  active?: boolean
  variant?: ActionVariant
  size?: ActionSize
} = {}) {
  const active = options.active ?? false
  const variant = options.variant ?? 'glass'
  const size = options.size ?? 'md'

  const base = 'inline-flex min-w-0 items-center justify-center rounded-xl border font-semibold backdrop-blur transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-50'
  const sizeClass = {
    compact: 'h-10 px-2.5 text-[13px] min-[375px]:px-3 sm:text-sm',
    md: 'h-10 px-3 text-sm',
    hero: 'px-3 py-2.5 text-center text-sm sm:px-5 sm:py-3'
  }[size]

  const variantClass = active
    ? 'border-cyan-500/45 bg-cyan-500/10 text-cyan-950 dark:border-cyan-300/30 dark:bg-cyan-300/10 dark:text-cyan-50'
    : variant === 'primary'
      ? 'border-cyan-500/35 bg-cyan-500/10 text-cyan-950 shadow-cyan-500/10 hover:bg-cyan-500/15 dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-50 dark:hover:bg-cyan-300/15'
      : variant === 'hero'
        ? 'border-slate-900/10 bg-white/35 text-slate-800 hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15'
        : 'border-white/45 bg-white/35 text-slate-700 hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'

  return [base, sizeClass, variantClass]
}
