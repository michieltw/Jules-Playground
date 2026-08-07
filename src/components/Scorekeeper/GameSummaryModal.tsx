import { useState, useEffect } from 'react';
import { GameState, GameEvent, GameSettings } from '../../types';
import { Award, Download, Trash2, X, CheckCircle, RefreshCw, MapPin, Users, Ticket, Tag } from 'lucide-react';

interface GameSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onUpdateEvents: (newEvents: GameEvent[]) => void;
  onFinishGame: () => void;
  homeTeam?: string;
  awayTeam?: string;
  homeColor?: string;
  awayColor?: string;
  homeLogo?: string;
  awayLogo?: string;
  location?: string;
  competition?: string;
  matchType?: string;
  officials?: string[];
  linesmen?: string[];
  date?: string;
  time?: string;
  settings?: GameSettings;
}

export default function GameSummaryModal({
  isOpen,
  onClose,
  gameState,
  onUpdateEvents,
  onFinishGame,
  homeTeam = 'Home',
  awayTeam = 'Away',
  homeColor = '#3b82f6',
  awayColor = '#ef4444',
  homeLogo,
  awayLogo,
  location,
  competition,
  matchType,
  officials,
  linesmen,
  date,
  time,
  settings
}: GameSummaryModalProps) {
  const [events, setEvents] = useState<GameEvent[]>(gameState.events);
  const [isFinalized, setIsFinalized] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEvents(gameState.events);
    }
  }, [isOpen, gameState.events]);

  if (!isOpen) return null;

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    onUpdateEvents(updated);
  };

  const handleExportCSV = () => {
    const now = new Date().toISOString().split('T')[0];
    let csvContent = `Match Date,Home Team,Away Team,Home Score,Away Score,Home SOG,Away SOG\n`;
    csvContent += `"${now}","${homeTeam}","${awayTeam}",${gameState.scoreHome},${gameState.scoreAway},${gameState.sogHome},${gameState.sogAway}\n\n`;

    csvContent += `Game Details\n`;
    if (date) csvContent += `Date,"${date}"\n`;
    if (time) csvContent += `Time,"${time}"\n`;
    if (location) csvContent += `Location,"${location}"\n`;
    if (competition) csvContent += `Competition,"${competition}"\n`;
    if (matchType) csvContent += `Match Type,"${matchType}"\n`;
    if (settings?.attendance) csvContent += `Attendance,${settings.attendance}\n`;
    if (officials && officials.length > 0) csvContent += `Officials,"${officials.join(', ')}"\n`;
    if (linesmen && linesmen.length > 0) csvContent += `Linesmen,"${linesmen.join(', ')}"\n`;
    csvContent += `\n`;

    csvContent += `Timestamp,Event Type,Team,Description,X Coord,Y Coord\n`;

    events.forEach(e => {
      const cleanText = e.text.replace(/"/g, '""');
      csvContent += `"${e.time}","${e.type}","${e.team}","${cleanText}","${e.x ?? ''}","${e.y ?? ''}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `wedstrijd_rapport_${homeTeam.replace(/\s+/g, '_')}_vs_${awayTeam.replace(/\s+/g, '_')}_${now}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsFinalized(true);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl w-full max-w-2xl p-5 md:p-6 shadow-2xl text-white my-auto flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#333] pb-4 mb-4">
          <div className="flex items-center gap-2.5 text-yellow-400 font-bold text-xl">
            <Award className="w-6 h-6" />
            <span>WEDSTRIJD RESULTAAT & OVERZICHT</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {/* Game Details Banner */}
          <div className="flex flex-wrap gap-4 bg-[#181818] rounded-xl p-3 text-xs font-mono text-gray-400 border border-[#2a2a2a]">
            {location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                <span>{location}</span>
              </div>
            )}
            {settings?.attendance ? (
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                <span>{settings.attendance.toLocaleString()} Toeschouwers</span>
              </div>
            ) : null}
            {competition && (
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-gray-500" />
                <span>{competition}</span>
              </div>
            )}
            {matchType && (
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                <span>{matchType}</span>
              </div>
            )}
          </div>
          {/* Match Score Card */}
          <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-4 flex items-center justify-around text-center shadow-inner">
            {/* Home */}
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black tracking-wider" style={{ color: homeColor }}>{homeTeam}</span>
              <span className="text-4xl font-extrabold text-white mt-1">{gameState.scoreHome}</span>
              <span className="text-[11px] font-mono text-gray-500 mt-1">SOG: {gameState.sogHome}</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-mono text-yellow-400 uppercase tracking-widest font-bold">EINDESTAND</span>
              <span className="text-2xl font-bold text-gray-500 my-1">-</span>
              <span className="text-xs font-mono text-gray-400">Periode {gameState.period}</span>
            </div>

            {/* Away */}
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black tracking-wider" style={{ color: awayColor }}>{awayTeam}</span>
              <span className="text-4xl font-extrabold text-white mt-1">{gameState.scoreAway}</span>
              <span className="text-[11px] font-mono text-gray-500 mt-1">SOG: {gameState.sogAway}</span>
            </div>
          </div>

          {/* Event Corrections List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-wider">
                GEBEURTENISSEN CORRIGEREN ({events.length})
              </h3>
              <span className="text-[11px] text-gray-500">Klik op de prullenbak om een event te verwijderen</span>
            </div>

            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl divide-y divide-[#222] max-h-60 overflow-y-auto">
              {events.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500 font-mono">Geen gebeurtenissen geregistreerd.</div>
              ) : (
                events.map(e => (
                  <div key={e.id} className="p-2.5 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-gray-500 w-16 shrink-0">{e.time}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        e.type === 'goal' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        e.type === 'penalty' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        e.type === 'icing' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                        e.type === 'offside' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        e.type === 'shot' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-gray-700/30 text-gray-300'
                      }`}>
                        {e.type}
                      </span>
                      <span className="font-semibold text-gray-200">{e.text}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteEvent(e.id)}
                      className="text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-colors"
                      title="Verwijder event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {isFinalized && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-3 text-emerald-400 text-xs font-mono">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>Wedstrijd is definitief gemaakt en CSV-rapport is gedownload!</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#333] mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-[#444] text-gray-300 font-bold text-sm hover:bg-[#333] transition-colors"
          >
            Terug naar Wedstrijd
          </button>

          <button
            onClick={handleExportCSV}
            className="flex-1 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            <Download className="w-4 h-4" />
            {isFinalized ? 'Her-download CSV' : 'Definitief Maken & CSV Exporteren'}
          </button>

          {isFinalized && (
            <button
              onClick={onFinishGame}
              className="py-3 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Sluit Wedstrijd
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
