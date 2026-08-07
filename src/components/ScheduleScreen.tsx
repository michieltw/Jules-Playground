import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Plus, Trash2, MapPin, Clock, Trophy, AlertTriangle, X, Users, Shield, Tag } from 'lucide-react';
import { ScheduledGame, Player } from '../types';
import RosterModal from './RosterModal';

interface ScheduleScreenProps {
  onBack: () => void;
  onStartGame?: (gameData: any) => void;
}

const COMPETITIONS = [
  'NHL',
  'Eredivisie',
  'BeNe League',
  'Recreanten Competitie',
  'Jeugd Competitie',
  'Beker Competitie',
  'Vriendschappelijk / Oefen',
  'Overige Competitie'
];

const MATCH_TYPES = [
  'Reguliere Competitie',
  'Play-offs',
  'Oefenwedstrijd',
  'Bekerwedstrijd',
  'Toernooi'
];

const DEFAULT_GAMES: ScheduledGame[] = [];

export default function ScheduleScreen({ onBack, onStartGame }: ScheduleScreenProps) {
  const [games, setGames] = useState<ScheduledGame[]>(() => {
    const saved = localStorage.getItem('blackout_scheduled_games');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_GAMES;
      }
    }
    return DEFAULT_GAMES;
  });

  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [competition, setCompetition] = useState(COMPETITIONS[0]);
  const [matchType, setMatchType] = useState(MATCH_TYPES[0]);

  // Form Roster States
  const [formHomeRoster, setFormHomeRoster] = useState<Player[]>([]);
  const [formAwayRoster, setFormAwayRoster] = useState<Player[]>([]);

  // Active Roster Modal State
  const [activeRosterModal, setActiveRosterModal] = useState<{
    gameId?: string; // If undefined, editing form roster
    isHome: boolean;
    teamName: string;
    roster: Player[];
  } | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<ScheduledGame | null>(null);

  useEffect(() => {
    localStorage.setItem('blackout_scheduled_games', JSON.stringify(games));
  }, [games]);

  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam.trim() || !awayTeam.trim()) return;

    const newGame: ScheduledGame = {
      id: Date.now().toString(),
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      date,
      time,
      location: location.trim() || 'Standaard Rink',
      competition,
      matchType,
      homeRoster: formHomeRoster,
      awayRoster: formAwayRoster
    };

    setGames(prev => [newGame, ...prev]);
    setIsFormOpen(false);
    // Reset form rosters
    setFormHomeRoster([]);
    setFormAwayRoster([]);
  };

  const confirmDeleteGame = () => {
    if (!gameToDelete) return;
    setGames(prev => prev.filter(g => g.id !== gameToDelete.id));
    setGameToDelete(null);
  };

  const handleSaveRoster = (updatedRoster: Player[]) => {
    if (!activeRosterModal) return;

    if (!activeRosterModal.gameId) {
      // Editing new game form roster
      if (activeRosterModal.isHome) {
        setFormHomeRoster(updatedRoster);
      } else {
        setFormAwayRoster(updatedRoster);
      }
    } else {
      // Editing existing game roster in list
      setGames(prev => prev.map(g => {
        if (g.id === activeRosterModal.gameId) {
          return {
            ...g,
            [activeRosterModal.isHome ? 'homeRoster' : 'awayRoster']: updatedRoster
          };
        }
        return g;
      }));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* TopAppBar */}
      <header className="bg-surface-container-low border-b border-outline-variant w-full top-0 flex items-center justify-between px-4 h-16 z-50 sticky">
        <button
          onClick={onBack}
          className="text-primary hover:bg-surface-container-high transition-colors active:scale-95 duration-100 p-2 rounded flex items-center justify-center"
          title="Terug"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-display text-[22px] md:text-[24px] font-bold text-primary tracking-tight">WEDSTRIJD PLANNING</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-12 py-6 flex flex-col gap-8">
        {/* Toggle Form / Header Action */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-display text-primary flex items-center gap-2">
              <Calendar className="w-5 h-5 text-tertiary" />
              <span>GEPLANDE WEDSTRIJDEN</span>
            </h2>
            <p className="text-xs text-on-surface-variant font-mono mt-0.5">
              Overzicht van ingeplande wedstrijden ({games.length})
            </p>
          </div>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-tertiary text-black font-display font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            {isFormOpen ? 'Sluit Formulier' : 'Nieuwe Wedstrijd'}
          </button>
        </div>

        {/* Schedule Match Form */}
        {isFormOpen && (
          <form
            onSubmit={handleAddGame}
            className="bg-surface-container-low border border-[#2A2A2A] rounded-2xl p-5 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <h3 className="font-display font-bold text-lg text-tertiary flex items-center gap-2 border-b border-outline-variant pb-2">
              <Trophy className="w-5 h-5" />
              <span>WEDSTRIJD INPLANNEN</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">
                  Thuisteam (Home)
                </label>
                <input
                  type="text"
                  required
                  value={homeTeam}
                  onChange={e => setHomeTeam(e.target.value)}
                  placeholder="bijv. Home Team"
                  className="w-full bg-surface-container-high border border-outline-variant focus:border-tertiary rounded-lg px-3 py-2 text-sm text-primary outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">
                  Uitteam (Away)
                </label>
                <input
                  type="text"
                  required
                  value={awayTeam}
                  onChange={e => setAwayTeam(e.target.value)}
                  placeholder="bijv. Away Team"
                  className="w-full bg-surface-container-high border border-outline-variant focus:border-tertiary rounded-lg px-3 py-2 text-sm text-primary outline-none transition-colors"
                />
              </div>

              {/* Competition Selection */}
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">
                  Competitie
                </label>
                <select
                  value={competition}
                  onChange={e => setCompetition(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant focus:border-tertiary rounded-lg px-3 py-2 text-sm text-primary outline-none transition-colors"
                >
                  {COMPETITIONS.map(comp => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
              </div>

              {/* Match Type Selection */}
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">
                  Wedstrijdtype
                </label>
                <select
                  value={matchType}
                  onChange={e => setMatchType(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant focus:border-tertiary rounded-lg px-3 py-2 text-sm text-primary outline-none transition-colors"
                >
                  {MATCH_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">
                  Datum
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant focus:border-tertiary rounded-lg px-3 py-2 text-sm text-primary outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">
                  Aanvangstijd
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant focus:border-tertiary rounded-lg px-3 py-2 text-sm text-primary outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">
                  Locatie / Arena
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="bijv. Scotiabank Arena"
                  className="w-full bg-surface-container-high border border-outline-variant focus:border-tertiary rounded-lg px-3 py-2 text-sm text-primary outline-none transition-colors"
                />
              </div>

              {/* Roster Edit Buttons inside Form */}
              <div className="md:col-span-2 pt-2 border-t border-outline-variant">
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-2">
                  Team Rosters Beheren (Spelers)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveRosterModal({
                      isHome: true,
                      teamName: homeTeam,
                      roster: formHomeRoster
                    })}
                    className="bg-surface-container-high border border-blue-500/40 hover:border-blue-400 text-blue-400 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-between transition-all hover:bg-blue-500/10"
                  >
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-400" />
                      Roster {homeTeam || 'Thuisteam'}
                    </span>
                    <span className="bg-blue-500/20 text-blue-300 font-mono text-[10px] px-2 py-0.5 rounded-full">
                      {formHomeRoster.length} spelers
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveRosterModal({
                      isHome: false,
                      teamName: awayTeam,
                      roster: formAwayRoster
                    })}
                    className="bg-surface-container-high border border-red-500/40 hover:border-red-400 text-red-400 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-between transition-all hover:bg-red-500/10"
                  >
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-red-400" />
                      Roster {awayTeam || 'Uitteam'}
                    </span>
                    <span className="bg-red-500/20 text-red-300 font-mono text-[10px] px-2 py-0.5 rounded-full">
                      {formAwayRoster.length} spelers
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant mt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:text-white font-bold text-sm"
              >
                Annuleren
              </button>
              <button
                type="submit"
                className="bg-tertiary text-black font-display font-bold px-6 py-2 rounded-lg text-sm shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                Wedstrijd Opslaan
              </button>
            </div>
          </form>
        )}

        {/* Scheduled Games List */}
        <div className="flex flex-col gap-4">
          {games.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-low border border-[#2A2A2A] rounded-2xl text-on-surface-variant font-mono text-sm">
              Er zijn momenteel geen geplande wedstrijden. Klik op "Nieuwe Wedstrijd" om er een toe te voegen.
            </div>
          ) : (
            games.map(game => (
              <div
                key={game.id}
                className="bg-surface-container-low border border-[#2A2A2A] hover:border-outline-variant rounded-2xl p-4 md:p-5 shadow-lg flex flex-col gap-4 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    {/* Teams */}
                    <div className="flex items-center gap-3">
                      <span className="font-display font-extrabold text-lg md:text-xl text-primary tracking-wide">
                        {game.homeTeam}
                      </span>
                      <span className="text-xs font-mono font-bold text-tertiary bg-tertiary-container/30 px-2 py-0.5 rounded uppercase">
                        VS
                      </span>
                      <span className="font-display font-extrabold text-lg md:text-xl text-primary tracking-wide">
                        {game.awayTeam}
                      </span>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {game.competition && (
                        <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded">
                          <Shield className="w-3 h-3" />
                          {game.competition}
                        </span>
                      )}

                      {game.matchType && (
                        <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                          <Tag className="w-3 h-3" />
                          {game.matchType}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-on-surface-variant mt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-tertiary" />
                        <span>{game.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-tertiary" />
                        <span>{game.time} uur</span>
                      </div>
                      {game.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-tertiary" />
                          <span>{game.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {onStartGame && (
                      <button
                        onClick={() => onStartGame(game)}
                        className="bg-surface-container-high hover:bg-tertiary hover:text-black text-tertiary border border-tertiary/40 font-display font-bold px-3.5 py-2 rounded-lg text-xs transition-all active:scale-95"
                      >
                        Start Scorekeeping
                      </button>
                    )}
                    <button
                      onClick={() => setGameToDelete(game)}
                      className="p-2 text-on-surface-variant hover:text-error hover:bg-surface-container-high rounded-lg transition-colors"
                      title="Verwijder van planning"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Roster Buttons on Scheduled Game Card */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#222]">
                  <button
                    onClick={() => setActiveRosterModal({
                      gameId: game.id,
                      isHome: true,
                      teamName: game.homeTeam,
                      roster: game.homeRoster || []
                    })}
                    className="bg-[#181818] hover:bg-[#252525] border border-blue-500/30 text-blue-400 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>Roster {game.homeTeam}</span>
                    <span className="bg-blue-500/20 text-blue-300 font-mono text-[10px] px-1.5 py-0.2 rounded">
                      {(game.homeRoster || []).length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveRosterModal({
                      gameId: game.id,
                      isHome: false,
                      teamName: game.awayTeam,
                      roster: game.awayRoster || []
                    })}
                    className="bg-[#181818] hover:bg-[#252525] border border-red-500/30 text-red-400 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Users className="w-3.5 h-3.5 text-red-400" />
                    <span>Roster {game.awayTeam}</span>
                    <span className="bg-red-500/20 text-red-300 font-mono text-[10px] px-1.5 py-0.2 rounded">
                      {(game.awayRoster || []).length}
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Roster Modal */}
      {activeRosterModal && (
        <RosterModal
          isOpen={true}
          teamName={activeRosterModal.teamName}
          isHome={activeRosterModal.isHome}
          initialRoster={activeRosterModal.roster}
          onClose={() => setActiveRosterModal(null)}
          onSave={handleSaveRoster}
        />
      )}

      {/* Delete Confirmation Modal */}
      {gameToDelete && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#222222] border border-[#333] rounded-2xl w-full max-w-md p-5 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#333] pb-3 mb-4">
              <div className="flex items-center gap-2 text-red-400 font-bold text-lg">
                <AlertTriangle className="w-5 h-5" />
                <span>WEDSTRIJD VERWIJDEREN</span>
              </div>
              <button
                onClick={() => setGameToDelete(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#333] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-300 mb-4">
              Weet je zeker dat je deze geplande wedstrijd wilt verwijderen?
            </p>

            <div className="bg-[#181818] border border-[#333] rounded-xl p-3 mb-5 font-mono text-xs">
              <div className="font-bold text-yellow-400 text-sm mb-1">
                {gameToDelete.homeTeam} VS {gameToDelete.awayTeam}
              </div>
              <div className="text-gray-400">
                {gameToDelete.date} om {gameToDelete.time} uur ({gameToDelete.location})
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGameToDelete(null)}
                className="flex-1 py-2.5 rounded-lg border border-[#444] text-gray-300 font-bold text-sm hover:bg-[#333] transition-colors"
              >
                Annuleren
              </button>
              <button
                type="button"
                onClick={confirmDeleteGame}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
