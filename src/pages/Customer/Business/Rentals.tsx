import BusinessCrudPage from './BusinessCrudPage';

export default function Rentals() {
  return (
    <BusinessCrudPage
      resource="rentals"
      rootKey="rental"
      title="Locações"
      subtitle="Agenda de eventos, reservas, clientes e valores em um só lugar."
      singular="Locação"
      defaults={{ status: 'quote', total_amount: 0, paid_amount: 0 }}
      fields={[
        { key: 'contact_id', label: 'Cliente', type: 'contact' },
        { key: 'title', label: 'Nome do evento', required: true },
        { key: 'event_type', label: 'Tipo de evento' },
        { key: 'starts_at', label: 'Início', type: 'datetime-local', required: true },
        { key: 'ends_at', label: 'Término', type: 'datetime-local' },
        { key: 'venue', label: 'Local' },
        { key: 'guest_count', label: 'Convidados', type: 'number' },
        { key: 'total_amount', label: 'Valor total', type: 'number' },
        { key: 'paid_amount', label: 'Valor pago', type: 'number' },
        { key: 'status', label: 'Situação', type: 'select', options: [
          { value: 'quote', label: 'Orçamento' }, { value: 'reserved', label: 'Reservada' },
          { value: 'confirmed', label: 'Confirmada' }, { value: 'completed', label: 'Concluída' },
          { value: 'canceled', label: 'Cancelada' },
        ] },
        { key: 'notes', label: 'Observações', type: 'textarea' },
      ]}
      columns={[
        { key: 'reference_code', label: 'Código' }, { key: 'title', label: 'Evento' },
        { key: 'starts_at', label: 'Data', format: 'datetime' }, { key: 'venue', label: 'Local' },
        { key: 'total_amount', label: 'Valor', format: 'currency' }, { key: 'status', label: 'Situação', format: 'status' },
      ]}
    />
  );
}
