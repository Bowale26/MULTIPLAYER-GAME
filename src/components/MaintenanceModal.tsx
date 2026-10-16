import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Archive, 
  Filter, 
  X, 
  ShieldAlert, 
  Layers, 
  Loader2, 
  Save 
} from 'lucide-react';
import { EngineeringRule, RuleStatus, RuleCategory, RuleSeverity } from '../types/game';
import { soundManager } from '../utils/sound';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [rules, setRules] = useState<EngineeringRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<RuleStatus | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<RuleCategory | 'ALL'>('ALL');
  const [showProposeModal, setShowProposeModal] = useState(false);

  // New rule form fields
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState<RuleSeverity>('HIGH');
  const [newCategory, setNewCategory] = useState<RuleCategory>('CONCURRENCY');
  const [newRootCause, setNewRootCause] = useState('');
  const [newRegressionTest, setNewRegressionTest] = useState('test_regression_guard');

  useEffect(() => {
    if (isOpen) {
      fetchRules();
    }
  }, [isOpen]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rules');
      const data = await res.json();
      if (data.rules) setRules(data.rules);
    } catch (err) {
      console.error('Failed to load engineering rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: RuleStatus) => {
    soundManager.playClick();
    try {
      const res = await fetch(`/api/rules/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.rule) {
        setRules((prev) => prev.map((r) => (r.id === id ? data.rule : r)));
        soundManager.playSuccess();
      }
    } catch (err) {
      console.error('Failed to update rule status:', err);
    }
  };

  const handleProposeRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    soundManager.playClick();
    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          severity: newSeverity,
          category: newCategory,
          rootCause: newRootCause.trim(),
          regressionTest: newRegressionTest.trim(),
        }),
      });
      const data = await res.json();
      if (data.rule) {
        setRules((prev) => [data.rule, ...prev]);
        setShowProposeModal(false);
        soundManager.playSuccess();
        // Reset form
        setNewTitle('');
        setNewDesc('');
        setNewRootCause('');
      }
    } catch (err) {
      console.error('Failed to propose rule:', err);
    }
  };

  if (!isOpen) return null;

  const filteredRules = rules.filter((r) => {
    const matchStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
    const matchCategory = selectedCategory === 'ALL' || r.category === selectedCategory;
    return matchStatus && matchCategory;
  });

  const getSeverityBadge = (sev: RuleSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-500/20 text-slate-400 border border-slate-500/30">LOW</span>;
    }
  };

  const getStatusBadge = (st: RuleStatus) => {
    switch (st) {
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">APPROVED</span>;
      case 'PROPOSED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">PROPOSED</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30">REJECTED</span>;
      case 'RETIRED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-500/20 text-slate-400 border border-slate-500/30">RETIRED</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="w-full max-w-4xl bg-[#090e24] border border-[#23335f] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 bg-[#0d1533] border-b border-[#1f2d57] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                Persistent Engineering Rulebook
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  Versioned & Audited
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Turns individual defects and architectural constraints into permanent, automated guardrails
              </p>
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

        {/* Filters and Actions */}
        <div className="px-4 py-2.5 bg-[#0b1129] border-b border-[#1b274c] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-[#101938] px-2 py-1 rounded-lg border border-[#1e2a52] text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as RuleStatus | 'ALL')}
                className="bg-transparent text-white text-xs focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="PROPOSED">Proposed</option>
                <option value="REJECTED">Rejected</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-[#101938] px-2 py-1 rounded-lg border border-[#1e2a52] text-xs">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as RuleCategory | 'ALL')}
                className="bg-transparent text-white text-xs focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="CONCURRENCY">Concurrency</option>
                <option value="SECURITY">Security</option>
                <option value="SCORING">Scoring</option>
                <option value="ACCESSIBILITY">Accessibility</option>
                <option value="MOBILE">Mobile</option>
                <option value="PERFORMANCE">Performance</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              setShowProposeModal(true);
            }}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Propose New Rule</span>
          </button>
        </div>

        {/* Rule List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {loading ? (
            <div className="py-12 flex justify-center items-center text-xs text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400 mr-2" />
              Loading rules repository...
            </div>
          ) : filteredRules.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-10 italic">
              No rules match the selected filters.
            </p>
          ) : (
            filteredRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-[#0e1633] border border-[#1f2e59] rounded-2xl p-4 transition-all hover:border-purple-500/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                      {rule.ruleCode}
                    </span>
                    <h3 className="text-sm font-bold text-white">{rule.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">v{rule.version}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getSeverityBadge(rule.severity)}
                    {getStatusBadge(rule.status)}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {rule.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-[#070b1a] p-2.5 rounded-xl border border-[#162243] font-mono mb-3">
                  <div>
                    <span className="text-slate-400 font-sans font-semibold">Root Cause: </span>
                    <span className="text-slate-200">{rule.rootCause}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans font-semibold">Regression Test: </span>
                    <span className="text-purple-300">{rule.regressionTest}()</span>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-500 font-mono">
                    Created: {new Date(rule.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex gap-1.5">
                    {rule.status === 'PROPOSED' && (
                      <button
                        onClick={() => handleUpdateStatus(rule.id, 'APPROVED')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[10px] font-bold flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Approve Rule
                      </button>
                    )}
                    {rule.status === 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateStatus(rule.id, 'RETIRED')}
                        className="px-2.5 py-1 bg-[#1a2548] hover:bg-slate-700 text-slate-300 rounded-md text-[10px] font-bold flex items-center gap-1"
                      >
                        <Archive className="w-3 h-3" /> Retire Rule
                      </button>
                    )}
                    {rule.status === 'PROPOSED' && (
                      <button
                        onClick={() => handleUpdateStatus(rule.id, 'REJECTED')}
                        className="px-2.5 py-1 bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-red-300 rounded-md text-[10px] font-bold flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Propose Rule Modal Dialog */}
        {showProposeModal && (
          <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-[#0b1229] border border-[#2b3d70] rounded-2xl p-5 w-full max-w-lg shadow-2xl">
              <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" /> Propose New Engineering Rule
              </h3>
              <form onSubmit={handleProposeRule} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Rule Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    placeholder="e.g. Reject Duplicate Submissions Per Round"
                    className="w-full px-3 py-1.5 bg-[#060a17] border border-[#21315b] rounded-lg text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as RuleCategory)}
                      className="w-full px-2 py-1.5 bg-[#060a17] border border-[#21315b] rounded-lg text-xs text-white"
                    >
                      <option value="CONCURRENCY">Concurrency</option>
                      <option value="SECURITY">Security</option>
                      <option value="SCORING">Scoring</option>
                      <option value="ACCESSIBILITY">Accessibility</option>
                      <option value="MOBILE">Mobile</option>
                      <option value="PERFORMANCE">Performance</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Severity</label>
                    <select
                      value={newSeverity}
                      onChange={(e) => setNewSeverity(e.target.value as RuleSeverity)}
                      className="w-full px-2 py-1.5 bg-[#060a17] border border-[#21315b] rounded-lg text-xs text-white"
                    >
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Description & Guardrail</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                    required
                    placeholder="What does this rule mandate to prevent future defects?"
                    className="w-full p-2 bg-[#060a17] border border-[#21315b] rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Root Cause</label>
                  <input
                    type="text"
                    value={newRootCause}
                    onChange={(e) => setNewRootCause(e.target.value)}
                    placeholder="Defect or reproduction observation"
                    className="w-full px-3 py-1.5 bg-[#060a17] border border-[#21315b] rounded-lg text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProposeModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-purple-600/30"
                  >
                    Submit Proposal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
