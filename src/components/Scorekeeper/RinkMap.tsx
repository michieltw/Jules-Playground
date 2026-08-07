import { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Snowflake, Flag, Trophy, AlertTriangle, Save, Award } from 'lucide-react';
import { GameEvent } from '../../types';

interface RinkMapProps {
  isRunning: boolean;
  stoppageTime: number;
  formatTime: (s: number) => string;
  onAddShot: (team: 'home' | 'away', x: number, y: number) => void;
  onFaceoff: (team: 'home' | 'away') => void;
  onIcing: () => void;
  onOffside: () => void;
  onOpenGoalModal: () => void;
  onOpenPenaltyModal: () => void;
  onSaveGame: () => void;
  onEndGame: () => void;
  events: GameEvent[];
  homeTeam?: string;
  awayTeam?: string;
  homeColor?: string;
  awayColor?: string;
}

export default function RinkMap({
  isRunning,
  stoppageTime,
  formatTime,
  onAddShot,
  onFaceoff,
  onIcing,
  onOffside,
  onOpenGoalModal,
  onOpenPenaltyModal,
  onSaveGame,
  onEndGame,
  events,
  homeTeam = 'Home',
  awayTeam = 'Away',
  homeColor = '#ffffff',
  awayColor = '#ef4444'
}: RinkMapProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFaceoffMode, setIsFaceoffMode] = useState(false);
  const [faceoffPopup, setFaceoffPopup] = useState<{ x: number, y: number } | null>(null);

  const rinkContainerRef = useRef<HTMLDivElement>(null);


  const handleInteractiveClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isRunning || isFaceoffMode) return;
    if (!rinkContainerRef.current) return;

    // Get the unscaled/unrotated bounding box of the rink section container
    const rect = rinkContainerRef.current.getBoundingClientRect();

    // Center of the unrotated rink in viewport pixels
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Offset of click from center in screen pixels
    const dxScreen = e.clientX - centerX;
    const dyScreen = e.clientY - centerY;

    // Un-scale by current zoom level
    const dxScaled = dxScreen / zoom;
    const dyScaled = dyScreen / zoom;

    // Un-rotate by current rotation angle (in radians)
    const rad = -rotation * (Math.PI / 180);
    const dxLocal = dxScaled * Math.cos(rad) - dyScaled * Math.sin(rad);
    const dyLocal = dxScaled * Math.sin(rad) + dyScaled * Math.cos(rad);

    // Convert local offsets to percentages relative to unrotated rink dimensions
    const xPct = ((dxLocal / rect.width) + 0.5) * 100;
    const yPct = ((dyLocal / rect.height) + 0.5) * 100;

    // Clamp percentages between 0% and 100%
    const clampedX = Math.max(0, Math.min(100, xPct));
    const clampedY = Math.max(0, Math.min(100, yPct));

    // Determine attacking team based on field side (left half vs right half)
    const isLeftSide = clampedX < 50;
    const team = isLeftSide ? 'away' : 'home';

    onAddShot(team, clampedX, clampedY);
  };

  const faceoffDots = [
    { top: '50%', left: '50%' },
    { top: '25%', left: '20%' },
    { top: '75%', left: '20%' },
    { top: '25%', left: '80%' },
    { top: '75%', left: '80%' },
    { top: '25%', left: '43%' },
    { top: '75%', left: '43%' },
    { top: '25%', left: '57%' },
    { top: '75%', left: '57%' },
  ];

  return (
    <>
      <section className="flex bg-[#1a1a1a] px-2 pt-2 gap-2 shrink-0 justify-between items-center text-gray-400 text-xs z-10">
        <div className="flex gap-2">
          <button className="glossy-button w-8 h-8 rounded-full flex items-center justify-center" onClick={() => setZoom(z => Math.max(1, z - 0.25))}><ZoomOut className="w-4 h-4" /></button>
          <button className="glossy-button w-8 h-8 rounded-full flex items-center justify-center" onClick={() => setZoom(z => Math.min(2.5, z + 0.25))}><ZoomIn className="w-4 h-4" /></button>
          <span className="flex items-center w-10 justify-center">{Math.round(zoom * 100)}%</span>
        </div>
        <button className="glossy-button px-3 py-1.5 rounded flex items-center gap-2" onClick={() => setRotation(r => (r + 90) % 360)}>
          <RotateCw className="w-4 h-4" /> Roteer
        </button>
      </section>

      <section ref={rinkContainerRef} className="relative bg-white mx-2 mt-2 mb-2 rounded-[40px] shrink-0 h-[280px] border-4 border-black shadow-lg overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-300 transform-origin-center"
          style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
        >
          {/* Rink Lines */}
          <div className="w-full h-full relative pointer-events-none">
            {/* Center Red Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[3px] bg-red-600 -translate-x-1/2 z-10"></div>

            {/* Center Blue Circle */}
            <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-blue-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>

            {/* Blue Lines */}
            <div className="absolute top-0 bottom-0 left-[37%] w-[3.5px] bg-blue-600 z-10"></div>
            <div className="absolute top-0 bottom-0 right-[37%] w-[3.5px] bg-blue-600 z-10"></div>

            {/* Goal Lines */}
            <div className="absolute top-0 bottom-0 left-[8%] w-[2px] bg-red-600 z-10"></div>
            <div className="absolute top-0 bottom-0 right-[8%] w-[2px] bg-red-600 z-10"></div>

            {/* Goal Creases */}
            <div className="absolute top-1/2 left-[8%] w-5 h-10 border-2 border-red-600 bg-blue-200/50 rounded-r-full -translate-y-1/2 z-10"></div>
            <div className="absolute top-1/2 right-[8%] w-5 h-10 border-2 border-red-600 bg-blue-200/50 rounded-l-full -translate-y-1/2 z-10"></div>

            {/* Four End-Zone Faceoff Circles */}
            <div className="absolute top-[25%] left-[20%] w-16 h-16 border-2 border-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[75%] left-[20%] w-16 h-16 border-2 border-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[25%] left-[80%] w-16 h-16 border-2 border-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[75%] left-[80%] w-16 h-16 border-2 border-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>

            {/* All 9 Faceoff Dots */}
            {/* Center Ice Dot */}
            <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-blue-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>

            {/* End Zone Dots */}
            <div className="absolute top-[25%] left-[20%] w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[75%] left-[20%] w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[25%] left-[80%] w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[75%] left-[80%] w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>

            {/* Neutral Zone Dots */}
            <div className="absolute top-[25%] left-[43%] w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[75%] left-[43%] w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[25%] left-[57%] w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[75%] left-[57%] w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>

            {/* Shot markers */}
            {events.filter(e => e.type === 'shot' && e.x !== undefined && e.y !== undefined).map(e => (
              <div
                key={e.id}
                className="absolute w-3 h-3 rounded-full z-30 shadow-md transform -translate-x-1/2 -translate-y-1/2 pointer-events-none border border-black/60"
                style={{ left: `${e.x}%`, top: `${e.y}%`, backgroundColor: e.team === homeTeam ? homeColor : awayColor }}
              />
            ))}
          </div>

          {/* Interactive Layer */}
          <div className="absolute inset-0 z-20 cursor-crosshair" onClick={handleInteractiveClick}></div>

          {/* Faceoff Dots Layer */}
          {isFaceoffMode && (
            <div className="absolute inset-0 z-40 pointer-events-none">
              {faceoffDots.map((pos, i) => (
                <div
                  key={i}
                  className="faceoff-dot pointer-events-auto"
                  style={pos}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFaceoffPopup({ x: e.clientX, y: e.clientY });
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stoppage Overlay */}
        {!isRunning && !isFaceoffMode && (
          <div className="absolute inset-0 bg-black/75 z-40 flex flex-col items-center justify-center p-2 text-center">
            <div className="text-white text-lg font-mono mb-2">{formatTime(stoppageTime)}</div>

            <button
              className="glossy-button px-5 py-2.5 rounded-lg text-white font-bold text-xs tracking-wide mb-3 hover:brightness-110 active:scale-95 transition-all border border-white/20 shadow-lg"
              onClick={() => setIsFaceoffMode(true)}
            >
              FACEOFF EN SPEL HERVATTEN
            </button>

            {/* Carousel row with icon-only buttons */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-[95%] p-1.5 bg-[#121212]/90 rounded-xl border border-[#333] shadow-xl backdrop-blur-sm scrollbar-none">
              {/* Icing */}
              <button
                onClick={onIcing}
                title="Icing"
                aria-label="Icing"
                className="glossy-button w-9 h-9 rounded-lg flex items-center justify-center text-cyan-400 hover:text-white hover:bg-cyan-600/40 border border-cyan-500/40 shrink-0 transition-all active:scale-90"
              >
                <Snowflake className="w-5 h-5" />
              </button>

              {/* Offside */}
              <button
                onClick={onOffside}
                title="Offside"
                aria-label="Offside"
                className="glossy-button w-9 h-9 rounded-lg flex items-center justify-center text-orange-400 hover:text-white hover:bg-orange-600/40 border border-orange-500/40 shrink-0 transition-all active:scale-90"
              >
                <Flag className="w-5 h-5" />
              </button>

              {/* Doelpunt */}
              <button
                onClick={onOpenGoalModal}
                title="Doelpunt"
                aria-label="Doelpunt"
                className="glossy-button w-9 h-9 rounded-lg flex items-center justify-center text-yellow-400 hover:text-white hover:bg-yellow-600/40 border border-yellow-500/40 shrink-0 transition-all active:scale-90"
              >
                <Trophy className="w-5 h-5" />
              </button>

              {/* Straf */}
              <button
                onClick={onOpenPenaltyModal}
                title="Straf"
                aria-label="Straf"
                className="glossy-button w-9 h-9 rounded-lg flex items-center justify-center text-red-400 hover:text-white hover:bg-red-600/40 border border-red-500/40 shrink-0 transition-all active:scale-90"
              >
                <AlertTriangle className="w-5 h-5" />
              </button>

              {/* Opslaan */}
              <button
                onClick={onSaveGame}
                title="Opslaan"
                aria-label="Opslaan"
                className="glossy-button w-9 h-9 rounded-lg flex items-center justify-center text-emerald-400 hover:text-white hover:bg-emerald-600/40 border border-emerald-500/40 shrink-0 transition-all active:scale-90"
              >
                <Save className="w-5 h-5" />
              </button>

              {/* End Game */}
              <button
                onClick={onEndGame}
                title="End Game"
                aria-label="End Game"
                className="glossy-button w-9 h-9 rounded-lg flex items-center justify-center text-purple-400 hover:text-white hover:bg-purple-600/40 border border-purple-500/40 shrink-0 transition-all active:scale-90"
              >
                <Award className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Faceoff Popup */}
        {faceoffPopup && (
          <div
            className="fixed bg-[#222] border border-[#555] rounded-lg p-2 z-[60] flex gap-2 shadow-xl transform -translate-x-1/2 -translate-y-full mt-[-10px]"
            style={{ left: faceoffPopup.x, top: faceoffPopup.y }}
          >
            <button className="glossy-button px-4 py-2 rounded text-white font-bold text-xs" onClick={() => { onFaceoff('home'); setFaceoffPopup(null); setIsFaceoffMode(false); }}>{homeTeam || 'Home'}</button>
            <button className="glossy-button px-4 py-2 rounded text-white font-bold text-xs" onClick={() => { onFaceoff('away'); setFaceoffPopup(null); setIsFaceoffMode(false); }}>{awayTeam || 'Away'}</button>
          </div>
        )}
      </section>
    </>
  );
}
