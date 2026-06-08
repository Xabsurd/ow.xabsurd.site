export type ControlSize = 'md' | 'sm'

export function controlClasses(options: {
  size?: ControlSize
  multiline?: boolean
  select?: boolean
} = {}) {
  const size = options.size ?? 'md'
  const shape = options.multiline
    ? 'w-full rounded-xl px-3 py-3'
    : size === 'sm'
      ? 'h-10 rounded-xl px-3'
      : 'h-12 rounded-xl px-4'
  const select = options.select ? 'appearance-none pr-10 font-semibold' : ''

  return [
    'focus-ring border border-white/45 bg-white/35 text-sm shadow-lg shadow-slate-950/5 backdrop-blur-xl transition hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15',
    shape,
    select
  ]
}

export const controlTriggerClass = [
  ...controlClasses(),
  'flex w-full items-center justify-between gap-3 text-left'
]
