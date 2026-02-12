import { useCart } from '../../hooks/useCart';

export default function CartSummary() {
  const { cart, clearCart } = useCart();

  if (!cart) {
    return (
      <div className="cart-empty">
        <span className="empty-icon">🛒</span>
        <h3>Your cart is empty</h3>
        <p>Browse events and add tickets to get started.</p>
      </div>
    );
  }

  return (
    <div className="cart-summary">
      <h2>Order Summary</h2>
      <h3 className="cart-event-title">{cart.eventTitle}</h3>
      <div className="cart-items">
        {cart.items.map((item, i) => (
          <div key={i} className="cart-item">
            <div>
              <p className="cart-item-name">{item.name}</p>
              <p className="cart-item-qty">Qty: {item.quantity}</p>
            </div>
            <p className="cart-item-price">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <span>Total</span>
        <span className="cart-total-amount">${cart.total.toFixed(2)}</span>
      </div>
      <button className="btn btn-outline btn-sm" onClick={clearCart}>
        Clear Cart
      </button>
    </div>
  );
}
