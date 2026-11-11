import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { RaporProvider } from './context/RaporContext';
import { CheckpointV2Page } from './pages/CheckpointV2Page';
import { CheckpointV1Page } from './pages/CheckpointV1Page';
import { UpdateRaporPage } from './pages/UpdateRaporPage';
import { EngineMatrixPage } from './pages/EngineMatrixPage';
import { SimulasiPage } from './pages/SimulasiPage';

// Supports root query shortcuts like /?v=2, /?v=simulasi&student=nadira or /?v=1&preview=1
const resolveQueryTarget = (): string | null => {
  const search = new URLSearchParams(window.location.search);
  const v = (search.get('v') || search.get('route') || '').toLowerCase();
  if (!v) return null;

  let target: string | null = null;
  if (v === '2' || v === 'v2') target = '/v2';
  else if (v === '1' || v === 'v1') target = '/v1';
  else if (v === 'rapor') target = '/rapor';
  else if (v === 'simulasi') target = '/simulasi';
  if (!target) return null;

  const params = new URLSearchParams();
  const preview = search.get('preview');
  const student = search.get('student');
  if (preview) params.set('preview', preview);
  if (student) params.set('student', student);
  const query = params.toString();
  return query ? `${target}?${query}` : target;
};

// The root query string (/?v=2) is not part of the hash route, so it is stripped after
// redirecting; otherwise it would re-trigger on every in-app navigation.
const stripRootQuery = () => {
  if (window.location.search) {
    window.history.replaceState(null, '', window.location.pathname + window.location.hash);
  }
};

const QueryParamRedirector: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const target = resolveQueryTarget();
    if (!target) return;
    stripRootQuery();
    navigate(target, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

// "/" resolves the query shortcut itself so it never races with a plain redirect to /v2.
const RootRedirect: React.FC = () => {
  const [target] = React.useState<string>(() => resolveQueryTarget() || '/v2');
  useEffect(() => {
    stripRootQuery();
  }, []);
  return <Navigate to={target} replace />;
};

export const App: React.FC = () => {
  return (
    <RaporProvider>
      <HashRouter>
        <QueryParamRedirector />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/v2" element={<CheckpointV2Page />} />
          <Route path="/v1" element={<CheckpointV1Page />} />
          <Route path="/rapor" element={<UpdateRaporPage />} />
          <Route path="/simulasi" element={<SimulasiPage />} />
          <Route path="/engine" element={<EngineMatrixPage />} />
          <Route path="*" element={<Navigate to="/v2" replace />} />
        </Routes>
      </HashRouter>
    </RaporProvider>
  );
};

export default App;
