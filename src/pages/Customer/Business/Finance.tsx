import BusinessCrudPage from './BusinessCrudPage';

export default function Finance() {
  return (
    <BusinessCrudPage
      resource="financial_entries"
      rootKey="financial_entry"
      title="Financeiro"
      subtitle="Contas a receber, contas a pagar, vencimentos e baixas."
      singular="Lançamento"
      defaults={{ kind: 'receivable', status: 'pending', due_on: new Date().toISOString().slice(0, 10) }}
      fields={[
        { key: 'contact_id', label: 'Contato', type: 'contact' },
        { key: 'rental_id', label: 'Locação relacionada', type: 'rental' },
        { key: 'description', label: 'Descrição', required: true },
        { key: 'kind', label: 'Tipo', type: 'select', options: [{ value: 'receivable', label: 'A receber' }, { value: 'payable', label: 'A pagar' }] },
        { key: 'category', label: 'Categoria' },
        { key: 'amount', label: 'Valor', type: 'number', required: true },
        { key: 'due_on', label: 'Vencimento', type: 'date', required: true },
        { key: 'status', label: 'Situação', type: 'select', options: [{ value: 'pending', label: 'Pendente' }, { value: 'paid', label: 'Pago' }, { value: 'overdue', label: 'Vencido' }, { value: 'canceled', label: 'Cancelado' }] },
        { key: 'payment_method', label: 'Forma de pagamento' },
        { key: 'notes', label: 'Observações', type: 'textarea' },
      ]}
      columns={[
        { key: 'description', label: 'Descrição' }, { key: 'kind', label: 'Tipo', format: 'status' },
        { key: 'amount', label: 'Valor', format: 'currency' }, { key: 'due_on', label: 'Vencimento', format: 'date' },
        { key: 'category', label: 'Categoria' }, { key: 'status', label: 'Situação', format: 'status' },
      ]}
    />
  );
}
