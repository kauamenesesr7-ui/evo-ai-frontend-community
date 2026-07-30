import BusinessCrudPage from './BusinessCrudPage';

export default function Reminders() {
  return (
    <BusinessCrudPage
      resource="business_reminders"
      rootKey="business_reminder"
      title="Lembretes"
      subtitle="Organize tarefas e envie lembretes ao cliente pelo WhatsApp conectado."
      singular="Lembrete"
      defaults={{ status: 'pending', delivery_channel: 'internal' }}
      fields={[
        { key: 'contact_id', label: 'Contato', type: 'contact' },
        { key: 'title', label: 'Título', required: true },
        { key: 'remind_at', label: 'Data e horário', type: 'datetime-local', required: true },
        { key: 'delivery_channel', label: 'Entrega', type: 'select', options: [{ value: 'internal', label: 'Somente no CRM' }, { value: 'whatsapp', label: 'Enviar por WhatsApp' }] },
        { key: 'description', label: 'Mensagem / descrição', type: 'textarea' },
      ]}
      columns={[
        { key: 'title', label: 'Lembrete' }, { key: 'remind_at', label: 'Quando', format: 'datetime' },
        { key: 'delivery_channel', label: 'Canal' }, { key: 'status', label: 'Situação', format: 'status' },
      ]}
    />
  );
}
