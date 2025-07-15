import React, { useState, useMemo } from 'react';
import type { EvaluationData, Scores, ScoreItem } from '../types';
import { RUBRIC_CATEGORIES, PLATFORMS } from '../constants';
import Modal from './common/Modal';
import Spinner from './common/Spinner';

interface EvaluationFormProps {
  onSaveSuccess: (evaluation: EvaluationData) => void;
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({ onSaveSuccess }) => {
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [evaluationDate, setEvaluationDate] = useState(new Date().toISOString().split('T')[0]);
  const [platformEvaluated, setPlatformEvaluated] = useState('');
  const [otherPlatformName, setOtherPlatformName] = useState('');
  const [scores, setScores] = useState<Scores>(() => {
    const initialScores: Scores = {};
    RUBRIC_CATEGORIES.forEach(category => {
      initialScores[category.id] = { items: {} };
      category.items.forEach(item => {
        initialScores[category.id].items[item.id] = { score: '', comments: '' };
      });
    });
    return initialScores;
  });
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const derivedScores = useMemo(() => {
    let totalWeightedScore = 0;
    let totalWeightWithScores = 0;
    const categoryDetails: { [key: string]: { average: number; weighted: number } } = {};

    RUBRIC_CATEGORIES.forEach(category => {
      const categoryItems = scores[category.id].items;
      const scoredItems = (Object.values(categoryItems) as ScoreItem[]).filter(item => typeof item.score === 'number' && item.score > 0);
      
      if (scoredItems.length > 0) {
        const sumOfScores = scoredItems.reduce((acc, item) => acc + (item.score as number), 0);
        const average = sumOfScores / scoredItems.length;
        const weighted = average * category.weight;
        
        categoryDetails[category.id] = { average, weighted };
        totalWeightedScore += weighted;
        totalWeightWithScores += category.weight;
      } else {
        categoryDetails[category.id] = { average: 0, weighted: 0 };
      }
    });

    const overallScore = totalWeightWithScores > 0 ? totalWeightedScore / totalWeightWithScores : 0;
    return { overallScore, categoryDetails };
  }, [scores]);

  const handleScoreChange = (categoryId: string, itemId: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        items: {
          ...prev[categoryId].items,
          [itemId]: { ...prev[categoryId].items[itemId], score: value === '' ? '' : parseInt(value, 10) },
        },
      },
    }));
  };

  const handleCommentsChange = (categoryId: string, itemId: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        items: { ...prev[categoryId].items, [itemId]: { ...prev[categoryId].items[itemId], comments: value } },
      },
    }));
  };
  
  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPlatformEvaluated(value);
    if (value !== 'Other') {
      setOtherPlatformName('');
    }
  };

  const validateForm = (): boolean => {
    if (!reviewerName || !reviewerEmail || !evaluationDate || !platformEvaluated) {
      setModalMessage("Please fill in all reviewer information fields at the top.");
      setShowModal(true);
      return false;
    }
    if (platformEvaluated === 'Other' && !otherPlatformName.trim()) {
      setModalMessage("Please specify the name of the platform when 'Other' is selected.");
      setShowModal(true);
      return false;
    }
    for (const category of RUBRIC_CATEGORIES) {
      for (const item of category.items) {
        if (scores[category.id].items[item.id].score === '') {
          setModalMessage(`Please provide a score for '${item.description}' in the '${category.name}' section.`);
          setShowModal(true);
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    setLoading(true);
    const finalPlatformName = platformEvaluated === 'Other' ? otherPlatformName.trim() : platformEvaluated;

    const evaluationData: EvaluationData = {
      id: crypto.randomUUID(),
      reviewerName,
      reviewerEmail,
      evaluationDate,
      platformEvaluated: finalPlatformName,
      scores,
      overallScore: derivedScores.overallScore,
      timestamp: new Date().toISOString(),
    };
    
    setTimeout(() => { // Simulate async save
      onSaveSuccess(evaluationData);
      setLoading(false);
    }, 500);
  };

  const inputClass = "block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-2 text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1";

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-6xl mx-auto border border-slate-700">
      <Modal show={showModal} title="Validation Error" onClose={() => setShowModal(false)}>
        <p>{modalMessage}</p>
      </Modal>

      <div className="mb-8 p-6 bg-slate-900/50 rounded-lg border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Reviewer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="reviewerName" className={labelClass}>Reviewer Name</label>
            <input type="text" id="reviewerName" className={inputClass} value={reviewerName} onChange={e => setReviewerName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="reviewerEmail" className={labelClass}>Reviewer Email</label>
            <input type="email" id="reviewerEmail" className={inputClass} value={reviewerEmail} onChange={e => setReviewerEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="evaluationDate" className={labelClass}>Date of Evaluation</label>
            <input type="date" id="evaluationDate" className={inputClass} value={evaluationDate} onChange={e => setEvaluationDate(e.target.value)} />
          </div>
          <div>
            <label htmlFor="platformEvaluated" className={labelClass}>Platform Evaluated</label>
            <select id="platformEvaluated" className={inputClass} value={platformEvaluated} onChange={handlePlatformChange}>
              <option value="">Select Platform...</option>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {platformEvaluated === 'Other' && (
              <div className="mt-4">
                <label htmlFor="otherPlatformName" className={labelClass}>Specify Platform Name</label>
                <input
                  type="text"
                  id="otherPlatformName"
                  className={inputClass}
                  value={otherPlatformName}
                  onChange={e => setOtherPlatformName(e.target.value)}
                  placeholder="Enter platform name..."
                  required
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {RUBRIC_CATEGORIES.map(category => (
          <div key={category.id} className="p-6 bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="flex justify-between items-baseline">
                <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                <span className="text-sm font-medium text-slate-400">Weight: {category.weight * 100}%</span>
            </div>
            <p className="text-slate-400 mb-4 text-sm">
                Category Average Score: <span className="font-bold text-white">{derivedScores.categoryDetails[category.id]?.average.toFixed(2) ?? '0.00'}</span>
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-slate-600">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-2/4">Item Description</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-1/4">Score (1-5)</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-2/4">Comments/Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {category.items.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 text-sm text-slate-300 align-top">{item.description}</td>
                      <td className="px-4 py-4 align-top">
                        <select
                          value={scores[category.id].items[item.id].score}
                          onChange={e => handleScoreChange(category.id, item.id, e.target.value)}
                          className={`${inputClass} w-full`}
                        >
                          <option value="">Select</option>
                          {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <textarea
                          value={scores[category.id].items[item.id].comments}
                          onChange={e => handleCommentsChange(category.id, item.id, e.target.value)}
                          rows={2}
                          className={`${inputClass} resize-y`}
                          placeholder="Add comments..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-center shadow-lg">
        <h3 className="text-2xl font-bold text-white">Overall Weighted Score</h3>
        <p className="text-5xl font-extrabold text-white mt-2">{derivedScores.overallScore.toFixed(2)}</p>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Spinner /> : 'Save Evaluation'}
        </button>
      </div>
    </div>
  );
};

export default EvaluationForm;