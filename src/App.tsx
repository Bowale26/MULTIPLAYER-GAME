import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { NavigationSidebar, ActiveTab } from './components/NavigationSidebar';
import { CentralPlayfield } from './components/CentralPlayfield';
import { MultiplayerSidebar } from './components/MultiplayerSidebar';
import { FooterBanner } from './components/FooterBanner';
import { AIGameMasterModal } from './components/AIGameMasterModal';
import { VisionAgentModal } from './components/VisionAgentModal';
import { JudgeAgentModal } from './components/JudgeAgentModal';
import { MaintenanceModal } from './components/MaintenanceModal';
import { MobileAppPackagingModal } from './components/MobileAppPackagingModal';
import { MobilePhoneFrame } from './components/MobilePhoneFrame';
import { AuthModal } from './components/AuthModal';
import { LobbiesModal } from './components/LobbiesModal';
import { LobbyChatDrawer } from './components/LobbyChatDrawer';
import { GlobalLeaderboard } from './components/GlobalLeaderboard';
import { HelpModal } from './components/HelpModal';
import { RoomData, ColorChoice, UserProfile } from './types/game';
import { soundManager } from './utils/sound';
import { verifyFirestoreConnection } from './lib/firebase';

export default function App() {
  const [roomCode, setRoomCode] = useState<string>('7F3K9Q');
  const [currentUserId, setCurrentUserId] = useState<string>('PID-ALEX77');
  const [playerNickname, setPlayerNickname] = useState<string>('Alex');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [room, setRoom] = useState<RoomData | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile-preview'>('desktop');
  const [activeTab, setActiveTab] = useState<ActiveTab>('game');

  // Modal open states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLobbiesOpen, setIsLobbiesOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGameMasterOpen, setIsGameMasterOpen] = useState(false);
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [isJudgeOpen, setIsJudgeOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isMobileGuideOpen, setIsMobileGuideOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // SSE event source ref
  const eventSourceRef = useRef<EventSource | null>(null);

  // Connect to SSE for real-time room & chat updates
  const connectSSE = useCallback((code: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      const es = new EventSource(`/api/rooms/${code}/events`);

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setRoom(data);
          setIsOnline(true);
        } catch (err) {
          console.error('Error parsing room SSE data:', err);
        }
      };

      es.onerror = () => {
        setIsOnline(false);
        // Fallback fetch state
        fetch(`/api/rooms/${code}/state`)
          .then((res) => res.json())
          .then((data) => {
            if (data.room) setRoom(data.room);
          })
          .catch(() => {});
      };

      eventSourceRef.current = es;
    } catch {
      setIsOnline(false);
    }
  }, []);

  // Initialize Auth from localStorage or demo account
  useEffect(() => {
    const savedToken = localStorage.getItem('multiplayer_game_token');
    if (savedToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setCurrentUser(data.user);
            setCurrentUserId(data.user.id);
            setPlayerNickname(data.user.username);
          }
        })
        .catch(() => {});
    } else {
      // Default initial demo user profile for instant testing
      const defaultUser: UserProfile = {
        id: 'PID-ALEX77',
        email: 'alex@game.io',
        username: 'Alex',
        avatarIndex: 1,
        createdAt: Date.now() - 86400000 * 3,
        stats: {
          gamesPlayed: 14,
          gamesWon: 9,
          highScore: 165,
          totalPoints: 1240,
          roundsPlayed: 62,
          bestStreak: 6,
          fastestResponseMs: 1050,
        },
      };
      setCurrentUser(defaultUser);
      setCurrentUserId(defaultUser.id);
      setPlayerNickname(defaultUser.username);
    }
  }, []);

  // Initial room state load
  useEffect(() => {
    fetch(`/api/rooms/${roomCode}/state`)
      .then((res) => res.json())
      .then((data) => {
        if (data.room) {
          setRoom(data.room);
          connectSSE(roomCode);
        }
      })
      .catch(() => {
        handleCreateRoom(playerNickname);
      });

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [roomCode, connectSSE]);

  // Handle Tab Navigation from left sidebar
  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'lobbies') setIsLobbiesOpen(true);
    else if (tab === 'leaderboard') setIsLeaderboardOpen(true);
    else if (tab === 'chat') setIsChatOpen(true);
    else if (tab === 'gamemaster') setIsGameMasterOpen(true);
    else if (tab === 'vision') setIsVisionOpen(true);
    else if (tab === 'judge') setIsJudgeOpen(true);
    else if (tab === 'maintenance' || tab === 'rules') setIsMaintenanceOpen(true);
    else if (tab === 'mobile') setIsMobileGuideOpen(true);
    else if (tab === 'help') setIsHelpOpen(true);
  };

  // Color Selection / Answer Submission
  const handleColorSelect = async (color: ColorChoice, timeMs: number) => {
    if (!room) return;

    try {
      const res = await fetch(`/api/rooms/${roomCode}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentUserId,
          color,
          clientTimeMs: timeMs,
        }),
      });
      const data = await res.json();
      if (data.room) setRoom(data.room);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  };

  // Send real-time chat message
  const handleSendMessage = async (text: string) => {
    if (!room || !text.trim()) return;

    try {
      await fetch(`/api/rooms/${roomCode}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          text: text.trim(),
        }),
      });
    } catch (err) {
      console.error('Failed to send chat message:', err);
    }
  };

  // Host Action (START, PAUSE, RESUME, RESTART, ADD_BOTS)
  const handleHostAction = async (action: 'START' | 'PAUSE' | 'RESUME' | 'RESTART' | 'ADD_BOTS') => {
    if (!room) return;
    soundManager.playClick();

    try {
      const res = await fetch(`/api/rooms/${roomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          playerId: currentUserId,
        }),
      });
      const data = await res.json();
      if (data.room) {
        setRoom(data.room);
        if (action === 'START' || action === 'RESUME') {
          soundManager.playRoundStart();
        }
      }
    } catch (err) {
      console.error(`Failed to execute host action ${action}:`, err);
    }
  };

  // Create Room
  const handleCreateRoom = async (nickname: string) => {
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname,
          roundDuration: 12,
          totalRounds: 10,
        }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        setRoomCode(data.roomCode);
        setCurrentUserId(data.playerId);
        setRoom(data.room);
        connectSSE(data.roomCode);
        soundManager.playSuccess();
      }
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  // Create Custom Lobby
  const handleCreateCustomLobby = async (config: {
    name: string;
    maxPlayers: number;
    roundDuration: number;
    totalRounds: number;
    isPrivate: boolean;
  }) => {
    try {
      const res = await fetch('/api/lobbies/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          nickname: playerNickname,
          playerId: currentUserId,
        }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        setRoomCode(data.roomCode);
        setCurrentUserId(data.playerId);
        setRoom(data.room);
        connectSSE(data.roomCode);
        soundManager.playSuccess();
      }
    } catch (err) {
      console.error('Failed to create custom lobby:', err);
    }
  };

  // Join Room / Lobby
  const handleJoinRoom = async (code: string, nickname: string) => {
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: code,
          nickname,
          playerId: currentUserId,
        }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        setRoomCode(data.roomCode);
        setCurrentUserId(data.playerId);
        setRoom(data.room);
        connectSSE(data.roomCode);
        soundManager.playSuccess();
      } else {
        showToast(data.message || 'Unable to join room.', 'error');
        soundManager.playError();
      }
    } catch (err) {
      console.error('Failed to join room:', err);
      showToast('Network error while joining room.', 'error');
    }
  };

  // Update Nickname
  const handleUpdateNickname = (newName: string) => {
    setPlayerNickname(newName);
    if (currentUser) {
      setCurrentUser({ ...currentUser, username: newName });
    }
    if (room) {
      const me = room.players.find((p) => p.id === currentUserId);
      if (me) me.nickname = newName;
      setRoom({ ...room });
    }
  };

  // Auth login success
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentUserId(user.id);
    setPlayerNickname(user.username);
    showToast(`Welcome back, ${user.username}!`, 'success');
    if (room) {
      const me = room.players.find((p) => p.isHost);
      if (me) me.nickname = `${user.username} (You)`;
      setRoom({ ...room });
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('multiplayer_game_token');
    localStorage.removeItem('multiplayer_game_user');
    setCurrentUser(null);
    const guestId = `PID-GUEST-${Math.floor(Math.random() * 899 + 100)}`;
    setCurrentUserId(guestId);
    setPlayerNickname('Guest Player');
    soundManager.playClick();
    showToast('Logged out of player account', 'info');
  };

  // Add Member to Room (Human or AI Challenger)
  const handleAddMember = async (member: { nickname: string; isBot?: boolean; rating?: number; avatarIndex?: number }) => {
    if (!room) return;
    soundManager.playClick();
    try {
      const res = await fetch(`/api/rooms/${roomCode}/members/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });
      const data = await res.json();
      if (data.success && data.room) {
        setRoom(data.room);
        soundManager.playSuccess();
        showToast(`Added ${member.nickname} to match roster!`, 'success');
      } else {
        showToast(data.message || 'Unable to add member to room.', 'error');
        soundManager.playError();
      }
    } catch (err) {
      console.error('Failed to add member:', err);
      showToast('Network error adding member', 'error');
    }
  };

  // Delete Member from Room
  const handleDeleteMember = async (playerId: string) => {
    if (!room) return;
    soundManager.playClick();
    try {
      const res = await fetch(`/api/rooms/${roomCode}/members/${playerId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && data.room) {
        setRoom(data.room);
        soundManager.playClick();
        showToast('Member removed from match', 'info');
      } else {
        showToast(data.message || 'Unable to remove member.', 'error');
        soundManager.playError();
      }
    } catch (err) {
      console.error('Failed to delete member:', err);
      showToast('Network error removing member', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#060914] text-slate-100 flex flex-col justify-between overflow-x-hidden">
      {/* Top Navigation Header */}
      <Header
        roomCode={roomCode}
        isOnline={isOnline}
        playerName={playerNickname}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenLobbies={() => setIsLobbiesOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onUpdateNickname={handleUpdateNickname}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <NavigationSidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          chatCount={room?.messages?.length}
        />

        {/* Central Display: Desktop View or Mobile Simulator Frame */}
        {viewMode === 'desktop' ? (
          <>
            <CentralPlayfield
              room={room}
              currentUserId={currentUserId}
              onColorSelect={handleColorSelect}
              onHostAction={handleHostAction}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              onUpdateNickname={handleUpdateNickname}
              playerNickname={playerNickname}
              onOpenLobbies={() => setIsLobbiesOpen(true)}
              onOpenChat={() => setIsChatOpen(!isChatOpen)}
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenVision={() => setIsVisionOpen(true)}
              onOpenHelp={() => setIsHelpOpen(true)}
            />

            {/* Right Sidebar: Players & Member Management & Leaderboard */}
            <MultiplayerSidebar
              room={room}
              currentUserId={currentUserId}
              onAddMember={handleAddMember}
              onDeleteMember={handleDeleteMember}
              onOpenHistory={() => setIsAuthOpen(true)}
            />
          </>
        ) : (
          <MobilePhoneFrame
            room={room}
            onColorSelect={handleColorSelect}
            onHostAction={handleHostAction}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            playerNickname={playerNickname}
          />
        )}
      </div>

      {/* Real-time Lobby Chat Drawer */}
      <LobbyChatDrawer
        room={room}
        currentUserId={currentUserId}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        onSendMessage={handleSendMessage}
      />

      {/* Footer Feature Banner */}
      <FooterBanner
        onOpenMobileGuide={() => setIsMobileGuideOpen(true)}
        onOpenVision={() => setIsVisionOpen(true)}
        onOpenJudge={() => setIsJudgeOpen(true)}
        onOpenGameMaster={() => setIsGameMasterOpen(true)}
        onOpenMaintenance={() => setIsMaintenanceOpen(true)}
      />

      {/* User Authentication & Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* Game Lobbies Browser Modal */}
      <LobbiesModal
        isOpen={isLobbiesOpen}
        onClose={() => {
          setIsLobbiesOpen(false);
          setActiveTab('game');
        }}
        currentRoomCode={roomCode}
        onSelectLobby={(code) => handleJoinRoom(code, playerNickname)}
        onCreateCustomLobby={handleCreateCustomLobby}
      />

      {/* Global Leaderboard Modal */}
      <GlobalLeaderboard
        isOpen={isLeaderboardOpen}
        onClose={() => {
          setIsLeaderboardOpen(false);
          setActiveTab('game');
        }}
        currentUser={currentUser}
        onPlayGame={() => {
          setActiveTab('game');
        }}
        onOpenAchievements={() => {
          setIsAuthOpen(true);
        }}
      />

      {/* AI Modals */}
      <AIGameMasterModal
        isOpen={isGameMasterOpen}
        onClose={() => {
          setIsGameMasterOpen(false);
          setActiveTab('game');
        }}
        room={room}
      />

      <VisionAgentModal
        isOpen={isVisionOpen}
        onClose={() => {
          setIsVisionOpen(false);
          setActiveTab('game');
        }}
        onApplyDetectedColor={(color) => {
          handleColorSelect(color, 1200);
          showToast(`🎯 Applied ${color} from Vision Agent directly into round!`, 'success');
        }}
      />

      <JudgeAgentModal
        isOpen={isJudgeOpen}
        onClose={() => {
          setIsJudgeOpen(false);
          setActiveTab('game');
        }}
        room={room}
      />

      <MaintenanceModal
        isOpen={isMaintenanceOpen}
        onClose={() => {
          setIsMaintenanceOpen(false);
          setActiveTab('game');
        }}
      />

      <MobileAppPackagingModal
        isOpen={isMobileGuideOpen}
        onClose={() => {
          setIsMobileGuideOpen(false);
          setActiveTab('game');
        }}
      />

      {/* Interactive Player Center & Game Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => {
          setIsHelpOpen(false);
          setActiveTab('game');
        }}
        onOpenVision={() => {
          setIsVisionOpen(true);
          setActiveTab('vision');
        }}
        onOpenLobbies={() => {
          setIsLobbiesOpen(true);
          setActiveTab('lobbies');
        }}
        onOpenLeaderboard={() => {
          setIsLeaderboardOpen(true);
          setActiveTab('leaderboard');
        }}
        onOpenAuth={() => {
          setIsAuthOpen(true);
        }}
      />

      {/* Non-blocking Floating Notification Toast */}
      {toast && (
        <div className="fixed top-16 right-4 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-xl border flex items-center gap-2 text-xs font-bold backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-[#0f1738]/95 border-blue-500/40 text-blue-200'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
