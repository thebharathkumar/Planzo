import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import CartSummary from '../components/checkout/CartSummary';
import PaymentForm from '../components/checkout/PaymentForm';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    // In production: create booking via API, then confirm with Stripe
    setTimeout(() => {
      setLoading(false);
      setConfirmed(true);
      clearCart();
    }, 1500);
  };

  if (confirmed) {
    return (
      <div className="checkout-page">
        <div className="confirmation-view">
          <span className="confirmation-icon">✅</span>
          <h1>Booking Confirmed!</h1>
          <p>Your tickets have been reserved. A confirmation email will be sent shortly.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Discover More Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="page-title">Checkout</h1>
      <div className="checkout-grid">
        <div className="checkout-payment">
          <PaymentForm onSubmit={handlePayment} loading={loading} />
        </div>
        <div className="checkout-summary">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
