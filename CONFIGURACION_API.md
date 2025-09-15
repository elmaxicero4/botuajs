# Configuración de API Keys

Para que la aplicación funcione correctamente, necesitas configurar las API keys de los servicios externos.

## 1. ElevenLabs API Key

1. Ve a [ElevenLabs](https://elevenlabs.io/)
2. Crea una cuenta o inicia sesión
3. Ve a tu perfil y copia tu API key
4. **IMPORTANTE**: La API key debe comenzar con `sk-` seguido de caracteres alfanuméricos

## 2. Gemini API Key

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una cuenta o inicia sesión con tu cuenta de Google
3. Genera una nueva API key
4. **IMPORTANTE**: La API key debe comenzar con `AIzaSy` seguido de caracteres alfanuméricos

## 3. Configuración del archivo .env

Crea un archivo llamado `.env` en la raíz del proyecto (al mismo nivel que `package.json`) con el siguiente contenido:

```
VITE_ELEVENLABS_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Importante:** 
- Reemplaza los valores de ejemplo con tus API keys reales
- No compartas tu archivo `.env` en repositorios públicos
- El archivo `.env` ya está incluido en `.gitignore` para proteger tus credenciales

## 4. Reiniciar la aplicación

Después de configurar las API keys:

1. Detén el servidor de desarrollo (Ctrl+C)
2. Ejecuta `npm run dev` nuevamente
3. La aplicación ahora debería funcionar correctamente con las voces de ElevenLabs

## Solución de problemas

### Error 401 de ElevenLabs
- **Causa**: API key inválida, expirada o sin créditos
- **Solución**: 
  - Verifica que tu API key sea correcta y comience con `sk-`
  - Asegúrate de tener créditos disponibles en tu cuenta de ElevenLabs
  - Verifica que la API key esté en el archivo `.env` correctamente
  - La aplicación automáticamente usará síntesis de voz nativa como fallback

### Error 503 de Gemini
- **Causa**: El servicio está sobrecargado temporalmente
- **Solución**: 
  - La aplicación automáticamente reintenta la conexión (hasta 2 veces)
  - Si falla, usa respuestas de fallback predefinidas
  - Intenta nuevamente en unos minutos

### Audio que se repite
- **Causa**: Múltiples llamadas simultáneas a la función de audio
- **Solución**: 
  - Este problema ya fue solucionado en la última actualización
  - Si persiste, verifica que no tengas múltiples pestañas abiertas de la aplicación
  - Reinicia la aplicación completamente

### La aplicación usa síntesis de voz nativa en lugar de ElevenLabs
- **Causa**: API key de ElevenLabs no configurada o inválida
- **Solución**: 
  - Configura correctamente la API key de ElevenLabs
  - Verifica que tengas créditos en tu cuenta
  - La síntesis de voz nativa es un fallback automático

## Características implementadas

✅ **Control de audio mejorado**: Evita repeticiones y conflictos
✅ **Manejo robusto de errores**: Fallbacks automáticos cuando las APIs fallan
✅ **Sistema de reintentos**: Para errores 503 de Gemini
✅ **Respuestas de fallback**: Diálogos predefinidos cuando Gemini falla
✅ **Seguridad**: API keys en variables de entorno
✅ **Mejor UX**: Mensajes de error más claros y informativos
