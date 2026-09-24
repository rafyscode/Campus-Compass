import type { QualityLevel } from '../types/campus'

export function resolveQuality(level: QualityLevel): Exclude<QualityLevel, 'auto'> {
  if (level !== 'auto') return level

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  const cores = navigator.hardwareConcurrency ?? 4
  const mobile = matchMedia('(pointer: coarse)').matches

  if (memory >= 8 && cores >= 8 && !mobile) return 'high'
  if (memory <= 2 || cores <= 4 || mobile) return 'performance'
  return 'balanced'
}
