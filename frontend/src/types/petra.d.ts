declare global {
  interface Window {
    aptos?: {
      connect(): Promise<{ address: string }>
      disconnect(): Promise<void>
      account(): Promise<{ address: string }>
      isConnected(): Promise<boolean>
    }
  }
}

export {} 