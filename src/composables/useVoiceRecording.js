import { ref, onUnmounted } from 'vue'
import { useVoiceSessionStore } from '@/stores/voiceSession'

export function useVoiceRecording() {
    const voiceStore = useVoiceSessionStore()
    const recognition = ref(null)
    const isSupported = ref(false)

    function initRecognition() {
        // Check browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            voiceStore.setError('Speech recognition not supported in this browser. Please use Chrome or Edge.')
            return false
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognition.value = new SpeechRecognition()

        // Configuration
        recognition.value.continuous = true
        recognition.value.interimResults = true
        recognition.value.lang = 'es-ES' // Spanish
        recognition.value.maxAlternatives = 1

        let lastProcessedFinalIndex = -1

        // Event handlers
        recognition.value.onstart = () => {
            console.log('Voice recognition started')
            lastProcessedFinalIndex = -1
            voiceStore.startRecording()
        }

        recognition.value.onresult = (event) => {
            let interim = ''
            let newFinal = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript
                const confidence = event.results[i][0].confidence

                if (event.results[i].isFinal) {
                    if (i > lastProcessedFinalIndex) {
                        newFinal += transcript
                        voiceStore.setConfidence(confidence)
                        lastProcessedFinalIndex = i
                    }
                } else {
                    // Only the most recent interim transcript matters, prevent accumulating old interims
                    interim += transcript
                }
            }

            if (newFinal) {
                voiceStore.updateTranscript(newFinal, false)
            }
            if (interim) {
                voiceStore.updateTranscript(interim, true)
            }
        }

        recognition.value.onerror = (event) => {
            console.error('Speech recognition error:', event.error)

            let errorMessage = 'Error de reconocimiento de voz'
            switch (event.error) {
                case 'no-speech':
                    errorMessage = 'No se detectó voz. Por favor, inténtalo de nuevo.'
                    break
                case 'audio-capture':
                    errorMessage = 'No se encontró ningún micrófono. Por favor, comprueba tu dispositivo.'
                    break
                case 'not-allowed':
                    errorMessage = 'Permiso de micrófono denegado. Por favor, toca el icono del candado en la barra de direcciones y permite el uso del micrófono.'
                    break
                case 'network':
                    errorMessage = 'Error de red. Por favor, comprueba tu conexión a internet.'
                    break
                default:
                    errorMessage = `Error de reconocimiento de voz: ${event.error}`
            }

            voiceStore.setError(errorMessage)
        }

        recognition.value.onend = () => {
            console.log('Voice recognition ended')
            voiceStore.stopRecording()
        }

        isSupported.value = true
        return true
    }

    let isStarting = false

    async function startRecording() {
        if (isStarting) return
        if (!recognition.value && !initRecognition()) {
            return
        }

        // Clear previous error before attempting new recording
        voiceStore.setError(null)
        isStarting = true

        // Force explicit microphone permission request - Crucial for Mobile iOS/Android
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                // Stop the tracks immediately, we only needed the permission prompt to trigger
                stream.getTracks().forEach(track => track.stop())
            } else {
                console.warn('getUserMedia not supported on this browser version')
            }
        } catch (err) {
            isStarting = false
            console.error('Microphone permission check error:', err)
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                voiceStore.setError('Permiso denegado. Ve a los Ajustes de tu móvil > Apps > Tu Navegador > Permisos, y permite el uso del Micrófono. Luego recarga la página.')
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                voiceStore.setError('No se detectó ningún micrófono funcional en tu dispositivo.')
            } else {
                voiceStore.setError('Sin acceso al micrófono: ' + err.message)
            }
            return
        }

        setTimeout(() => {
            try {
                recognition.value.start()
            } catch (error) {
                // Already started
                if (error.message && error.message.includes('already started')) {
                    console.warn('Recognition already started')
                } else {
                    voiceStore.setError(error.message || 'Error al iniciar reconocimiento')
                }
            } finally {
                isStarting = false
            }
        }, 300)
    }

    function stopRecording() {
        if (recognition.value) {
            try {
                recognition.value.stop()
            } catch (error) {
                console.error('Error stopping recognition:', error)
            }
        }
    }

    function toggleRecording() {
        if (voiceStore.isRecording) {
            stopRecording()
        } else {
            startRecording()
        }
    }

    // Cleanup on component unmount
    onUnmounted(() => {
        if (recognition.value) {
            recognition.value.stop()
        }
    })

    return {
        isSupported,
        startRecording,
        stopRecording,
        toggleRecording
    }
}
