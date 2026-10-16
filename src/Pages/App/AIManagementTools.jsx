import { useState } from 'react';
import { BrainCircuit, Sparkles } from 'lucide-react';
import { api, getApiErrorMessage } from '../../Config/api';
import { EmptyState, ErrorState, Panel, Status } from './DashboardParts';
import { dateTimeLabel } from './DashboardUtils';

const AIManagementTools = ({ feedback = [] }) => {
  const [feedbackId, setFeedbackId] = useState('');
  const [insight, setInsight] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [working, setWorking] = useState('');
  const [error, setError] = useState('');

  const analyzeFeedback = async () => {
    const selectedFeedback = feedback.find(item => item._id === feedbackId);
    if (!selectedFeedback) return;
    setWorking('sentiment');
    setError('');
    try {
      const { data } = await api.post('/ai/sentiment/analyze', {
        feedbackId: selectedFeedback._id,
        commentText: selectedFeedback.comment || ''
      });
      setInsight(data.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Guest feedback could not be analyzed.'));
    } finally {
      setWorking('');
    }
  };

  const loadSchedule = async () => {
    setWorking('schedule');
    setError('');
    try {
      const { data } = await api.get('/ai/housekeeping/smart-schedule');
      setSchedule(data.schedule || []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Smart housekeeping recommendations could not be loaded.'));
    } finally {
      setWorking('');
    }
  };

  return (
    <Panel id="ai-tools" title="AI operations assistant" meta="Guest feedback analysis and smart room preparation">
      <div className="dash-panel-body dash-stack">
        {error && <ErrorState message={error} />}
        <div className="dash-ai-tool">
          <div className="dash-ai-heading"><BrainCircuit size={18} /><div><strong>Guest sentiment</strong><span>Extract themes and recommended staff action from a review.</span></div></div>
          <div className="dash-form-row">
            <label className="dash-field">Guest review<select value={feedbackId} onChange={event => setFeedbackId(event.target.value)}><option value="">Choose a review</option>{feedback.map(item => <option key={item._id} value={item._id}>{item.guest?.name || 'Guest'} · {item.rating}/5 · {String(item.comment || '').slice(0, 55)}</option>)}</select></label>
            <button className="dash-button" type="button" disabled={!feedbackId || Boolean(working)} onClick={analyzeFeedback}><Sparkles size={14} />{working === 'sentiment' ? 'Analyzing…' : 'Analyze feedback'}</button>
          </div>
          {insight && <div className="dash-ai-result"><div className="dash-toolbar"><Status value={insight.sentimentCategory} /><span>Score {Number(insight.sentimentScore).toFixed(2)}</span></div><p><strong>Suggested action:</strong> {insight.suggestedStaffAction}</p>{insight.extractedIssues?.length > 0 && <p><strong>Issues:</strong> {insight.extractedIssues.join(', ')}</p>}{insight.extractedPraise?.length > 0 && <p><strong>Guest praise:</strong> {insight.extractedPraise.join(', ')}</p>}</div>}
          {feedback.length === 0 && <EmptyState>No guest reviews are available to analyze.</EmptyState>}
        </div>
        <div className="dash-ai-tool">
          <div className="dash-ai-heading"><Sparkles size={18} /><div><strong>Smart housekeeping schedule</strong><span>Prioritize unclean rooms based on upcoming arrivals.</span></div></div>
          <button className="dash-button-secondary" type="button" disabled={Boolean(working)} onClick={loadSchedule}>{working === 'schedule' ? 'Prioritizing rooms…' : 'Generate cleaning schedule'}</button>
          {schedule.length > 0
            ? <div className="dash-list">{schedule.map(room => <div className="dash-list-item" key={room.roomId}><div className="dash-list-main"><strong>Room {room.roomNumber} · {room.roomType}</strong><span>{room.nextArrival ? `Next arrival ${dateTimeLabel(room.nextArrival)}` : 'No upcoming arrival'} · ~{room.estimatedTimeMinutes} min</span></div><Status value={room.recommendedCleaningOrder} /></div>)}</div>
            : schedule.length === 0 && working !== 'schedule' && <p className="dash-metric-note">Generate recommendations when rooms need preparation.</p>}
        </div>
      </div>
    </Panel>
  );
};

export default AIManagementTools;
