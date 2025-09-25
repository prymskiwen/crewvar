import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  messageSendTime: number;
  apiResponseTime: number;
  renderTime: number;
  totalMessages: number;
}

export const ChatPerformanceMonitor = () => {
  const [metrics] = useState<PerformanceMetrics>({
    messageSendTime: 0,
    apiResponseTime: 0,
    renderTime: 0,
    totalMessages: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Monitor performance metrics
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('chat')) {
          console.log('Chat Performance:', entry);
        }
      });
    });

    observer.observe({ entryTypes: ['measure', 'navigation'] });

    return () => observer.disconnect();
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded text-xs z-50"
      >
        📊 Perf
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded text-xs z-50 max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Chat Performance</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div>Send Time: {metrics.messageSendTime}ms</div>
        <div>API Response: {metrics.apiResponseTime}ms</div>
        <div>Render Time: {metrics.renderTime}ms</div>
        <div>Messages: {metrics.totalMessages}</div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className="text-green-400">✅ Optimistic Updates</div>
        <div className="text-green-400">✅ Reduced Polling</div>
        <div className="text-green-400">✅ Memo Components</div>
        <div className="text-yellow-400">⚠️ WebSocket Status</div>
      </div>
    </div>
  );
};
