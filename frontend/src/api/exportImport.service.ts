import api from './axios';

export const exportImportService = {
  exportToExcel: async (endpoint: string, filename: string, params?: Record<string, string | number>) => {
    const res = await api.get(endpoint, {
      params: { ...params, format: 'excel' },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportToCSV: async (endpoint: string, filename: string, params?: Record<string, string | number>) => {
    const res = await api.get(endpoint, {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportToPDF: async (endpoint: string, filename: string, params?: Record<string, string | number>) => {
    const res = await api.get(endpoint, {
      params: { ...params, format: 'pdf' },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  importFromExcel: (endpoint: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
