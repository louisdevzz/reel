declare global {
  interface Window {
    aptos?: {
      connect(): Promise<{ address: string }>
      disconnect(): Promise<void>
      account(): Promise<{ address: string }>
      isConnected(): Promise<boolean>
      signAndSubmitTransaction?: (payload: any) => Promise<{ hash: string }>
      signTransaction?: (payload: any) => Promise<any>
      submitTransaction?: (signedTx: any) => Promise<{ hash: string }>
    }
  }
}

export {} 