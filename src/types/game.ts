export type ColorChoice = 'RED' | 'BLUE' | 'YELLOW' | 'GREEN';

export type RoomState = 
  | 'WAITING' 
  | 'STARTING' 
  | 'PLAYING' 
  | 'ROUND_COMPLETE' 
  | 'PAUSED' 
  | 'FINISHED';

export interface Player {
  id: string;
  nickname: string;
  score: number;
  connected: boolean;
  isHost: boolean;
  avatarIndex: number;
  streak: number;
  isBot?: boolean;
  competitiveRating?: number;
  title?: string;
  tier?: string;
  lastAnswerRound?: number;
  lastAnswerColor?: ColorChoice;
  lastAnswerCorrect?: boolean;
  lastResponseTimeMs?: number;
}

export interface MatchHistoryItem {
  matchId: string;
  roomCode: string;
  winnerUid: string;
  winnerNickname: string;
  loserUid?: string;
  participants: Array<{
    id: string;
    nickname: string;
    score: number;
    isBot?: boolean;
    rating?: number;
  }>;
  finalScores: Record<string, number>;
  timestamp: number;
  streakDelta: number;
  roundsPlayed: number;
  gameMode: string;
}

export interface RoundSubmission {
  playerId: string;
  color: ColorChoice;
  timeMs: number;
  isCorrect: boolean;
  pointsEarned: number;
  submittedAt: number;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  message: string;
  type: 'system' | 'player' | 'judge' | 'score' | 'rule';
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: number;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'Trophy' | 'Flame' | 'Zap' | 'Target' | 'Clock' | 'Crown' | 'Shield' | 'Award' | 'Sparkles';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: number;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  highScore: number;
  totalPoints: number;
  roundsPlayed: number;
  bestStreak: number;
  currentStreak?: number;
  fastestResponseMs?: number;
  competitiveRating?: number; // ELO / Rating e.g. 1520
  winLossRatio?: number; // percentage e.g. 68.5%
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Grandmaster';
}

export interface UserProfile {
  id: string; // Unique Player ID, e.g. "PID-8F29A1"
  email: string;
  username: string;
  avatarIndex: number;
  createdAt: number;
  stats: UserStats;
  competitiveRating?: number;
  tier?: string;
  achievements?: Achievement[];
  matchHistory?: MatchHistoryItem[];
  token?: string;
}

export interface GlobalLeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  avatarIndex: number;
  totalPoints: number;
  gamesWon: number;
  gamesPlayed: number;
  highScore: number;
  winRate: number;
  bestStreak?: number;
  roundsPlayed?: number;
  fastestResponseMs?: number;
  achievementsCount?: number;
}

export interface LobbySummary {
  code: string;
  name: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  state: RoomState;
  round: number;
  totalRounds: number;
  roundDuration: number;
  isPrivate: boolean;
  createdAt?: number;
}

export interface RoomData {
  code: string;
  name?: string;
  hostId: string;
  maxPlayers: number;
  isPrivate?: boolean;
  state: RoomState;
  round: number;
  totalRounds: number;
  roundDuration: number; // in seconds, default 12
  targetScore: number;
  targetColor: ColorChoice;
  roundStartTime: number;
  roundEndTime: number;
  players: Player[];
  leaderboard: Player[];
  submissions: Record<string, RoundSubmission>;
  auditLogs: AuditLog[];
  messages: ChatMessage[];
  winner?: Player;
}

export type RuleSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RuleStatus = 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'RETIRED';
export type RuleCategory = 'CONCURRENCY' | 'SECURITY' | 'SCORING' | 'VISION' | 'ACCESSIBILITY' | 'MOBILE' | 'PERFORMANCE';

export interface EngineeringRule {
  id: string;
  ruleCode: string;
  title: string;
  description: string;
  severity: RuleSeverity;
  status: RuleStatus;
  category: RuleCategory;
  rootCause: string;
  regressionTest: string;
  affectedComponents: string[];
  createdAt: string;
  approvedAt?: string;
  version: number;
}

export interface TestResult {
  id: string;
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  severity: RuleSeverity;
}

export interface VisionAnalysisResult {
  dominantColor: ColorChoice | 'UNKNOWN';
  confidence: number;
  colorHex: string;
  detectedObjects: string[];
  lightingCondition: string;
  sceneDescription: string;
  timestamp: number;
}

export interface JudgeVerdict {
  status: 'APPROVED' | 'REQUIRES_FIX' | 'CRITICAL_BLOCK';
  overallScore: number; // 0 - 100
  evaluationDate: string;
  evaluatorModel: string;
  thinkingSummary: string;
  criteriaScores: {
    functionalCorrectness: number;
    concurrencyAndScoringIntegrity: number;
    accessibilityAndContrast: number;
    agentOrchestration: number;
    resilienceAndErrorHandling: number;
  };
  passedChecks: string[];
  criticalIssues: string[];
  recommendations: string[];
}
