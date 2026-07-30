import BusinessCrudPage from './BusinessCrudPage';

export default function Contracts() {
  return (
    <BusinessCrudPage
      resource="contracts"
      rootKey="contract"
      title="Contratos"
      subtitle="Crie, assine pela empresa e gere PDFs com selo de integridade."
      singular="Contrato"
      defaults={{ status: 'draft', issued_on: new Date().toISOString().slice(0, 10) }}
      fields={[
        { key: 'contact_id', label: 'Cliente', type: 'contact' },
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
  );
}
