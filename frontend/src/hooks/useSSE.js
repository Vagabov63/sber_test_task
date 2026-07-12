import { useEffect, useState, useRef } from 'react';
import useObligationsStore from '../store/obligationsStore';
import { useFilters } from './useFilters';

export function useSSE() {
  const [status, setStatus] = useState('disconnected');
  const { apiFilters } = useFilters();

  const loadObligations = useObligationsStore((state) => state.loadObligations);
  const loadUpcomingObligations = useObligationsStore(
    (state) => state.loadUpcomingObligations,
  );

  const reconnectTimeoutRef = useRef(null);

  const apiFiltersRef = useRef(apiFilters);
  useEffect(() => {
    apiFiltersRef.current = apiFilters;
  }, [apiFilters]);

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
        loadObligations(apiFilters);
      };

      eventSource.addEventListener('obligation_updated', () => {
        loadObligations(apiFilters);
        loadUpcomingObligations();
      });

      eventSource.addEventListener('obligation_deleted', () => {
        loadObligations(apiFilters);
        loadUpcomingObligations();
      });

      eventSource.addEventListener('obligation_created', () => {
        loadObligations(apiFilters);
        loadUpcomingObligations();
      });

      eventSource.onerror = () => {
        setStatus('reconnecting');

        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }

        reconnectAttempts++;

        const delay = Math.min(
          baseDelay * Math.pow(1.5, reconnectAttempts),
          maxDelay,
        );

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
  }, [loadObligations, loadUpcomingObligations, apiFilters]);

  return { status };
}
