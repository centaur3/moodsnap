import { useState } from 'react';

function App() {
  const [mood, setMood] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchMoodAndSuggest = async () => {
    const m = await fetch('https://moodsnap-mood.onrender.com/mood').then(r => r.text());
    setMood(m);
    const sug = await fetch(`https://moodsnap-suggestion.onrender.com/suggest/${m}`)
      .then(r => r.json());
    setSuggestions(sug);
  };

  return (
    <div style={{textAlign:'center', marginTop:'4rem'}}>
      <h1>MoodSnap</h1>
      <button onClick={fetchMoodAndSuggest}>Snap Mood & Activity</button>
      {mood && <h2>Current Mood: {mood}</h2>}
      {suggestions.length > 0 && (
        <ul>{suggestions.map((s,i)=><li key={i}>{s}</li>)}</ul>
      )}
    </div>
  );
}

export default App;