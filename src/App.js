import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaCloudMoon, FaArrowDown, FaArrowUp, FaUser, FaRegMoon } from 'react-icons/fa';
import { init, isTMA, backButton, showBackButton, hideBackButton, onBackButtonClick, offBackButtonClick, mountBackButton } from '@telegram-apps/sdk-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('sleep');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentStory, setCurrentStory] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTherapyModalOpen, setIsTherapyModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);
  const [isPracticeFolderOpen, setIsPracticeFolderOpen] = useState(false);

  const stories = [
    { id: 'george_camp', title: 'Путешествие в лагерь', author: 'Джордж', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Джорджа - Путешествие в лагерь.mp3', coverGradient: 'linear-gradient(135deg, #A3BFFA, #BEE3F8)' },
    { id: 'george_eliza', title: 'Элиза', author: 'Джордж', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Джорджа - Элиза.mp3', coverGradient: 'linear-gradient(135deg, #BEE3F8, #CBD5E0)' },
    { id: 'mila_dream', title: 'Маленькая мечта', author: 'Мила', url: 'https://raw.githubusercontent.com/GeorgeBuzeev/TestManya/main/Рассказ Милы - Маленькая мечта.mp3', coverGradient: 'linear-gradient(135deg, #A3BFFA, #CBD5E0)' },
    { id: 'dummy1', title: 'Загадочный лес', author: 'Аня', url: '', coverGradient: 'linear-gradient(135deg, #BEE3F8, #A3BFFA)' },
    { id: 'dummy2', title: 'Ночной полёт', author: 'Петр', url: '', coverGradient: 'linear-gradient(135deg, #CBD5E0, #A3BFFA)' },
    { id: 'dummy3', title: 'Секрет озера', author: 'Катя', url: '', coverGradient: 'linear-gradient(135deg, #A3BFFA, #BEE3F8)' },
  ];

  const practiceAudios = [
    { id: 'sleepcast1', title: 'Сон и здоровье', author: 'Джордж', url: '', coverGradient: 'linear-gradient(135deg, #A3BFFA, #BEE3F8)' },
    { id: 'sleepcast2', title: 'Расслабление перед сном', author: 'Джордж', url: '', coverGradient: 'linear-gradient(135deg, #BEE3F8, #CBD5E0)' },
    { id: 'sleepcast3', title: 'Тишина ночи', author: 'Джордж', url: '', coverGradient: 'linear-gradient(135deg, #CBD5E0, #A3BFFA)' },
  ];

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const thumbRef = useRef(null);

  useEffect(() => {
    async function initTg() {
      if (await isTMA()) {
        try {
          init();
          console.log('Telegram SDK инициализирован, версия:', init().version);
          console.log('Версия Telegram WebApp:', window.Telegram?.WebApp?.version || 'не определена');

          const viewportHeight = window.Telegram?.WebApp?.viewportStableHeight || window.innerHeight;
          console.log('Стабильная высота viewport:', viewportHeight);
          document.documentElement.style.setProperty('--viewport-height', `${viewportHeight}px`);
          const safeAreaTop = getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0px';
          document.documentElement.style.setProperty('--safe-area-top', safeAreaTop);

          // Инициализация кнопки "Назад"
          try {
            mountBackButton();
            console.log('BackButton смонтирована');
          } catch (error) {
            console.error('Ошибка монтирования BackButton:', error);
          }
        } catch (error) {
          console.error('Ошибка инициализации Telegram SDK:', error);
        }
      } else {
        console.error('Приложение не запущено в Telegram');
      }
    }

    initTg();
  }, []);

  useEffect(() => {
    const handleBackButton = () => {
      console.log('BackButton нажата, состояния:', {
        isPracticeFolderOpen,
        isPlayerOpen,
        isTherapyModalOpen,
      });
      if (isPlayerOpen) {
        closePlayer();
      } else if (isTherapyModalOpen) {
        closeTherapyModal();
      } else if (isPracticeFolderOpen) {
        closePracticeFolder();
      }
    };

    if (isPracticeFolderOpen || isPlayerOpen || isTherapyModalOpen) {
      try {
        showBackButton();
        console.log('BackButton показана');
      } catch (error) {
        console.error('Ошибка показа BackButton:', error);
      }
    } else {
      try {
        hideBackButton();
        console.log('BackButton скрыта');
      } catch (error) {
        console.error('Ошибка скрытия BackButton:', error);
      }
    }

    try {
      onBackButtonClick(handleBackButton);
      console.log('Обработчик BackButton установлен');
    } catch (error) {
      console.error('Ошибка установки обработчика BackButton:', error);
    }

    return () => {
      try {
        offBackButtonClick(handleBackButton);
        console.log('Обработчики BackButton очищены');
      } catch (error) {
        console.error('Ошибка очистки обработчиков BackButton:', error);
      }
    };
  }, [isPracticeFolderOpen, isPlayerOpen, isTherapyModalOpen]);

  const playStory = (storyId, sourceArray = stories) => {
    const story = sourceArray.find(s => s.id === storyId);
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

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => console.log('Ошибка воспроизведения аудио:', error));
    }
    setIsPlaying(!isPlaying);
  };

  const playPrevious = () => {
    if (currentStory) {
      const sourceArray = isPracticeFolderOpen ? practiceAudios : stories;
      const currentIndex = sourceArray.findIndex(s => s.id === currentStory.id);
      const previousIndex = (currentIndex - 1 + sourceArray.length) % sourceArray.length;
      playStory(sourceArray[previousIndex].id, sourceArray);
    }
  };

  const playNext = () => {
    if (currentStory) {
      const sourceArray = isPracticeFolderOpen ? practiceAudios : stories;
      const currentIndex = sourceArray.findIndex(s => s.id === currentStory.id);
      const nextIndex = (currentIndex + 1) % sourceArray.length;
      playStory(sourceArray[nextIndex].id, sourceArray);
    }
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

  const openTherapyModal = () => {
    setIsTherapyModalOpen(true);
  };

  const closeTherapyModal = () => {
    setIsTherapyModalOpen(false);
  };

  const openPracticeFolder = () => {
    setIsPracticeFolderOpen(true);
  };

  const closePracticeFolder = () => {
    setIsPracticeFolderOpen(false);
  };

  const handleProgressBarMouseDown = (e) => {
    setIsDragging(true);
    updateProgress(e);
  };

  const handleProgressBarTouchStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    updateProgress(e.touches[0]);
  };

  const updateProgress = (e) => {
    if (isDragging && progressBarRef.current && audioRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const width = rect.width;
      const percent = Math.max(0, Math.min(1, offsetX / width));
      const newTime = percent * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setDragPosition(percent * 100);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', updateProgress);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', (e) => {
        e.preventDefault();
        updateProgress(e.touches[0]);
      }, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    } else {
      window.removeEventListener('mousemove', updateProgress);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', updateProgress);
      window.removeEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', updateProgress);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', updateProgress);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div className="app-container">
      <div className="app-header"></div>
      <div className="content-container">
        {activeTab === 'sleep' ? (
          <div className="main-content">
            <div className="header-image">
              <h1 className="header-title">Рассказы для сна</h1>
            </div>
            <div className="button-container">
              <button className="sleep-button" onClick={openTherapyModal}>
                О сказкотерапии
              </button>
              <button className="sleep-button">
                Полный доступ
              </button>
            </div>
            {stories.map((story) => (
              <div
                key={story.id}
                className="story-card"
                onClick={() => playStory(story.id, stories)}
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
          </div>
        ) : activeTab === 'practice' ? (
          <div className="main-content">
            {!isPracticeFolderOpen ? (
              <>
                <h1 className="app-title">Выберите практику</h1>
                <p className="app-subtitle">Набор практик перед сном, слушайте каждый вечер и учитесь засыпать</p>
                <div
                  className="story-card"
                  onClick={openPracticeFolder}
                >
                  <div className="story-cover" style={{ background: 'linear-gradient(135deg, #A3BFFA, #BEE3F8)' }}></div>
                  <div className="story-info">
                    <h3 className="story-title">Слипкаст о здоровом сне от Джорджа</h3>
                    <p className="story-author">By: Джордж</p>
                  </div>
                  <button className="play-icon pulse">
                    <FaPlay />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="header-image">
                  <h1 className="header-title">Слипкаст о здоровом сне</h1>
                </div>
                {practiceAudios.map((audio) => (
                  <div
                    key={audio.id}
                    className="story-card"
                    onClick={() => playStory(audio.id, practiceAudios)}
                  >
                    <div className="story-cover" style={{ background: audio.coverGradient }}></div>
                    <div className="story-info">
                      <h3 className="story-title">{audio.title}</h3>
                      <p className="story-author">By: {audio.author}</p>
                    </div>
                    <button className="play-icon pulse">
                      <FaPlay />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        ) : (
          <div className="main-content">
            <h1 className="app-title">Профиль</h1>
            <p className="app-subtitle">Это твой профиль</p>
          </div>
        )}
      </div>

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

      {isPlayerOpen && !isMinimized && (
        <div className="player-overlay">
          <div className="player-container">
            <button className="action-button minimize top-left" onClick={minimizePlayer}>
              <FaArrowDown className="me-2" /> Свернуть
            </button>
            <div className="player-cover" style={{ background: currentStory.coverGradient }}></div>
            <h2 className="player-title" title={currentStory.title}>{currentStory.title}</h2>
            <p className="player-author">By: {currentStory.author}</p>
            <div className="player-controls">
              <button className="player-button" onClick={playPrevious}>
                <svg width="30" height="30" fill="none" stroke="#A3BFFA" strokeWidth="2.5">
                  <polygon points="19 20 9 12 19 4 19 20"/>
                  <line x1="5" y1="4" x2="5" y2="20"/>
                </svg>
              </button>
              <button className="player-button play-button" onClick={togglePlay}>
                {isPlaying ? <FaPause size={40} color="#A3BFFA" /> : <FaPlay size={40} color="#A3BFFA" />}
              </button>
              <button className="player-button" onClick={playNext}>
                <svg width="30" height="30" fill="none" stroke="#A3BFFA" strokeWidth="2.5">
                  <polygon points="5 4 15 12 5 20 5 4"/>
                  <line x1="19" y1="4" x2="19" y2="20"/>
                </svg>
              </button>
            </div>
            <div className="time">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div
              className="progress-bar"
              ref={progressBarRef}
              onMouseDown={handleProgressBarMouseDown}
              onTouchStart={handleProgressBarTouchStart}
              style={{ touchAction: 'none' }}
            >
              <div
                className="progress"
                style={{ width: `${isDragging ? dragPosition : (currentTime / duration) * 100 || 0}%` }}
              ></div>
              <div
                className="thumb"
                ref={thumbRef}
                style={{ left: `${isDragging ? dragPosition : (currentTime / duration) * 100 || 0}%` }}
              ></div>
            </div>
            <button className="action-button close" onClick={closePlayer}>
              Закрыть
            </button>
          </div>
        </div>
      )}

      {isPlayerOpen && isMinimized && (
        <div className="mini-player">
          <div className="mini-player-cover" style={{ background: currentStory.coverGradient }}></div>
          <div className="mini-player-info">
            <div className="mini-player-title">{currentStory.title}</div>
            <div className="mini-player-author">By: {currentStory.author}</div>
          </div>
          <div className="mini-player-controls">
            <button className="player-button pulse" onClick={togglePlay}>
              {isPlaying ? <FaPause size={20} color="#A3BFFA" /> : <FaPlay size={20} color="#A3BFFA" />}
            </button>
            <button className="player-button pulse" onClick={maximizePlayer}>
              <FaArrowUp size={20} color="#A3BFFA" />
            </button>
          </div>
        </div>
      )}

      <div className="nav-bar">
        <button
          className={`nav-button ${activeTab === 'sleep' ? 'active' : ''}`}
          onClick={() => setActiveTab('sleep')}
        >
          <FaCloudMoon />
          <span>Сон</span>
        </button>
        <button
          className={`nav-button ${activeTab === 'practice' ? 'active' : ''}`}
          onClick={() => setActiveTab('practice')}
        >
          <FaRegMoon />
          <span>Практика</span>
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