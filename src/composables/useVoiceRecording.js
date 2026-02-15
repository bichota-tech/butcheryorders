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

        // Event handlers
        recognition.value.onstart = () => {
            console.log('Voice recognition started')
            voiceStore.startRecording()
        }

        recognition.value.onresult = (event) => {
            let interim = ''
            let final = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript
                const confidence = event.results[i][0].confidence

                if (event.results[i].isFinal) {
                    final += transcript
                    voiceStore.setConfidence(confidence)
                } else {
                    interim += transcript
                }
            }

            if (final) {
                voiceStore.updateTranscript(final, false)
            }
            if (interim) {
                voiceStore.updateTranscript(interim, true)
            }
        }

        recognition.value.onerror = (event) => {
            console.error('Speech recognition error:', event.error)

            let errorMessage = 'Voice recognition error'
            switch (event.error) {
                case 'no-speech':
                    errorMessage = 'No speech detected. Please try again.'
                    break
                case 'audio-capture':
                    errorMessage = 'No microphone found. Please check your device.'
                    break
                case 'not-allowed':
                    errorMessage = 'Microphone permission denied. Please allow microphone access.'
                    break
                case 'network':
                    errorMessage = 'Network error. Please check your connection.'
                    break
                default:
                    errorMessage = `Voice recognition error: ${event.error}`
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

    function startRecording() {
        if (!recognition.value && !initRecognition()) {
            return
        }

        try {
            recognition.value.start()
        } catch (error) {
            // Already started
            if (error.message.includes('already started')) {
                console.warn('Recognition already started')
            } else {
                voiceStore.setError(error.message)
            }
        }
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
