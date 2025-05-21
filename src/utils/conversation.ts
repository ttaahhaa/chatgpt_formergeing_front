import { api } from '@/services/api';

export async function getOrCreateEmptyConversation() {
    try {
        // Get all conversations
        const { conversations } = await api.getConversations();

        // Find an empty conversation
        const emptyConversation = conversations.find(conv => conv.messageCount === 0);

        if (emptyConversation) {
            // Use existing empty conversation
            console.log('Using existing empty conversation:', emptyConversation.id);
            return emptyConversation.id;
        }

        // Create new conversation if no empty one exists
        const result = await api.createNewConversation();
        if (result?.conversation_id) {
            console.log("New conversation created:", result.conversation_id);
            return result.conversation_id;
        }

        throw new Error('Failed to create new conversation');
    } catch (err) {
        console.error('Error in getOrCreateEmptyConversation:', err);
        throw err;
    }
} 