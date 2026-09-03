import React from 'react';
import { Key, Shield, Lock, UserCheck } from 'lucide-react';

interface ApiEndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | string;
  path: string;
  auth?: 'api_key' | 'inference_key' | 'service_key' | 'dashboard_session' | 'oauth_client' | 'oauth_bearer' | 'none' | string;
}

const methodColors: Record<string, { bg: string; text: string; border: string }> = {
  GET: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  POST: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  PUT: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  PATCH: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  DELETE: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
};

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
  const methodStyle = methodColors[method.toUpperCase()] || methodColors.GET;
  const authInfo = auth ? authConfig[auth] : null;
  const AuthIcon = authInfo?.icon;

  return (
    <div
      style={{ padding: '12px 16px' }}
      className="my-5 flex flex-col gap-2 rounded-xl border border-[#222226] bg-[#121214] sm:flex-row sm:items-center sm:justify-between shadow-xs"
    >
      <div className="flex items-center gap-3 font-mono text-xs overflow-x-auto">
        <span
          style={{ padding: '2px 8px', borderRadius: '4px' }}
          className={`font-mono text-[10px] font-bold uppercase tracking-wider border ${methodStyle.bg} ${methodStyle.text} ${methodStyle.border}`}
        >
          {method}
        </span>
        <span className="font-semibold text-zinc-100">{path}</span>
      </div>

      {authInfo && (
        <div
          style={{ padding: '3px 8px', borderRadius: '6px' }}
          className={`flex items-center gap-1.5 border text-[11px] font-medium font-sans ${authInfo.color}`}
        >
          {AuthIcon && <AuthIcon style={{ width: '11px', height: '11px' }} />}
          <span>{authInfo.label}</span>
        </div>
      )}
    </div>
  );
}
