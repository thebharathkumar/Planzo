import { useState } from 'react';

export default function PaymentForm({ onSubmit, loading }) {
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, integrate Stripe Elements here
    onSubmit({ cardholderName });
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <h2>Payment Details</h2>
      <p className="payment-note">
        Stripe payment integration will be connected here.
        For now, this is a placeholder form.
      </p>
      <div className="form-group">
        <label htmlFor="cardholder">Cardholder Name</label>
        <input
          id="cardholder"
          type="text"
          className="form-input"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="John Doe"
          required
        />
      </div>
      <div className="form-group">
        <label>Card Number</label>
        <div className="stripe-placeholder">
          Stripe Card Element will render here
        </div>
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-lg btn-full"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Complete Booking'}
      </button>
    </form>
  );
}
