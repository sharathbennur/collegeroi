import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useStream } from '@langchain/langgraph-sdk/react';
import './AgentSidebar.css';

interface AgentSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const AgentSidebar = ({ isOpen, onClose }: AgentSidebarProps) => {
    const [input, setInput] = useState('');
    const { messages, submit, isLoading } = useStream({
        apiUrl: 'http://localhost:8000/chat',
        assistantId: 'collegeroi-agent', // Need to provide an assistantId
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput('');

        try {
            // Assuming the backend expects { messages: [{ role: 'user', content: '...' }] } or similar
            await submit({ messages: [{ role: 'user', content: userMessage }] });
        } catch (error) {
            console.error('Error submitting message:', error);
            // Optional: restore input on error
            setInput(userMessage);
        }
    };

    // Helper to safely render message content
    const renderMessageContent = (content: any) => {
        if (typeof content === 'string') {
            return content;
        }
        if (Array.isArray(content)) {
            return content.map((c: any, i: number) => {
                if (c.type === 'text') return <span key={i}>{c.text}</span>;
                return null;
            });
        }
        return JSON.stringify(content);
    };

    return (
        <div className="agent-sidebar">
            <div className="agent-sidebar-header">
                <h3>
                    <span role="img" aria-label="robot">🤖</span> Agent Co-pilot
                </h3>
                <button className="close-agent-button" onClick={onClose} aria-label="Close sidebar">
                    ✕
                </button>
            </div>

            <div className="agent-sidebar-body">
                {!messages || messages.length === 0 ? (
                    <div className="agent-message-placeholder">
                        <p>Hi! I'm your College ROI Agent.</p>
                        <p>I can help you find data, estimate costs, or compare colleges.</p>
                    </div>
                ) : (
                    <div className="agent-messages-list">
                        {messages.map((message: any) => (
                            <div
                                key={message.id || Math.random().toString()}
                                className={`agent-message ${message.type === 'human' ? 'user-message' : 'bot-message'}`}
                            >
                                {renderMessageContent(message.content)}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="agent-message bot-message loading-indicator">
                                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            <div className="agent-sidebar-footer">
                <form className="agent-input-container" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="agent-input"
                        placeholder="Ask me anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" className="agent-send-button" disabled={isLoading || !input.trim()}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AgentSidebar;
