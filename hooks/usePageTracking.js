import { useEffect } from 'react';
import ReactGa from 'react-ga';
import { useLocation } from 'react-router-dom';

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.ga === 'function') {
      ReactGa.pageview(location.pathname + location.search);
    }
  }, [location.pathname, location.search]);
};

export default usePageTracking;
