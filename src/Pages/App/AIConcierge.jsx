import { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { api, getApiErrorMessage } from '../../Config/api';
import { EmptyState, ErrorState, Panel } from './DashboardParts';

const AIConcierge = ({ activeStay }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const sendMessage = async event => {
    event.preventDefault();
    const question = prompt.trim();
    if (!question || working) return;
    setWorking(true);
    setError('');
    try {
      const { data } = await api.post('/ai/concierge/chat', {
        prompt: question,
        ...(activeStay?._id ? { bookingId: activeStay._id } : {})
      });
      setMessages(current => [...current, {
        question,
        response: data.response,
        actionTriggered: data.actionTriggered
      }]);
      setPrompt('');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'The AI concierge is unavailable right now.'));
    } finally {
      setWorking(false);
    }
  };

  return (
    <Panel id="ai-concierge" title="AI guest concierge" meta="Ask about your stay, hotel services, or local recommendations">
      <div className="dash-panel-body dash-stack">
        {error && <ErrorState message={error} />}
        <div className="dash-concierge-messages" aria-live="polite">
          {messages.length === 0
            ? <EmptyState>Ask a question and our AI concierge will help. Room issues are sent to the team when you have an active stay.</EmptyState>
            : messages.map((message, index) => <div className="dash-concierge-message" key={`${index}-${message.question}`}>
              <p><strong>You</strong>{message.question}</p>
              <p><strong><Bot size={14} /> LuxuryStay Concierge</strong>{message.response}</p>
              {message.actionTriggered && <div className="dash-note" role="status">A maintenance request has been sent to the property team.</div>}
            </div>)}
        </div>
        <form className="dash-form-row" onSubmit={sendMessage}>
          <label className="dash-field dash-concierge-input">Your question<textarea required maxLength="1000" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="How can I request extra towels?" /></label>
          <button className="dash-button" type="submit" disabled={working || !prompt.trim()}><Send size={14} />{working ? 'Thinking…' : 'Ask concierge'}</button>
        </form>
      </div>
    </Panel>
  );
};

export default AIConcierge;
