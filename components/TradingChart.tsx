import React, { useEffect, useRef, useState } from 'react';

interface Tick {
  time: number;
  price: number;
}

interface TradingChartProps {
  symbol?: string;
  height?: number;
}

const SYMBOLS = [
  { id: 'R_100', name: 'Volatility 100 Index' },
  { id: 'R_75', name: 'Volatility 75 Index' },
  { id: 'R_50', name: 'Volatility 50 Index' },
  { id: 'R_25', name: 'Volatility 25 Index' },
  { id: 'R_10', name: 'Volatility 10 Index' },
  { id: '1HZ100V', name: 'Volatility 100 (1s) Index' },
  { id: 'BOOM1000', name: 'Boom 1000 Index' },
  { id: 'CRASH1000', name: 'Crash 1000 Index' },
];

const TradingChart: React.FC<TradingChartProps> = ({ symbol: initialSymbol = 'R_100', height = 400 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [symbol, setSymbol] = useState(initialSymbol);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxTicks = 100;

  // Connect to Deriv WebSocket
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('Deriv WebSocket connected');
          setIsConnected(true);
          setError(null);
          
          // Subscribe to ticks for the selected symbol
          ws.send(JSON.stringify({
            ticks: symbol,
            subscribe: 1
          }));
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.error) {
            console.error('Deriv error:', data.error);
            setError(data.error.message);
            return;
          }

          if (data.tick) {
            const newTick: Tick = {
              time: data.tick.epoch * 1000,
              price: data.tick.quote
            };
            
            setPreviousPrice(currentPrice);
            setCurrentPrice(newTick.price);
            
            setTicks(prev => {
              const updated = [...prev, newTick];
              return updated.slice(-maxTicks);
            });
          }
        };

        ws.onerror = (err) => {
          console.error('WebSocket error:', err);
          setError('Connection error');
          setIsConnected(false);
        };

        ws.onclose = () => {
          console.log('WebSocket closed');
          setIsConnected(false);
          // Reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

      } catch (err) {
        console.error('Failed to connect:', err);
        setError('Failed to connect to market data');
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [symbol]);

  // Draw chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || ticks.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const chartHeight = rect.height;
    const padding = { top: 20, right: 80, bottom: 30, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const drawHeight = chartHeight - padding.top - padding.bottom;

    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, chartHeight);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (drawHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Calculate price range
    const prices = ticks.map(t => t.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const pricePadding = priceRange * 0.1;

    const scaleY = (price: number) => {
      return padding.top + drawHeight - ((price - minPrice + pricePadding) / (priceRange + pricePadding * 2)) * drawHeight;
    };

    const scaleX = (index: number) => {
      return padding.left + (index / (ticks.length - 1)) * chartWidth;
    };

    // Draw price line
    ctx.beginPath();
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ticks.forEach((tick, i) => {
      const x = scaleX(i);
      const y = scaleY(tick.price);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw gradient fill under the line
    const gradient = ctx.createLinearGradient(0, padding.top, 0, chartHeight - padding.bottom);
    gradient.addColorStop(0, 'rgba(0, 245, 212, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 245, 212, 0)');

    ctx.beginPath();
    ticks.forEach((tick, i) => {
      const x = scaleX(i);
      const y = scaleY(tick.price);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(scaleX(ticks.length - 1), chartHeight - padding.bottom);
    ctx.lineTo(scaleX(0), chartHeight - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw current price dot
    if (ticks.length > 0) {
      const lastTick = ticks[ticks.length - 1];
      const x = scaleX(ticks.length - 1);
      const y = scaleY(lastTick.price);

      // Glow effect
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 245, 212, 0.3)';
      ctx.fill();

      // Main dot
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00f5d4';
      ctx.fill();

      // Price label on right side
      ctx.fillStyle = '#00f5d4';
      ctx.fillRect(width - padding.right + 5, y - 10, 70, 20);
      ctx.fillStyle = '#0a0a0f';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(lastTick.price.toFixed(2), width - padding.right + 40, y + 4);
    }

    // Draw price scale on right
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const price = minPrice - pricePadding + ((priceRange + pricePadding * 2) / 5) * (5 - i);
      const y = padding.top + (drawHeight / 5) * i;
      ctx.fillText(price.toFixed(2), width - padding.right + 35, y + 3);
    }

  }, [ticks]);

  // Handle symbol change
  const handleSymbolChange = (newSymbol: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Unsubscribe from current symbol
      wsRef.current.send(JSON.stringify({ forget_all: 'ticks' }));
    }
    setTicks([]);
    setCurrentPrice(null);
    setPreviousPrice(null);
    setSymbol(newSymbol);
  };

  const priceChange = currentPrice && previousPrice ? currentPrice - previousPrice : 0;
  const priceColor = priceChange >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-darkcard/50 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-white/10 gap-3">
        <div className="flex items-center gap-4">
          <select
            value={symbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
            className="bg-darkbg border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-neon/50"
          >
            {SYMBOLS.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
            {isConnected ? 'LIVE' : 'DISCONNECTED'}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentPrice && (
            <div className="text-right">
              <div className="text-2xl font-mono text-white font-bold">
                {currentPrice.toFixed(2)}
              </div>
              <div className={`text-sm font-mono ${priceColor}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(4)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height }}>
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-darkbg/50">
            <div className="text-center">
              <div className="text-red-400 mb-2">{error}</div>
              <button 
                onClick={() => setError(null)}
                className="text-neon text-sm hover:underline"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : ticks.length < 2 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <div className="text-silver text-sm">Loading market data...</div>
            </div>
          </div>
        ) : null}
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
          style={{ display: ticks.length >= 2 ? 'block' : 'none' }}
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/10 flex justify-between items-center text-xs text-gray-500">
        <span>Deriv Synthetic Indices</span>
        <span>Real-time data • {ticks.length} ticks</span>
      </div>
    </div>
  );
};

export default TradingChart;
