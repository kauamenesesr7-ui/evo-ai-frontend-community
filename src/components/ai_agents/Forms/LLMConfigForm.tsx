import { useCallback, useEffect } from 'react';
import {
  Label,
  Textarea,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@evoapi/design-system';
import { MessageSquare, Settings, ShieldCheck } from 'lucide-react';
import type { ApiKey } from '@/types/agents';
import AdvancedBotConfig, { type AdvancedBotConfigData } from './AdvancedBotConfig';

type AgentPageMode = 'create' | 'edit' | 'view';

export interface LLMConfigData {
  model: string;
  api_key_id: string;
  instruction: string;
  output_key: string;
  advanced_config: AdvancedBotConfigData;
}

export interface A2AConfigData {
  agent_card_url: string;
  output_key: string;
}

interface LLMConfigFormProps {
  mode: AgentPageMode;
  data: LLMConfigData;
  onChange: (data: LLMConfigData) => void;
  onValidationChange: (isValid: boolean, errors: string[]) => void;
  apiKeys: ApiKey[];
  onApiKeysReload?: () => void;
  hideInstructions?: boolean;
}

const sanitizeAgentName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

export default function LLMConfigForm({
  mode,
  data,
  onChange,
  onValidationChange,
  hideInstructions = false,
}: LLMConfigFormProps) {
  const isReadOnly = mode === 'view';
  const instructionError =
    data.instruction && data.instruction.length < 10
      ? 'Escreva pelo menos 10 caracteres para orientar o agente.'
      : '';

  useEffect(() => {
    onValidationChange(!instructionError, instructionError ? [instructionError] : []);
  }, [instructionError, onValidationChange]);

  const update = useCallback(
    <K extends keyof LLMConfigData>(field: K, value: LLMConfigData[K]) =>
      onChange({ ...data, [field]: value }),
    [data, onChange],
  );

  return (
    <div className="space-y-6">
      <Card className="border-violet-500/20 bg-violet-500/5">
        <CardContent className="flex items-start gap-3 pt-5">
          <div className="rounded-lg bg-violet-500/15 p-2">
            <ShieldCheck className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <p className="font-semibold">Tecnologia gerenciada pela AppEventos</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Segurança, modelo e infraestrutura são administrados centralmente. Você só precisa
              explicar como o agente deve atender seus clientes.
            </p>
          </div>
        </CardContent>
      </Card>

      {!hideInstructions && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-500/10 p-2">
                <MessageSquare className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <CardTitle>Instruções de atendimento</CardTitle>
                <CardDescription>
                  Explique o comportamento, tom de voz, regras e quando transferir para uma pessoa.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.instruction || ''}
              onChange={event => update('instruction', event.target.value)}
              placeholder="Ex.: Seja cordial, pergunte data e local do evento, apresente opções disponíveis e nunca confirme disponibilidade sem consultar o catálogo."
              rows={9}
              disabled={isReadOnly}
              className={instructionError ? 'border-destructive' : ''}
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{instructionError || 'Você pode alterar essas instruções quando quiser.'}</span>
              <span>{data.instruction?.length || 0}/2000</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-500/10 p-2">
              <Settings className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <CardTitle>Identificador interno</CardTitle>
              <CardDescription>Usado apenas nas automações da sua empresa.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="agent-output-key">Identificador</Label>
          <Input
            id="agent-output-key"
            value={data.output_key || ''}
            onChange={event => update('output_key', sanitizeAgentName(event.target.value))}
            placeholder="atendimento_eventos"
            disabled={isReadOnly}
          />
        </CardContent>
      </Card>

      <AdvancedBotConfig
        data={data.advanced_config}
        onChange={advancedConfig => update('advanced_config', advancedConfig)}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
