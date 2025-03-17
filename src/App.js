import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentStory, setCurrentStory] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const stories = [
    { id: 'george_camp', title: 'Путешествие в лагерь', author: 'Джордж', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Джорджа - Путешествие в лагерь.mp3', color: '#FF6F61' },
    { id: 'george_eliza', title: 'Элиза', author: 'Джордж', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Джорджа - Элиза.mp3', color: '#F7A440' },
    { id: 'mila_dream', title: 'Маленькая мечта', author: 'Мила', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Милы - Маленькая мечта.mp3', color: '#F7C948' },
  ];

  const audioRef = React.useRef(null);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      setTimeout(() => window.Telegram.WebApp.expand(), 100);
    }
  }, []);

  const playStory = (storyId) => {
    const story = stories.find(s => s.id === storyId);
    setCurrentStory(story);
    setIsPlayerOpen(true);
    const audio = audioRef.current;
    audio.src = story.url;
    audio.play();
    setIsPlaying(true);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const closePlayer = () => {
    const audio = audioRef.current;
    audio.pause();
    setIsPlaying(false);
    setCurrentStory(null);
    setIsPlayerOpen(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  return (
    <div className="flex flex-col h-screen bg-[#2A1B3D] text-white">
      {/* Основной контент */}
      <div className="flex-1 overflow-y-auto p-6 pb-20">
        {activeTab === 'today' ? (
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Сказки для сна</h1>
            {stories.map((story) => (
              <div
                key={story.id}
                className="story-card flex items-center mb-6 p-4 rounded-xl cursor-pointer transition-all hover:bg-opacity-80"
                style={{ backgroundColor: story.color }}
                onClick={() => playStory(story.id)}
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{story.title}</h3>
                  <p className="text-sm text-gray-200">By: {story.author}</p>
                </div>
                <button className="play-icon ml-4">
                  <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </button>
              </div>
            ))}
            {/* Фейковый контент для проверки скролла */}
            <div className="h-40"></div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6 mt-20 text-center">Спокойный сон — без усилий</h1>
            <p className="text-gray-300 mb-4 text-center">Премиум-доступ к сказкам для лёгкого засыпания.</p>
            <button className="catalog-button block w-4/5 mx-auto mt-4 p-3 bg-[#FFBF69] text-[#2A1B3D] rounded-lg hover:bg-[#FF9F1C] font-semibold">
              Каталог
            </button>
          </div>
        )}
      </div>

      {/* Полноэкранный плеер */}
      {isPlayerOpen && currentStory && (
        <div className="fixed inset-0 bg-[#2A1B3D] flex flex-col items-center justify-center p-6 z-50">
          <div className="player-cover mb-6" style={{ backgroundColor: currentStory.color, width: '200px', height: '200px', borderRadius: '16px' }}></div>
          <h2 className="text-xl font-bold mb-2">{currentStory.title}</h2>
          <p className="text-sm text-gray-400 mb-4">By: {currentStory.author}</p>
          <div className="player-controls flex justify-center gap-6 mb-4">
            <button className="player-button">
              <svg width="24" height="24" fill="none" stroke="#FFBF69" strokeWidth="2">
                <polygon points="19 20 9 12 19 4 19 20"/>
                <line x1="5" y1="4" x2="5" y2="20"/>
              </svg>
            </button>
            <button className="player-button play-button" onClick={togglePlay}>
              {isPlaying ? (
                <svg width="32" height="32" fill="#FFBF69">
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg>
              ) : (
                <svg width="32" height="32" fill="#FFBF69">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              )}
            </button>
            <button className="player-button">
              <svg width="24" height="24" fill="none" stroke="#FFBF69" strokeWidth="2">
                <polygon points="5 4 15 12 5 20 5 4"/>
                <line x1="19" y1="4" x2="19" y2="20"/>
              </svg>
            </button>
          </div>
          <div className="time flex justify-between text-sm text-gray-300 w-full max-w-md mb-4">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="progress-bar w-full max-w-md h-1 bg-gray-600 rounded-full">
            <div
              className="progress h-1 bg-[#FFBF69] rounded-full"
              style={{ width: `${(currentTime / duration) * 100 || 0}%`, transition: 'width 0.1s linear' }}
            ></div>
          </div>
          <button className="mt-6 text-gray-300 text-sm" onClick={closePlayer}>Закрыть</button>
        </div>
      )}

      {/* Меню внизу */}
      <div className="tab-buttons fixed bottom-0 left-0 right-0 flex justify-around bg-[#2A1B3D] p-2 rounded-t-xl shadow-lg z-10">
        <button
          className={`tab-button flex flex-col items-center p-2 rounded-lg ${activeTab === 'today' ? 'bg-[#44318D] text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('today')}
        >
          <span className="text-lg">🕒</span>
          Сегодня
        </button>
        <button
          className={`tab-button flex flex-col items-center p-2 rounded-lg ${activeTab === 'sleep' ? 'bg-[#44318D] text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('sleep')}
        >
          <span className="text-lg">🌙</span>
          Сон
        </button>
      </div>
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
      />
    </div>
  );
}

export default App;