import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuración de Gemini
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAQkQvMvNpds_1DO_Y-yE9InLh61yJjRQQ';
const genAI = new GoogleGenerativeAI(API_KEY);

// Usar el modelo más económico (gemini-1.5-flash) para texto
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Función para reintentar con delay exponencial
const retryWithDelay = async (fn, maxRetries = 2, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Solo reintentar para errores 503 (servicio sobrecargado)
      // No reintentar para errores 429 (cuota excedida)
      if (error.message && error.message.includes('503')) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`Reintentando en ${delay}ms... (intento ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

// Contexto base para los personajes conversacionales
const getCharacterContext = (characterName, isFirstTime = false) => {
  const baseContext = `Eres ${characterName}, una persona muy amigable y conversacional. Tu personalidad es cálida, divertida y entusiasta. Te gusta charlar sobre cualquier tema y siempre tienes algo interesante que decir.

Características de tu personalidad:
- Eres muy amigable y acogedor
- Te gusta conversar sobre cualquier tema
- Siempre tienes historias divertidas que contar
- Hablas de manera conversacional y cercana
- Eres paciente y comprensivo
- Tienes buen sentido del humor

IMPORTANTE: ${isFirstTime ? 
  'Es la PRIMERA VEZ que hablas con esta persona. Debes dar una introducción cálida y alegre (máximo 2 oraciones) presentándote y preguntando cómo está.' : 
  'Ya has hablado antes con esta persona. Continúa la conversación de manera natural y amigable.'}

CARACTERÍSTICAS ESPECIALES:
- Habla con alegría y entusiasmo
- Usa expresiones naturales y coloquiales
- Sé cálido y acogedor
- Usa un lenguaje que suene natural al hablar (no muy formal)
- Mantén un tono positivo y divertido

Responde de manera natural y conversacional, como si fueras una persona real hablando con un amigo. Mantén tus respuestas concisas pero interesantes (máximo 2-3 oraciones), y siempre muestra entusiasmo y alegría.`;

  return baseContext;
};

// Función para generar diálogo inicial de introducción
export const generateInitialDialogue = async (characterName) => {
  try {
    // Verificar si la API key está disponible
    if (!API_KEY || API_KEY === 'tu_api_key_de_gemini_aqui') {
      throw new Error('API key de Gemini no configurada');
    }

    const context = getCharacterContext(characterName, true);
    
    const prompt = `${context}

Es la primera vez que te encuentras con esta persona. Genera una introducción cálida y breve (máximo 2 oraciones) presentándote como ${characterName} y preguntando cómo está.`;

    const result = await retryWithDelay(async () => {
      return await model.generateContent(prompt);
    });
    const response = await result.response;
    const text = response.text();
    
    return text.trim();
  } catch (error) {
    console.error('Error al generar diálogo inicial con Gemini:', error);
    
    // Mensaje específico para cuota excedida
    if (error.message && error.message.includes('429')) {
      console.log('Cuota de Gemini excedida - usando respuestas de fallback');
    }
    
    // Respuestas de fallback para introducción más naturales
    const fallbackIntroductions = {
      'catalina': [
        '¡Hola! Soy Catalina, ¿cómo estás hoy?',
        '¡Bienvenido! Soy Catalina, me da mucho gusto conocerte. ¿Cómo has estado?',
        '¡Saludos! Soy Catalina, ¿qué tal tu día?'
      ],
      'toño': [
        '¡Ey! Soy Toño, ¿cómo estás?',
        '¡Hola! Soy Toño, me da mucho gusto conocerte. ¿Cómo has estado?',
        '¡Saludos! Soy Toño, ¿qué tal tu día?'
      ]
    };
    
    const characterKey = characterName.toLowerCase();
    const responses = fallbackIntroductions[characterKey] || fallbackIntroductions['catalina'];
    return responses[Math.floor(Math.random() * responses.length)];
  }
};

// Función para generar respuesta con Gemini
export const generateGeminiResponse = async (userMessage, characterName, isFirstTime = false) => {
  try {
    // Verificar si la API key está disponible
    if (!API_KEY || API_KEY === 'tu_api_key_de_gemini_aqui') {
      throw new Error('API key de Gemini no configurada');
    }

    const context = getCharacterContext(characterName, isFirstTime);
    
    const prompt = `${context}

La persona dice: "${userMessage}"

Responde como ${characterName}, de manera natural y conversacional. Mantén tu respuesta concisa pero interesante (máximo 2-3 oraciones).`;

    const result = await retryWithDelay(async () => {
      return await model.generateContent(prompt);
    });
    const response = await result.response;
    const text = response.text();
    
    return text.trim();
  } catch (error) {
    console.error('Error al generar respuesta con Gemini:', error);
    
    // Mensaje específico para cuota excedida
    if (error.message && error.message.includes('429')) {
      console.log('Cuota de Gemini excedida - usando respuestas de fallback');
    }
    
    // Respuestas de fallback si Gemini falla
    const fallbackResponses = {
      'catalina': [
        '¡Hola! Soy Catalina, ¿cómo estás hoy?',
        'Me encanta charlar contigo, siempre tienes cosas interesantes que decir.',
        '¿Qué tal tu día? ¿Algo emocionante te ha pasado?',
        '¡Qué bueno verte! Soy Catalina y me da mucho gusto conversar contigo.',
        '¿Te gusta conversar? A mí me encanta conocer gente nueva.'
      ],
      'toño': [
        '¡Ey! Soy Toño, ¿cómo estás?',
        'Tengo muchas historias divertidas que contarte.',
        '¿Cómo has estado? ¿Algo nuevo en tu vida?',
        '¡Saludos! Soy Toño y me encanta conocer gente nueva.',
        '¿Qué te gusta hacer en tu tiempo libre?'
      ]
    };
    
    const characterKey = characterName.toLowerCase();
    const responses = fallbackResponses[characterKey] || fallbackResponses['catalina'];
    return responses[Math.floor(Math.random() * responses.length)];
  }
};

export default { generateGeminiResponse, generateInitialDialogue };
