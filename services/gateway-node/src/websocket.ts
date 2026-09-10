import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';

export class RealtimeHub {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      console.log(`[WebSocket] Client connected. Total active clients: ${this.clients.size}`);

      // Send initial welcome message
      ws.send(JSON.stringify({
        type: 'CONNECTION_ESTABLISHED',
        timestamp: new Date().toISOString(),
        message: 'Connected to VaultGuard Real-Time Event Hub'
      }));

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`[WebSocket] Client disconnected. Total active clients: ${this.clients.size}`);
      });

      ws.on('error', (err) => {
        console.error('[WebSocket] Error:', err.message);
        this.clients.delete(ws);
      });
    });
  }

  public broadcast(type: string, data: any) {
    const payload = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  public getClientCount(): number {
    return this.clients.size;
  }
}
