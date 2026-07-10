import { useEffect, useState, useRef } from "react";
import useObligationsStore from "../store/obligationsStore";

export function useSSE() {
  const isFirstConnection = useRef(true);
  const [status, setStatus] = useState('disconnected');
  
  const loadObligations = useObligationsStore((state) => state.loadObligations);

  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    let eventSource = null;
    let reconnectAttempts = 0;
    const baseDelay = 1000;
    const maxDelay = 10000;

    const connect = () => {
      setStatus('connecting');
      
      eventSource = new EventSource('http://localhost:8000/events');

      eventSource.onopen = () => {
        setStatus('connected');
        reconnectAttempts = 0;
        if (!isFirstConnection.current) {
          loadObligations();
        } else {
          isFirstConnection.current = false;
        }
      };

      eventSource.addEventListener('obligation_updated', () => {
        loadObligations();
      });

      eventSource.addEventListener('obligation_deleted', () => {
        loadObligations();
      });

      eventSource.addEventListener('obligation_created', () => {
        loadObligations();
      });

      eventSource.onerror = () => {
        setStatus('reconnecting');
        
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }

        reconnectAttempts++;
        
        const delay = Math.min(baseDelay * Math.pow(1.5, reconnectAttempts), maxDelay);
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSource) {
        eventSource.close();
        setStatus('disconnected');
      }
    };
  }, [loadObligations]);

  return { status };
}