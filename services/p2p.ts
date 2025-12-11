import { Peer, DataConnection } from 'peerjs';
import { displaySystemNotification } from './api';

export interface P2PMessage {
  type: 'RATE_UPDATE' | 'PING' | 'PONG';
  content: string;
  senderId: string;
  senderRole: string;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

class P2PService {
  private peer: Peer | null = null;
  private myId: string = '';
  
  // Cache the active connection to the partner
  private activeConnection: DataConnection | null = null;
  
  private onStatusChange: ((status: ConnectionStatus) => void) | null = null;
  private onDataReceived: ((data: P2PMessage) => void) | null = null;

  initialize(id: string, onStatus: (status: ConnectionStatus) => void) {
    if (this.peer) return;

    this.myId = id;
    this.onStatusChange = onStatus;

    // Critical: Use Google's public STUN servers to penetrate mobile NATs
    this.peer = new Peer(id, {
      debug: 2,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ],
      },
      secure: true
    });

    this.peer.on('open', (id) => {
      console.log('✅ P2P ID Active:', id);
      // We are online as a peer, but not necessarily connected to a partner yet
      this.updateStatus('disconnected'); 
    });

    this.peer.on('connection', (conn) => {
      console.log('Incoming connection from:', conn.peer);
      this.setupConnectionEvents(conn);
    });

    this.peer.on('error', (err) => {
      console.error('PeerJS Error:', err);
      // Specific handling for "Peer unavailable"
      if (err.type === 'peer-unavailable') {
         // Keep quiet or retry logic
      }
      this.updateStatus('error');
    });

    this.peer.on('disconnected', () => {
      console.log('Peer disconnected from server');
      this.updateStatus('disconnected');
      // Attempt to reconnect to the signalling server
      setTimeout(() => this.peer?.reconnect(), 5000);
    });
  }

  /**
   * Establishes a persistent connection to the partner.
   * Call this when the user enters the Partner ID or loads the app.
   */
  connectToPartner(partnerId: string) {
    if (!this.peer || this.peer.disconnected) {
        console.warn('Cannot connect: Peer not ready');
        return;
    }

    if (this.activeConnection && this.activeConnection.peer === partnerId && this.activeConnection.open) {
        console.log('Already connected to', partnerId);
        this.updateStatus('connected');
        return;
    }

    this.updateStatus('connecting');
    console.log('Attempting to connect to:', partnerId);

    const conn = this.peer.connect(partnerId, {
        reliable: true,
        serialization: 'json'
    });

    this.setupConnectionEvents(conn);
  }

  private setupConnectionEvents(conn: DataConnection) {
    this.activeConnection = conn;

    conn.on('open', () => {
      console.log(`🔗 Connected to ${conn.peer}`);
      this.updateStatus('connected');
      
      // Send a ping to confirm bidirectional data flow
      conn.send({
        type: 'PING',
        content: 'Init',
        senderId: this.myId,
        senderRole: 'SYSTEM'
      } as P2PMessage);
    });

    conn.on('data', (data: unknown) => {
      const msg = data as P2PMessage;
      console.log('📩 Received:', msg);
      
      if (msg.type === 'RATE_UPDATE') {
        const title = msg.senderRole === 'USA' ? '💵 Cotação USD' : '₿ Cotação BTC';
        displaySystemNotification(title, `${msg.content}`);
      }
      
      // Pass data up to UI if needed (for logs)
      if (this.onDataReceived) {
          this.onDataReceived(msg);
      }
    });

    conn.on('close', () => {
      console.log('Connection closed');
      this.activeConnection = null;
      this.updateStatus('disconnected');
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      this.updateStatus('error');
    });
  }

  async sendData(data: P2PMessage): Promise<boolean> {
    if (!this.activeConnection || !this.activeConnection.open) {
        throw new Error('Sem conexão com o parceiro. Verifique se ele está com o app aberto.');
    }

    this.activeConnection.send(data);
    return true;
  }

  /**
   * Register a callback to update UI logs when data arrives
   */
  onMessage(callback: (msg: P2PMessage) => void) {
      this.onDataReceived = callback;
  }

  private updateStatus(status: ConnectionStatus) {
    if (this.onStatusChange) this.onStatusChange(status);
  }
}

export const p2pService = new P2PService();