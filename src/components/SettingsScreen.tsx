import { useState, useEffect } from 'react';
import { Play, Users, ArrowLeft } from 'lucide-react';
import { GameConfig, Player } from '../types';
import RosterModal from './RosterModal';

interface SettingsScreenProps {
  scheduledGameData?: {
    homeTeam: string;
    awayTeam: string;
    homeRoster?: Player[];
    awayRoster?: Player[];
    date?: string;
    time?: string;
    location?: string;
    competition?: string;
    matchType?: string;
    officials?: string[];
    linesmen?: string[];
  } | null;
  onStart: () => void;
  onBack: () => void;
}

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <section className="flex flex-col gap-4">
    <h2 className="font-mono text-[12px] font-bold text-tertiary tracking-widest uppercase">{title}</h2>
    <div className="bg-card-gradient metallic-border rounded-lg p-4 inner-glow flex flex-col gap-4">
      {children}
    </div>
  </section>
);

const Row = ({ label, children, border = true, disabled = false }: { label: string, children: React.ReactNode, border?: boolean, disabled?: boolean }) => (
  <div className={`flex justify-between items-center py-2 ${border ? 'border-b border-outline-variant/30' : ''} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <span className="text-[18px] text-on-background">{label}</span>
    {children}
  </div>
);

const Select = ({ options, value, onChange, className = "w-32", disabled = false }: { options: string[], value?: string, onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void, className?: string, disabled?: boolean }) => (
  <select
    className={`bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-[16px] outline-none input-focus pr-8 appearance-none ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    value={value}
    onChange={onChange}
    disabled={disabled}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238e9192' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 0.5rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1.5em 1.5em'
    }}
  >
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const Toggle = ({ checked, onChange, disabled = false }: { checked?: boolean, onChange?: () => void, disabled?: boolean }) => (
  <button
    className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${checked && !disabled ? 'bg-tertiary' : 'bg-surface-container-highest border border-outline-variant'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={disabled ? undefined : onChange}
    disabled={disabled}
  >
    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${checked && !disabled ? 'right-1 bg-black' : 'left-1 bg-outline'}`}></div>
  </button>
);

export default function SettingsScreen({ scheduledGameData, onStart, onBack }: SettingsScreenProps) {
  const [gameSettingsMode, setGameSettingsMode] = useState<string>(scheduledGameData ? 'Custom' : 'Default');
  const isDefault = gameSettingsMode === 'Default';

  const [homeTeam, setHomeTeam] = useState(scheduledGameData?.homeTeam || '');
  const [awayTeam, setAwayTeam] = useState(scheduledGameData?.awayTeam || '');

  const [homeColor, setHomeColor] = useState('#00205B');
  const [awayColor, setAwayColor] = useState('#AF1E2D');

  const [homeLogo, setHomeLogo] = useState('');
  const [awayLogo, setAwayLogo] = useState('');

  const [homeRoster, setHomeRoster] = useState<Player[]>(scheduledGameData?.homeRoster || []);

  const [awayRoster, setAwayRoster] = useState<Player[]>(scheduledGameData?.awayRoster || []);

  const [activeRosterModal, setActiveRosterModal] = useState<{ isHome: boolean } | null>(null);

  const [periodLength, setPeriodLength] = useState(20);
  const [trackIcing, setTrackIcing] = useState(true);
  const [trackOffside, setTrackOffside] = useState(true);
  const [trackSOG, setTrackSOG] = useState(true);

  const [officialGame, setOfficialGame] = useState(true);
  const [gameType, setGameType] = useState('League');
  const [attendance, setAttendance] = useState(0);
  const [ticketsSold, setTicketsSold] = useState(0);

  const [liveGame, setLiveGame] = useState(true);
  const [teamSelection, setTeamSelection] = useState('Custom');
  const [allowFillInPlayers, setAllowFillInPlayers] = useState(false);

  const [gameClock, setGameClock] = useState(true);
  const [clockPauseBehavior, setClockPauseBehavior] = useState('Freeze Clock');
  const [autoStopAtPeriodEnd, setAutoStopAtPeriodEnd] = useState('Yes');
  const [periodFormat, setPeriodFormat] = useState('P1 P2 P3 OT SO');
  const [shootout, setShootout] = useState(true);
  const [soRules, setSoRules] = useState('NHL');

  const [trackSOGLocation, setTrackSOGLocation] = useState(false);
  const [trackFOW, setTrackFOW] = useState(true);
  const [faceoffLocation, setFaceoffLocation] = useState(true);
  const [goalscorer, setGoalscorer] = useState(true);
  const [assists, setAssists] = useState('Standard');

  const [trackPenalties, setTrackPenalties] = useState(true);
  const [penaltyClock, setPenaltyClock] = useState('Continuous');
  const [durationTypes, setDurationTypes] = useState('Standard');

  const [officialsMode, setOfficialsMode] = useState(scheduledGameData?.officials ? 'Custom' : 'List');
  const [linesmenMode, setLinesmenMode] = useState(scheduledGameData?.linesmen ? 'Custom' : 'List');
  const [venueMode, setVenueMode] = useState(scheduledGameData?.location ? 'Custom' : 'Scotiabank Arena');
  const [customVenue, setCustomVenue] = useState(scheduledGameData?.location || '');
  const [customOfficials, setCustomOfficials] = useState(scheduledGameData?.officials?.join(', ') || '');
  const [customLinesmen, setCustomLinesmen] = useState(scheduledGameData?.linesmen?.join(', ') || '');

  const [capacity, setCapacity] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);

  const [localBackup, setLocalBackup] = useState(true);

  // Load defaults if any
  useEffect(() => {
    try {
      const defaultsStr = localStorage.getItem('blackout_hockey_defaults');
      if (defaultsStr) {
        const defaults = JSON.parse(defaultsStr);
        if (defaults.periodLength !== undefined) setPeriodLength(defaults.periodLength);
        if (defaults.trackIcing !== undefined) setTrackIcing(defaults.trackIcing);
        if (defaults.trackOffside !== undefined) setTrackOffside(defaults.trackOffside);
        if (defaults.trackSOG !== undefined) setTrackSOG(defaults.trackSOG);
        if (defaults.officialGame !== undefined) setOfficialGame(defaults.officialGame);
        if (defaults.gameType) setGameType(defaults.gameType);
        if (defaults.attendance !== undefined) setAttendance(defaults.attendance);
        if (defaults.ticketsSold !== undefined) setTicketsSold(defaults.ticketsSold);

        if (defaults.liveGame !== undefined) setLiveGame(defaults.liveGame);
        if (defaults.teamSelection) setTeamSelection(defaults.teamSelection);
        if (defaults.allowFillInPlayers !== undefined) setAllowFillInPlayers(defaults.allowFillInPlayers);

        if (defaults.gameClock !== undefined) setGameClock(defaults.gameClock);
        if (defaults.clockPauseBehavior) setClockPauseBehavior(defaults.clockPauseBehavior);
        if (defaults.autoStopAtPeriodEnd) setAutoStopAtPeriodEnd(defaults.autoStopAtPeriodEnd);
        if (defaults.periodFormat) setPeriodFormat(defaults.periodFormat);
        if (defaults.shootout !== undefined) setShootout(defaults.shootout);
        if (defaults.soRules) setSoRules(defaults.soRules);

        if (defaults.trackSOGLocation !== undefined) setTrackSOGLocation(defaults.trackSOGLocation);
        if (defaults.trackFOW !== undefined) setTrackFOW(defaults.trackFOW);
        if (defaults.faceoffLocation !== undefined) setFaceoffLocation(defaults.faceoffLocation);
        if (defaults.goalscorer !== undefined) setGoalscorer(defaults.goalscorer);
        if (defaults.assists) setAssists(defaults.assists);

        if (defaults.trackPenalties !== undefined) setTrackPenalties(defaults.trackPenalties);
        if (defaults.penaltyClock) setPenaltyClock(defaults.penaltyClock);
        if (defaults.durationTypes) setDurationTypes(defaults.durationTypes);

        if (defaults.officialsMode) setOfficialsMode(defaults.officialsMode);
        if (defaults.linesmenMode) setLinesmenMode(defaults.linesmenMode);
        if (defaults.venueMode) setVenueMode(defaults.venueMode);
        if (defaults.capacity !== undefined) setCapacity(defaults.capacity);
        if (defaults.avgPrice !== undefined) setAvgPrice(defaults.avgPrice);
      }
    } catch(e) {}
  }, []);

  const handleStart = () => {
    const config: GameConfig = {
      homeTeam,
      awayTeam,
      homeColor,
      awayColor,
      homeLogo,
      awayLogo,
      homeRoster,
      awayRoster,
      date: scheduledGameData?.date || new Date().toISOString().split('T')[0],
      time: scheduledGameData?.time || '20:00',
      location: venueMode === 'Custom' ? customVenue : venueMode,
      competition: scheduledGameData?.competition || '',
      matchType: scheduledGameData?.matchType || '',
      officials: officialsMode === 'Custom' ? customOfficials.split(',').map(s => s.trim()) : [],
      linesmen: linesmenMode === 'Custom' ? customLinesmen.split(',').map(s => s.trim()) : [],
      settings: {
        periodLength: periodLength * 60,
        trackIcing,
        trackOffside,
        trackSOG,
        officialGame,
        gameType,
        attendance,
        ticketsSold,
        liveGame,
        teamSelection,
        allowFillInPlayers,
        gameClock,
        clockPauseBehavior,
        autoStopAtPeriodEnd,
        periodFormat,
        shootout,
        soRules,
        trackSOGLocation,
        trackFOW,
        faceoffLocation,
        goalscorer,
        assists,
        trackPenalties,
        penaltyClock,
        durationTypes,
        officialsMode,
        linesmenMode,
        venueMode,
        capacity,
        avgPrice,
        haptics: true,
        stayAwake: true,
        autosave: true,
        localStorageEnabled: true,
        autogenerateCSV: false
      }
    };
    localStorage.setItem('blackout_hockey_current_config', JSON.stringify(config));
    // Clear out any old saved game state
    localStorage.removeItem('blackout_hockey_saved_game');
    onStart();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* TopAppBar */}
      <header className="bg-surface-container-low border-b border-outline-variant w-full top-0 flex items-center justify-between px-4 h-16 z-50 sticky">
        <button
          onClick={onBack}
          className="text-primary hover:bg-surface-container-high transition-colors active:scale-95 duration-100 p-2 rounded flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-display text-[24px] font-bold text-primary tracking-tight">PRE-GAME SETTINGS</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-12 py-6 flex flex-col gap-10">

        {/* Game Config */}
        <Section title="GAME CONFIG">
          <Row label="Game Settings" border={isDefault}>
            <Select
              options={['Default', 'Custom']}
              value={gameSettingsMode}
              onChange={(e) => setGameSettingsMode(e.target.value)}
            />
          </Row>
          {!isDefault && <Row label="Official Game"><Toggle checked={officialGame} onChange={() => setOfficialGame(!officialGame)} /></Row>}
          {!isDefault && <Row label="Game Type" disabled={!officialGame}><Select disabled={!officialGame} options={['League', 'Tournament', 'Friendly']} value={gameType} onChange={(e) => setGameType(e.target.value)} className="w-40" /></Row>}
          {!isDefault && <Row label="Live Game" border={false}><Toggle checked={liveGame} onChange={() => setLiveGame(!liveGame)} /></Row>}
        </Section>

        {/* Dynamic Settings - Hidden if Default is selected */}
        {!isDefault && (
          <>
            {/* Teams & Roster */}
            <Section title="TEAMS & ROSTER">
              <Row label="Team Selection"><Select options={['Custom', 'Choose from list']} value={teamSelection} onChange={(e) => setTeamSelection(e.target.value)} className="w-48" /></Row>
              <Row label="Allow Fill-in Players"><Toggle checked={allowFillInPlayers} onChange={() => setAllowFillInPlayers(!allowFillInPlayers)} /></Row>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Home Team */}
                <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-4 flex flex-col gap-2">
                  <label className="font-mono text-[12px] font-bold text-on-surface-variant tracking-widest uppercase">HOME TEAM</label>
                  {teamSelection === 'Custom' ? (
                    <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background font-display font-bold uppercase outline-none input-focus" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
                  ) : (
                    <Select options={['Home Team', 'BOS', 'NYR', 'MTL', 'OTT', 'BUF', 'TOR']} value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} className="w-full font-display font-bold uppercase" />
                  )}
                  <div className="flex gap-2 items-center mt-2">
                    <input type="color" className="w-8 h-8 rounded p-0 border-0 bg-transparent shrink-0 cursor-pointer" value={homeColor} onChange={(e) => setHomeColor(e.target.value)} />
                    <input className="flex-1 bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-sm outline-none input-focus" placeholder="Logo URL" type="text" value={homeLogo} onChange={(e) => setHomeLogo(e.target.value)} />
                  </div>
                  <button
                    onClick={() => setActiveRosterModal({ isHome: true })}
                    className="mt-2 w-full bg-surface-container-high border border-outline-variant text-primary py-2 rounded flex items-center justify-between px-3 hover:bg-surface-container-highest transition-colors text-xs font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" /> Open Roster
                    </span>
                    <span className="bg-blue-500/20 text-blue-300 font-mono text-[10px] px-2 py-0.5 rounded-full">
                      {homeRoster.length} spelers
                    </span>
                  </button>
                </div>

                {/* Away Team */}
                <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-4 flex flex-col gap-2">
                  <label className="font-mono text-[12px] font-bold text-on-surface-variant tracking-widest uppercase">AWAY TEAM</label>
                  {teamSelection === 'Custom' ? (
                    <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background font-display font-bold uppercase outline-none input-focus" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
                  ) : (
                    <Select options={['Away Team', 'OTT', 'BUF', 'TOR', 'BOS', 'NYR', 'MTL']} value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} className="w-full font-display font-bold uppercase" />
                  )}
                  <div className="flex gap-2 items-center mt-2">
                    <input type="color" className="w-8 h-8 rounded p-0 border-0 bg-transparent shrink-0 cursor-pointer" value={awayColor} onChange={(e) => setAwayColor(e.target.value)} />
                    <input className="flex-1 bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-sm outline-none input-focus" placeholder="Logo URL" type="text" value={awayLogo} onChange={(e) => setAwayLogo(e.target.value)} />
                  </div>
                  <button
                    onClick={() => setActiveRosterModal({ isHome: false })}
                    className="mt-2 w-full bg-surface-container-high border border-outline-variant text-primary py-2 rounded flex items-center justify-between px-3 hover:bg-surface-container-highest transition-colors text-xs font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-red-400" /> Open Roster
                    </span>
                    <span className="bg-red-500/20 text-red-300 font-mono text-[10px] px-2 py-0.5 rounded-full">
                      {awayRoster.length} spelers
                    </span>
                  </button>
                </div>
              </div>
            </Section>

            {/* Game Clock */}
            <Section title="GAME CLOCK">
              <Row label="Game Clock"><Toggle checked={gameClock} onChange={() => setGameClock(!gameClock)} /></Row>
              <Row label="Clock Pause Behavior" disabled={!gameClock}><Select disabled={!gameClock} options={['Freeze Clock', 'Running Clock']} value={clockPauseBehavior} onChange={(e) => setClockPauseBehavior(e.target.value)} className="w-40" /></Row>
              <Row label="Auto Stop at Period End" disabled={!gameClock}><Select disabled={!gameClock} options={['Yes', 'No']} value={autoStopAtPeriodEnd} onChange={(e) => setAutoStopAtPeriodEnd(e.target.value)} className="w-32" /></Row>
              <Row label="Period Format" disabled={!gameClock}><Select disabled={!gameClock} options={['P1 P2 P3 OT SO', 'Custom']} value={periodFormat} onChange={(e) => setPeriodFormat(e.target.value)} className="w-48" /></Row>

              <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 py-2 border-b border-outline-variant/30 ${!gameClock ? 'opacity-50 pointer-events-none' : ''}`}>
                {['P1', 'P2', 'P3', 'OT'].map((p, i) => (
                  <div key={p} className="flex flex-col gap-1">
                    <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase">{p}</label>
                    <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-center font-display font-bold text-[24px] input-focus outline-none" type="text" defaultValue={i === 3 ? "05:00" : "20:00"} />
                  </div>
                ))}
              </div>

              <Row label="Shootout" disabled={!gameClock}><Toggle disabled={!gameClock} checked={shootout} onChange={() => setShootout(!shootout)} /></Row>
              <Row label="SO Rules" border={false} disabled={!gameClock || !shootout}><Select disabled={!gameClock || !shootout} options={['NHL', 'IIHF', 'Custom']} value={soRules} onChange={(e) => setSoRules(e.target.value)} className="w-32" /></Row>
            </Section>

            {/* Tracking & Stats */}
            <Section title="TRACKING & STATS">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <Row label="Icing"><Toggle checked={trackIcing} onChange={() => setTrackIcing(!trackIcing)} /></Row>
                <Row label="Offside"><Toggle checked={trackOffside} onChange={() => setTrackOffside(!trackOffside)} /></Row>
                <Row label="SOG"><Toggle checked={trackSOG} onChange={() => {
                  const newVal = !trackSOG;
                  setTrackSOG(newVal);
                  if (!newVal) {
                    setTrackSOGLocation(false);
                  }
                }} /></Row>
                <Row label="SOG Location" disabled={!trackSOG}><Toggle disabled={!trackSOG} checked={trackSOGLocation && trackSOG} onChange={() => setTrackSOGLocation(!trackSOGLocation)} /></Row>
                <Row label="FOW"><Toggle checked={trackFOW} onChange={() => {
                  const newVal = !trackFOW;
                  setTrackFOW(newVal);
                  if (!newVal) {
                    setFaceoffLocation(false);
                  }
                }} /></Row>
                <Row label="Faceoff Location" disabled={!trackFOW}><Toggle disabled={!trackFOW} checked={faceoffLocation && trackFOW} onChange={() => setFaceoffLocation(!faceoffLocation)} /></Row>
                <Row label="Goalscorer"><Toggle checked={goalscorer} onChange={() => {
                  const newVal = !goalscorer;
                  setGoalscorer(newVal);
                  if (!newVal) {
                    setAssists('Standard');
                  }
                }} /></Row>
              </div>
              <Row label="Assists" border={false} disabled={!goalscorer}><Select disabled={!goalscorer} options={['Standard', 'Custom']} value={assists} onChange={(e) => setAssists(e.target.value)} className="w-32" /></Row>
            </Section>

            {/* Penalties */}
            <Section title="PENALTIES">
              <Row label="Penalties"><Toggle checked={trackPenalties} onChange={() => setTrackPenalties(!trackPenalties)} /></Row>
              <Row label="Penalty Clock" disabled={!trackPenalties || !gameClock}><Select disabled={!trackPenalties || !gameClock} options={['Continuous', 'Freeze']} value={penaltyClock} onChange={(e) => setPenaltyClock(e.target.value)} className="w-36" /></Row>
              <Row label="Duration/Types" disabled={!trackPenalties}><Select disabled={!trackPenalties} options={['Standard', 'Custom']} value={durationTypes} onChange={(e) => setDurationTypes(e.target.value)} className="w-32" /></Row>
              <div className={`grid grid-cols-2 gap-4 mt-2 ${!trackPenalties ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-2 flex flex-col items-center justify-center gap-1">
                  <label className="font-mono text-[12px] font-bold text-on-surface-variant tracking-widest uppercase">MINOR</label>
                  <span className="font-display text-[24px] font-bold text-tertiary tabular-nums">2:00</span>
                </div>
                <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-2 flex flex-col items-center justify-center gap-1">
                  <label className="font-mono text-[12px] font-bold text-on-surface-variant tracking-widest uppercase">MAJOR</label>
                  <span className="font-display text-[24px] font-bold text-error tabular-nums">5:00</span>
                </div>
              </div>
            </Section>

            {/* Officials & Venue */}
            <Section title="OFFICIALS & VENUE">
              <Row label="Game Officials (2x)"><Select options={['List', 'Custom']} value={officialsMode} onChange={(e) => setOfficialsMode(e.target.value)} className="w-40" /></Row>
              {officialsMode === 'Custom' && (
                <div className="flex flex-col gap-1 -mt-2">
                  <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-[16px] input-focus outline-none" type="text" placeholder="Naam 1, Naam 2" value={customOfficials} onChange={(e) => setCustomOfficials(e.target.value)} />
                </div>
              )}
              <Row label="Linesmen (2x)"><Select options={['List', 'Custom']} value={linesmenMode} onChange={(e) => setLinesmenMode(e.target.value)} className="w-40" /></Row>
              {linesmenMode === 'Custom' && (
                <div className="flex flex-col gap-1 -mt-2">
                  <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-[16px] input-focus outline-none" type="text" placeholder="Naam 1, Naam 2" value={customLinesmen} onChange={(e) => setCustomLinesmen(e.target.value)} />
                </div>
              )}
              <Row label="Venue"><Select options={['Scotiabank Arena', 'Custom']} value={venueMode} onChange={(e) => setVenueMode(e.target.value)} className="w-48" /></Row>
              {venueMode === 'Custom' && (
                <div className="flex flex-col gap-1 -mt-2">
                  <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-[16px] input-focus outline-none" type="text" placeholder="Arena Naam" value={customVenue} onChange={(e) => setCustomVenue(e.target.value)} />
                </div>
              )}
              <div className={`grid grid-cols-2 gap-4 py-2 ${!officialGame ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase">Capacity</label>
                  <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-[16px] input-focus outline-none" type="number" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || 0)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase">Tickets Sold</label>
                  <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-[16px] input-focus outline-none" type="number" value={ticketsSold} onChange={(e) => setTicketsSold(parseInt(e.target.value) || 0)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase">Avg Price ($)</label>
                  <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-[16px] input-focus outline-none" type="number" value={avgPrice} onChange={(e) => setAvgPrice(parseInt(e.target.value) || 0)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase">Attendance</label>
                  <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-[16px] input-focus outline-none" type="number" value={attendance} onChange={(e) => setAttendance(parseInt(e.target.value) || 0)} />
                </div>
              </div>
            </Section>

            {/* System */}
            <section className="flex flex-col gap-4">
              <h2 className="font-mono text-[12px] font-bold text-tertiary tracking-widest uppercase">SYSTEM</h2>
              <div className="bg-surface-container-low metallic-border rounded-lg p-4 inner-glow flex flex-col gap-2">
                <Row label="Local Backup" border={false}><Toggle checked={localBackup} onChange={() => setLocalBackup(!localBackup)} /></Row>
              </div>
            </section>
          </>
        )}

        {/* Start Game Action */}
        <div className="pt-2 pb-8">
          <button
            className="w-full bg-tertiary text-black font-display text-[24px] font-bold py-4 rounded-lg raised-element bg-button-gradient hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(233,196,0,0.3)]"
            onClick={handleStart}
          >
            <Play fill="currentColor" className="w-6 h-6" />
            START GAME
          </button>
        </div>

        {/* Roster Modal */}
        {activeRosterModal && (
          <RosterModal
            isOpen={true}
            teamName={activeRosterModal.isHome ? homeTeam : awayTeam}
            isHome={activeRosterModal.isHome}
            initialRoster={activeRosterModal.isHome ? homeRoster : awayRoster}
            onClose={() => setActiveRosterModal(null)}
            onSave={(updatedRoster) => {
              if (activeRosterModal.isHome) {
                setHomeRoster(updatedRoster);
              } else {
                setAwayRoster(updatedRoster);
              }
            }}
          />
        )}

      </main>
    </div>
  );
}
