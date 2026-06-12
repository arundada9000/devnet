const BATCH_WINDOW_MS = 5000;
const MAX_BATCH_SIZE = 10;

class NotificationBatcher {
  constructor() {
    this.queue = [];
    this.timer = null;
  }

  enqueue(notification) {
    this.queue.push({
      ...notification,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
    });

    if (this.queue.length >= MAX_BATCH_SIZE) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), BATCH_WINDOW_MS);
    }
  }

  flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, MAX_BATCH_SIZE);
    const latest = batch.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));

    if (Notification.permission === "granted" && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(latest.title, {
          body: batch.length > 1
            ? `${batch.length} updates: ${latest.body}`
            : latest.body,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          tag: `batch-${Date.now()}`,
          data: { batch: batch.map((n) => n.id) },
        });
      });
    }
  }

  get pending() {
    return this.queue.length;
  }
}

export const notifBatcher = new NotificationBatcher();
