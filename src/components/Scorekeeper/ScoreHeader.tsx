import { PawPrint, Cat, Clock, ArrowLeft } from 'lucide-react';
import { GameState } from '../../types';
import { useState } from 'react';

interface ScoreHeaderProps {
  gameState: GameState;
  formatTime: (s: number) => string;
  onBack: () => void;
  homeTeam: string;
  awayTeam: string;
  homeColor?: string;
  awayColor?: string;
  trackPenalties?: boolean;
  onAdjustTime?: (seconds: number) => void;
}

export default function ScoreHeader({ gameState, formatTime, onBack, homeTeam, awayTeam, homeColor = '#00205B', awayColor = '#AF1E2D', trackPenalties = true, onAdjustTime }: ScoreHeaderProps) {
  const [startY, setStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
      setStartY(e.touches[0].clientY);
    } else {
      setStartY((e as React.MouseEvent).clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (startY === null || !onAdjustTime) return;
    let clientY;
    if ('touches' in e) {
      clientY = e.touches[0].clientY;
    } else {
      clientY = (e as React.MouseEvent).clientY;
    }

    const diff = startY - clientY;

    // Swipe up = add time (+1s), Swipe down = remove time (-1s)
    if (diff > 20) {
      onAdjustTime(1);
      setStartY(clientY);
    } else if (diff < -20) {
      onAdjustTime(-1);
      setStartY(clientY);
    }
  };

  const handleTouchEnd = () => {
    setStartY(null);
  };

  const homePenalties = (gameState.activePenalties || []).filter(
    p => p.team === homeTeam
  );
  const awayPenalties = (gameState.activePenalties || []).filter(
    p => p.team === awayTeam
  );

  return (
    <header className="flex flex-col glossy-dark pt-4 pb-2 px-2 shrink-0 z-10 relative shadow-xl">
      <button onClick={onBack} className="absolute top-2 left-2 text-gray-400 hover:text-white z-20">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div className="flex justify-between items-center relative z-10 pt-4 px-2">
        {/* Team 1: Home */}
        <div className="flex items-center gap-3 w-1/3">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1 overflow-hidden shrink-0 border-2 border-white/20 shadow-lg" style={{ backgroundColor: homeColor }}>
              <PawPrint className="text-white w-7 h-7 drop-shadow-md" fill="currentColor" />
            </div>
            <span className="font-bold text-lg" style={{ color: homeColor }}>{homeTeam}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold leading-none">{gameState.scoreHome}</div>
            <div className="text-[10px] text-gray-400 font-bold mt-1">SOG: <span>{gameState.sogHome}</span></div>
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center justify-center w-1/3">
          <div
            className="timer-bg text-4xl mb-1 mt-1 shadow-inner text-white tracking-wider touch-none cursor-ns-resize"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            title="Swipe omhoog/omlaag om klok aan te passen"
          >
            {formatTime(gameState.timeRemaining)}
          </div>
          <div className="text-[10px] text-gray-400 font-bold tracking-wider cursor-pointer select-none">
            PERIODE {gameState.period}
          </div>
        </div>

        {/* Team 2: Away */}
        <div className="flex items-center justify-end gap-3 w-1/3">
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold leading-none">{gameState.scoreAway}</div>
            <div className="text-[10px] text-gray-400 font-bold mt-1">SOG: <span>{gameState.sogAway}</span></div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1 overflow-hidden shrink-0 border-2 border-white/20 shadow-lg" style={{ backgroundColor: awayColor }}>
              <Cat className="text-white w-7 h-7 drop-shadow-md" fill="currentColor" />
            </div>
            <span className="font-bold text-lg" style={{ color: awayColor }}>{awayTeam}</span>
          </div>
        </div>
      </div>

      {/* Penalty Boxes */}
      <div className="flex justify-between mt-4 px-1 gap-2 text-xs">
        {/* Home Penalty Box */}
        <div className="flex-1 bg-black/40 rounded p-1 flex flex-col border border-gray-700 min-h-[50px] max-h-28 overflow-y-auto">
          <div className="text-center text-[9px] text-gray-400 mb-1 border-b border-gray-700 pb-1 font-bold">
            STRAFBANK ({homeTeam})
          </div>
          {!trackPenalties ? (
            <div className="text-center text-[10px] text-gray-500 py-1 font-mono italic">Straffen uitgeschakeld</div>
          ) : homePenalties.length === 0 ? (
            <div className="text-center text-[10px] text-gray-500 py-1 font-mono">Geen straffen</div>
          ) : (
            homePenalties.map(p => (
              <div key={p.id} className="flex justify-between items-center px-1 font-mono py-0.5 border-b border-gray-800/40 last:border-0">
                <span className="text-gray-200 font-bold truncate max-w-[90px]" title={p.player}>
                  {p.player || 'Speler'}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 font-bold text-[11px]">
                    {formatTime(p.secondsRemaining)} <span className="text-[8px] text-gray-500">MIN</span>
                  </span>
                  <Clock className={`w-3 h-3 ${gameState.isRunning ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Away Penalty Box */}
        <div className="flex-1 bg-black/40 rounded p-1 flex flex-col border border-gray-700 min-h-[50px] max-h-28 overflow-y-auto">
          <div className="text-center text-[9px] text-gray-400 mb-1 border-b border-gray-700 pb-1 font-bold">
            STRAFBANK ({awayTeam})
          </div>
          {!trackPenalties ? (
            <div className="text-center text-[10px] text-gray-500 py-1 font-mono italic">Straffen uitgeschakeld</div>
          ) : awayPenalties.length === 0 ? (
            <div className="text-center text-[10px] text-gray-500 py-1 font-mono">Geen straffen</div>
          ) : (
            awayPenalties.map(p => (
              <div key={p.id} className="flex justify-between items-center px-1 font-mono py-0.5 border-b border-gray-800/40 last:border-0">
                <span className="text-gray-200 font-bold truncate max-w-[90px]" title={p.player}>
                  {p.player || 'Speler'}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 font-bold text-[11px]">
                    {formatTime(p.secondsRemaining)} <span className="text-[8px] text-gray-500">MIN</span>
                  </span>
                  <Clock className={`w-3 h-3 ${gameState.isRunning ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </header>
  );
}
