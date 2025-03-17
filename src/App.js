import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentStory, setCurrentStory] = useState(null);
  const [upNext, setUpNext] = useState('Up Next: -');
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);

  const stories = [
    { id: 'george_camp', title: 'Путешествие в лагерь', author: 'Джордж', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Джорджа - Путешествие в лагерь.mp3', cover: '#E5989B' },
    { id: 'george_eliza', title: 'Элиза', author: 'Джордж', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Джорджа - Элиза.mp3', cover: '#F4A261' },
    { id: 'mila_dream', title: 'Маленькая мечта', author: 'Мила', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Милы - Маленькая мечта.mp3', cover: '#F4C4A1' },
  ];

  const audioRef = React.useRef(null);
  let currentIndex = 0;

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      setTimeout(() => window.Telegram.WebApp.expand(), 100);
    }
  }, []);

  const playStory = (storyId) => {
    currentIndex = stories.findIndex(s => s.id === storyId);
    const audio = audioRef.current;
    audio.src = stories[currentIndex].url;
    setCurrentStory(stories[currentIndex]);
    updateUpNext();
    audio.play();
    setIsPlaying(true);
    setIsPlayerMinimized(false);
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

  const prevStory = () => {
    currentIndex = (currentIndex - 1 + stories.length) % stories.length;
    playStory(stories[currentIndex].id);
  };

  const nextStory = () => {
    currentIndex = (currentIndex + 1) % stories.length;
    playStory(stories[currentIndex].id);
  };

  const updateUpNext = () => {
    const nextIndex = (currentIndex + 1) % stories.length;
    setUpNext(`Up Next: ${stories[nextIndex].title}`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const minimizePlayer = () => {
    setIsPlayerMinimized(true);
  };

  const maximizePlayer = () => {
    setIsPlayerMinimized(false);
  };

  const stopPlaying = () => {
    const audio = audioRef.current;
    audio.pause();
    setIsPlaying(false);
    setCurrentStory(null);
    setIsPlayerMinimized(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#2A1B3D] to-[#44318D] text-white">
      {/* Основной контент */}
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {activeTab === 'today' ? (
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Сказки для сна</h1>
            {stories.map((story) => (
              <div
                key={story.id}
                className="story-card flex items-center mb-4 p-3 rounded-xl cursor-pointer transition-all hover:bg-opacity-80"
                onClick={() => playStory(story.id)}
              >
                <div className="story-cover mr-4" style={{ backgroundColor: story.cover }}></div>
                <div className="flex-1">
                  <h3 className="text-md font-semibold">{story.title}</h3>
                  <p className="text-xs text-gray-400">By: {story.author}</p>
                </div>
                <button className="play-icon">
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </button>
              </div>
            ))}
            {/* Добавим фейковый контент для проверки скролла */}
            <div className="h-40"></div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6 mt-20 text-center">Спокойный сон — без усилий</h1>
            <p className="text-gray-300 mb-4 text-center">Премиум-доступ к боту Мане — это не просто сказки, а ваш инструмент для лёгкого засыпания, глубокого сна и спокойного утра.</p>
            <h2 className="text-xl font-semibold mb-4 text-center">🎯 Что вы получите?</h2>
            <ul className="list-disc list-inside text-gray-300 mb-6 text-center">
              <li>Подготовитесь к лучшему отдыху благодаря уникальным историям с эффектом медитации, озвученным известными голосами</li>
              <li>Проследите за вашим настроением, каждый вечер, перед сном</li>
              <li>А еще - создание и озвучка персональных историй по запросу, превращая ваши мечты в реальность!</li>
            </ul>
            <h2 className="text-xl font-semibold mb-4 text-center">🌟 Тарифы на выбор:</h2>
            <ul className="list-disc list-inside text-gray-300 mb-4 text-center">
              <li>На 30 дней - 450 рублей</li>
              <li>На 365 дней + 30 дней бесплатно 🎁 - 3600 рублей<br />Экономия 39%! Это всего 276 рублей в месяц! Дешевле капучинки</li>
            </ul>
            <button className="catalog-button block w-4/5 mx-auto mt-4 p-3 bg-[#FFBF69] text-[#2A1B3D] rounded-lg hover:bg-[#FF9F1C] font-semibold">
              Каталог
            </button>
          </div>
        )}
      </div>

      {/* Полноэкранный плеер */}
      {currentStory && !isPlayerMinimized && (
        <div className="fixed inset-0 bg-[#44318D] flex flex-col items-center justify-center p-6 z-50">
          <div className="player-circle relative mb-6">
            <svg className="progress-circle" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke="#FFBF69" strokeWidth="5" fill="none" opacity="0.3" />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#FFBF69"
                strokeWidth="5"
                fill="none"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * (currentTime / duration || 0))}
                style={{ transition: 'stroke-dashoffset 0.1s linear' }}
              />
            </svg>
            <div className="player-title text-center absolute inset-0 flex items-center justify-center">{currentStory.title}</div>
          </div>
          <p className="text-sm text-gray-300 mb-4">By: {currentStory.author}</p>
          <div className="player-controls flex justify-center gap-4 mb-4">
            <button className="player-button" onClick={prevStory}>
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
            <button className="player-button" onClick={nextStory}>
              <svg width="24" height="24" fill="none" stroke="#FFBF69" strokeWidth="2">
                <polygon points="5 4 15 12 5 20 5 4"/>
                <line x1="19" y1="4" x2="19" y2="20"/>
              </svg>
            </button>
          </div>
          <div className="time mt-2 flex justify-between text-sm text-gray-300 w-full max-w-md">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="up-next mt-2 text-sm text-gray-400 text-center">{upNext}</div>
          <button className="mt-6 text-gray-300 text-sm" onClick={minimizePlayer}>Свернуть</button>
          <button className="mt-2 text-gray-300 text-sm" onClick={stopPlaying}>Остановить</button>
        </div>
      )}

      {/* Мини-плеер */}
      {currentStory && isPlayerMinimized && (
        <div className="fixed bottom-16 left-0 right-0 bg-[#2A1B3D] p-3 flex items-center justify-between z-50">
          <div className="flex items-center">
            <div className="mini-player-cover mr-3" style={{ backgroundColor: currentStory.cover }}></div>
            <div>
              <div className="text-sm font-semibold">{currentStory.title}</div>
              <div className="text-xs text-gray-400">By: {currentStory.author}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="player-button" onClick={togglePlay}>
              {isPlaying ? (
                <svg width="20" height="20" fill="#FFBF69">
                  <rect x="6" y="4" width="4" height="12"/>
                  <rect x="12" y="4" width="4" height="12"/>
                </svg>
              ) : (
                <svg width="20" height="20" fill="#FFBF69">
                  <polygon points="5 3 17 10 5 17 5 3"/>
                </svg>
              )}
            </button>
            <button className="player-button" onClick={nextStory}>
              <svg width="20" height="20" fill="none" stroke="#FFBF69" strokeWidth="2">
                <polygon points="5 4 15 12 5 20 5 4"/>
                <line x1="19" y1="4" x2="19" y2="20"/>
              </svg>
            </button>
            <button className="player-button" onClick={maximizePlayer}>
              <svg width="20" height="20" fill="#FFBF69" viewBox="0 0 24 24">
                <path d="M4 4h16v16H4z" fill="none" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 4l16 16M4 20L20 4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Вкладки */}
      <div className="tab-buttons flex justify-around bg-[#2A1B3D] p-2">
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
        onEnded={nextStory}
      />
    </div>
  );
}

export default App;