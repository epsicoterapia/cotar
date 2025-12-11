import React, { useState } from 'react';
import { UserRole } from '../types';
import { Link2, Copy, ArrowRight, ShieldCheck, ArrowLeft, Share2 } from 'lucide-react';

interface BindingScreenProps {
  role: UserRole;
  myId: string;
  onLink: (partnerId: string) => void;
  onBack: () => void;
}

export const BindingScreen: React.FC<BindingScreenProps> = ({ role, myId, onLink, onBack }) => {
  const [partnerIdInput, setPartnerIdInput] = useState('');
  const [copied, setCopied] = useState(false);

  const isUSA = role === UserRole.USA;
  
  // Theme logic
  const theme = isUSA
    ? {
        bg: 'bg-white',
        text: 'text-usa-primary',
        button: 'bg-usa-primary hover:bg-usa-primary/90',
        border: 'border-usa-primary',
        input: 'bg-gray-50 text-gray-900 focus:ring-usa-primary'
      }
    : {
        bg: 'bg-gray-900',
        text: 'text-btc-primary',
        button: 'bg-btc-primary hover:bg-yellow-500',
        border: 'border-btc-primary',
        input: 'bg-gray-800 text-white focus:ring-btc-primary'
      };

  const generateShareUrl = () => {
    return `${window.location.origin}${window.location.pathname}?connect=${myId}`;
  };

  const handleShare = async () => {
    const url = generateShareUrl();
    const shareData = {
      title: 'ExchangeLink',
      text: `Conecte-se comigo no ExchangeLink usando meu ID: ${myId}`,
      url: url
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generateShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (partnerIdInput.trim().length > 0 && partnerIdInput !== myId) {
      onLink(partnerIdInput.trim().toUpperCase());
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isUSA ? 'bg-gray-50' : 'bg-black'}`}>
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className={`absolute top-6 left-6 p-2 rounded-full transition-colors flex items-center gap-2 font-medium ${isUSA ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-400 hover:bg-gray-800'}`}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Voltar</span>
      </button>

      <div className={`w-full max-w-md ${theme.bg} p-8 rounded-3xl shadow-2xl space-y-8 mt-12`}>
        
        {/* Local ID Section */}
        <div className="text-center space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${isUSA ? 'bg-usa-primary/10' : 'bg-white/10'}`}>
            <ShieldCheck className={`w-8 h-8 ${theme.text}`} />
          </div>
          
          <div>
            <label className={`text-xs uppercase tracking-widest font-bold ${isUSA ? 'text-gray-400' : 'text-gray-500'}`}>
              Seu ID de Acesso
            </label>
            <div className={`text-3xl font-mono font-bold mt-1 ${theme.text} tracking-wider`}>
              {myId}
            </div>
          </div>

          <button 
            onClick={handleShare}
            className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 font-bold transition-all ${isUSA ? 'border-usa-primary text-usa-primary hover:bg-usa-primary/5' : 'border-btc-primary text-btc-primary hover:bg-btc-primary/10'}`}
          >
             {copied ? (
                 <span>Link Copiado!</span>
             ) : (
                 <>
                    <Share2 className="w-5 h-5" />
                    <span>Enviar Convite</span>
                 </>
             )}
          </button>
          <p className="text-[10px] text-gray-400">Envie este link para o outro smartphone</p>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className={`flex-grow border-t ${isUSA ? 'border-gray-200' : 'border-gray-700'}`}></div>
          <span className={`flex-shrink-0 mx-4 text-xs font-bold uppercase ${isUSA ? 'text-gray-400' : 'text-gray-600'}`}>
            OU DIGITE MANUALMENTE
          </span>
          <div className={`flex-grow border-t ${isUSA ? 'border-gray-200' : 'border-gray-700'}`}></div>
        </div>

        {/* Server ID Input */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={partnerIdInput}
              onChange={(e) => setPartnerIdInput(e.target.value)}
              placeholder="Cole o ID do Parceiro aqui"
              className={`w-full px-4 py-4 text-center text-lg font-mono rounded-xl border-2 border-transparent focus:outline-none focus:ring-2 transition-all uppercase placeholder-opacity-50 ${theme.input}`}
              maxLength={10}
            />
          </div>

          <button
            type="submit"
            disabled={!partnerIdInput}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${theme.button}`}
          >
            <span>Conectar</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
};