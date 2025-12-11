import React from 'react';
import { UserRole } from '../types';
import { DollarSign, Bitcoin, BellRing } from 'lucide-react';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-md w-full space-y-8 flex flex-col">
        
        <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-gray-800">ExchangeLink</h1>
            <p className="text-gray-500 mt-2">Quem é você nesta transação?</p>
        </div>

        <div className="grid grid-cols-1 gap-6 w-full">
          {/* USA Option */}
          <button
            onClick={() => onSelectRole(UserRole.USA)}
            className="group relative flex flex-col items-center justify-center p-8 bg-white border-2 border-transparent hover:border-usa-primary rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="h-16 w-16 bg-usa-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-usa-primary group-hover:text-white transition-colors duration-300">
              <DollarSign className="w-8 h-8 text-usa-primary group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Sou Dólar (USA)</h3>
            <p className="text-xs text-gray-400 mt-1">Envio cotações em Dólar</p>
          </button>

          {/* Bitcoin Option */}
          <button
            onClick={() => onSelectRole(UserRole.BITCOIN)}
            className="group relative flex flex-col items-center justify-center p-8 bg-gray-900 border-2 border-transparent hover:border-btc-primary rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="h-16 w-16 bg-btc-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-btc-primary group-hover:text-white transition-colors duration-300">
              <Bitcoin className="w-8 h-8 text-btc-primary group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Sou Bitcoin (BTC)</h3>
            <p className="text-xs text-gray-400 mt-1">Envio cotações em Cripto</p>
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
          <BellRing className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 leading-relaxed">
            Ao selecionar um perfil, seu navegador solicitará permissão para <strong>Notificações</strong>. Aceite para receber os alertas quando a tela estiver bloqueada.
          </p>
        </div>

      </div>
    </div>
  );
};