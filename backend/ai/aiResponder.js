// Simple rule-based AI responder for now
// You can replace this with a call to OpenAI or Gemini later

const getCustomAIResponse = (message) => {
  const msg = message.toLowerCase();
  
  if (msg.includes('price') || msg.includes('cost')) {
    return "Our pricing depends on the specific project requirements. A standard house starts around ₹20 Lakh. Would you like to see a detailed breakdown?";
  }
  
  if (msg.includes('hello') || msg.includes('hi')) {
    return "Hello! How can I help you with your construction project today?";
  }

  if (msg.includes('admin') || msg.includes('human') || msg.includes('talk to someone')) {
    return "I can connect you with an admin. Please type 'admin' to switch to a live agent.";
  }

  return "I understand. Could you provide more details about what you are looking for so I can assist you better?";
};

const shouldHandoff = (aiResponse) => {
  // Logic to determine if the conversation should be handed off to a human
  // For now, let's just return false and let the client explicitly request it
  // You can make this smarter later
  return false; 
};

module.exports = { getCustomAIResponse, shouldHandoff };