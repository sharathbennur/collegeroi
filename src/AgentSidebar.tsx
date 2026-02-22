import { useState, type FormEvent } from 'react';
import './AgentSidebar.css';

interface AgentSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const AgentSidebar = ({ isOpen, onClose }: AgentSidebarProps) => {
    const [input, setInput] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        // TODO: Implement actual agent interaction
        console.log('User sent:', input);
        setInput('');
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
                <div className="agent-message-placeholder">
                    <p>Hi! I'm your College ROI Agent.</p>
                    <p>I can help you find data, estimate costs, or compare colleges.</p>
                    <p><em>(Chat functionality coming soon...)</em></p>
                </div>
            </div>

            <div className="agent-sidebar-footer">
                <form className="agent-input-container" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="agent-input"
                        placeholder="Ask me anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" className="agent-send-button">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AgentSidebar;
