function noopSubscribe(): () => void {
  return () => {};
}

export function getSpeechRecognitionConstructor(): typeof SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

export function subscribeSpeechRecognitionSupport(): () => void {
  return noopSubscribe();
}

export function getServerSpeechRecognitionSupport(): boolean {
  return false;
}
