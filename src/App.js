import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaSun, FaCloudMoon, FaArrowDown, FaArrowUp, FaUser } from 'react-icons/fa'; // Импортируем иконки для интерфейса
import './App.css';

function App() {
  // Состояния приложения
  // activeTab: Определяет, какая вкладка активна ("today", "sleep" или "profile")
  const [activeTab, setActiveTab] = useState('today');
  // isPlaying: Указывает, воспроизводится ли трек в данный момент
  const [isPlaying, setIsPlaying] = useState(false);
  // currentTime: Текущее время воспроизведения трека в секундах
  const [currentTime, setCurrentTime] = useState(0);
  // duration: Общая длительность трека в секундах
  const [duration, setDuration] = useState(0);
  // currentStory: Хранит данные текущего выбранного трека
  const [currentStory, setCurrentStory] = useState(null);
  // isPlayerOpen: Указывает, открыт ли полноэкранный плеер
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  // isMinimized: Указывает, свёрнут ли плеер в мини-версию
  const [isMinimized, setIsMinimized] = useState(false);
  // userName: Хранит имя пользователя из Telegram
  const [userName, setUserName] = useState('Пользователь');

  // Массив с данными о треках
  const stories = [
    { id: 'george_camp', title: 'Путешествие в лагерь', author: 'Джордж', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Джорджа - Путешествие в лагерь.mp3', coverGradient: 'linear-gradient(135deg, #F5C563, #E5989B)' },
    { id: 'george_eliza', title: 'Элиза', author: 'Джордж', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Джорджа - Элиза.mp3', coverGradient: 'linear-gradient(135deg, #F28C38, #F5C563)' },
    { id: 'mila_dream', title: 'Маленькая мечта', author: 'Мила', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Милы - Маленькая мечта.mp3', coverGradient: 'linear-gradient(135deg, #E5989B, #F28C38)' },
  ];

  // Ссылка на элемент аудио для управления воспроизведением
  const audioRef = React.useRef(null);

  // Эффект для инициализации Telegram Mini App и получения имени пользователя
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready(); // Готовим Telegram Web App
      window.Telegram.WebApp.expand(); // Расширяем окно приложения
      setTimeout(() => window.Telegram.WebApp.expand(), 100); // Повторяем расширение для надёжности

      // Получаем данные пользователя из Telegram
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user && user.first_name) {
        setUserName(user.first_name); // Устанавливаем имя пользователя
      }
    }
  }, []);

  // Функция для воспроизведения выбранного трека
  const playStory = (storyId) => {
    const story = stories.find(s => s.id === storyId); // Ищем трек по ID в массиве
    if (story) {
      setCurrentStory(story); // Устанавливаем текущий трек
      setIsPlayerOpen(true); // Открываем полноэкранный плеер
      setIsMinimized(false); // Убеждаемся, что плеер не свёрнут
      const audio = audioRef.current;
      audio.src = story.url; // Устанавливаем источник аудио
      audio.play().catch((error) => console.log('Ошибка воспроизведения аудио:', error)); // Запускаем воспроизведение с обработкой ошибок
      setIsPlaying(true); // Устанавливаем статус "играет"
    }
  };

  // Функция для переключения между паузой и воспроизведением
  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause(); // Ставим трек на паузу
    } else {
      audio.play().catch((error) => console.log('Ошибка воспроизведения аудио:', error)); // Возобновляем воспроизведение
    }
    setIsPlaying(!isPlaying); // Переключаем статус
  };

  // Функция для перехода к предыдущему треку
  const playPrevious = () => {
    if (currentStory) {
      const currentIndex = stories.findIndex(s => s.id === currentStory.id); // Находим индекс текущего трека
      const previousIndex = (currentIndex - 1 + stories.length) % stories.length; // Переход к предыдущему (с зацикливанием)
      playStory(stories[previousIndex].id); // Воспроизводим предыдущий трек
    }
  };

  // Функция для перехода к следующему треку
  const playNext = () => {
    if (currentStory) {
      const currentIndex = stories.findIndex(s => s.id === currentStory.id); // Находим индекс текущего трека
      const nextIndex = (currentIndex + 1) % stories.length; // Переход к следующему (с зацикливанием)
      playStory(stories[nextIndex].id); // Воспроизводим следующий трек
    }
  };

  // Функция для сворачивания плеера
  const minimizePlayer = () => {
    setIsMinimized(true); // Устанавливаем состояние свёрнутого плеера
  };

  // Функция для разворачивания плеера
  const maximizePlayer = () => {
    setIsMinimized(false); // Устанавливаем состояние развернутого плеера
  };

  // Функция для закрытия плеера
  const closePlayer = () => {
    const audio = audioRef.current;
    audio.pause(); // Останавливаем воспроизведение
    setIsPlaying(false); // Сбрасываем статус воспроизведения
    setCurrentStory(null); // Очищаем текущий трек
    setIsPlayerOpen(false); // Закрываем плеер
    setIsMinimized(false); // Сбрасываем состояние свёрнутости
  };

  // Функция форматирования времени в формат "минуты:секунды"
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60); // Вычисляем минуты
    const secs = Math.floor(seconds % 60); // Вычисляем секунды
    return `${mins}:${secs < 10 ? '0' + secs : secs}`; // Форматируем с ведущим нулем для секунд
  };

  return (
    <div className="app-container">
      {/* Основной контейнер для контента */}
      <div className="content-container">
        {activeTab === 'today' ? (
          <div className="main-content">
            <h1 className="app-title">{userName}, не торопись</h1> {/* Заголовок с именем пользователя */}
            {stories.map((story) => (
              <div
                key={story.id}
                className="story-card"
                onClick={() => playStory(story.id)}
              >
                <div className="story-cover" style={{ background: story.coverGradient }}></div>
                <div className="story-info">
                  <h3 className="story-title">{story.title}</h3>
                  <p className="story-author">By: {story.author}</p>
                </div>
                <button className="play-icon pulse">
                  <FaPlay /> {/* Иконка Play для начала воспроизведения */}
                </button>
              </div>
            ))}
            <div className="spacer"></div> {/* Пустой блок для прокрутки */}
          </div>
        ) : activeTab === 'sleep' ? (
          <div className="main-content">
            <h1 className="app-title">Спокойный сон</h1>
            <p className="app-subtitle">Премиум-доступ к сказкам для лёгкого засыпания.</p>
            <button className="catalog-button">Каталог</button>
          </div>
        ) : (
          <div className="main-content">
            <h1 className="app-title">{userName}</h1> {/* Заголовок вкладки профиля */}
            <p className="app-subtitle">Это твой профиль</p>
          </div>
        )}
      </div>

      {/* Полноэкранный плеер */}
      {isPlayerOpen && !isMinimized && (
        <div className="player-overlay">
          <div className="player-container">
            <div className="player-cover" style={{ background: currentStory.coverGradient }}></div>
            <h2 className="player-title">{currentStory.title}</h2>
            <p className="player-author">By: {currentStory.author}</p>
            <div className="player-controls">
              <button className="player-button" onClick={playPrevious}>
                <svg width="24" height="24" fill="none" stroke="#F5C563" strokeWidth="2">
                  <polygon points="19 20 9 12 19 4 19 20"/>
                  <line x1="5" y1="4" x2="5" y2="20"/>
                </svg>
              </button>
              <button className="player-button play-button" onClick={togglePlay}>
                {isPlaying ? <FaPause size={32} color="#F5C563" /> : <FaPlay size={32} color="#F5C563" />}
              </button>
              <button className="player-button" onClick={playNext}>
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
            <button className="action-button minimize" onClick={minimizePlayer}>
              <FaArrowDown className="me-2" /> Свернуть
            </button>
            <button className="action-button close" onClick={closePlayer}>
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Мини-плеер */}
      {isPlayerOpen && isMinimized && (
        <div className="mini-player">
          <div className="mini-player-cover" style={{ background: currentStory.coverGradient }}></div>
          <div className="mini-player-info">
            <div className="mini-player-title">{currentStory.title}</div>
            <div className="mini-player-author">By: {currentStory.author}</div>
          </div>
          <div className="mini-player-controls">
            <button className="player-button pulse" onClick={togglePlay}>
              {isPlaying ? <FaPause size={20} color="#F5C563" /> : <FaPlay size={20} color="#F5C563" />}
            </button>
            <button className="player-button pulse" onClick={maximizePlayer}>
              <FaArrowUp size={20} color="#F5C563" />
            </button>
          </div>
        </div>
      )}

      {/* Нижняя навигация */}
      <div className="nav-bar">
        <button
          className={`nav-button ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <FaSun /> {/* Иконка солнца для вкладки "Сегодня" */}
          <span>Сегодня</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'sleep' ? 'active' : ''}`}
          onClick={() => setActiveTab('sleep')}
        >
          <FaCloudMoon /> {/* Иконка луны для вкладки "Сон" */}
          <span>Сон</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser /> {/* Иконка пользователя для вкладки профиля */}
          <span>{userName}</span>
        </button>
      </div>
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)} // Обновляем текущее время при воспроизведении
        onLoadedMetadata={() => setDuration(audioRef.current.duration)} // Устанавливаем длительность после загрузки метаданных
      />
    </div>
  );
}

export default App;