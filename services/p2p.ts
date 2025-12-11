import { Peer } from 'peerjs';
import { displaySystemNotification } from './api';

export interface P2PMessage {
  type: 'RATE_UPDATE';
  content: string;
  senderId: string;
  senderRole: string;
}

class P2PService {
  private peer: Peer | null = null;
  private conn: any = null;
  private myId: string = '';
  private onStatusChange: ((status: string) => void) | null = null;

  initialize(id: string, onStatus: (status: string) => void) {
    if (this.peer) return;

    this.myId = id;
    this.onStatusChange = onStatus;
    
    // Connect to the public PeerJS server (Acting as the broker)
    this.peer = new Peer(id, {
      debug: 1
    });

    this.peer.on('open', (id) => {
      console.log('My P2P ID is:', id);
      this.updateStatus('online');
    });

    this.peer.on('connection', (conn) => {
      // Logic for when SOMEONE connects to ME
      conn.on('data', (data: unknown) => {
        this.handleIncomingData(data as P2PMessage);
      });
    });

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
      this.updateStatus('error');
    });

    this.peer.on('disconnected', () => {
      this.updateStatus('disconnected');
    });
  }

  /**
   * Connects to the partner and sends data
   */
  async sendData(partnerId: string, data: P2PMessage): Promise<boolean> {
    if (!this.peer || this.peer.disconnected) {
      throw new Error('P2P Disconnected');
    }

    return new Promise((resolve, reject) => {
      const conn = this.peer!.connect(partnerId);
      
      conn.on('open', () => {
        conn.send(data);
        resolve(true);
        // We can close connection after sending to save resources, 
        // or keep open. For this simple app, we open-send-close roughly.
        setTimeout(() => conn.close(), 1000);
      });

      conn.on('error', (err) => {
        reject(err);
      });
    });
  }

  private handleIncomingData(data: P2PMessage) {
    if (data.type === 'RATE_UPDATE') {
      // Trigger the native notification we built earlier
      const title = data.senderRole === 'USA' ? '💵 Cotação USD' : '₿ Cotação BTC';
      displaySystemNotification(title, `${data.content}`);
    }
  }

  private updateStatus(status: string) {
    if (this.onStatusChange) this.onStatusChange(status);
  }

  destroy() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

export const p2pService = new P2PService();