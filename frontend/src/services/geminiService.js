// Gemini AI Service for ADLTrack Copilot
// Uses backend API for AI chat functionality

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Store chat sessions by ID
const chatSessions = {};

/**
 * Creates or retrieves a chat session for the given ID
 * @param {string} sessionId - Unique session identifier
 * @param {string} role - User role (caregiver or family)
 * @returns {object} Chat session object
 */
export const createChatSession = (sessionId, role = 'caregiver') => {
  if (!chatSessions[sessionId]) {
    chatSessions[sessionId] = {
      id: sessionId,
      role: role,
      messages: [],
      createdAt: new Date().toISOString()
    };
  }
  return chatSessions[sessionId];
};

/**
 * Sends a message to the AI copilot and gets a response
 * @param {string} sessionId - Chat session ID
 * @param {string} message - User message
 * @param {string} role - User role
 * @param {object} context - Additional context (patient info, etc.)
 * @returns {Promise<string>} AI response
 */
export const sendChatMessage = async (sessionId, message, role = 'caregiver', context = {}) => {
  try {
    const response = await fetch(`${API_URL}/api/copilot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        message: message,
        role: role,
        context: context
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Copilot chat error:', error);
    // Return a helpful fallback message
    return getFallbackResponse(message, role);
  }
};

/**
 * Provides fallback responses when AI service is unavailable
 */
const getFallbackResponse = (message, role) => {
  const lowerMessage = message.toLowerCase();
  
  // Emergency detection
  if (lowerMessage.includes('emergency') || lowerMessage.includes('911') || 
      lowerMessage.includes('heart attack') || lowerMessage.includes('not breathing')) {
    return "⚠️ EMERGENCY DETECTED: If this is a medical emergency, please call 911 immediately. I cannot provide medical diagnosis or treatment advice. Your safety and the patient's safety is the top priority.";
  }
  
  // Common caregiver questions
  if (role === 'caregiver') {
    if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
      return "For medication questions, always refer to the care plan and medication list in the patient's profile. If you're unsure about a medication, contact the supervising nurse or the patient's physician before administering.";
    }
    if (lowerMessage.includes('transfer') || lowerMessage.includes('lift')) {
      return "For safe transfers: 1) Ensure the patient is aware and ready, 2) Use proper body mechanics - bend at your knees, not your back, 3) Use transfer aids like gait belts when available, 4) Never rush the process. If the patient is heavier than you can safely manage, request assistance.";
    }
    if (lowerMessage.includes('fall') || lowerMessage.includes('fell')) {
      return "If a patient has fallen: 1) Stay calm, 2) Don't move them immediately - check for injuries first, 3) Ask where they hurt, 4) If there's any head injury or they can't get up, call for medical assistance, 5) Document the incident thoroughly with photos and notes.";
    }
  }
  
  // Family member questions
  if (role === 'family') {
    if (lowerMessage.includes('how is') || lowerMessage.includes('doing')) {
      return "You can check your loved one's status in the Timeline tab, which shows completed tasks and any notes from the caregiver. The Vitals section shows the latest health readings. If you have specific concerns, use the Chat feature to message the caregiver directly.";
    }
    if (lowerMessage.includes('caregiver') || lowerMessage.includes('who')) {
      return "You can view the current caregiver's profile by tapping on their information in the dashboard. This shows their certifications, experience, and contact information. You can also message them directly through the app.";
    }
  }
  
  // Default response
  return "I'm here to help! I can assist with care-related questions, task guidance, and general information. For medical emergencies, always call 911. What would you like to know?";
};

/**
 * Gets the greeting message based on role
 */
export const getGreeting = (role, patientName = 'the patient') => {
  if (role === 'caregiver') {
    return `Hello! I'm your AI Care Assistant. I'm here to help you provide the best care for ${patientName}. I can answer questions about care procedures, help with documentation, and provide guidance on tasks. How can I assist you today?`;
  } else {
    return `Hello! I'm your Family Care Assistant. I can help you understand ${patientName}'s care plan, explain medical terms, and keep you informed about their well-being. What would you like to know?`;
  }
};

/**
 * Clears a chat session
 */
export const clearChatSession = (sessionId) => {
  if (chatSessions[sessionId]) {
    delete chatSessions[sessionId];
  }
};

export default {
  createChatSession,
  sendChatMessage,
  getGreeting,
  clearChatSession
};
