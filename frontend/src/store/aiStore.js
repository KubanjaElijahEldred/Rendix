import { create } from 'zustand';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 30000,
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage');
  if (token) {
    const parsedToken = JSON.parse(token);
    if (parsedToken.state?.token) {
      config.headers.Authorization = `Bearer ${parsedToken.state.token}`;
    }
  }
  return config;
});

export const useAIStore = create((set, get) => ({
  // State
  currentResponse: null,
  audioData: null,
  isProcessing: false,
  processingType: null,
  processingHistory: [],
  availableVoices: [],

  // Actions
  processAIRequest: async (type, data) => {
    set({ isProcessing: true, processingType: type, currentResponse: null, audioData: null });
    
    try {
      let response;
      let responseData = {};

      switch (type) {
        case 'explain':
          response = await api.post('/ai/explain', data);
          responseData = {
            type: 'explanation',
            content: response.data.explanation,
            metadata: {
              tokens: response.data.tokens_used,
              model: response.data.model,
            },
            timestamp: new Date().toISOString(),
          };
          break;

        case 'translate':
          response = await api.post('/ai/translate', data);
          responseData = {
            type: 'translation',
            content: response.data.translation,
            metadata: {
              sourceLanguage: response.data.source_language,
              targetLanguage: response.data.target_language,
              tokens: response.data.tokens_used,
            },
            timestamp: new Date().toISOString(),
          };
          break;

        case 'report':
          response = await api.post('/ai/report', data);
          responseData = {
            type: 'report',
            content: response.data.report,
            metadata: {
              reportType: response.data.report_type,
              tokens: response.data.tokens_used,
            },
            timestamp: new Date().toISOString(),
          };
          break;

        case 'tts':
          response = await api.post('/ai/tts', data);
          responseData = {
            type: 'speech',
            content: `Generated speech for: ${data.text.substring(0, 100)}...`,
            metadata: {
              voiceId: response.data.voice_id,
              provider: response.data.provider,
              textLength: response.data.text_length,
              duration: response.data.duration_estimate,
            },
            timestamp: new Date().toISOString(),
          };
          // Store audio data separately
          set({ audioData: response.data.audio_data });
          break;

        case 'stt':
          // For STT, we'd need to handle file upload differently
          // This is a placeholder implementation
          responseData = {
            type: 'transcription',
            content: 'Speech transcription would appear here',
            metadata: {
              language: 'en',
              confidence: 0.95,
            },
            timestamp: new Date().toISOString(),
          };
          break;

        case 'pdf':
          response = await api.post('/ai/pdf', data);
          responseData = {
            type: 'pdf',
            content: `PDF created: ${data.title}`,
            metadata: {
              title: response.data.title,
              size: response.data.pdf_data?.length || 0,
            },
            timestamp: new Date().toISOString(),
          };
          // Handle PDF download if needed
          if (response.data.pdf_data) {
            const blob = new Blob([Uint8Array.from(atob(response.data.pdf_data), c => c.charCodeAt(0))], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${data.title}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
          }
          break;

        case 'ocr':
          // OCR is handled through document store, but we can track it here
          responseData = {
            type: 'ocr',
            content: 'Document processed with OCR',
            metadata: {
              documentId: data.documentId,
            },
            timestamp: new Date().toISOString(),
          };
          break;

        default:
          throw new Error(`Unknown AI request type: ${type}`);
      }

      // Add to history
      set((state) => ({
        currentResponse: responseData,
        processingHistory: [responseData, ...state.processingHistory].slice(0, 50), // Keep last 50 items
        isProcessing: false,
        processingType: null,
      }));

      return responseData;
    } catch (error) {
      const errorResponse = {
        type: 'error',
        content: `Error: ${error.response?.data?.detail || error.message || 'Processing failed'}`,
        metadata: {
          errorType: type,
          statusCode: error.response?.status,
        },
        timestamp: new Date().toISOString(),
      };

      set({
        currentResponse: errorResponse,
        isProcessing: false,
        processingType: null,
      });

      throw error;
    }
  },

  // Get available TTS voices
  getVoices: async () => {
    try {
      const response = await axios.get('/api/ai/voices');
      
      set({
        availableVoices: response.data.voices,
      });

      return response.data.voices;
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      return [];
    }
  },

  // Clear current response
  clearResponse: () => {
    set({
      currentResponse: null,
      audioData: null,
    });
  },

  // Clear processing history
  clearHistory: () => {
    set({
      processingHistory: [],
    });
  },

  // Set processing state manually (for UI feedback)
  setProcessing: (isProcessing, type = null) => {
    set({
      isProcessing,
      processingType: type,
    });
  },

  // Get response from history by ID or index
  getHistoryItem: (identifier) => {
    const { processingHistory } = get();
    
    if (typeof identifier === 'number') {
      return processingHistory[identifier];
    } else {
      return processingHistory.find(item => item.id === identifier);
    }
  },

  // Export processing history
  exportHistory: () => {
    const { processingHistory } = get();
    
    const historyData = {
      exportDate: new Date().toISOString(),
      totalItems: processingHistory.length,
      items: processingHistory,
    };

    const blob = new Blob([JSON.stringify(historyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rendix-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Get statistics about processing history
  getProcessingStats: () => {
    const { processingHistory } = get();
    
    const stats = {
      total: processingHistory.length,
      byType: {},
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    processingHistory.forEach(item => {
      // Count by type
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;

      // Count by time period
      const itemDate = new Date(item.timestamp);
      if (itemDate >= today) stats.today++;
      if (itemDate >= weekAgo) stats.thisWeek++;
      if (itemDate >= monthAgo) stats.thisMonth++;
    });

    return stats;
  },
}));
