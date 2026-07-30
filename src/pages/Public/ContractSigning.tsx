import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  Checkbox,
  Input,
  Label,
} from '@evoapi/design-system';
import { CheckCircle2, Download, FileSignature, Loader2 } from 'lucide-react';

interface PublicContract {
  number: string;
  title: string;
  content: string;
  status: string;
  issued_on: string;
  customer?: string;
  event?: string;
  event_date?: string;
  customer_accepted: boolean;
  customer_signed_at?: string;
  document_hash?: string;
}

const apiBase = import.meta.env.VITE_API_URL || window.location.origin;

export default function ContractSigning() {
  const { token } = useParams<{ token: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [contract, setContract] = useState<PublicContract | null>(null);
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${apiBase}/api/v1/public/contracts/${token}`)
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(payload => {
        setContract(payload.data);
        setName(payload.data.customer || '');
      })
      .catch(() => setError('Contrato não encontrado ou link inválido.'));
  }, [token]);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    context.lineWidth = 2.5;
    context.lineCap = 'round';
    context.strokeStyle = '#111827';
  }, [contract]);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const context = event.currentTarget.getContext('2d');
    const current = point(event);
    context?.beginPath();
    context?.moveTo(current.x, current.y);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const context = event.currentTarget.getContext('2d');
    const current = point(event);
    context?.lineTo(current.x, current.y);
    context?.stroke();
  };

  const sign = async () => {
    if (!name.trim() || !document.trim() || !accepted || !canvasRef.current) {
      setError('Preencha nome e documento, desenhe a assinatura e aceite o contrato.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/v1/public/contracts/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract: {
            customer_signer_name: name,
            customer_signer_document: document,
            customer_signature_data: canvasRef.current.toDataURL('image/png'),
            customer_accepted: accepted,
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message);
      setContract(payload.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível assinar o contrato.');
    } finally {
      setSaving(false);
    }
  };

  if (error && !contract) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <Alert variant="destructive">
          <AlertTitle>Link indisponível</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!contract) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  const signed = contract.customer_accepted;

  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-zinc-100 md:p-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold">
              <span className="text-white">App</span><span className="text-violet-500">Eventos</span>
            </div>
            <p className="text-sm text-zinc-400">{contract.number} · {contract.title}</p>
          </div>
          <Badge className={signed ? 'bg-emerald-600' : 'bg-violet-600'}>
            {signed ? 'ASSINADO' : 'AGUARDANDO ASSINATURA'}
          </Badge>
        </div>

        {signed && (
          <Alert className="border-emerald-700 bg-emerald-950/30">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Contrato assinado com sucesso</AlertTitle>
            <AlertDescription>
              A integridade foi registrada com selo SHA-256: {contract.document_hash}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="p-3 md:p-5">
            <iframe
              title="Conteúdo do contrato"
              sandbox=""
              srcDoc={`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;line-height:1.55;color:#18181b;padding:24px}h1{font-size:22px}h2{font-size:16px;margin-top:24px}table{width:100%}</style></head><body>${contract.content}</body></html>`}
              className="h-[65vh] w-full rounded-lg bg-white"
            />
          </CardContent>
        </Card>

        {!signed && (
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-2 font-semibold">
                <FileSignature className="h-5 w-5 text-violet-500" />
                Assinatura do cliente
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="signer-name">Nome completo</Label>
                  <Input id="signer-name" value={name} onChange={event => setName(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signer-document">CPF ou documento</Label>
                  <Input id="signer-document" value={document} onChange={event => setDocument(event.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Desenhe sua assinatura</Label>
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={220}
                  className="h-44 w-full touch-none rounded-lg border bg-white"
                  onPointerDown={start}
                  onPointerMove={move}
                  onPointerUp={() => { drawing.current = false; }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0, 0, 800, 220)}
                >
                  Limpar assinatura
                </Button>
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <Checkbox checked={accepted} onCheckedChange={value => setAccepted(value === true)} />
                Li e aceito integralmente os termos deste contrato.
              </label>
              <Button className="w-full bg-violet-600 hover:bg-violet-700" disabled={saving} onClick={sign}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assinar contrato
              </Button>
            </CardContent>
          </Card>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(`${apiBase}/api/v1/public/contracts/${token}/pdf`, '_blank')}
        >
          <Download className="mr-2 h-4 w-4" />
          Baixar PDF
        </Button>
      </div>
    </main>
  );
}
