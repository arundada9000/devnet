const TIMING_CONFIGS = [
  { key: 'urgent', delay: 0, priority: 'high' },
  { key: 'standard', delay: 5000, priority: 'normal' },
  { key: 'digest', delay: 300000, priority: 'low' }
]

export class NotificationScheduler {
  constructor() {
    this.queue = []
    this.timers = new Map()
  }

  schedule(type, payload, timing = 'standard') {
    const config = TIMING_CONFIGS.find(t => t.key === timing) || TIMING_CONFIGS[1]
    const id = crypto.randomUUID()

    const entry = {
      id,
      type,
      payload,
      priority: config.priority,
      scheduledAt: Date.now() + config.delay
    }

    this.queue.push(entry)

    const timer = setTimeout(() => {
      this.dispatch(entry)
      this.queue = this.queue.filter(e => e.id !== id)
    }, config.delay)

    this.timers.set(id, timer)
    return id
  }

  cancel(id) {
    const timer = this.timers.get(id)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(id)
      this.queue = this.queue.filter(e => e.id !== id)
    }
  }

  flush() {
    this.queue.forEach(entry => {
      clearTimeout(this.timers.get(entry.id))
      this.dispatch(entry)
    })
    this.queue = []
    this.timers.clear()
  }

  dispatch(entry) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: entry.payload
      })
    }
  }

  get pending() {
    return this.queue.length
  }
}
