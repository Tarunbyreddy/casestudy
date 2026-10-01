import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import api from "../services/api";

function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalQuantity,
    totalAmount,
  } = useCart();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkout = async () => {
    if (cartItems.length === 0) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/orders", {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.cartQuantity,
        })),
      });

      clearCart();

      navigate("/orders");
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Unable to place order.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <ShoppingBag size={45} />

          <h2>Your cart is empty</h2>

          <p>Add some products before checking out.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Shopping Cart</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="cart-container">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <div>
                <h3>{item.name}</h3>

                <p className="stock">₹{Number(item.price).toFixed(2)} each</p>
              </div>

              <div className="quantity-controls">
                <button
                  onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                >
                  <Minus size={14} />
                </button>

                <strong>{item.cartQuantity}</strong>

                <button
                  onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                >
                  <Plus size={14} />
                </button>

                <button onClick={() => removeFromCart(item.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Total Items</span>
            <strong>{totalQuantity}</strong>
          </div>

          <div className="summary-row summary-total">
            <span>Total</span>
            <strong>₹{totalAmount.toFixed(2)}</strong>
          </div>

          <button
            className="checkout-btn"
            onClick={checkout}
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
