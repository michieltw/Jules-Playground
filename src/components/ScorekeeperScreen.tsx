import { useState, useEffect } from 'react';
import { GameState, GameEvent, GameConfig, ActivePenalty } from '../types';
import ScoreHeader from './Scorekeeper/ScoreHeader';
import MediaControls from './Scorekeeper/MediaControls';
import RinkMap from './Scorekeeper/RinkMap';
import ActionLog from './Scorekeeper/ActionLog';
import GoalModal from './Scorekeeper/GoalModal';
import PenaltyModal from './Scorekeeper/PenaltyModal';
import GameSummaryModal from './Scorekeeper/GameSummaryModal';

export default function ScorekeeperScreen({ onBack }: { onBack: () => void }) {
  const [config, setConfig] = useState<GameConfig>({
    homeTeam: 'Home',
    awayTeam: 'Away',
    settings: {
      periodLength: 20 * 60,
      trackIcing: true,
      trackOffside: true,
      trackSOG: true,
      officialGame: false,
      gameType: 'League',
      attendance: 0,
      ticketsSold: 0,
      liveGame: true,
      teamSelection: 'Custom',
      allowFillInPlayers: false,
      gameClock: true,
      clockPauseBehavior: 'Freeze Clock',
      autoStopAtPeriodEnd: 'Yes',
      periodFormat: 'P1 P2 P3 OT SO',
      shootout: true,
      soRules: 'NHL',
      trackSOGLocation: false,
      trackFOW: true,
      faceoffLocation: true,
      goalscorer: true,
      assists: 'Standard',
      trackPenalties: true,
      penaltyClock: 'Continuous',
      durationTypes: 'Standard',
      officialsMode: 'List',
      linesmenMode: 'List',
      venueMode: 'Custom',
      capacity: 0,
      avgPrice: 0,
      haptics: false,
      stayAwake: false,
      autosave: false,
      localStorageEnabled: true,
      autogenerateCSV: false
    }
  });

  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    period: 1,
    timeRemaining: 20 * 60,
    stoppageTime: 0,
    sogHome: 0,
    sogAway: 0,
    scoreHome: 0,
    scoreAway: 0,
    events: []
  });

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('blackout_hockey_current_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig) as GameConfig;
        setConfig(parsed);
        setGameState(prev => ({
          ...prev,
          timeRemaining: parsed.settings.periodLength || 20 * 60
        }));
      }

      const savedGame = localStorage.getItem('blackout_hockey_saved_game');
      if (savedGame) {
        setGameState(JSON.parse(savedGame));
      }
    } catch(e) {}
  }, []);

  const [filter, setFilter] = useState<'all' | 'shot' | 'goal' | 'penalty'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [isGameSummaryOpen, setIsGameSummaryOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 2500);
  };

  useEffect(() => {
    let interval: any;
    const isContinuousPenalty = config.settings?.penaltyClock === 'Continuous';

    if (gameState.isRunning) {
      interval = setInterval(() => {
        setGameState(prev => {
          const newTime = Math.max(0, prev.timeRemaining - 1);
          const updatedPenalties = (prev.activePenalties || [])
            .map(p => ({ ...p, secondsRemaining: p.secondsRemaining - 1 }))
            .filter(p => p.secondsRemaining > 0);

          let newIsRunning = prev.isRunning;
          if (newTime === 0 && config.settings?.autoStopAtPeriodEnd === 'Yes') {
             newIsRunning = false;
          }

          return {
            ...prev,
            isRunning: newIsRunning,
            timeRemaining: newTime,
            activePenalties: updatedPenalties
          };
        });
      }, 1000);
    } else {
      interval = setInterval(() => {
        setGameState(prev => {
          let updatedPenalties = prev.activePenalties || [];
          if (isContinuousPenalty && updatedPenalties.length > 0) {
            updatedPenalties = updatedPenalties
              .map(p => ({ ...p, secondsRemaining: p.secondsRemaining - 1 }))
              .filter(p => p.secondsRemaining > 0);
          }

          return {
            ...prev,
            stoppageTime: prev.stoppageTime + 1,
            activePenalties: updatedPenalties
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.isRunning, config.settings?.penaltyClock]);

  const handleTogglePlayPause = () => setGameState(prev => ({ ...prev, isRunning: !prev.isRunning, stoppageTime: 0 }));

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timeString = `${formatTime(gameState.timeRemaining)} P${gameState.period}`;

  const handleAddShot = (team: 'home' | 'away', x: number, y: number) => {
    if (!config.settings.trackSOG) {
      showToast('Shots on goal tracking is disabled in defaults');
      return;
    }
    const realTeam = team === 'home' ? config.homeTeam : config.awayTeam;
    const newEvent: GameEvent = {
      id: Date.now().toString(),
      type: 'shot',
      team: realTeam,
      time: timeString,
      text: `SOG ${realTeam}`,
      x, y
    };
    setGameState(prev => ({
      ...prev,
      events: [newEvent, ...prev.events],
      sogHome: team === 'home' ? prev.sogHome + 1 : prev.sogHome,
      sogAway: team === 'away' ? prev.sogAway + 1 : prev.sogAway,
    }));
  };

  const handleFaceoff = (team: 'home' | 'away') => {
    const realTeam = team === 'home' ? config.homeTeam : config.awayTeam;
    const newEvent: GameEvent = {
      id: Date.now().toString(),
      type: 'faceoff',
      team: realTeam,
      time: timeString,
      text: `FACEOFF GEWONNEN: ${realTeam}`
    };

    if (config.settings.trackFOW) {
      setGameState(prev => ({
        ...prev,
        events: [newEvent, ...prev.events],
        isRunning: true,
        stoppageTime: 0
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        isRunning: true,
        stoppageTime: 0
      }));
    }
  };

  const handleIcing = () => {
    if (!config.settings.trackIcing) {
      showToast('Icing tracking is disabled in defaults');
      return;
    }
    const newEvent: GameEvent = {
      id: Date.now().toString(),
      type: 'icing',
      team: config.homeTeam,
      time: timeString,
      text: 'ICING'
    };
    setGameState(prev => ({ ...prev, events: [newEvent, ...prev.events] }));
    showToast('Icing geregistreerd');
  };

  const handleOffside = () => {
    if (!config.settings.trackOffside) {
      showToast('Offside tracking is disabled in defaults');
      return;
    }
    const newEvent: GameEvent = {
      id: Date.now().toString(),
      type: 'offside',
      team: config.homeTeam,
      time: timeString,
      text: 'OFFSIDE'
    };
    setGameState(prev => ({ ...prev, events: [newEvent, ...prev.events] }));
    showToast('Offside geregistreerd');
  };

  const handleGoalSubmit = (data: { team: 'home' | 'away'; scorer: string; assist1: string; assist2: string }) => {
    const realTeam = data.team === 'home' ? config.homeTeam : config.awayTeam;
    let text = `DOELPUNT ${realTeam} ${data.scorer}`;
    const assists = [data.assist1, data.assist2].filter(Boolean);
    if (assists.length > 0) {
      text += ` (Assists: ${assists.join(', ')})`;
    }

    const newEvent: GameEvent = {
      id: Date.now().toString(),
      type: 'goal',
      team: realTeam,
      time: timeString,
      text,
      scorer: data.scorer,
      assist1: data.assist1,
      assist2: data.assist2
    };

    setGameState(prev => ({
      ...prev,
      events: [newEvent, ...prev.events],
      scoreHome: data.team === 'home' ? prev.scoreHome + 1 : prev.scoreHome,
      scoreAway: data.team === 'away' ? prev.scoreAway + 1 : prev.scoreAway,
    }));
    showToast(`Doelpunt ${realTeam} geregistreerd!`);

    if (config.settings?.haptics && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const handlePenaltySubmit = (data: { team: 'home' | 'away'; player: string; reason: string; minutes: number }) => {
    if (config.settings?.trackPenalties === false) {
      showToast('Straffen bijhouden is uitgeschakeld in instellingen');
      return;
    }

    const realTeam = data.team === 'home' ? config.homeTeam : config.awayTeam;
    const playerText = data.player || 'Speler';
    const text = `STRAF ${realTeam} ${playerText} (${data.minutes} MIN - ${data.reason})`;
    const eventId = Date.now().toString();

    const newEvent: GameEvent = {
      id: eventId,
      type: 'penalty',
      team: realTeam,
      time: timeString,
      text,
      penaltyReason: data.reason,
      penaltyMinutes: data.minutes
    };

    const newActivePenalty: ActivePenalty = {
      id: eventId,
      eventId,
      team: realTeam,
      player: playerText,
      reason: data.reason,
      minutes: data.minutes,
      secondsRemaining: (data.minutes || 2) * 60
    };

    setGameState(prev => ({
      ...prev,
      events: [newEvent, ...prev.events],
      activePenalties: [...(prev.activePenalties || []), newActivePenalty]
    }));
    showToast(`Straf ${realTeam} geregistreerd!`);

    if (config.settings?.haptics && "vibrate" in navigator) {
      navigator.vibrate([300]);
    }
  };

  const handleFinishGame = () => {
    try {
      const savedPlayed = localStorage.getItem('blackout_played_games');
      const playedGames = savedPlayed ? JSON.parse(savedPlayed) : [];
      playedGames.push({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        homeTeam: config.homeTeam,
        awayTeam: config.awayTeam,
        scoreHome: gameState.scoreHome,
        scoreAway: gameState.scoreAway,
        events: gameState.events
      });
      localStorage.setItem('blackout_played_games', JSON.stringify(playedGames));
      // Remove from saved game since it's finished
      localStorage.removeItem('blackout_hockey_saved_game');
    } catch (e) {
      console.error(e);
    }
    onBack();
  };

  const handleSaveGame = () => {
    try {
      localStorage.setItem('blackout_hockey_saved_game', JSON.stringify(gameState));
      showToast('Wedstrijd opgeslagen in local storage!');
    } catch (e) {
      showToast('Opslaan mislukt');
    }
  };

  const handleUndo = (id: string) => {
    setGameState(prev => {
      const eventToUndo = prev.events.find(e => e.id === id);
      if (!eventToUndo) return prev;

      let newSogHome = prev.sogHome;
      let newSogAway = prev.sogAway;
      let newScoreHome = prev.scoreHome;
      let newScoreAway = prev.scoreAway;

      if (eventToUndo.type === 'shot') {
        if (eventToUndo.team === config.homeTeam) newSogHome--;
        if (eventToUndo.team === config.awayTeam) newSogAway--;
      } else if (eventToUndo.type === 'goal') {
        if (eventToUndo.team === config.homeTeam) newScoreHome--;
        if (eventToUndo.team === config.awayTeam) newScoreAway--;
      }

      return {
        ...prev,
        events: prev.events.filter(e => e.id !== id),
        sogHome: newSogHome,
        sogAway: newSogAway,
        scoreHome: newScoreHome,
        scoreAway: newScoreAway,
        activePenalties: (prev.activePenalties || []).filter(p => p.eventId !== id && p.id !== id)
      };
    });
  };

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto scrollbar-none bg-[#1a1a1a] relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[110] bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-xs shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {toastMessage}
        </div>
      )}

      <ScoreHeader
        gameState={gameState}
        formatTime={formatTime}
        onBack={onBack}
        homeTeam={config.homeTeam}
        awayTeam={config.awayTeam}
        homeColor={config.homeColor}
        awayColor={config.awayColor}
        homeLogo={config.homeLogo}
        awayLogo={config.awayLogo}
        trackPenalties={config.settings?.trackPenalties}
        onAdjustTime={(seconds: number) => {
          setGameState(prev => ({
            ...prev,
            timeRemaining: Math.max(0, prev.timeRemaining + seconds)
          }));
        }}
      />
      <MediaControls isRunning={gameState.isRunning} onToggle={handleTogglePlayPause} filter={filter} setFilter={setFilter} />
      <RinkMap
        isRunning={gameState.isRunning}
        stoppageTime={gameState.stoppageTime}
        formatTime={formatTime}
        onAddShot={handleAddShot}
        onFaceoff={handleFaceoff}
        onIcing={handleIcing}
        onOffside={handleOffside}
        onOpenGoalModal={() => setIsGoalModalOpen(true)}
        onOpenPenaltyModal={() => {
          if (config.settings?.trackPenalties === false) {
            showToast('Straffen bijhouden is uitgeschakeld in instellingen');
          } else {
            setIsPenaltyModalOpen(true);
          }
        }}
        onSaveGame={handleSaveGame}
        onEndGame={() => setIsGameSummaryOpen(true)}
        events={gameState.events}
        homeTeam={config.homeTeam}
        awayTeam={config.awayTeam}
        homeColor={config.homeColor}
        awayColor={config.awayColor}
      />
      <ActionLog
        events={gameState.events}
        filter={filter}
        onUndo={handleUndo}
        homeTeam={config.homeTeam}
        awayTeam={config.awayTeam}
        homeColor={config.homeColor}
        awayColor={config.awayColor}
      />

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSubmit={handleGoalSubmit}
        homeTeam={config.homeTeam}
        awayTeam={config.awayTeam}
        homeRoster={config.homeRoster}
        awayRoster={config.awayRoster}
      />

      {/* Penalty Modal */}
      <PenaltyModal
        isOpen={isPenaltyModalOpen}
        onClose={() => setIsPenaltyModalOpen(false)}
        onSubmit={handlePenaltySubmit}
        homeTeam={config.homeTeam}
        awayTeam={config.awayTeam}
        homeRoster={config.homeRoster}
        awayRoster={config.awayRoster}
      />

      {/* Game Summary / End Game Modal */}
      <GameSummaryModal
        isOpen={isGameSummaryOpen}
        onClose={() => setIsGameSummaryOpen(false)}
        gameState={gameState}
        onUpdateEvents={(newEvents) => {
          setGameState(prev => {
            const validIds = new Set(newEvents.map(e => e.id));
            return {
              ...prev,
              events: newEvents,
              activePenalties: (prev.activePenalties || []).filter(p => !p.eventId || validIds.has(p.eventId))
            };
          });
        }}
        onFinishGame={handleFinishGame}
        homeTeam={config.homeTeam}
        awayTeam={config.awayTeam}
        homeColor={config.homeColor}
        awayColor={config.awayColor}
        homeLogo={config.homeLogo}
        awayLogo={config.awayLogo}
        location={config.location}
        competition={config.competition}
        matchType={config.matchType}
        officials={config.officials}
        linesmen={config.linesmen}
        date={config.date}
        time={config.time}
        settings={config.settings}
      />
    </div>
  );
}
