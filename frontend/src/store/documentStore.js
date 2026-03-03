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

export const useDocumentStore = create((set, get) => ({
  // State
  documents: [],
  currentDocument: null,
  isLoading: false,
  uploadProgress: 0,

  // Actions
  uploadDocument: async (file) => {
    set({ isLoading: true, uploadProgress: 0 });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, '')); // Remove extension

      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          set({ uploadProgress: progress });
        },
      });

      const newDocument = response.data;
      
      set((state) => ({
        documents: [newDocument, ...state.documents],
        currentDocument: newDocument,
        isLoading: false,
        uploadProgress: 0,
      }));

      return newDocument;
    } catch (error) {
      set({ isLoading: false, uploadProgress: 0 });
      const message = error.response?.data?.detail || 'Upload failed';
      throw new Error(message);
    }
  },

  getDocuments: async (skip = 0, limit = 50) => {
    set({ isLoading: true });
    
    try {
      const response = await api.get('/documents/', {
        params: { skip, limit },
      });

      set({
        documents: response.data,
        isLoading: false,
      });

      return response.data;
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.detail || 'Failed to fetch documents';
      throw new Error(message);
    }
  },

  getDocument: async (documentId) => {
    set({ isLoading: true });
    
    try {
      const response = await api.get(`/documents/${documentId}`);
      
      set({
        currentDocument: response.data,
        isLoading: false,
      });

      return response.data;
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.detail || 'Failed to fetch document';
      throw new Error(message);
    }
  },

  processOCR: async (documentId) => {
    set({ isLoading: true });
    
    try {
      const response = await api.post(`/documents/${documentId}/ocr`);
      
      // Update current document with OCR results
      const { currentDocument } = get();
      if (currentDocument && currentDocument.id === documentId) {
        set({
          currentDocument: {
            ...currentDocument,
            extracted_text: response.data.text,
            ocr_confidence: response.data.confidence,
            word_count: response.data.word_count,
            char_count: response.data.char_count,
            processing_status: 'completed',
          },
          isLoading: false,
        });
      }

      return response.data;
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.detail || 'OCR processing failed';
      throw new Error(message);
    }
  },

  deleteDocument: async (documentId) => {
    set({ isLoading: true });
    
    try {
      await api.delete(`/documents/${documentId}`);
      
      set((state) => ({
        documents: state.documents.filter(doc => doc.id !== documentId),
        currentDocument: state.currentDocument?.id === documentId ? null : state.currentDocument,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.detail || 'Failed to delete document';
      throw new Error(message);
    }
  },

  updateDocument: async (documentId, updateData) => {
    set({ isLoading: true });
    
    try {
      const response = await api.put(`/documents/${documentId}`, updateData);
      
      // Update documents list and current document
      set((state) => ({
        documents: state.documents.map(doc =>
          doc.id === documentId ? response.data : doc
        ),
        currentDocument: state.currentDocument?.id === documentId 
          ? response.data 
          : state.currentDocument,
        isLoading: false,
      }));

      return response.data;
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.detail || 'Failed to update document';
      throw new Error(message);
    }
  },

  setCurrentDocument: (document) => {
    set({ currentDocument: document });
  },

  clearCurrentDocument: () => {
    set({ currentDocument: null });
  },

  // Utility function to format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Utility function to get file icon based on MIME type
  getFileIcon: (mimeType) => {
    if (mimeType?.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    return '📁';
  },
}));
