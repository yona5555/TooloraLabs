let cachedVoices: SpeechSynthesisVoice[] = [];
let cachedVoicesKey = "";

function noopSubscribe(): () => void {
  return () => {};
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function subscribeSpeechSynthesisSupport(): () => void {
  return noopSubscribe();
}

export function getServerSpeechSynthesisSupport(): boolean {
  return false;
}

export function subscribeToVoices(callback: () => void): () => void {
  if (!isSpeechSynthesisSupported()) return noopSubscribe();
  window.speechSynthesis.addEventListener("voiceschanged", callback);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", callback);
}

export function getVoicesSnapshot(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return cachedVoices;
  const voices = window.speechSynthesis.getVoices();
  const key = voices.map((v) => v.voiceURI).join("|");
  if (key !== cachedVoicesKey) {
    cachedVoicesKey = key;
    cachedVoices = voices;
  }
  return cachedVoices;
}

export function getServerVoicesSnapshot(): SpeechSynthesisVoice[] {
  return [];
}
