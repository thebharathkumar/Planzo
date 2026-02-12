import { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const emptyTicket = { name: '', price: '', quantity: '' };

export default function CreateEventForm({ onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    address: '',
  });
  const [tickets, setTickets] = useState([{ ...emptyTicket }]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTicketChange = (index, field, value) => {
    setTickets((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addTicket = () => setTickets((prev) => [...prev, { ...emptyTicket }]);

  const removeTicket = (index) => {
    setTickets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tickets: tickets
          .filter((t) => t.name && t.quantity)
          .map((t) => ({
            name: t.name,
            price: Number(t.price) || 0,
            quantity: Number(t.quantity),
          })),
      };
      await api.post('/events', payload);
      toast.success('Event created successfully!');
      setForm({ title: '', description: '', startTime: '', endTime: '', address: '' });
      setTickets([{ ...emptyTicket }]);
      onCreated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="create-event-form" onSubmit={handleSubmit}>
      <h2>Create New Event</h2>

      <div className="form-group">
        <label htmlFor="title">Event Title</label>
        <input id="title" name="title" className="form-input" value={form.title}
          onChange={handleChange} required placeholder="Summer Music Festival" />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" className="form-input form-textarea"
          value={form.description} onChange={handleChange} rows={4}
          placeholder="Describe your event..." />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startTime">Start Date & Time</label>
          <input id="startTime" name="startTime" type="datetime-local" className="form-input"
            value={form.startTime} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="endTime">End Date & Time</label>
          <input id="endTime" name="endTime" type="datetime-local" className="form-input"
            value={form.endTime} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="address">Venue Address</label>
        <input id="address" name="address" className="form-input" value={form.address}
          onChange={handleChange} required placeholder="123 Main St, San Francisco, CA" />
      </div>

      <div className="ticket-configurator">
        <div className="ticket-config-header">
          <h3>Tickets</h3>
          <button type="button" className="btn btn-outline btn-sm" onClick={addTicket}>
            + Add Ticket Type
          </button>
        </div>
        {tickets.map((ticket, i) => (
          <div key={i} className="ticket-config-row">
            <input className="form-input" placeholder="Ticket name" value={ticket.name}
              onChange={(e) => handleTicketChange(i, 'name', e.target.value)} />
            <input className="form-input" placeholder="Price" type="number" step="0.01"
              min="0" value={ticket.price}
              onChange={(e) => handleTicketChange(i, 'price', e.target.value)} />
            <input className="form-input" placeholder="Qty" type="number" min="1"
              value={ticket.quantity}
              onChange={(e) => handleTicketChange(i, 'quantity', e.target.value)} />
            {tickets.length > 1 && (
              <button type="button" className="btn-icon-danger" onClick={() => removeTicket(i)}>
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={submitting}>
        {submitting ? 'Creating...' : 'Publish Event'}
      </button>
    </form>
  );
}
