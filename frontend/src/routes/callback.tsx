import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react';
import { useKeylessAccounts } from '../lib/core/useKeylessAccounts';

export const Route = createFileRoute('/callback')({
  component: CallbackPage,
})

function CallbackPage() {
    const isLoading = useRef(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('Initializing...');
    const switchKeylessAccount = useKeylessAccounts(
      (state) => state.switchKeylessAccount
    );
    const navigate = useNavigate();
  
    const fragmentParams = new URLSearchParams(window.location.hash.substring(1));
    const idToken = fragmentParams.get("id_token");
  
    useEffect(() => {
      console.log('Callback route mounted');
      setStatus('Route mounted successfully');
      
      // This is a workaround to prevent firing twice due to strict mode
      if (isLoading.current) return;
      isLoading.current = true;
  
      async function deriveAccount(idToken: string) {
        try {
          setStatus('Processing authentication...');
          console.log('Processing callback with idToken:', idToken.substring(0, 50) + '...');
          await switchKeylessAccount(idToken);
          console.log('Successfully switched keyless account');
          setStatus('Authentication successful! Redirecting...');
          navigate({ to: "/" });
        } catch (error) {
          console.error('Error in callback:', error);
          setError(error instanceof Error ? error.message : 'Unknown error occurred');
          setStatus('Authentication failed. Redirecting...');
          // Still navigate to home even on error
          setTimeout(() => {
            navigate({ to: "/" });
          }, 3000);
        }
      }
  
      if (!idToken) {
        console.error('No idToken found in URL fragment');
        setError('No authentication token found');
        setStatus('No token found. Redirecting...');
        setTimeout(() => {
          navigate({ to: "/" });
        }, 3000);
        return;
      }
  
      deriveAccount(idToken);
    }, [idToken, isLoading, navigate, switchKeylessAccount]);
  
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="relative flex flex-col justify-center items-center border rounded-lg px-8 py-4 shadow-sm cursor-not-allowed tracking-wider">
          <span className="absolute flex h-3 w-3 -top-1 -right-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <div className="text-center">
            <div className="mb-2 font-medium">{status}</div>
            {error && (
              <div className="text-red-500 text-sm mt-2">
                Error: {error}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Callback route is working
            </div>
          </div>
        </div>
      </div>
    );
}
