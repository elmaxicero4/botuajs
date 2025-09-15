import { useState, useEffect, useRef } from 'react'
import { FaPlay, FaPause, FaMicrophone, FaTimes } from 'react-icons/fa'
import { generateGeminiResponse, generateInitialDialogue } from './geminiConfig'
import { generateSpeech, playAudio, stopCurrentAudio } from './elevenlabsConfig'
import './App.css'

// Datos de los diálogos
const dialogues = [
  {
    character: 'catalina',
    name: 'Catalina',
    text: '¡Hola! Soy Catalina, ¿cómo estás hoy?'
  },
  {
    character: 'toño',
    name: 'Toño',
    text: '¡Ey! Soy Toño, ¿quieres que juguemos juntos?'
  },
  {
    character: 'catalina',
    name: 'Catalina',
    text: '¡Claro! Me encanta jugar contigo, Toño.'
  },
  {
    character: 'toño',
    name: 'Toño',
    text: '¡Perfecto! Entonces vamos a divertirnos mucho.'
  }
]

function App() {
  const [currentDialogue, setCurrentDialogue] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [dialogueIndex, setDialogueIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const [hasTalkedBefore, setHasTalkedBefore] = useState({}) // Rastrea si ya habló con cada personaje
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const audioGenerationRef = useRef(false) // Para evitar múltiples generaciones simultáneas

  const startDialogue = async () => {
    if (currentDialogue === null) {
      const selectedCharacter = dialogues[dialogueIndex]
      const characterName = selectedCharacter.name
      const isFirstTime = !hasTalkedBefore[characterName]
      
      setIsGeneratingResponse(true)
      
      try {
        // Generar diálogo inicial con Gemini
        const initialText = await generateInitialDialogue(characterName)
        
        const newDialogue = {
          character: selectedCharacter.character,
          name: characterName,
          text: initialText
        }
        
        setCurrentDialogue(newDialogue)
        setIsSpeaking(true)
        
        // Marcar que ya habló con este personaje
        setHasTalkedBefore(prev => ({
          ...prev,
          [characterName]: true
        }))
        
        // Reproducir la voz automáticamente
        setTimeout(() => {
          speakText(initialText, characterName)
        }, 1000)
        
      } catch (error) {
        console.error('Error al generar diálogo inicial:', error)
        
        // Fallback a diálogo predefinido
        setCurrentDialogue(selectedCharacter)
        setIsSpeaking(true)
        setTimeout(() => {
          speakText(selectedCharacter.text, characterName)
        }, 1000)
      } finally {
        setIsGeneratingResponse(false)
        setDialogueIndex((prev) => (prev + 1) % dialogues.length)
      }
    }
  }

  const closeDialogue = () => {
      setIsClosing(true)
    setTimeout(() => {
      setCurrentDialogue(null)
      setIsSpeaking(false)
      setUserInput('')
      setIsClosing(false)
      setConversationHistory([])
      setIsGeneratingResponse(false)
    }, 500) // Duración de la animación de cierre
  }

  const handleUserInput = (e) => {
    setUserInput(e.target.value)
  }

  const handleSendMessage = async () => {
    if (userInput.trim() && currentDialogue && !isGeneratingResponse) {
      const userMessage = userInput.trim()
      setIsGeneratingResponse(true)
      
      // Agregar mensaje del usuario al historial
      setConversationHistory(prev => [...prev, {
        type: 'user',
        message: userMessage,
        timestamp: new Date()
      }])
      
      try {
        // Verificar si es la primera vez que habla con este personaje
        const isFirstTime = !hasTalkedBefore[currentDialogue.name]
        
        // Generar respuesta con Gemini
        const geminiResponse = await generateGeminiResponse(userMessage, currentDialogue.name, isFirstTime)
        
        // Crear nuevo diálogo con la respuesta de Gemini
        const newDialogue = {
          character: currentDialogue.character,
          name: currentDialogue.name,
          text: geminiResponse
        }
        
        // Actualizar el diálogo actual con la nueva respuesta
        setCurrentDialogue(newDialogue)
        
        // Agregar respuesta al historial
        setConversationHistory(prev => [...prev, {
          type: 'character',
          message: geminiResponse,
          character: currentDialogue.name,
          timestamp: new Date()
        }])
        
        // Reproducir la nueva respuesta automáticamente
        setTimeout(() => {
          speakText(geminiResponse, currentDialogue.name)
        }, 500)
        
      } catch (error) {
        console.error('Error al procesar mensaje:', error)
        
        // Respuesta de error amigable
        const errorResponse = {
          character: currentDialogue.character,
          name: currentDialogue.name,
          text: 'Disculpa, parece que hay un problema técnico. ¿Podrías intentar de nuevo?'
        }
        
        setCurrentDialogue(errorResponse)
        setTimeout(() => {
          speakText(errorResponse.text, currentDialogue.name)
        }, 500)
      } finally {
        setIsGeneratingResponse(false)
        setUserInput('')
      }
    }
  }

  const handleOverlayClick = (e) => {
    // Solo cerrar si se hace click directamente en el overlay, no en sus hijos
    if (e.target === e.currentTarget) {
      closeDialogue()
    }
  }

  const handleCloseButtonClick = (e) => {
    e.stopPropagation() // Evitar que se active el click del overlay
    closeDialogue()
  }

  const handleVoiceInput = () => {
    setIsRecording(!isRecording)
    // Aquí implementarías la funcionalidad de reconocimiento de voz
    console.log('Grabando voz:', !isRecording)
  }

  // Función para reproducir texto con ElevenLabs
  const speakText = async (text, characterName = null) => {
    if (!text || isPlayingVoice || isGeneratingAudio || audioGenerationRef.current) return

    try {
      audioGenerationRef.current = true
      setIsGeneratingAudio(true)
      setIsPlayingVoice(true)
      
      console.log(`Generando voz con ElevenLabs para ${characterName}...`)
      
      // Generar audio con ElevenLabs
      const audioBlob = await generateSpeech(text, characterName)
      
      // Reproducir el audio
      await playAudio(audioBlob)
      
    } catch (error) {
      console.error('Error al generar/reproducir audio:', error)
      
      // Mostrar mensaje de error específico según el tipo de problema
      if (error.message.includes('permisos') || error.message.includes('missing_permissions')) {
        console.warn('⚠️ ElevenLabs: Tu plan no incluye text-to-speech. Usando síntesis de voz nativa como fallback.')
      } else if (error.message.includes('API key')) {
        console.warn('⚠️ ElevenLabs: Problema con la API key. Usando síntesis de voz nativa como fallback.')
      } else {
        console.warn('⚠️ ElevenLabs: Error desconocido. Usando síntesis de voz nativa como fallback.')
      }
      
      // Fallback a síntesis de voz nativa si ElevenLabs falla
      fallbackToNativeSpeech(text, characterName)
    } finally {
      audioGenerationRef.current = false
      setIsGeneratingAudio(false)
      setIsPlayingVoice(false)
    }
  }

  // Función de fallback a síntesis de voz nativa
  const fallbackToNativeSpeech = (text, characterName) => {
    if (!text) return

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Configurar parámetros básicos según el personaje
    utterance.rate = 0.9
    utterance.volume = 0.8
    
    // Diferenciar voces por personaje
    if (characterName?.toLowerCase() === 'catalina') {
      utterance.pitch = 1.1  // Voz más aguda para Catalina
      utterance.rate = 0.95  // Ligeramente más rápida
    } else if (characterName?.toLowerCase() === 'toño') {
      utterance.pitch = 0.9  // Voz más grave para Toño
      utterance.rate = 0.85  // Ligeramente más lenta
    } else {
      utterance.pitch = 1.0  // Voz neutra por defecto
    }
    
    utterance.onstart = () => {
      setIsPlayingVoice(true)
      console.log(`Reproduciendo con síntesis de voz nativa: ${characterName}`)
    }
    
    utterance.onend = () => {
      setIsPlayingVoice(false)
    }
    
    utterance.onerror = (event) => {
      setIsPlayingVoice(false)
      console.error('Error en síntesis de voz nativa:', event.error)
    }
    
    speechSynthesis.speak(utterance)
  }

  // Función para detener la voz
  const stopVoice = () => {
    // Detener audio de ElevenLabs
    stopCurrentAudio()
    
    // Detener síntesis de voz nativa
    speechSynthesis.cancel()
    
    // Resetear refs y estados
    audioGenerationRef.current = false
    setIsPlayingVoice(false)
    setIsGeneratingAudio(false)
  }

  // Efecto para inicializar ElevenLabs
  useEffect(() => {
    console.log('Inicializando ElevenLabs para síntesis de voz...')
  }, [])

  // Efecto para reproducir voz automáticamente cuando aparece un diálogo
  useEffect(() => {
    if (currentDialogue && !isClosing && !isPlayingVoice && !isGeneratingAudio && !audioGenerationRef.current) {
      // Pequeño delay para que la animación se complete
      const timer = setTimeout(() => {
        speakText(currentDialogue.text, currentDialogue.name)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [currentDialogue, isClosing])

  // Efecto para la animación de hablar en bucle
  useEffect(() => {
    if (currentDialogue) {
      const interval = setInterval(() => {
        setIsSpeaking(prev => !prev)
      }, 400) // Cambia cada 400ms para un bucle más fluido

      return () => clearInterval(interval)
    }
  }, [currentDialogue])

  // Limpiar síntesis de voz al cerrar diálogo
  useEffect(() => {
    if (isClosing) {
      stopVoice()
    }
  }, [isClosing])

  return (
    <div className="app">
      
      <div className="main-content">
        <h1>Juego de Diálogos</h1>
        <p>Presiona el botón para iniciar una conversación</p>
        
        <button 
          className="dialogue-button"
          onClick={startDialogue}
          disabled={currentDialogue !== null || isGeneratingResponse}
        >
          {isGeneratingResponse ? 'Cargando...' : currentDialogue ? 'Conversando...' : 'Iniciar Diálogo'}
        </button>
      </div>

      {currentDialogue && (
        <div className={`dialogue-overlay ${isClosing ? 'closing' : ''}`} onClick={handleOverlayClick}>
          <button className="close-button" onClick={handleCloseButtonClick}>
            <FaTimes />
          </button>
          <div className="dialogue-container">
            {/* Personaje grande */}
            <div className="character-portrait">
              <img 
                src={`/${currentDialogue.character}${isSpeaking ? '1' : '2'}.png`}
                alt={currentDialogue.name}
                className="character-image-large"
              />
            </div>
            
            {/* Caja de diálogo */}
            <div className="dialogue-box">
              <div className="character-name-container">
                <div className="character-name-tag">{currentDialogue.name}</div>
                <button 
                  className={`voice-icon-button ${isPlayingVoice ? 'playing' : ''}`}
                  onClick={() => isPlayingVoice ? stopVoice() : speakText(currentDialogue.text, currentDialogue.name)}
                  title={isPlayingVoice ? 'Detener voz' : 'Reproducir voz'}
                >
                  {isPlayingVoice ? <FaPause /> : <FaPlay />}
                </button>
              </div>
              <div className="dialogue-text">{currentDialogue.text}</div>
              
              {/* Input del usuario con micrófono integrado */}
              <div className="user-input-container">
                <input
                  type="text"
                  value={userInput}
                  onChange={handleUserInput}
                  placeholder={isGeneratingResponse ? "Generando respuesta..." : "Escribe tu respuesta..."}
                  className="user-input-rounded"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isGeneratingResponse}
                />
                <button 
                  className={`microphone-icon ${isRecording ? 'recording' : ''} ${isGeneratingResponse ? 'disabled' : ''}`}
                  onClick={handleVoiceInput}
                  title={isRecording ? 'Detener grabación' : 'Grabar voz'}
                  disabled={isGeneratingResponse}
                >
                  <FaMicrophone />
                </button>
              </div>
              
              {/* Indicador de carga */}
              {(isGeneratingResponse || isGeneratingAudio) && (
                <div className="loading-indicator">
                  <div className="loading-spinner"></div>
                  <span>
                    {isGeneratingResponse ? 'Generando respuesta...' : 'Generando voz...'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
