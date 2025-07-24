/**
 * Performance monitoring composable for Core Web Vitals
 */
import { ref, onMounted, onUnmounted } from 'vue'

export interface PerformanceMetrics {
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
}

export const usePerformance = () => {
  const metrics = ref<PerformanceMetrics>({})
  const isSupported = ref(false)

  // Performance observer for Core Web Vitals
  let observer: PerformanceObserver | null = null

  const initPerformanceObserver = () => {
    if (!('PerformanceObserver' in window)) {
      return
    }

    isSupported.value = true

    try {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Largest Contentful Paint
          if (entry.entryType === 'largest-contentful-paint') {
            metrics.value.lcp = entry.startTime
          }

          // First Input Delay
          if (entry.entryType === 'first-input' && 'processingStart' in entry) {
            metrics.value.fid = (entry as any).processingStart - entry.startTime
          }

          // Cumulative Layout Shift
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            metrics.value.cls = (metrics.value.cls || 0) + (entry as any).value
          }

          // First Contentful Paint
          if (entry.name === 'first-contentful-paint') {
            metrics.value.fcp = entry.startTime
          }
        }
      })

      // Observe different entry types
      const entryTypes = ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint']
      
      entryTypes.forEach(type => {
        try {
          observer?.observe({ entryTypes: [type] })
        } catch {
          // Some entry types might not be supported
        }
      })

    } catch {
      // Performance Observer not supported
    }
  }

  // Get navigation timing metrics
  const getNavigationMetrics = () => {
    if (!('performance' in window) || !performance.getEntriesByType) {
      return
    }

    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0]
      metrics.value.ttfb = nav.responseStart - nav.requestStart
    }
  }

  // Get performance score based on thresholds
  const getPerformanceScore = () => {
    const scores = {
      lcp: metrics.value.lcp ? (metrics.value.lcp <= 2500 ? 'good' : metrics.value.lcp <= 4000 ? 'needs-improvement' : 'poor') : 'unknown',
      fid: metrics.value.fid ? (metrics.value.fid <= 100 ? 'good' : metrics.value.fid <= 300 ? 'needs-improvement' : 'poor') : 'unknown',
      cls: metrics.value.cls ? (metrics.value.cls <= 0.1 ? 'good' : metrics.value.cls <= 0.25 ? 'needs-improvement' : 'poor') : 'unknown',
      fcp: metrics.value.fcp ? (metrics.value.fcp <= 1800 ? 'good' : metrics.value.fcp <= 3000 ? 'needs-improvement' : 'poor') : 'unknown',
      ttfb: metrics.value.ttfb ? (metrics.value.ttfb <= 800 ? 'good' : metrics.value.ttfb <= 1800 ? 'needs-improvement' : 'poor') : 'unknown'
    }

    return scores
  }

  // Send metrics to analytics (optional)
  const sendToAnalytics = (metric: keyof PerformanceMetrics, value: number) => {
    // Only in production and if analytics is available
    if (process.env.NODE_ENV === 'production' && typeof (window as any).gtag !== 'undefined') {
      try {
        (window as any).gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: metric.toUpperCase(),
          value: Math.round(value),
          non_interaction: true,
        })
      } catch {
        // Ignore analytics errors
      }
    }
  }

  // Resource timing analysis
  const getResourceMetrics = () => {
    if (!performance.getEntriesByType) return []

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    return resources.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      transferSize: resource.transferSize || 0,
      type: resource.initiatorType,
      startTime: resource.startTime
    })).sort((a, b) => b.duration - a.duration)
  }

  // Memory usage (Chrome only)
  const getMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      }
    }
    return null
  }

  // Performance budget checker
  const checkPerformanceBudget = (budgets: Partial<PerformanceMetrics>) => {
    const violations: string[] = []

    if (budgets.lcp && metrics.value.lcp && metrics.value.lcp > budgets.lcp) {
      violations.push(`LCP: ${metrics.value.lcp}ms > ${budgets.lcp}ms`)
    }

    if (budgets.fid && metrics.value.fid && metrics.value.fid > budgets.fid) {
      violations.push(`FID: ${metrics.value.fid}ms > ${budgets.fid}ms`)
    }

    if (budgets.cls && metrics.value.cls && metrics.value.cls > budgets.cls) {
      violations.push(`CLS: ${metrics.value.cls} > ${budgets.cls}`)
    }

    return violations
  }

  onMounted(() => {
    // Initialize performance monitoring
    initPerformanceObserver()
    getNavigationMetrics()

    // Send metrics when available
    const unwatchLcp = watch(() => metrics.value.lcp, (value) => {
      if (value) sendToAnalytics('lcp', value)
    })

    const unwatchFid = watch(() => metrics.value.fid, (value) => {
      if (value) sendToAnalytics('fid', value)
    })

    const unwatchCls = watch(() => metrics.value.cls, (value) => {
      if (value) sendToAnalytics('cls', value)
    })

    // Cleanup watchers
    onUnmounted(() => {
      unwatchLcp()
      unwatchFid()
      unwatchCls()
    })
  })

  onUnmounted(() => {
    // Cleanup performance observer
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  return {
    metrics: readonly(metrics),
    isSupported: readonly(isSupported),
    getPerformanceScore,
    getResourceMetrics,
    getMemoryUsage,
    checkPerformanceBudget
  }
}