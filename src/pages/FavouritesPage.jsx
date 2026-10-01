import { useEffect, useState } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

import { getFavourites, removeFavourite } from "../services/favouriteService";

import { useCart } from "../context/CartContext";

function FavouritesPage() {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  const loadFavourites = async () => {
    try {
      setLoading(true);

      const data = await getFavourites();

      setFavourites(data);
    } catch (error) {
      console.error("Failed to load favourites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavourites();
  }, []);

  const remove = async (productId) => {
    try {
      await removeFavourite(productId);

      setFavourites((current) =>
        current.filter((item) => item.productId !== productId),
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <p>Loading favourites...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Favourites</h1>

          <p className="page-subtitle">Products you have saved.</p>
        </div>
      </div>

      {favourites.length === 0 ? (
        <div className="empty-state">
          <Heart size={45} />

          <h2>No favourites yet</h2>

          <p>Add products to your favourites from the Products page.</p>
        </div>
      ) : (
        <div className="product-grid">
          {favourites.map((item) => (
            <div className="product-card" key={item.id}>
              <div className="product-card-body">
                <span className="product-category">{item.categoryName}</span>

                <h3>{item.productName}</h3>

                <div className="product-meta">
                  <strong>₹{Number(item.price).toFixed(2)}</strong>
                </div>
              </div>

              <div className="product-actions">
                <button
                  className="primary-btn"
                  onClick={() =>
                    addToCart({
                      id: item.productId,
                      name: item.productName,
                      price: item.price,
                      quantity: item.quantity,
                    })
                  }
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>

                <button
                  className="danger-btn"
                  onClick={() => remove(item.productId)}
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavouritesPage;
