export const isAndroid = () => {
  return /android/i.test(navigator.userAgent);
};

export const isIOS = () => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const isMobileNative = () => {
  return isAndroid() || isIOS();
};

export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || (window.innerWidth <= 768);
};

export const getPlatformSpecificAuth = () => {
  if (isAndroid()) {
    return {
      persistence: true,
      signInOptions: ['google.com', 'password'],
      androidPackageName: 'com.hukie.app', // Replace with your actual package name
      androidInstallApp: true
    };
  }
  
  return {
    persistence: false,
    signInOptions: ['google.com', 'password']
  };
};
