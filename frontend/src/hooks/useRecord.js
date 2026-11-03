import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import getApiErrorMessage from '../utils/getApiErrorMessage';

const useRecord = (path, responseKey, refreshKey = 0) => {
  const [state, setState] = useState({ record: null, loading: Boolean(path), error: '' });
  useEffect(() => {
    let active = true;
    setState({ record: null, loading: Boolean(path), error: '' });
    const loadRecord = async () => {
      try {
        const response = await apiClient.get(path);
        if (active) setState({ record: response.data[responseKey], loading: false, error: '' });
      } catch (error) {
        if (active) setState({ record: null, loading: false, error: getApiErrorMessage(error, 'Unable to load record.') });
      }
    };
    if (path) loadRecord();
    return () => { active = false; };
  }, [path, responseKey, refreshKey]);
  return state;
};

export default useRecord;
