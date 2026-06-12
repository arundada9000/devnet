export function registerPeriodicSync() {
  if (!('PeriodicSyncManager' in window)) {
    console.warn('PeriodicSync not supported')
    return false
  }

  navigator.serviceWorker.ready.then(reg => {
    reg.periodicSync.register('check-alerts', {
      minInterval: 30 * 60 * 1000
    }).catch(err => {
      console.warn('PeriodicSync registration failed:', err)
    })
  })

  return true
}

export async function getSyncStatus() {
  const reg = await navigator.serviceWorker.ready
  const tags = await reg.periodicSync.getTags()
  return {
    supported: 'PeriodicSyncManager' in window,
    registeredTags: tags
  }
}
