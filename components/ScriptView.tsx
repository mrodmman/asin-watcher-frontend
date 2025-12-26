import React, { useState } from 'react';
import { GirlMathScript } from '../types';

interface ScriptViewProps {
  script: GirlMathScript;
  onClose: () => void;
}

const ScriptView: React.FC<ScriptViewProps> = ({ script, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const masterVideoScript = `${script.intro}\n\n${script.products.map(p => `This is the ${p.cleanName}. ${p.body}`).join('\n\n')}\n\n${script.outro}`.trim();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        <div className="bg-gradient-to-r from-pink-600 to-rose-500 p-6 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">Master Campaign Suite</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="bg-pink-50 rounded-3xl p-8 border border-pink-100">
            <div className="space-y-8 text-xl serif-font italic text-gray-800 leading-relaxed">
              <p>"{script.intro}"</p>
              {script.products.map((p, idx) => (
                <p key={idx}>This is the <span className="not-italic font-black text-pink-600">{p.cleanName}</span>. {p.body}</p>
              ))}
              <p>"{script.outro}"</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t flex gap-4">
          <button onClick={() => handleCopy(masterVideoScript)} className="flex-1 bg-white text-gray-700 border-2 py-4 rounded-2xl font-black uppercase hover:bg-gray-50">
            {copied ? 'Copied!' : 'Copy Script'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScriptView;
