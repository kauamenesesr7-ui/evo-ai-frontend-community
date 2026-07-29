import { useState } from 'react';
import { Input, Label, Button } from '@evoapi/design-system';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  CredentialRefsEditor,
  KeyValueEditor,
  mergeRetiredHeaders,
  splitAuthHeaders,
  useVaultMigrationState,
} from '@/components/ai_agents/shared';

export interface Step2Data {
  url: string;
  headers: Record<string, unknown>;
  credential_refs: Record<string, string>;
}

interface Step2Props {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2_Connection({ data, onChange, onNext, onBack }: Step2Props) {
  const { t } = useLanguage('customMcpServers');
  const { t: tVault } = useLanguage('integrationCredentials');
  // Story 2.7: retired inline auth headers become read-only, but ALWAYS stay
  // in the payload — the backend replaces the stored object wholesale.
  const migrationState = useVaultMigrationState();
  const headersRetired = Boolean(migrationState.retired.custom_mcp_servers);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!data.url || !data.url.trim()) {
      setError(t('form.validation.urlRequired'));
      return;
    }
    try {
      new URL(data.url);
    } catch {
      setError(t('form.validation.urlInvalid'));
      return;
    }
    setError('');
    onNext();
  };

  return (
    <div className="flex flex-col h-full min-h-0 max-w-4xl mx-auto py-2 px-4">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto space-y-4">
          <div>
            <Label className="text-sm mb-1.5 block font-semibold">
              {t('form.labels.url')} <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder={t('form.placeholders.url')}
              value={data.url}
              onChange={e => onChange({ ...data, url: e.target.value })}
              className={`h-10 text-sm ${error ? 'border-red-500' : ''}`}
              autoFocus
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>

          <div className="pt-2">
            {headersRetired ? (
              <div className="space-y-2">
                {Object.keys(splitAuthHeaders(data.headers).auth).map(name => (
                  <div
                    key={name}
                    className="flex items-center gap-2 text-sm border rounded-md px-3 py-2"
                  >
                    <span className="font-mono">{name}</span>
                    <span className="font-mono text-muted-foreground">••••</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {tVault('retirement.managedByVault')}
                    </span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  {tVault('retirement.authHeadersLocked')}
                </p>
                <KeyValueEditor
                  id="headers"
                  label={t('form.labels.headers')}
                  value={splitAuthHeaders(data.headers).others}
                  onChange={next =>
                    onChange({
                      ...data,
                      headers: mergeRetiredHeaders(data.headers, next as Record<string, unknown>),
                    })
                  }
                  hint={t('form.hints.headers')}
                />
              </div>
            ) : (
              <KeyValueEditor
                id="headers"
                label={t('form.labels.headers')}
                value={data.headers}
                onChange={next => onChange({ ...data, headers: next })}
                hint={t('form.hints.headers')}
              />
            )}
          </div>

          {/* Vault-backed auth headers (EVO-2250 story 2.4): one credential
              per header name; inline headers above stay as the fallback. */}
          <div className="pt-2">
            <CredentialRefsEditor
              id="credential_refs"
              value={data.credential_refs}
              onChange={refs => onChange({ ...data, credential_refs: refs })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between flex-shrink-0 pt-2 border-t">
        <Button variant="outline" className="px-6 gap-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          {t('wizard.actions.back')}
        </Button>
        <Button className="px-6 gap-2" onClick={handleNext} disabled={!data.url}>
          {t('wizard.actions.continue')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
