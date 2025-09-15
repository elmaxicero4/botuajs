// Configuración de ElevenLabs usando el SDK oficial
import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js';

// Configuración de la API key
const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '0e8d64ca1f3af39bab8e20a834f9231bec39939fd1feddcf2fd6c2dffe05ab16';

// Inicializar el cliente de ElevenLabs
const elevenlabs = new ElevenLabsClient({
  apiKey: API_KEY,
});

// IDs de voces específicas para cada personaje
const VOICE_IDS = {
  catalina: 'EXAVITQu4vr4xnSDxMaL', // Voz femenina alegre
  toño: 'VR6AewLTigWG4xSOukaG', // Voz masculina alegre
};

// Configuración de voz para cada personaje
const VOICE_SETTINGS = {
  catalina: {
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.2,
    use_speaker_boost: true
  },
  toño: {
    stability: 0.6,
    similarity_boost: 0.7,
    style: 0.3,
    use_speaker_boost: true
  }
};

// Función para obtener el ID de voz según el personaje
export const getVoiceId = (characterName) => {
  const characterKey = characterName.toLowerCase();
  return VOICE_IDS[characterKey] || VOICE_IDS.catalina;
};

// Función para obtener la configuración de voz según el personaje
export const getVoiceSettings = (characterName) => {
  const characterKey = characterName.toLowerCase();
  return VOICE_SETTINGS[characterKey] || VOICE_SETTINGS.catalina;
};

// Función para generar audio con ElevenLabs usando el SDK oficial
export const generateSpeech = async (text, characterName) => {
  try {
    // Verificar si la API key está disponible
    if (!API_KEY || API_KEY === 'tu_api_key_de_elevenlabs_aqui') {
      throw new Error('API key de ElevenLabs no configurada. Por favor, configura tu API key en el archivo .env o como variable de entorno VITE_ELEVENLABS_API_KEY');
    }

    const voiceId = getVoiceId(characterName);
    const voiceSettings = getVoiceSettings(characterName);
    
    console.log(`Generando voz para ${characterName} con ElevenLabs SDK...`);
    
    // Usar el SDK oficial de ElevenLabs
    const audio = await elevenlabs.textToSpeech.convert(
      voiceId,
      {
        text: text,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
        voiceSettings: voiceSettings
      }
    );

    return audio;
  } catch (error) {
    console.error('Error al generar audio con ElevenLabs SDK:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error.message.includes('missing_permissions') || error.message.includes('text_to_speech')) {
      throw new Error('Tu API key de ElevenLabs no tiene permisos para text-to-speech. Actualiza tu plan en https://elevenlabs.io/ para usar esta función');
    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      throw new Error('API key de ElevenLabs inválida o expirada. Verifica tu API key en https://elevenlabs.io/');
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      throw new Error('Límite de uso de ElevenLabs excedido. Intenta más tarde o actualiza tu plan');
    } else if (error.message.includes('422') || error.message.includes('validation')) {
      throw new Error('Error de validación en ElevenLabs. Verifica el texto y la configuración de voz');
    } else {
      throw new Error(`Error en ElevenLabs SDK: ${error.message}`);
    }
  }
};

// Variable global para controlar el audio actual
let currentAudio = null;

// Función para reproducir audio usando el SDK
export const playAudio = async (audioBlob) => {
  return new Promise((resolve, reject) => {
    try {
      // Detener audio anterior si existe
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }

      // Usar la función play del SDK de ElevenLabs
      play(audioBlob).then(() => {
        currentAudio = null;
        resolve();
      }).catch((error) => {
        currentAudio = null;
        reject(new Error('Error al reproducir audio con ElevenLabs SDK'));
      });

    } catch (error) {
      reject(new Error('Error al reproducir audio: ' + error.message));
    }
  });
};

// Función para detener el audio actual
export const stopCurrentAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
};

// Función para obtener lista de voces disponibles usando el SDK
export const getAvailableVoices = async () => {
  try {
    const voices = await elevenlabs.voices.getAll();
    return voices || [];
  } catch (error) {
    console.error('Error al obtener voces con ElevenLabs SDK:', error);
    return [];
  }
};

// Función para obtener información de una voz específica
export const getVoiceInfo = async (voiceId) => {
  try {
    const voice = await elevenlabs.voices.get(voiceId);
    return voice;
  } catch (error) {
    console.error('Error al obtener información de voz:', error);
    return null;
  }
};

export default {
  generateSpeech,
  playAudio,
  stopCurrentAudio,
  getVoiceId,
  getVoiceSettings,
  getAvailableVoices,
  getVoiceInfo
};