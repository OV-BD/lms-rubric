import React, { useState, useCallback } from 'react';
import type { EvaluationData, ScoreItem } from '../types';
import { RUBRIC_CATEGORIES } from '../constants';
import Modal from './common/Modal';
import Spinner from './common/Spinner';
import { generateEvaluationSummary } from '../services/geminiService';
import { SparklesIcon, DocumentTextIcon, ClipboardIcon, CheckIcon } from './common/icons';

interface DashboardProps {
  evaluations: EvaluationData[];
}

const Dashboard: React.FC<DashboardProps> = ({ evaluations }) => {
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const viewDetails = (evaluation: EvaluationData) => {
    setSelectedEvaluation(evaluation);
    setShowDetailModal(true);
  };

  const handleGenerateSummary = useCallback(async (evaluation: EvaluationData) => {
    setSelectedEvaluation(evaluation);
    setShowAiModal(true);
    setIsAiLoading(true);
    setAiSummary('');
    const summary = await generateEvaluationSummary(evaluation);
    setAiSummary(summary);
    setIsAiLoading(false);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'bg-green-500/20 text-green-300';
    if (score >= 2.5) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-red-500/20 text-red-300';
  };

  const DetailModalContent = () => (
    selectedEvaluation && (
      <div className="space-y-4">
        <div>
          <p><strong>Reviewer:</strong> {selectedEvaluation.reviewerName} ({selectedEvaluation.reviewerEmail})</p>
          <p><strong>Date:</strong> {selectedEvaluation.evaluationDate}</p>
        </div>
        {RUBRIC_CATEGORIES.map(cat => {
            const catScores = selectedEvaluation.scores[cat.id]?.items;
            if (!catScores) return null;
            const scoredItems = (Object.values(catScores) as ScoreItem[]).filter(item => typeof item.score === 'number');
            const avgScore = scoredItems.length > 0 ? scoredItems.reduce((sum, item) => sum + (item.score as number), 0) / scoredItems.length : 0;

            return (
              <details key={cat.id} className="bg-slate-700/50 p-3 rounded-lg">
                <summary className="font-semibold text-white cursor-pointer">
                  {cat.name} (Avg: {avgScore.toFixed(2)})
                </summary>
                <ul className="list-disc list-inside ml-4 mt-2 text-sm space-y-2">
                  {cat.items.map(item => (
                    <li key={item.id}>
                      {item.description}: <strong className="text-white">Score: {selectedEvaluation.scores[cat.id]?.items[item.id]?.score || 'N/A'}</strong><br />
                      <span className="text-slate-400 italic">Comments: {selectedEvaluation.scores[cat.id]?.items[item.id]?.comments || 'None'}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )
        })}
      </div>
    )
  );

  const AiModalContent = () => (
    <div>
      {isAiLoading && (
        <div className="flex flex-col items-center justify-center h-48">
          <Spinner />
          <p className="mt-4 text-slate-400">Generating AI summary...</p>
        </div>
      )}
      {!isAiLoading && aiSummary && (
        <>
        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br />') }} />
        <button onClick={copyToClipboard} className="mt-4 flex items-center px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">
          {copied ? <CheckIcon className="text-green-400" /> : <ClipboardIcon />}
          <span className="ml-2">{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
        </button>
        </>
      )}
    </div>
  );

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-7xl mx-auto border border-slate-700">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Evaluation Dashboard</h2>
      
      {evaluations.length === 0 ? (
        <p className="text-center text-slate-400 text-lg py-10">No evaluations submitted yet. Go to the 'Evaluation Form' tab to create one.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Reviewer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {evaluations.map(e => (
                <tr key={e.id} className="hover:bg-slate-800 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium text-white">{e.platformEvaluated}</td>
                  <td className="px-4 py-4 text-sm text-slate-300">{e.reviewerName}</td>
                  <td className="px-4 py-4 text-sm text-slate-300">{e.evaluationDate}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full font-bold ${getScoreColor(e.overallScore)}`}>
                      {e.overallScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium space-x-2">
                    <button onClick={() => viewDetails(e)} className="p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors" title="View Details"><DocumentTextIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleGenerateSummary(e)} className="p-2 rounded-md text-blue-400 hover:bg-slate-700 hover:text-blue-300 transition-colors" title="Generate AI Summary"><SparklesIcon className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedEvaluation && (
        <>
            <Modal show={showDetailModal} title={`Details for ${selectedEvaluation.platformEvaluated}`} onClose={() => setShowDetailModal(false)}>
                <DetailModalContent />
            </Modal>
            <Modal show={showAiModal} title={`AI Summary for ${selectedEvaluation.platformEvaluated}`} onClose={() => setShowAiModal(false)}>
                <AiModalContent />
            </Modal>
        </>
      )}
    </div>
  );
};

export default Dashboard;
