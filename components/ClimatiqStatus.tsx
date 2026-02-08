import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Info, Zap } from 'lucide-react';

interface ClimatiqStatusProps {
  onConnectionChange?: (connected: boolean) => void;
}

const ClimatiqStatus: React.FC<ClimatiqStatusProps> = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = '';

  const checkConnection = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/climatiq/validate`, {
        credentials: 'include',
      });
      
      const data = await response.json();
      const connected = data.success && data.connected;
      
      setIsConnected(connected);
      setLastChecked(new Date());
      onConnectionChange?.(connected);
    } catch (error: any) {
      setIsConnected(false);
      setError(error.message || 'Connection failed');
      onConnectionChange?.(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-blue-600" />
          <h3 className="font-semibold text-stone-800">Carbon Calculation Engine</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-stone-200 text-stone-600'
          }`}>
            {isConnected ? (
              <span className="flex items-center gap-1">
                <CheckCircle size={12} />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <AlertCircle size={12} />
                {isChecking ? 'Checking...' : 'Offline'}
              </span>
            )}
          </span>
          <button
            onClick={checkConnection}
            disabled={isChecking}
            className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh connection status"
          >
            <RefreshCw 
              size={14} 
              className={`text-stone-600 ${isChecking ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>
      </div>

      {isConnected ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <div className="flex gap-2">
            <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-green-800">
              Connected to Climatiq API for real-time carbon emission calculations. 
              All sustainability metrics use verified emission factors from scientific databases.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className={`border rounded-xl p-3 mb-3 ${
            error ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex gap-2">
              <AlertCircle size={16} className={`flex-shrink-0 mt-0.5 ${
                error ? 'text-red-600' : 'text-yellow-600'
              }`} />
              <div className="text-xs">
                {error ? (
                  <p className="text-red-800">
                    <strong>API Error:</strong> {error}
                    <br />
                    Using estimated emission factors. Some calculations may be less accurate.
                  </p>
                ) : (
                  <p className="text-yellow-800">
                    Unable to connect to Climatiq API. Using estimated emission factors. 
                    Some calculations may be less accurate.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <div className="flex gap-2">
              <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <strong>Fallback Mode:</strong> Using scientifically-based estimated emission factors:
                <ul className="mt-1.5 ml-4 list-disc space-y-0.5">
                  <li>Flight: 255g CO2/km per passenger</li>
                  <li>Train: 41g CO2/km per passenger</li>
                  <li>Bus: 89g CO2/km per passenger</li>
                  <li>Car: 171g CO2/km per passenger</li>
                  <li>Hotel: 25kg CO2 per night</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {lastChecked && (
        <p className="text-[10px] text-stone-400 mt-2">
          Last checked: {lastChecked.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default ClimatiqStatus;
