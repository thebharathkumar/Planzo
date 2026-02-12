import { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';

export default function TicketSelector({ event, tickets }) {
  const [quantities, setQuantities] = useState({});
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const updateQuantity = (ticketId, delta) => {
    setQuantities((prev) => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, Math.min(10, current + delta));
      return { ...prev, [ticketId]: next };
    });
  };

  const handleAddToCart = () => {
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([ticketId, quantity]) => {
        const ticket = tickets.find((t) => t.id === Number(ticketId));
        return {
          ticketId: ticket.id,
          name: ticket.name,
          quantity,
          price: Number(ticket.price),
        };
      });

    if (items.length === 0) return;
    addToCart(event.id, event.title, items);
    navigate('/checkout');
  };

  const totalItems = Object.values(quantities).reduce((s, q) => s + q, 0);

  return (
    <div className="ticket-selector">
      <h2 className="ticket-selector-title">Tickets</h2>
      {(!tickets || tickets.length === 0) ? (
        <p className="ticket-none">No tickets available for this event.</p>
      ) : (
        <>
          {tickets.map((ticket) => {
            const qty = quantities[ticket.id] || 0;
            const available = ticket.quantity_available - (ticket.quantity_sold || 0);
            return (
              <div key={ticket.id} className="ticket-item">
                <div className="ticket-item-info">
                  <h4 className="ticket-item-name">{ticket.name}</h4>
                  <p className="ticket-item-price">
                    {Number(ticket.price) === 0 ? 'Free' : `$${Number(ticket.price).toFixed(2)}`}
                  </p>
                  <p className="ticket-item-available">{available} remaining</p>
                </div>
                <div className="ticket-item-controls">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(ticket.id, -1)}
                    disabled={qty === 0}
                  >
                    −
                  </button>
                  <span className="qty-display">{qty}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(ticket.id, 1)}
                    disabled={qty >= available}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
          <button
            className="btn btn-primary btn-lg btn-full"
            disabled={totalItems === 0}
            onClick={handleAddToCart}
          >
            {totalItems === 0 ? 'Select tickets' : `Add ${totalItems} to cart`}
          </button>
        </>
      )}
    </div>
  );
}
