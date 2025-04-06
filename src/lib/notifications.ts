export async function initializeNotifications() {
  if (!('Notification' in window)) {
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return false;
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
  });

  return subscription;
}

export function showNotification(title: string, options: NotificationOptions) {
  if (!('Notification' in window)) return;
  
  new Notification(title, options);
}