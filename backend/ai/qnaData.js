// This is your AI's "training data".
// Add keywords (in lowercase) and the answer you want the AI to give.
// The AI will find the first match.

const qnaData = [
  {
    keywords: ["hello", "hi", "hey"],
    answer: "Hello! How can I help you with our construction offerings today?"
  },
  {
    keywords: ["price", "cost", "how much", "lakh", "crore"],
    answer: "We have several plans: Standard (from ₹20 Lakh), Premium (from ₹50 Lakh), and Custom (₹1 Crore & above). Which one are you interested in?"
  },
  {
    keywords: ["standard", "20 lakh"],
    answer: "The Standard plan is a high-quality residential home, perfect for families. An admin will be with you shortly to discuss the specifics."
  },
  {
    keywords: ["premium", "50 lakh"],
    answer: "The Premium plan includes more spacious layouts and luxury fittings. An admin will be with you shortly to go over the details."
  },
  {
    keywords: ["admin", "human", "talk to person", "real person"],
    answer: "I understand. I'm notifying an admin for you now. They will join this chat shortly to assist you."
  }
];

// Default response if no keywords match
const defaultResponse = "I'm not sure I understand. I am notifying an admin who can help with your specific question. They will join this chat shortly.";

// Handoff phrase (if this is returned, the chat will be transferred to an admin)
const handoffPhrase = "An admin will be with you shortly";

module.exports = {
  qnaData,
  defaultResponse,
  handoffPhrase
};
