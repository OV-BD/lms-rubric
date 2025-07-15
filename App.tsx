
import React, { useState, useEffect, useCallback } from 'react';
import EvaluationForm from './components/EvaluationForm';
import Dashboard from './components/Dashboard';
import type { EvaluationData } from './types';
import { DocumentTextIcon, ChartBarIcon } from './components/common/icons';

type Tab = 'form' | 'dashboard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('form');
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedEvaluations = localStorage.getItem('lms-evaluations');
      if (storedEvaluations) {
        setEvaluations(JSON.parse(storedEvaluations));
      }
    } catch (error) {
      console.error("Failed to load evaluations from localStorage", error);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('lms-evaluations', JSON.stringify(evaluations));
      } catch (error) {
        console.error("Failed to save evaluations to localStorage", error);
      }
    }
  }, [evaluations, isLoaded]);

  const handleSaveSuccess = useCallback((newEvaluation: EvaluationData) => {
    setEvaluations(prev => [...prev, newEvaluation]);
    setActiveTab('dashboard');
  }, []);

  const TabButton = ({ tabName, label, icon }: { tabName: Tab; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-t-lg transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white ${
        activeTab === tabName
          ? 'bg-white/10 text-white'
          : 'bg-black/20 text-blue-200 hover:bg-white/20 hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500 selection:text-white">
      <header className="p-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">LMS Evaluation Tool</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-blue-200">
          Powered by Gemini for AI-driven insights.
        </p>
      </header>
      
      <main className="px-4 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center space-x-2 border-b border-white/10 mb-8">
            <TabButton tabName="form" label="Evaluation Form" icon={<DocumentTextIcon />} />
            <TabButton tabName="dashboard" label="Dashboard" icon={<ChartBarIcon />} />
          </div>

          <div className="transition-opacity duration-500">
            {activeTab === 'form' && <EvaluationForm onSaveSuccess={handleSaveSuccess} />}
            {activeTab === 'dashboard' && <Dashboard evaluations={evaluations} />}
          </div>
        </div>
      </main>
      
      <footer className="text-center py-4 text-sm text-slate-400">
        <p>Built by a world-class senior frontend React engineer.</p>
      </footer>
    </div>
  );
};

export default App;
