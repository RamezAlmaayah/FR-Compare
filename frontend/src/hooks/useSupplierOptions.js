import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import getApiErrorMessage from '../utils/getApiErrorMessage';

const useSupplierOptions = () => {
  const [state, setState] = useState({ suppliers: [], loading: true, error: '' });
  useEffect(() => {
    let active = true;
    const loadSuppliers = async () => {
      try {
        const suppliers = [];
        let page = 1;
        let totalPages = 1;
        do {
          const response = await apiClient.get('/suppliers', { params: { page, limit: 50, sort: 'name' } });
          suppliers.push(...response.data.suppliers);
          totalPages = response.data.totalPages;
          page += 1;
        } while (active && page <= totalPages);
        if (active) setState({ suppliers, loading: false, error: '' });
      } catch (error) {
        if (active) setState({ suppliers: [], loading: false, error: getApiErrorMessage(error, 'Unable to load suppliers.') });
      }
    };
    loadSuppliers();
    return () => { active = false; };
  }, []);
  return state;
};

export default useSupplierOptions;
