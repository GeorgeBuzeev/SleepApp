import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentStory, setCurrentStory] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const stories = [
    { id: 'george_camp', title: 'Путешествие в лагерь', author: 'Джордж', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Джорджа - Путешествие в лагерь.mp3', cover: '#F5C563' },
    { id: 'george_eliza', title: 'Элиза', author: 'Джордж', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Джорджа - Элиза.mp3', cover: '#F28C38' },
    { id: 'mila_dream', title: 'Маленькая мечта', author: 'Мила', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Милы - Маленькая мечта.mp3', cover: '#E5989B' },
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
    setIsMinimized(false);
    const audio = audioRef.current;
    audio.src = story.url;
    audio.play().catch((error) => console.log('Error playing audio:', error));
    setIsPlaying(true);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => console.log('Error playing audio:', error));
    }
    setIsPlaying(!isPlaying);
  };

  const minimizePlayer = () => {
    setIsMinimized(true);
  };

  const maximizePlayer = () => {
    setIsMinimized(false);
  };

  const closePlayer = () => {
    const audio = audioRef.current;
    audio.pause();
    setIsPlaying(false);
    setCurrentStory(null);
    setIsPlayerOpen(false);
    setIsMinimized(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  return (
    <div className="app-container">
      {/* Основной контент */}
      <div className="content-container">
        {activeTab === 'today' ? (
          <div className="main-content">
            <h1 className="app-title">Сказки для сна</h1>
            {stories.map((story) => (
              <div
                key={story.id}
                className="story-card"
                onClick={() => playStory(story.id)}
              >
                <div className="story-cover" style={{ backgroundColor: story.cover }}></div>
                <div className="story-info">
                  <h3 className="story-title">{story.title}</h3>
                  <p className="story-author">By: {story.author}</p>
                </div>
                <button className="play-icon">
                  <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </button>
              </div>
            ))}
            <div className="spacer"></div>
          </div>
        ) : (
          <div className="main-content">
            <h1 className="app-title">Спокойный сон</h1>
            <p className="app-subtitle">Премиум-доступ к сказкам для лёгкого засыпания.</p>
            <button className="catalog-button">Каталог</button>
          </div>
        )}
      </div>

      {/* Полноэкранный плеер */}
      {isPlayerOpen && !isMinimized && (
        <div className="player-overlay">
          <div className="player-container">
            <div className="player-cover" style={{ backgroundColor: currentStory.cover }}></div>
            <h2 className="player-title">{currentStory.title}</h2>
            <p className="player-author">By: {currentStory.author}</p>
            <div className="player-controls">
              <button className="player-button">
                <svg width="24" height="24" fill="none" stroke="#F5C563" strokeWidth="2">
                  <polygon points="19 20 9 12 19 4 19 20"/>
                  <line x1="5" y1="4" x2="5" y2="20"/>
                </svg>
              </button>
              <button className="player-button play-button" onClick={togglePlay}>
                {isPlaying ? (
                  <svg width="32" height="32" fill="#F5C563">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                  </svg>
                ) : (
                  <svg width="32" height="32" fill="#F5C563">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                )}
              </button>
              <button className="player-button">
                <svg width="24" height="24" fill="none" stroke="#F5C563" strokeWidth="2">
                  <polygon points="5 4 15 12 5 20 5 4"/>
                  <line x1="19" y1="4" x2="19" y2="20"/>
                </svg>
              </button>
            </div>
            <div className="time">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              ></div>
            </div>
            <button className="action-button minimize" onClick={minimizePlayer}>Свернуть</button>
            <button className="action-button close" onClick={closePlayer}>Закрыть</button>
          </div>
        </div>
      )}

      {/* Мини-плеер */}
      {isPlayerOpen && isMinimized && (
        <div className="mini-player">
          <div className="mini-player-cover" style={{ backgroundColor: currentStory.cover }}></div>
          <div className="mini-player-info">
            <div className="mini-player-title">{currentStory.title}</div>
            <div className="mini-player-author">By: {currentStory.author}</div>
          </div>
          <div className="mini-player-controls">
            <button className="player-button" onClick={togglePlay}>
              {isPlaying ? (
                <svg width="20" height="20" fill="#F5C563">
                  <rect x="6" y="4" width="4" height="12"/>
                  <rect x="12" y="4" width="4" height="12"/>
                </svg>
              ) : (
                <svg width="20" height="20" fill="#F5C563">
                  <polygon points="5 3 17 10 5 17 5 3"/>
                </svg>
              )}
            </button>
            <button className="player-button" onClick={maximizePlayer}>
              <svg width="20" height="20" fill="#F5C563" viewBox="0 0 24 24">
                <path d="M4 4h16v16H4z" fill="none" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 4l16 16M4 20L20 4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Навигация */}
      <div className="nav-bar">
        <button
          className={`nav-button ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <span>🕒</span> Сегодня
        </button>
        <button
          className={`nav-button ${activeTab === 'sleep' ? 'active' : ''}`}
          onClick={() => setActiveTab('sleep')}
        >
          <span>🌙</span> Сон
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