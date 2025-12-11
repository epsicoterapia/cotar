import React, { useState } from 'react';
import { UserRole, NotificationLog } from '../types';
import { fetchBitcoinRate, fetchUSDRate } from '../services/api';
import { p2pService } from '../services/p2p';
import { Send, RefreshCcw, ArrowLeft, CheckCircle, Activity, Settings, X, Trash2, Smartphone, Server, Wifi, WifiOff } from 'lucide-react';

interface DashboardProps {
  role: UserRole;
  myId: string;
  partnerId: string;
  onBack: () => void;
  onUnpair: () => void;
  p2pStatus: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ role, myId, partnerId, onBack, onUnpair, p2pStatus }) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const isUSA = role === UserRole.USA;
  const isOnline = p2pStatus === 'online';
  
  // Theme configurations based on role
  const theme = isUSA
    ? {
        bg: 'bg-slate-50',
        card: 'bg-white',
        primary: 'bg-usa-primary hover:bg-opacity-90',
        text: 'text-usa-primary',
        accent: 'text-usa-secondary',
        border: 'border-usa-primary',
        label: 'USD'
      }
    : {
        bg: 'bg-gray-900',
        card: 'bg-gray-800',
        primary: 'bg-btc-primary hover:bg-yellow-500',
        text: 'text-btc-primary',
        accent: 'text-white',
        border: 'border-btc-primary',
        label: 'BTC'
      };

  const handleAction = async () => {
    setLoading(true);
    try {
      // 1. Fetch Data
      let rate = 0;
      let formattedRate = '';

      if (isUSA) {
        rate = await fetchUSDRate();
        formattedRate = `$1.00 USD = €${rate.toFixed(2)} EUR`;
      } else {
        rate = await fetchBitcoinRate();
        formattedRate = `$${rate.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;
      }

      // 2. Use P2P Service to send Real Data
      await p2pService.sendData(partnerId, {
        type: 'RATE_UPDATE',
        content: formattedRate,
        senderId: myId,
        senderRole: role
      });

      // 3. Log Success
      const newLog: NotificationLog = {
        id: Date.now().toString(),
        from: role,
        message: `Enviado: ${formattedRate}`,
        timestamp: new Date(),
        type: 'success'
      };
      setLogs(prev => [newLog, ...prev]);

    } catch (error) {
      console.error(error);
      const errorLog: NotificationLog = {
        id: Date.now().toString(),
        from: role,
        message: 'Falha: Parceiro não encontrado ou offline.',
        timestamp: new Date(),
        type: 'error'
      };
      setLogs(prev => [errorLog, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-500 flex flex-col`}>
      {/* Header */}
      <header className="p-4 flex justify-between items-center relative z-10">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${isUSA ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-300 hover:bg-gray-800'}`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-2">
            {/* Status Indicator */}
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? 'P2P Online' : 'Offline'}
            </div>

            {/* Settings Button */}
            <button 
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-full transition-colors ${isUSA ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-300 hover:bg-gray-800'}`}
            >
            <Settings className="w-6 h-6" />
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto space-y-8">
        
        {/* Action Card */}
        <div className={`w-full ${theme.card} p-8 rounded-3xl shadow-2xl border-t-4 ${theme.border} transform transition-all flex flex-col items-center`}>
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${isUSA ? 'bg-usa-primary/10' : 'bg-black/40'} mb-8`}>
            <Activity className={`w-12 h-12 ${theme.text}`} />
          </div>

          <button
            onClick={handleAction}
            disabled={loading || !isOnline}
            className={`w-full group relative overflow-hidden py-5 px-6 rounded-xl font-bold text-lg text-white shadow-lg transition-all duration-300 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${theme.primary}`}
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <RefreshCcw className="w-6 h-6 animate-spin" />
                  <span>Enviando P2P...</span>
                </>
              ) : (
                <>
                  <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  <span>
                    {isUSA ? 'Enviar Cotação Dólar' : 'Enviar Cotação BTC'}
                  </span>
                </>
              )}
            </div>
          </button>
          {!isOnline && (
              <p className="mt-3 text-xs text-red-500 font-medium">Conexão P2P indisponível. Verifique a internet.</p>
          )}
        </div>

        {/* Transmission Log (Minimal) */}
        <div className="w-full space-y-3">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className={`flex items-start gap-3 p-4 rounded-xl text-sm border-l-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300
                ${log.type === 'success' 
                  ? (isUSA ? 'bg-white border-green-500' : 'bg-gray-800 border-green-500') 
                  : (isUSA ? 'bg-red-50 border-red-500' : 'bg-red-900/20 border-red-500')}
              `}
            >
              <CheckCircle className={`w-5 h-5 shrink-0 ${log.type === 'success' ? 'text-green-500' : 'text-red-500'}`} />
              <div className="flex-1">
                 <p className={`${isUSA ? 'text-gray-800' : 'text-gray-200'} font-medium`}>
                   {log.message}
                 </p>
                 <p className={`text-xs mt-1 ${isUSA ? 'text-gray-400' : 'text-gray-500'}`}>
                   {log.timestamp.toLocaleTimeString()}
                 </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 ${isUSA ? 'bg-white' : 'bg-gray-800 text-white'} relative`}>
            
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200/20"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações
            </h3>

            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${isUSA ? 'bg-gray-50' : 'bg-gray-700/50'}`}>
                <div className="flex items-center gap-2 mb-1 text-xs uppercase font-bold opacity-60">
                  <Smartphone className="w-3 h-3" />
                  ID Local
                </div>
                <div className="font-mono text-lg font-bold tracking-wider">{myId}</div>
              </div>

              <div className={`p-4 rounded-xl ${isUSA ? 'bg-gray-50' : 'bg-gray-700/50'}`}>
                 <div className="flex items-center gap-2 mb-1 text-xs uppercase font-bold opacity-60">
                  <Server className="w-3 h-3" />
                  ID Parceiro
                </div>
                <div className="font-mono text-lg font-bold tracking-wider">{partnerId}</div>
              </div>

              <button 
                onClick={() => {
                  if(confirm('Tem certeza que deseja limpar o ID do parceiro?')) {
                    onUnpair();
                  }
                }}
                className="w-full mt-6 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Limpar ID
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};