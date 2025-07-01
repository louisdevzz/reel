declare module 'node-media-server' {
  interface NodeMediaServerConfig {
    rtmp?: {
      port?: number;
      chunk_size?: number;
      gop_cache?: boolean;
      ping?: number;
      ping_timeout?: number;
    };
    http?: {
      port?: number;
      allow_origin?: string;
    };
    auth?: {
      api?: boolean;
      api_user?: string;
      api_pass?: string;
      play?: boolean;
      publish?: boolean;
      secret?: string;
    };
    trans?: {
      ffmpeg?: string;
      tasks?: Array<{
        app?: string;
        hls?: boolean;
        hlsFlags?: string;
        dash?: boolean;
        dashFlags?: string;
      }>;
    };
  }

  class NodeMediaServer {
    constructor(config: NodeMediaServerConfig);
    
    on(event: 'preConnect', listener: (id: string, args: any) => void): this;
    on(event: 'postConnect', listener: (id: string, args: any) => void): this;
    on(event: 'doneConnect', listener: (id: string, args: any) => void): this;
    on(event: 'prePublish', listener: (id: string, StreamPath: string, args: any) => boolean | void): this;
    on(event: 'postPublish', listener: (id: string, StreamPath: string, args: any) => void): this;
    on(event: 'donePublish', listener: (id: string, StreamPath: string, args: any) => void): this;
    
    run(): void;
  }

  export = NodeMediaServer;
} 