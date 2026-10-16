import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Play, 
  Loader2, 
  X, 
  Award, 
  Cpu, 
  Activity,
  Layers
} from 'lucide-react';
import { RoomData, JudgeVerdict, TestResult } from '../types/game';
import { soundManager } from '../utils/sound';

interface JudgeAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData | null;
}

export const JudgeAgentModal: React.FC<JudgeAgentModalProps> = ({
  isOpen,
  onClose,
  room,
}) => {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [evaluatingWithArgon, setEvaluatingWithArgon] = useState(false);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [verdict, setVerdict] = useState<JudgeVerdict | null>(null);

  useEffect(() => {
    if (isOpen && tests.length === 0) {
      runFullEvaluationSuite();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const runFullEvaluationSuite = async () => {
    soundManager.playClick();
    setIsRunningTests(true);
    setVerdict(null);

    try {
      // Step 1: Run automated regression test suite on server
      const diagRes = await fetch('/api/diagnostics/run');
      const diagData = await diagRes.json();
      setTests(diagData.results || []);
      setIsRunningTests(false);

      // Step 2: Feed evidence into A2A Judge Agent powered by gemini-4-argon with ThinkingLevel.HIGH
      setEvaluatingWithArgon(true);
      const judgeRes = await fetch('/api/ai/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEvidence: diagData,
          roomAuditLogs: room?.auditLogs || [],
        }),
      });
      const judgeData = await judgeRes.json();
      if (judgeData.verdict) {
        setVerdict(judgeData.verdict);
        soundManager.playSuccess();
      }
    } catch (err) {
      console.error('Judge evaluation failed:', err);
    } finally {
      setIsRunningTests(false);
      setEvaluatingWithArgon(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="w-full max-w-3xl bg-[#090e24] border border-[#23335f] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 bg-[#0d1533] border-b border-[#1f2d57] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                A2A Judge Agent
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  Gemini 3.8 Flash (High Thinking)
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Independent verification of game integrity, concurrency, and rules</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a2548]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-4 py-2.5 bg-[#0b1129] border-b border-[#1b274c] flex items-center justify-between">
          <span className="text-xs text-slate-300 font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Evaluation Pipeline: Diagnostics → Test Evidence → Reasoning Audit
          </span>
          <button
            onClick={runFullEvaluationSuite}
            disabled={isRunningTests || evaluatingWithArgon}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30"
          >
            {isRunningTests || evaluatingWithArgon ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Full Audit</span>
              </>
            )}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Status summary banner */}
          {verdict && (
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              verdict.status === 'APPROVED'
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : 'bg-red-950/40 border-red-500/40'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg ${
                  verdict.status === 'APPROVED'
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : 'bg-red-500 text-white shadow-red-500/30'
                }`}>
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">
                      VERDICT: {verdict.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
                      Score: {verdict.overallScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Evaluator: {verdict.evaluatorModel}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                {new Date(verdict.evaluationDate).toLocaleString()}
              </div>
            </div>
          )}

          {/* Deep Thinking Summary from gemini-4-argon */}
          {verdict?.thinkingSummary && (
            <div className="bg-[#0e1633] border border-[#1f2e59] rounded-2xl p-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" /> High-Thinking Audit Trace
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-[#060a17] p-3 rounded-xl border border-[#1d2a52] font-mono">
                {verdict.thinkingSummary}
              </p>
            </div>
          )}

          {/* Criteria Scores Grid */}
          {verdict?.criteriaScores && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(verdict.criteriaScores).map(([key, score]) => (
                <div key={key} className="bg-[#0e1633] border border-[#1f2e59] rounded-xl p-3 text-center">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 truncate mb-1">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {score}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Automated Test Suite Evidence */}
          <div className="bg-[#0e1633] border border-[#1f2e59] rounded-2xl p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-400" /> Automated Regression Test Suite
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                {tests.filter(t => t.passed).length}/{tests.length} Passed
              </span>
            </h3>

            <div className="space-y-1.5">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#070b1a] border border-[#172346] text-xs"
                >
                  <div className="flex items-center gap-2">
                    {test.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-200">{test.name}</span>
                      <span className="block text-[10px] text-slate-500 font-mono">{test.suite}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {test.durationMs}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
