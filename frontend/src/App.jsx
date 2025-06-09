import { useState } from 'react';

// API endpoints - with offline fallback
const MOOD_API_URL = 'https://moodsnap-mood.onrender.com/mood';
const SUGGESTION_API_URL = 'https://moodsnap-suggestion.onrender.com/suggest';

// Offline data
const OFFLINE_MOODS = ['happy', 'sad', 'excited', 'tired'];
const OFFLINE_SUGGESTIONS = {
  'happy': ["Go for a walk", "Call a friend", "Listen to your favorite music"],
  'sad': ["Listen to uplifting music", "Call a friend", "Watch a funny video"],
  'excited': ["Plan an adventure", "Try something new", "Share your excitement with someone"],
  'tired': ["Take a short nap", "Drink some water", "Do some light stretching"]
};

function App() {
  const [mood, setMood] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [showOfflineMode, setShowOfflineMode] = useState(false);

  const getRandomMood = () => {
    return OFFLINE_MOODS[Math.floor(Math.random() * OFFLINE_MOODS.length)];
  };

  const getOfflineSuggestions = (mood) => {
    return OFFLINE_SUGGESTIONS[mood] || ["Try taking a break", "Drink some water"];
  };
  
  const useOfflineMode = () => {
    const randomMood = getRandomMood();
    setMood(randomMood);
    setSuggestions(getOfflineSuggestions(randomMood));
    setError('Using offline mode. Try online services when available.');
    setShowOfflineMode(false);
  };

  const fetchMoodAndSuggest = async () => {
    if (!isOnline) {
      useOfflineMode();
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setMood('');
    setSuggestions([]);
    
    let currentMood = '';
    let onlineSuccess = false;
    
    try {
      // Try to fetch mood from the API
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
      
      currentMood = moodData.mood;
      setMood(currentMood);
      onlineSuccess = true;
      
      // Try to fetch suggestions
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
      setError(null);
      
    } catch (error) {
      console.error('Error:', error);
      if (!onlineSuccess) {
        // If we couldn't connect to the mood service, use offline mode
        setShowOfflineMode(true);
      } else {
        // If we got the mood but not suggestions, use offline suggestions
        setSuggestions(getOfflineSuggestions(currentMood));
        setError('Suggestions service is unavailable. Using offline suggestions.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between online and offline mode
  const toggleOnlineMode = () => {
    const newMode = !isOnline;
    setIsOnline(newMode);
    if (newMode) {
      setError('Online mode enabled. Try fetching mood and suggestions.');
    } else {
      useOfflineMode();
    }
  };

  return (
    <div style={{textAlign: 'center', marginTop: '4rem', padding: '20px'}}>
      <h1>MoodSnap</h1>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={toggleOnlineMode}
          style={{
            padding: '8px 16px',
            margin: '0 10px 20px 0',
            fontSize: '14px',
            backgroundColor: isOnline ? '#4CAF50' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isOnline ? 'Online Mode' : 'Offline Mode'}
        </button>
      </div>
      
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
          marginBottom: '20px'
        }}
      >
        {isLoading ? 'Loading...' : isOnline ? 'Snap Mood & Activity (Online)' : 'Get Random Mood & Activities (Offline)'}
      </button>
      
      {showOfflineMode && (
        <div style={{ 
          margin: '20px auto', 
          maxWidth: '500px',
          padding: '15px',
          backgroundColor: '#fff3e0',
          borderLeft: '4px solid #ff9800',
          textAlign: 'left',
          borderRadius: '4px'
        }}>
          <h3>Unable to connect to online services</h3>
          <p>Would you like to use offline mode instead?</p>
          <button 
            onClick={useOfflineMode}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Use Offline Mode
          </button>
          <button 
            onClick={() => setShowOfflineMode(false)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      )}
      
      {error && !showOfflineMode && (
        <div style={{ 
          color: '#d32f2f', 
          margin: '20px 0', 
          padding: '15px', 
          backgroundColor: '#ffebee', 
          borderRadius: '4px',
          borderLeft: '4px solid #f44336',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto',
          textAlign: 'left'
        }}>
          {error}
        </div>
      )}
      
      {mood && (
        <div style={{ margin: '20px 0' }}>
          <h2>Current Mood: {mood}</h2>
        </div>
      )}
      
      {suggestions.length > 0 && (
        <div style={{ margin: '20px auto', maxWidth: '500px', textAlign: 'left' }}>
          <h3>
            {!isOnline ? 'Offline ' : ''}Suggested Activities:
            {!isOnline && (
              <span style={{
                fontSize: '0.8em',
                color: '#ff9800',
                marginLeft: '10px',
                fontWeight: 'normal'
              }}>
                (Offline Mode)
              </span>
            )}
          </h3>
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