import React from 'react';
import { Key, Shield, Lock, UserCheck } from 'lucide-react';

interface ApiEndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | string;
  path: string;
  auth?: 'api_key' | 'inference_key' | 'service_key' | 'dashboard_session' | 'oauth_client' | 'oauth_bearer' | 'none' | string;
}

const authConfig: Record<string, { label: string; icon: React.ComponentType<{ style?: React.CSSProperties }>; color: string }> = {
  api_key: {
    label: 'API Key (Bearer zrv_...)',
    icon: Key,
    color: 'text-[#4DFFB4] border-[#4DFFB4]/30 bg-[#4DFFB4]/10',
  },
  inference_key: {
    label: 'API Key (Bearer zrv_...)',
    icon: Key,
    color: 'text-[#4DFFB4] border-[#4DFFB4]/30 bg-[#4DFFB4]/10',
  },
  service_key: {
    label: 'Service Key (Bearer zrv_svc_...)',
    icon: Shield,
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  },
  dashboard_session: {
    label: 'Dashboard Session (Cookie + CSRF)',
    icon: Lock,
    color: 'text-zinc-300 border-zinc-700 bg-zinc-800/40',
  },
  oauth_bearer: {
    label: 'OAuth Bearer Token',
    icon: UserCheck,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  },
  oauth_client: {
    label: 'OAuth Client Contract',
    icon: UserCheck,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  },
};

export function ApiEndpoint({ method, path, auth }: ApiEndpointProps) {
  const authInfo = auth ? authConfig[auth] : null;
  const AuthIcon = authInfo?.icon;

  return (
    <div
      className="zorveus-endpoint not-prose"
    >
      <div className="zorveus-endpoint-path">
        <span
          className="zorveus-endpoint-method"
          data-method={method.toUpperCase()}
        >
          {method.toUpperCase()}
        </span>
        <span className="font-semibold text-zinc-100">{path}</span>
      </div>

      {authInfo && (
        <div
          className="zorveus-endpoint-auth"
        >
          {AuthIcon && <AuthIcon style={{ width: '11px', height: '11px' }} />}
          <span>{authInfo.label}</span>
        </div>
      )}
    </div>
  );
}
