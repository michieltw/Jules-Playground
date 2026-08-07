import { useState, useRef, useEffect } from 'react';
import { Play, Calendar, Settings as SettingsIcon, Download, Upload, LogOut, User } from 'lucide-react';

interface MainMenuScreenProps {
  onNewGame: () => void;
  onLogout: () => void;
  onConfigureDefaults: () => void;
  onOpenSchedule: () => void;
}

export default function MainMenuScreen({ onNewGame, onLogout, onConfigureDefaults, onOpenSchedule }: MainMenuScreenProps) {
  const [videoPlaying, setVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay might fail, fallback to skip
        setVideoPlaying(false);
      });
    }
  }, []);

  const handleVideoEnd = () => {
    setVideoPlaying(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportGames = () => {
    const savedPlayed = localStorage.getItem('blackout_played_games');
    const playedGames = savedPlayed ? JSON.parse(savedPlayed) : [];

    if (playedGames.length === 0) {
      alert("Er zijn geen gespeelde wedstrijden om te exporteren.");
      return;
    }

    let csvContent = `Match Date,Home Team,Away Team,Home Score,Away Score\n`;
    playedGames.forEach((game: any) => {
      csvContent += `"${game.date}","${game.homeTeam}","${game.awayTeam}",${game.scoreHome},${game.scoreAway}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gespeelde_wedstrijden.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportGames = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const newGames: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 3) {
            newGames.push({
              id: cols[0] || Date.now().toString() + i,
              homeTeam: cols[1],
              awayTeam: cols[2],
              date: cols[3] || new Date().toISOString().split('T')[0],
              time: cols[4] || '20:00',
              location: cols[5] || 'Home Rink',
              competition: cols[6] || 'Geïmporteerd',
              matchType: cols[7] || 'Reguliere Competitie',
              homeRoster: [],
              awayRoster: []
            });
          }
        }

        if (newGames.length > 0) {
          const saved = localStorage.getItem('blackout_scheduled_games');
          const existingGames = saved ? JSON.parse(saved) : [];
          localStorage.setItem('blackout_scheduled_games', JSON.stringify([...newGames, ...existingGames]));
          alert(`${newGames.length} wedstrijden succesvol geïmporteerd! Ga naar Schedule om ze te zien.`);
        } else {
          alert('Geen geldige wedstrijden gevonden in de CSV. Let op het formaat.');
        }
      } catch (err) {
        console.error(err);
        alert('Fout bij het importeren van de CSV.');
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col min-h-screen h-screen bg-background relative overflow-hidden">
      {/* Video Transition Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black transition-opacity duration-1000 flex items-center justify-center ${
          videoPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {videoPlaying && (
          <video
            ref={videoRef}
            src="https://cdn.shopify.com/videos/c/o/v/3e51447def85482cbd9434b59757f97e.mp4"
            className="w-full h-full object-cover"
            onEnded={handleVideoEnd}
            playsInline
            muted
          />
        )}
        {videoPlaying && (
          <button
            className="absolute bottom-10 right-10 text-white/60 hover:text-white font-mono text-[12px] font-bold tracking-widest z-50 uppercase bg-black/40 px-3 py-1.5 rounded border border-white/20"
            onClick={handleVideoEnd}
          >
            SKIP
          </button>
        )}
      </div>

      {/* Top Right User Icon */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={onLogout}
          className="w-10 h-10 rounded-full bg-surface-container-low border border-[#2A2A2A] hover:border-tertiary/60 hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-tertiary transition-all shadow-md active:scale-95 group relative"
          title="Logout / Switch User"
        >
          <User className="w-5 h-5 text-tertiary" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-surface-container-highest border border-outline-variant rounded-full flex items-center justify-center text-error">
            <LogOut className="w-2.5 h-2.5" />
          </div>
        </button>
      </div>

      {/* Main Menu Content */}
      <div className="flex-1 w-full flex flex-col justify-between py-6 px-4 md:px-0 max-w-lg mx-auto z-10">

        {/* Banner image with rounded edge fades */}
        <div className="relative w-full max-w-md mx-auto h-44 md:h-56 my-auto overflow-hidden flex items-center justify-center">
          <img
            src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/scorekeeper.png?v=1786003535"
            alt="Scorekeeper"
            className="w-full h-full object-contain"
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse 88% 85% at 50% 50%, black 45%, transparent 100%)',
              maskImage: 'radial-gradient(ellipse 88% 85% at 50% 50%, black 45%, transparent 100%)'
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 85% 80% at 50% 50%, rgba(18,20,20,0) 30%, rgba(18,20,20,0.5) 70%, #121414 98%)'
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3 my-auto">
          <button
            onClick={onNewGame}
            className="w-full bg-tertiary text-black font-display text-[20px] md:text-[22px] font-bold py-4 rounded-lg raised-element bg-button-gradient hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(233,196,0,0.2)]"
          >
            <Play fill="currentColor" className="w-6 h-6" />
            NEW GAME
          </button>

          <button
            onClick={onOpenSchedule}
            className="w-full bg-surface-container-low border border-[#2A2A2A] text-on-background font-display text-[17px] md:text-[18px] font-bold py-3.5 rounded-lg hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center gap-2.5 shadow-md"
          >
            <Calendar className="w-5 h-5 text-on-surface-variant" />
            SCHEDULE
          </button>

          <button
            onClick={onConfigureDefaults}
            className="w-full bg-surface-container-low border border-[#2A2A2A] text-on-background font-display text-[17px] md:text-[18px] font-bold py-3.5 rounded-lg hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center gap-2.5 shadow-md"
          >
            <SettingsIcon className="w-5 h-5 text-on-surface-variant" />
            CONFIGURE DEFAULTS
          </button>

          <div className="grid grid-cols-2 gap-3 mt-1">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImportGames}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[#050505] border border-[#2A2A2A] text-on-surface-variant font-mono text-[11px] font-bold tracking-widest py-3.5 rounded-lg hover:text-white hover:border-outline-variant active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 uppercase shadow-md inner-glow"
            >
              <Download className="w-4 h-4" />
              Import Games
            </button>
            <button
              onClick={handleExportGames}
              className="w-full bg-[#050505] border border-[#2A2A2A] text-on-surface-variant font-mono text-[11px] font-bold tracking-widest py-3.5 rounded-lg hover:text-white hover:border-outline-variant active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 uppercase shadow-md inner-glow"
            >
              <Upload className="w-4 h-4" />
              Export Games
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
