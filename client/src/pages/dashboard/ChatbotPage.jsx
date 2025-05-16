import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ChatbotPage = () => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const response = await api.get('/api/ai/conversations');
            setConversations(response.data);

            // Set active conversation to the most recent one if it exists
            if (response.data.length > 0) {
                setActiveConversation(response.data[0].id);
                fetchMessages(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const response = await api.get(`/api/ai/conversations/${conversationId}/messages`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const createNewConversation = async () => {
        try {
            const response = await api.post('/api/ai/conversations', {
                title: 'New Conversation'
            });
            setConversations([response.data, ...conversations]);
            setActiveConversation(response.data.id);
            setMessages([]);
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Create conversation if none exists
            let conversationId = activeConversation;
            if (!conversationId) {
                const newConversation = await api.post('/api/ai/conversations', {
                    title: input.substring(0, 30) + (input.length > 30 ? '...' : '')
                });
                conversationId = newConversation.data.id;
                setActiveConversation(conversationId);
                setConversations([newConversation.data, ...conversations]);
            }

            // Send message to API
            const response = await api.post(`/api/ai/conversations/${conversationId}/messages`, {
                content: input
            });

            // Update conversation title if it's the first message
            if (messages.length === 0) {
                const updatedConversations = conversations.map(conv =>
                    conv.id === conversationId
                        ? { ...conv, title: input.substring(0, 30) + (input.length > 30 ? '...' : '') }
                        : conv
                );
                setConversations(updatedConversations);
            }

            // Add AI response to messages
            setMessages(prev => [...prev, response.data]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again later.',
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConversationSelect = (conversationId) => {
        setActiveConversation(conversationId);
        fetchMessages(conversationId);
    };

    const handleDeleteConversation = async (e, conversationId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this conversation?')) return;

        try {
            await api.delete(`/api/ai/conversations/${conversationId}`);
            setConversations(conversations.filter(conv => conv.id !== conversationId));

            if (activeConversation === conversationId) {
                if (conversations.length > 1) {
                    const newActiveConv = conversations.find(conv => conv.id !== conversationId);
                    setActiveConversation(newActiveConv.id);
                    fetchMessages(newActiveConv.id);
                } else {
                    setActiveConversation(null);
                    setMessages([]);
                }
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="container mx-auto h-full">
            <div className="flex h-[calc(100vh-12rem)] overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-base-200 border-r border-base-300 flex flex-col">
                    <div className="p-4 border-b border-base-300">
                        <button
                            onClick={createNewConversation}
                            className="btn btn-primary w-full"
                        >
                            New Conversation
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {conversations.length === 0 ? (
                            <div className="text-center p-4 text-base-content/70">
                                No conversations yet
                            </div>
                        ) : (
                            <ul className="menu p-2">
                                {conversations.map(conversation => (
                                    <li key={conversation.id}>
                                        <a
                                            className={activeConversation === conversation.id ? 'active' : ''}
                                            onClick={() => handleConversationSelect(conversation.id)}
                                        >
                                            <div className="flex justify-between items-center w-full">
                                                <span className="truncate">{conversation.title}</span>
                                                <button
                                                    className="btn btn-ghost btn-xs"
                                                    onClick={(e) => handleDeleteConversation(e, conversation.id)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-base-100">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                <div className="mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
                                <p className="text-base-content/70 max-w-md">
                                    Ask me anything about your projects, portfolio, or get help with coding problems.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}
                                    >
                                        <div className="chat-image avatar">
                                            <div className="w-10 rounded-full">
                                                <img
                                                    src={message.role === 'user' ? currentUser.avatar : '/ai-avatar.png'}
                                                    alt={message.role === 'user' ? 'User' : 'AI'}
                                                />
                                            </div>
                                        </div>
                                        <div className="chat-header">
                                            {message.role === 'user' ? currentUser.name : 'AI Assistant'}
                                            <time className="text-xs opacity-50 ml-1">{formatTimestamp(message.timestamp)}</time>
                                        </div>
                                        <div className={`chat-bubble ${message.role === 'user' ? 'chat-bubble-primary' : ''}`}>
                                            {message.content}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="chat chat-start">
                                        <div className="chat-image avatar">
                                            <div className="w-10 rounded-full">
                                                <img src="/ai-avatar.png" alt="AI" />
                                            </div>
                                        </div>
                                        <div className="chat-bubble">
                                            <span className="loading loading-dots loading-md"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-base-300 bg-base-100">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="input input-bordered flex-1"
                                placeholder="Type your message here..."
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoading || !input.trim()}
                            >
                                {isLoading ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatbotPage;