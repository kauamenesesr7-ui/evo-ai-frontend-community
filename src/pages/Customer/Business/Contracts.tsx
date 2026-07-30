import { useState } from 'react';
import { Button } from '@evoapi/design-system';
import BusinessCrudPage from './BusinessCrudPage';

export default function Contracts() {
  const [view, setView] = useState<'contracts' | 'templates'>('contracts');

  return (
    <div className="h-full overflow-hidden">
      <div className="flex gap-2 border-b px-4 py-3">
        <Button variant={view === 'contracts' ? 'default' : 'outline'} size="sm" onClick={() => setView('contracts')}>
          Contratos emitidos
        </Button>
        <Button variant={view === 'templates' ? 'default' : 'outline'} size="sm" onClick={() => setView('templates')}>
          Modelos e cláusulas
        </Button>
      </div>
      <div className="h-[calc(100%-57px)] overflow-auto">
        {view === 'contracts' ? (
          <BusinessCrudPage
            resource="contracts"
            rootKey="contract"
            title="Contratos"
            subtitle="Crie, envie para assinatura, acompanhe o aceite e gere PDFs com selo de integridade."
            singular="Contrato"
            defaults={{ status: 'draft', issued_on: new Date().toISOString().slice(0, 10) }}
            fields={[
              { key: 'contact_id', label: 'Cliente', type: 'contact' },
              { key: 'rental_id', label: 'Locação relacionada', type: 'rental' },
              { key: 'title', label: 'Título', required: true },
              { key: 'issued_on', label: 'Data de emissão', type: 'date', required: true },
              { key: 'company_signer_name', label: 'Responsável da empresa' },
              { key: 'content', label: 'Conteúdo do contrato', type: 'textarea', required: true },
            ]}
            columns={[
              { key: 'number', label: 'Número' }, { key: 'title', label: 'Contrato' },
              { key: 'issued_on', label: 'Emissão', format: 'date' }, { key: 'company_signer_name', label: 'Responsável' },
              { key: 'status', label: 'Situação', format: 'status' },
            ]}
          />
        ) : (
          <BusinessCrudPage
            resource="contract_templates"
            rootKey="contract_template"
            title="Modelos de contrato"
            subtitle="Edite cláusulas com versionamento: contratos antigos nunca são alterados."
            singular="Modelo"
            defaults={{ version: 1, is_default: true }}
            fields={[
              { key: 'name', label: 'Nome do modelo', required: true },
              {
                key: 'is_default',
                label: 'Modelo padrão',
                type: 'select',
                options: [
                  { value: 'true', label: 'Sim' },
                  { value: 'false', label: 'Não' },
                ],
              },
              { key: 'content', label: 'Cláusulas e variáveis', type: 'textarea', required: true },
            ]}
            columns={[
              { key: 'name', label: 'Modelo' },
              { key: 'version', label: 'Versão' },
              { key: 'is_default', label: 'Padrão' },
              { key: 'updated_at', label: 'Atualizado em', format: 'datetime' },
            ]}
          />
        )}
      </div>
    </div>
  );
}
