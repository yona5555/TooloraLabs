let cachedVoices: SpeechSynthesisVoice[] = [];
let cachedVoicesKey = "";

const EMPTY_VOICES: SpeechSynthesisVoice[] = [];

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
    const seen = new Set<string>();
    cachedVoices = voices.filter((v) => {
      if (seen.has(v.voiceURI)) return false;
      seen.add(v.voiceURI);
      return true;
    });
  }
  return cachedVoices;
}

export function getServerVoicesSnapshot(): SpeechSynthesisVoice[] {
  return EMPTY_VOICES;
}
