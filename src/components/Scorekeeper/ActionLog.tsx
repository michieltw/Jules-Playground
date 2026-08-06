import { Target, Trophy, Hand, Handshake, PawPrint, Cat, RotateCcw } from 'lucide-react';
import { GameEvent } from '../../types';

interface ActionLogProps {
  events: GameEvent[];
  filter: string;
  onUndo: (id: string) => void;
  homeTeam: string;
  awayTeam: string;
  homeColor?: string;
  awayColor?: string;
}

export default function ActionLog({ events, filter, onUndo, homeTeam, awayTeam, homeColor = '#00205B', awayColor = '#AF1E2D' }: ActionLogProps) {
  const filteredEvents = events.filter(e => filter === 'all' || e.type === filter);

  return (
    <section className="flex flex-col flex-1 bg-[#1a1a1a] mt-1 relative z-0 min-h-[220px] pb-6">
      <div className="text-center py-2 bg-[#222] border-y border-[#333] font-bold text-xs tracking-widest text-gray-300 shadow-sm z-10 shrink-0 sticky top-0">
        ACTIELOG
      </div>
      <div className="overflow-y-auto flex-1 pb-10 relative z-0 scrollbar-none">
        {filteredEvents.map(ev => {
          const isHome = ev.team === homeTeam;
          const TeamIcon = isHome ? PawPrint : Cat;
          const ActionIcon = ev.type === 'shot' ? Target : ev.type === 'goal' ? Trophy : ev.type === 'penalty' ? Hand : Handshake;
          const bgColor = isHome ? homeColor : awayColor;

          return (
            <div key={ev.id} className="action-log-row flex items-center justify-between p-3 border-b border-[#333] text-sm">
              <div className="flex items-center gap-3 w-full">
                <span className="text-gray-400 font-mono w-16 text-xs">{ev.time}</span>
                <div className="text-gray-500 w-2 text-center text-xs">|</div>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-white/20" style={{ backgroundColor: bgColor }}>
                  <TeamIcon className="text-white w-4 h-4 drop-shadow-sm" />
                </div>
                <ActionIcon className="text-gray-400 w-4 h-4 shrink-0" />
                <span className="font-semibold text-gray-200 flex-1 truncate">{ev.text}</span>
              </div>

              {!ev.isHistorical && (
                <button
                  className="glossy-button px-3 py-1 rounded text-[10px] font-bold text-gray-400 flex flex-col items-center justify-center shrink-0 mx-3"
                  onClick={() => onUndo(ev.id)}
                >
                  <RotateCcw className="w-3 h-3 mb-0.5" /> UNDO
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#1a1a1a] to-transparent pointer-events-none z-10"></div>
    </section>
  );
}
