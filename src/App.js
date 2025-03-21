import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaSun, FaCloudMoon, FaArrowDown, FaArrowUp, FaUser } from 'react-icons/fa'; // Импортируем иконки для интерфейса
import './App.css';

function App() {
  // Состояния приложения
  const [activeTab, setActiveTab] = useState('today');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentStory, setCurrentStory] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTherapyModalOpen, setIsTherapyModalOpen] = useState(false); // Состояние для модального окна

  // Массив с данными о треках
  const stories = [
    { id: 'george_camp', title: 'Путешествие в лагерь', author: 'Джордж', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Джорджа - Путешествие в лагерь.mp3', coverGradient: 'linear-gradient(135deg, #F5C563, #E5989B)' },
    { id: 'george_eliza', title: 'Элиза', author: 'Джордж', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Джорджа - Элиза.mp3', coverGradient: 'linear-gradient(135deg, #F28C38, #F5C563)' },
    { id: 'mila_dream', title: 'Маленькая мечта', author: 'Мила', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Милы - Маленькая мечта.mp3', coverGradient: 'linear-gradient(135deg, #E5989B, #F28C38)' },
  ];

  // Ссылка на элемент аудио для управления воспроизведением
  const audioRef = React.useRef(null);

  // Эффект для инициализации Telegram Mini App
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready(); // Готовим Telegram Web App
      window.Telegram.WebApp.expand(); // Расширяем окно приложения
      setTimeout(() => window.Telegram.WebApp.expand(), 100); // Повторяем расширение для надёжности
    }
  }, []);

  // Функция для воспроизведения выбранного трека
  const playStory = (storyId) => {
    const story = stories.find(s => s.id === storyId);
    if (story) {
      setCurrentStory(story);
      setIsPlayerOpen(true);
      setIsMinimized(false);
      const audio = audioRef.current;
      audio.src = story.url;
      audio.play().catch((error) => console.log('Ошибка воспроизведения аудио:', error));
      setIsPlaying(true);
    }
  };

  // Функция для переключения между паузой и воспроизведением
  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => console.log('Ошибка воспроизведения аудио:', error));
    }
    setIsPlaying(!isPlaying);
  };

  // Функция для перехода к предыдущему треку
  const playPrevious = () => {
    if (currentStory) {
      const currentIndex = stories.findIndex(s => s.id === currentStory.id);
      const previousIndex = (currentIndex - 1 + stories.length) % stories.length;
      playStory(stories[previousIndex].id);
    }
  };

  // Функция для перехода к следующему треку
  const playNext = () => {
    if (currentStory) {
      const currentIndex = stories.findIndex(s => s.id === currentStory.id);
      const nextIndex = (currentIndex + 1) % stories.length;
      playStory(stories[nextIndex].id);
    }
  };

  // Функция для сворачивания плеера
  const minimizePlayer = () => {
    setIsMinimized(true);
  };

  // Функция для разворачивания плеера
  const maximizePlayer = () => {
    setIsMinimized(false);
  };

  // Функция для закрытия плеера
  const closePlayer = () => {
    const audio = audioRef.current;
    audio.pause();
    setIsPlaying(false);
    setCurrentStory(null);
    setIsPlayerOpen(false);
    setIsMinimized(false);
  };

  // Функция форматирования времени
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  // Функция для открытия модального окна
  const openTherapyModal = () => {
    setIsTherapyModalOpen(true);
  };

  // Функция для закрытия модального окна
  const closeTherapyModal = () => {
    setIsTherapyModalOpen(false);
  };

  return (
    <div className="app-container">
      {/* Основной контейнер для контента */}
      <div className="content-container">
        {activeTab === 'today' ? (
          <div className="main-content">
            <h1 className="app-title">Не торопись</h1>
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
                  <FaPlay />
                </button>
              </div>
            ))}
            <div className="spacer"></div>
          </div>
        ) : activeTab === 'sleep' ? (
          <div className="main-content">
            {/* Шапка с декоративным фоном */}
            <div className="header-image">
              <h1 className="header-title">Рассказы для сна</h1>
            </div>
            {/* Кнопки */}
            <div className="button-container">
              <button className="sleep-button" onClick={openTherapyModal}>
                О сказкотерапии
              </button>
              <button className="sleep-button">
                Полный доступ
              </button>
            </div>
          </div>
        ) : (
          <div className="main-content">
            <h1 className="app-title">Профиль</h1>
            <p className="app-subtitle">Это твой профиль</p>
          </div>
        )}
      </div>

      {/* Модальное окно для статьи "О сказкотерапии" */}
      {isTherapyModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">О сказкотерапии</h2>
              <button className="modal-close-button" onClick={closeTherapyModal}>
                Закрыть
              </button>
            </div>
            <div className="modal-body">
              <p>Давайте разберёмся, почему взрослым стоит обратить внимание на эту полезную практику.</p>
              <h3>1. Снятие стресса</h3>
              <p>Сказки помогают отвлечься от повседневных забот и тревог, перенося вас в безопасный, воображаемый мир. Погружение в расслабляющий сюжет снижает уровень кортизола — гормона стресса.</p>
              <p>Исследования показывают, что расслабление перед сном способствует более быстрому засыпанию и улучшает качество отдыха.</p>

              <h3>2. Улучшение сна</h3>
              <p>Когда наш мозг перегружен мыслями, заснуть становится трудно. Сказки действуют как своего рода "перезагрузка" — они отвлекают внимание от тревожных мыслей, помогая подготовить ум к отдыху.</p>
              <p>Расслабляющие истории создают позитивный эмоциональный фон, который способствует более глубокому и качественному сну.</p>

              <h3>3. Развитие воображения</h3>
              <p>Воображение важно не только в детстве, но и во взрослой жизни. Слушая сказки, мы стимулируем работу мозга, развиваем креативность и поддерживаем когнитивные способности.</p>
              <p>К тому же, исследования подтверждают, что регулярная работа с воображением помогает предотвращать возрастные изменения мозга.</p>

              <h3>4. Эмоциональная разрядка</h3>
              <p>Сказки вызывают у нас самые разные эмоции — радость, сострадание, волнение, облегчение. Это позволяет проживать и осознавать чувства, которые в повседневной жизни мы часто подавляем.</p>
              <p>Рассказанные истории становятся своеобразным эмоциональным "психологом", позволяя освободиться от накопленного стресса.</p>

              <h3>5. Поиск смысла</h3>
              <p>Многие сказки содержат глубокие философские идеи. Размышления над сюжетами помогают понять себя, свои желания и мечты, а также найти новые подходы к решению жизненных задач.</p>

              <h3>Научная основа</h3>
              <p>Регулярное слушание или чтение историй перед сном — это не просто приятный ритуал. Наука подтверждает их пользу:</p>
              <ul>
                <li><strong>Борьба с бессонницей:</strong> Слушание сказок улучшает качество сна, помогая быстрее засыпать и реже просыпаться ночью.</li>
                <li><strong>Снижение тревожности:</strong> Вымышленный мир временно вытесняет тревожные мысли, что снижает уровень стресса.</li>
                <li><strong>Стимуляция мозга:</strong> Прослушивание историй укрепляет память, улучшает концентрацию и поддерживает когнитивные способности.</li>
              </ul>

              <h3>Как выбрать сказку для себя?</h3>
              <p>Чтобы получить максимум удовольствия и пользы от прослушивания, обратите внимание на:</p>
              <ul>
                <li><strong>Сюжет:</strong> Выбирайте истории с добрым и расслабляющим посылом, чтобы они вызывали положительные эмоции.</li>
                <li><strong>Язык:</strong> Лёгкий, понятный текст лучше всего подходит для подготовки ко сну.</li>
                <li><strong>Длительность:</strong> История не должна быть слишком длинной — 10–20 минут достаточно, чтобы успокоить ум.</li>
              </ul>

              <h3>Почему стоит попробовать?</h3>
              <p>Сказки перед сном — это не просто способ расслабиться, но и мощный инструмент для улучшения качества жизни. Они помогают справляться со стрессом, укрепляют умственные способности и дарят эмоциональное облегчение.</p>
              <p>Добавьте сказки в свой вечерний ритуал, чтобы каждый день завершался на волшебной ноте. Кто знает, возможно, этот простой ритуал станет вашим любимым способом заботы о себе?</p>
              <p>Если же проблемы со сном продолжаются, попробуйте воспользоваться телеграм-ботом "Маня". Она поможет расслабиться и быстрее заснуть!</p>
            </div>
          </div>
        </div>
      )}

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
          <FaSun />
          <span>Сегодня</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'sleep' ? 'active' : ''}`}
          onClick={() => setActiveTab('sleep')}
        >
          <FaCloudMoon />
          <span>Сон</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser />
          <span>Профиль</span>
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