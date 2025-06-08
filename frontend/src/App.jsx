import { useState } from 'react';

// API endpoints
const MOOD_API_URL = 'https://moodsnap-mood.onrender.com/mood';
const SUGGESTION_API_URL = 'https://moodsnap-suggestion.onrender.com/suggest';

function App() {
  const [mood, setMood] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMoodAndSuggest = async () => {
    setIsLoading(true);
    setError(null);
    setMood('');
    setSuggestions([]);
    
    try {
      // Fetch mood
      console.log('Fetching mood from:', MOOD_API_URL);
      const moodResponse = await fetch(MOOD_API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!moodResponse.ok) {
        throw new Error(`Mood API error: ${moodResponse.status} ${moodResponse.statusText}`);
      }
      
      const moodData = await moodResponse.json();
      console.log('Mood API response:', moodData);
      
      if (moodData.status !== 'success') {
        throw new Error(moodData.message || 'Failed to get mood');
      }
      
      const currentMood = moodData.mood;
      setMood(currentMood);
      
      // Fetch suggestions
      const suggestionsUrl = `${SUGGESTION_API_URL}/${encodeURIComponent(currentMood)}`;
      console.log('Fetching suggestions from:', suggestionsUrl);
      
      const suggestionsResponse = await fetch(suggestionsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!suggestionsResponse.ok) {
        throw new Error(`Suggestions API error: ${suggestionsResponse.status} ${suggestionsResponse.statusText}`);
      }
      
      const suggestionsData = await suggestionsResponse.json();
      console.log('Suggestions API response:', suggestionsData);
      
      if (suggestionsData.status !== 'success') {
        throw new Error(suggestionsData.message || 'Failed to get suggestions');
      }
      
      setSuggestions(Array.isArray(suggestionsData.suggestions) ? suggestionsData.suggestions : []);
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{textAlign: 'center', marginTop: '4rem', padding: '20px'}}>
      <h1>MoodSnap</h1>
      <button 
        onClick={fetchMoodAndSuggest}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          backgroundColor: isLoading ? '#cccccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        {isLoading ? 'Loading...' : 'Snap Mood & Activity'}
      </button>
      
      {error && (
        <div style={{ color: 'red', margin: '20px 0', padding: '10px', backgroundColor: '#ffeeee', borderRadius: '4px' }}>
          Error: {error}
        </div>
      )}
      
      {mood && (
        <div style={{ margin: '20px 0' }}>
          <h2>Current Mood: {mood}</h2>
        </div>
      )}
      
      {suggestions.length > 0 && (
        <div style={{ margin: '20px auto', maxWidth: '500px', textAlign: 'left' }}>
          <h3>Suggested Activities:</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {suggestions.map((suggestion, i) => (
              <li 
                key={i}
                style={{
                  padding: '10px',
                  margin: '5px 0',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  borderLeft: '4px solid #007bff'
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Debug section - only shown in development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginTop: '40px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h3>Debug Info</h3>
          <div>Environment: {process.env.NODE_ENV}</div>
          <div>Last updated: {new Date().toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}

export default App;