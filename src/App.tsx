import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { RaporProvider } from './context/RaporContext';
import { PortalHubPage } from './pages/PortalHubPage';
import { CheckpointV2Page } from './pages/CheckpointV2Page';
import { CheckpointV1Page } from './pages/CheckpointV1Page';
import { UpdateRaporPage } from './pages/UpdateRaporPage';

// Supports root query shortcuts like /?v=2 or /?v=1&preview=1
const QueryParamRedirector: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const v = (search.get('v') || search.get('route') || '').toLowerCase();
    if (!v) return;

    const preview = search.get('preview');
    const previewQuery = preview ? `?preview=${preview}` : '';

    if (v === '2' || v === 'v2') {
      navigate(`/v2${previewQuery}`, { replace: true });
    } else if (v === '1' || v === 'v1') {
      navigate(`/v1${previewQuery}`, { replace: true });
    } else if (v === 'rapor') {
      navigate('/rapor', { replace: true });
    }
  }, [navigate, location]);

  return null;
};

export const App: React.FC = () => {
  return (
    <RaporProvider>
      <HashRouter>
        <QueryParamRedirector />
        <Routes>
          <Route path="/" element={<PortalHubPage />} />
          <Route path="/v2" element={<CheckpointV2Page />} />
          <Route path="/v1" element={<CheckpointV1Page />} />
          <Route path="/rapor" element={<UpdateRaporPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </RaporProvider>
  );
};

export default App;
