/**
 * EpidemiWatch SSE Service
 * Real-time alert streaming from backend
 */

import { OutbreakAlert } from './api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export type AlertCallback = (alert: OutbreakAlert) => void;
export type ErrorCallback = (error: Event) => void;
export type ConnectionCallback = () => void;

export class AlertStreamService {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // 2 seconds
  private reconnectTimer: number | null = null;

  /**
   * Connect to the SSE alert stream
   */
  connect(
    onAlert: AlertCallback,
    onError?: ErrorCallback,
    onConnect?: ConnectionCallback
  ): void {
    // Close existing connection if any
    this.disconnect();

    try {
      this.eventSource = new EventSource(`${API_BASE}/alerts/stream`);

      this.eventSource.onopen = () => {
        console.log('[SSE] Connected to alert stream');
        this.reconnectAttempts = 0;
        onConnect?.();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const alert: OutbreakAlert = JSON.parse(event.data);
          console.log('[SSE] Received alert:', alert);
          onAlert(alert);
        } catch (error) {
          console.error('[SSE] Failed to parse alert:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('[SSE] Connection error:', error);
        onError?.(error);
        
        // Attempt reconnection
        this.handleReconnect(onAlert, onError, onConnect);
      };
    } catch (error) {
      console.error('[SSE] Failed to create EventSource:', error);
      this.handleReconnect(onAlert, onError, onConnect);
    }
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(
    onAlert: AlertCallback,
    onError?: ErrorCallback,
    onConnect?: ConnectionCallback
  ): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[SSE] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect(onAlert, onError, onConnect);
    }, delay);
  }

  /**
   * Disconnect from the SSE stream
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('[SSE] Disconnected from alert stream');
    }

    this.reconnectAttempts = 0;
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }

  /**
   * Get connection state
   */
  getConnectionState(): 'CONNECTING' | 'OPEN' | 'CLOSED' {
    if (!this.eventSource) return 'CLOSED';
    
    switch (this.eventSource.readyState) {
      case EventSource.CONNECTING:
        return 'CONNECTING';
      case EventSource.OPEN:
        return 'OPEN';
      case EventSource.CLOSED:
        return 'CLOSED';
      default:
        return 'CLOSED';
    }
  }
}

// Singleton instance
export const alertStreamService = new AlertStreamService();

/**
 * React hook for SSE connection
 * Usage in component:
 * 
 * useEffect(() => {
 *   alertStreamService.connect(
 *     (alert) => console.log('New alert:', alert),
 *     (error) => console.error('SSE error:', error),
 *     () => console.log('Connected')
 *   );
 *   
 *   return () => alertStreamService.disconnect();
 * }, []);
 */

// Made with Bob
