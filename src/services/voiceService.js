import api from './api'

export const processTranscript = async (transcript) => {
    const response = await api.post('/voice/process', { transcript })
    return response.data.data
}
