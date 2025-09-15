# Configuración de ElevenLabs

## Implementación Actualizada
La aplicación ahora usa el **SDK oficial de ElevenLabs** (`@elevenlabs/elevenlabs-js`) en lugar de llamadas directas a la API. Esto proporciona:

- ✅ Mejor manejo de errores
- ✅ Funcionalidades más robustas
- ✅ Soporte oficial mantenido
- ✅ Mejor integración con el navegador

## Solución

### 1. Obtener una API Key de ElevenLabs

1. Ve a [https://elevenlabs.io/](https://elevenlabs.io/)
2. Crea una cuenta o inicia sesión
3. Ve a tu perfil/configuración
4. Genera una nueva API key

### 2. Configurar la API Key

Tienes dos opciones para configurar tu API key:

#### Opción A: Archivo .env (Recomendado)
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
VITE_ELEVENLABS_API_KEY=tu_api_key_real_aqui
```

**Importante:** Reemplaza `tu_api_key_real_aqui` con tu API key real de ElevenLabs.

#### Opción B: Variable de entorno del sistema
Configura la variable de entorno `VITE_ELEVENLABS_API_KEY` en tu sistema.

### 3. Reiniciar el servidor de desarrollo

Después de configurar la API key, reinicia tu servidor de desarrollo:

```bash
npm run dev
```

## Fallback Automático

Si ElevenLabs no está disponible o hay problemas con la API key, la aplicación automáticamente usará la síntesis de voz nativa del navegador como respaldo. Esto significa que:

- ✅ La aplicación seguirá funcionando
- ✅ Los personajes seguirán "hablando"
- ⚠️ La calidad de voz será diferente (síntesis nativa vs ElevenLabs)

## Verificación

Para verificar que la configuración funciona:

1. Abre la consola del navegador (F12)
2. Inicia un diálogo
3. Deberías ver: `Generando voz para [personaje] con ElevenLabs SDK...`
4. Si hay problemas, verás: `Usando síntesis de voz nativa como fallback...`

## Nuevas Funcionalidades del SDK

- **Reproducción optimizada**: Usa la función `play()` del SDK para mejor rendimiento
- **Manejo de errores mejorado**: Mensajes más específicos y útiles
- **Funciones adicionales**: 
  - `getAvailableVoices()`: Obtener todas las voces disponibles
  - `getVoiceInfo(voiceId)`: Obtener información específica de una voz

## Notas Importantes

- **Nunca compartas tu API key** en repositorios públicos
- **Agrega `.env` a tu `.gitignore`** para evitar subir la API key por accidente
- Las API keys de ElevenLabs tienen límites de uso según tu plan
- Si excedes el límite, verás el error: "Límite de uso de ElevenLabs excedido"
