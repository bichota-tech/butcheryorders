import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useVoiceSessionStore = defineStore('voiceSession', () => {
    const isRecording = ref(false)
    const transcript = ref('')
    const interimTranscript = ref('')
    const confidence = ref(0)
    const recognizedItems = ref([])
    const error = ref(null)
    const isProcessing = ref(false)

    const fullTranscript = computed(() => {
        const parts = [transcript.value]
        if (interimTranscript.value) {
            parts.push(interimTranscript.value)
        }
        return parts.filter(Boolean).join(' ')
    })

    const hasTranscript = computed(() => transcript.value.length > 0)

    function startRecording() {
        isRecording.value = true
        error.value = null
    }

    function stopRecording() {
        isRecording.value = false
    }

    function updateTranscript(text, isInterim = false) {
        if (isInterim) {
            interimTranscript.value = text
        } else {
            if (transcript.value) {
                transcript.value += ' ' + text
            } else {
                transcript.value = text
            }
            interimTranscript.value = ''
        }
    }

    function setConfidence(value) {
        confidence.value = value
    }

    function setRecognizedItems(items) {
        recognizedItems.value = items
    }

    function addRecognizedItem(item) {
        recognizedItems.value.push(item)
    }

    function removeRecognizedItem(index) {
        recognizedItems.value.splice(index, 1)
    }

    function updateRecognizedItem(index, updates) {
        if (recognizedItems.value[index]) {
            recognizedItems.value[index] = {
                ...recognizedItems.value[index],
                ...updates
            }
        }
    }

    function setError(err) {
        error.value = err
        isRecording.value = false
    }

    function setProcessing(value) {
        isProcessing.value = value
    }

    function reset() {
        isRecording.value = false
        transcript.value = ''
        interimTranscript.value = ''
        confidence.value = 0
        recognizedItems.value = []
        error.value = null
        isProcessing.value = false
    }

    function clearError() {
        error.value = null
    }

    return {
        isRecording,
        transcript,
        interimTranscript,
        fullTranscript,
        confidence,
        recognizedItems,
        error,
        isProcessing,
        hasTranscript,
        startRecording,
        stopRecording,
        updateTranscript,
        setConfidence,
        setRecognizedItems,
        addRecognizedItem,
        removeRecognizedItem,
        updateRecognizedItem,
        setError,
        setProcessing,
        reset,
        clearError
    }
})
