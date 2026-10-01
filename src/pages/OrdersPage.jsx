import { useEffect, useState } from "react";
import api from "../services/api";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/orders/history", {
        params: {
          page: 0,
          size: 20,
        },
      });

      setOrders(response.data.content || []);
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Orders</h1>

        <p className="page-subtitle">View your previous purchases.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <h2>No orders yet</h2>
          <p>Your orders will appear here after checkout.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-header">
              <div>
                <strong>Order #{order.id}</strong>

                <div className="stock">{order.totalQuantity} items</div>
              </div>

              <strong>₹{Number(order.totalAmount).toFixed(2)}</strong>
            </div>

            {order.orderItems?.map((item) => (
              <div className="order-item" key={item.id}>
                <div>
                  <strong>
                    {item.productName || item.product?.name || "Product"}
                  </strong>

                  <div className="stock">Quantity: {item.quantity}</div>
                </div>

                <strong>₹{Number(item.priceAtPurchase).toFixed(2)}</strong>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export default OrdersPage;
