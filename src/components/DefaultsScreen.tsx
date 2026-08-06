import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { GameSettings } from '../types';

interface DefaultsScreenProps {
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

export default function DefaultsScreen({ onBack }: DefaultsScreenProps) {
  const [periodLength, setPeriodLength] = useState(20);
  const [trackIcing, setTrackIcing] = useState(true);
  const [trackOffside, setTrackOffside] = useState(true);
  const [trackSOG, setTrackSOG] = useState(true);

  const [officialGame, setOfficialGame] = useState(true);
  const [gameType, setGameType] = useState('League');
  const [attendance, setAttendance] = useState(18800);
  const [ticketsSold, setTicketsSold] = useState(18800);

  const [liveGame, setLiveGame] = useState(true);
  const [teamSelection, setTeamSelection] = useState('Choose from list');
  const [allowFillInPlayers, setAllowFillInPlayers] = useState(false);

  const [gameClock, setGameClock] = useState(true);
  const [clockPauseBehavior, setClockPauseBehavior] = useState('Freeze Clock');
  const [autoStopAtPeriodEnd, setAutoStopAtPeriodEnd] = useState('Yes');
  const [periodFormat, setPeriodFormat] = useState('P1 P2 P3 OT SO');
  const [shootout, setShootout] = useState(true);
  const [soRules, setSoRules] = useState('NHL');

  const [trackSOGType, setTrackSOGType] = useState(false);
  const [trackSOGLocation, setTrackSOGLocation] = useState(false);
  const [trackFOW, setTrackFOW] = useState(true);
  const [faceoffLocation, setFaceoffLocation] = useState(true);
  const [goalscorer, setGoalscorer] = useState(true);
  const [assists, setAssists] = useState('Standard');

  const [trackPenalties, setTrackPenalties] = useState(true);
  const [penaltyClock, setPenaltyClock] = useState('Continuous');
  const [durationTypes, setDurationTypes] = useState('Standard');

  const [officialsMode, setOfficialsMode] = useState('List');
  const [linesmenMode, setLinesmenMode] = useState('List');
  const [venueMode, setVenueMode] = useState('Scotiabank Arena');
  const [capacity, setCapacity] = useState(18800);
  const [avgPrice, setAvgPrice] = useState(150);

  const [soundEffects, setSoundEffects] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [stayAwake, setStayAwake] = useState(true);
  const [autosave, setAutosave] = useState(true);
  const [localStorageEnabled, setLocalStorageEnabled] = useState(true);
  const [autogenerateCSV, setAutogenerateCSV] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('blackout_hockey_defaults');
      if (saved) {
        const defaults = JSON.parse(saved);
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

        if (defaults.trackSOGType !== undefined) setTrackSOGType(defaults.trackSOGType);
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

        if (defaults.soundEffects !== undefined) setSoundEffects(defaults.soundEffects);
        if (defaults.haptics !== undefined) setHaptics(defaults.haptics);
        if (defaults.stayAwake !== undefined) setStayAwake(defaults.stayAwake);
        if (defaults.autosave !== undefined) setAutosave(defaults.autosave);
        if (defaults.localStorageEnabled !== undefined) setLocalStorageEnabled(defaults.localStorageEnabled);
        if (defaults.autogenerateCSV !== undefined) setAutogenerateCSV(defaults.autogenerateCSV);
      }
    } catch(e) {}
  }, []);

  const handleSave = () => {
    const defaults = {
      periodLength, trackIcing, trackOffside, trackSOG,
      officialGame, gameType, attendance, ticketsSold,
      liveGame, teamSelection, allowFillInPlayers,
      gameClock, clockPauseBehavior, autoStopAtPeriodEnd, periodFormat, shootout, soRules,
      trackSOGType, trackSOGLocation, trackFOW, faceoffLocation, goalscorer, assists,
      trackPenalties, penaltyClock, durationTypes,
      officialsMode, linesmenMode, venueMode, capacity, avgPrice,
      soundEffects, haptics, stayAwake, autosave, localStorageEnabled, autogenerateCSV
    };
    localStorage.setItem('blackout_hockey_defaults', JSON.stringify(defaults));
    onBack();
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
        <h1 className="font-display text-[24px] font-bold text-primary tracking-tight">CONFIGURE DEFAULTS</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-12 py-6 flex flex-col gap-10">

        {/* Game Config */}
        <Section title="GAME CONFIG">
          <Row label="Official Game"><Toggle checked={officialGame} onChange={() => setOfficialGame(!officialGame)} /></Row>
          <Row label="Game Type" disabled={!officialGame}><Select disabled={!officialGame} options={['League', 'Tournament', 'Friendly']} value={gameType} onChange={(e) => setGameType(e.target.value)} className="w-40" /></Row>
          <Row label="Live Game" border={false}><Toggle checked={liveGame} onChange={() => setLiveGame(!liveGame)} /></Row>
        </Section>

        {/* Teams & Roster */}
        <Section title="TEAMS & ROSTER">
          <div className="flex items-center gap-2 mb-2">
            <input defaultChecked className="rounded bg-[#050505] border-[#2A2A2A] text-tertiary focus:ring-tertiary w-4 h-4" type="checkbox" />
            <label className="text-[16px] text-on-surface-variant">Auto populate fields</label>
          </div>
          <Row label="Team Selection"><Select options={['Choose from list', 'Custom']} value={teamSelection} onChange={e => setTeamSelection(e.target.value)} className="w-48" /></Row>
          <Row label="Allow Fill-in Players" border={false}><Toggle checked={allowFillInPlayers} onChange={() => setAllowFillInPlayers(!allowFillInPlayers)} /></Row>
        </Section>

        {/* Game Clock */}
        <Section title="GAME CLOCK">
          <Row label="Game Clock"><Toggle checked={gameClock} onChange={() => setGameClock(!gameClock)} /></Row>
          <Row label="Clock Pause Behavior" disabled={!gameClock}><Select disabled={!gameClock} options={['Freeze Clock', 'Running Clock']} value={clockPauseBehavior} onChange={e => setClockPauseBehavior(e.target.value)} className="w-40" /></Row>
          <Row label="Auto Stop at Period End" disabled={!gameClock}><Select disabled={!gameClock} options={['Yes', 'No']} value={autoStopAtPeriodEnd} onChange={e => setAutoStopAtPeriodEnd(e.target.value)} className="w-32" /></Row>
          <Row label="Period Format" disabled={!gameClock}><Select disabled={!gameClock} options={['P1 P2 P3 OT SO', 'Custom']} value={periodFormat} onChange={e => setPeriodFormat(e.target.value)} className="w-48" /></Row>

          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 py-2 border-b border-outline-variant/30 ${!gameClock ? 'opacity-50 pointer-events-none' : ''}`}>
            {['P1', 'P2', 'P3', 'OT'].map((p, i) => (
              <div key={p} className="flex flex-col gap-1">
                <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase">{p}</label>
                <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-center font-display font-bold text-[24px] input-focus outline-none" type="text" defaultValue={i === 3 ? "05:00" : "20:00"} />
              </div>
            ))}
          </div>

          <Row label="Shootout" disabled={!gameClock}><Toggle disabled={!gameClock} checked={shootout} onChange={() => setShootout(!shootout)} /></Row>
          <Row label="SO Rules" border={false} disabled={!gameClock || !shootout}><Select disabled={!gameClock || !shootout} options={['NHL', 'IIHF', 'Custom']} value={soRules} onChange={e => setSoRules(e.target.value)} className="w-32" /></Row>
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
                setTrackSOGType(false);
                setTrackSOGLocation(false);
              }
            }} /></Row>
            <Row label="SOG Type" disabled={!trackSOG}><Toggle disabled={!trackSOG} checked={trackSOGType && trackSOG} onChange={() => setTrackSOGType(!trackSOGType)} /></Row>
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
                setAssists('Standard'); // Reset or disable
              }
            }} /></Row>
          </div>
          <Row label="Assists" border={false} disabled={!goalscorer}><Select disabled={!goalscorer} options={['Standard', 'Custom']} value={assists} onChange={e => setAssists(e.target.value)} className="w-32" /></Row>
        </Section>

        {/* Penalties */}
        <Section title="PENALTIES">
          <Row label="Penalties"><Toggle checked={trackPenalties} onChange={() => setTrackPenalties(!trackPenalties)} /></Row>
          <Row label="Penalty Clock" disabled={!trackPenalties || !gameClock}><Select disabled={!trackPenalties || !gameClock} options={['Continuous', 'Freeze']} value={penaltyClock} onChange={e => setPenaltyClock(e.target.value)} className="w-36" /></Row>
          <Row label="Duration/Types" disabled={!trackPenalties}><Select disabled={!trackPenalties} options={['Standard', 'Custom']} value={durationTypes} onChange={e => setDurationTypes(e.target.value)} className="w-32" /></Row>
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
          <Row label="Game Officials (2x)"><Select options={['List', 'Custom']} value={officialsMode} onChange={e => setOfficialsMode(e.target.value)} className="w-40" /></Row>
          <Row label="Linesmen (2x)"><Select options={['List', 'Custom']} value={linesmenMode} onChange={e => setLinesmenMode(e.target.value)} className="w-40" /></Row>
          <Row label="Venue"><Select options={['Scotiabank Arena', 'Custom']} value={venueMode} onChange={e => setVenueMode(e.target.value)} className="w-48" /></Row>
          <div className={`grid grid-cols-2 gap-4 py-2 ${!officialGame ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase">Capacity</label>
              <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-[16px] input-focus outline-none" type="number" value={capacity} onChange={e => setCapacity(parseInt(e.target.value) || 0)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase">Tickets Sold</label>
              <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-[16px] input-focus outline-none" type="number" value={ticketsSold} onChange={e => setTicketsSold(parseInt(e.target.value) || 0)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase">Avg Price ($)</label>
              <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-[16px] input-focus outline-none" type="number" value={avgPrice} onChange={e => setAvgPrice(parseInt(e.target.value) || 0)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase">Attendance</label>
              <input className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-[16px] input-focus outline-none" type="number" value={attendance} onChange={e => setAttendance(parseInt(e.target.value) || 0)} />
            </div>
          </div>
        </Section>

        {/* System */}
        <section className="flex flex-col gap-4">
          <h2 className="font-mono text-[12px] font-bold text-tertiary tracking-widest uppercase">SYSTEM</h2>
          <div className="bg-surface-container-low metallic-border rounded-lg p-4 inner-glow flex flex-col gap-2">
            <Row label="Sound Effects"><Toggle checked={soundEffects} onChange={() => setSoundEffects(!soundEffects)} /></Row>
            <Row label="Haptics"><Toggle checked={haptics} onChange={() => setHaptics(!haptics)} /></Row>
            <Row label="Stay Awake"><Toggle checked={stayAwake} onChange={() => setStayAwake(!stayAwake)} /></Row>
            <Row label="Local Storage"><Toggle checked={localStorageEnabled} onChange={() => {
              const newVal = !localStorageEnabled;
              setLocalStorageEnabled(newVal);
              if (!newVal) setAutosave(false);
            }} /></Row>
            <Row label="Autosave" disabled={!localStorageEnabled}><Toggle disabled={!localStorageEnabled} checked={autosave && localStorageEnabled} onChange={() => setAutosave(!autosave)} /></Row>
            <Row label="Autogenerate CSV" border={false}><Toggle checked={autogenerateCSV} onChange={() => setAutogenerateCSV(!autogenerateCSV)} /></Row>
          </div>
        </section>

        {/* Save Action */}
        <div className="pt-2 pb-8">
          <button
            className="w-full bg-tertiary text-black font-display text-[24px] font-bold py-4 rounded-lg raised-element bg-button-gradient hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(233,196,0,0.3)]"
            onClick={handleSave}
          >
            <Save fill="currentColor" className="w-6 h-6" />
            SAVE DEFAULTS
          </button>
        </div>

      </main>
    </div>
  );
}
