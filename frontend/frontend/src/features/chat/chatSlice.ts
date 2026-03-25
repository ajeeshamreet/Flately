// @ts-nocheck
import { createSlice } from '@reduxjs/toolkit';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  matchId: string;
  messages: Message[];
}

interface ChatState {
  conversations: Record<string, Conversation>;
  activeConversationId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: {},
  activeConversationId: null,
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },
    setConversation: (state, action) => {
      const { conversationId, messages } = action.payload;
      state.conversations[conversationId] = {
        id: conversationId,
        matchId: conversationId,
        messages: messages || [],
      };
      state.loading = false;
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (state.conversations[conversationId]) {
        state.conversations[conversationId].messages.push(message);
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearChat: (state) => {
      state.conversations = {};
      state.activeConversationId = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setActiveConversation,
  setConversation,
  addMessage,
  setError,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
