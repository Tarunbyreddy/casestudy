import { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { getProducts } from "../services/productService";
import { getTenants } from "../services/tenantService";
import { getCategories } from "../services/categoryService";

import {
  getFavourites,
  addFavourite,
  removeFavourite,
} from "../services/favouriteService";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function ProductsPage() {
  const { authenticated, user } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [favouriteIds, setFavouriteIds] = useState(new Set());
  const [favouriteLoading, setFavouriteLoading] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [favouriteError, setFavouriteError] = useState("");

  // LOAD TENANTS + CATEGORIES

  useEffect(() => {
    async function loadFilters() {
      try {
        const [tenantData, categoryData] = await Promise.all([
          getTenants(),
          getCategories(),
        ]);

        setTenants(tenantData);
        setCategories(categoryData);
      } catch (error) {
        console.error("Failed to load filters:", error);
      }
    }

    loadFilters();
  }, []);

  // LOAD PRODUCTS

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts({
          search,
          categoryId,
          tenantId,
          page,
          size: 8,
        });

        setProducts(data.content || []);
        setTotalPages(data.totalPages || 0);
      } catch (error) {
        console.error("Failed to load products:", error);

        setError(error.response?.data?.message || "Unable to load products.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [search, categoryId, tenantId, page]);

  // LOAD USER FAVOURITES

  useEffect(() => {
    async function loadFavourites() {
      if (!authenticated) {
        setFavouriteIds(new Set());
        return;
      }

      try {
        const data = await getFavourites();

        /*
         * Backend FavouriteResponse is expected to contain
         * productId.
         *
         * Example:
         * {
         *   id: 1,
         *   productId: 5,
         *   productName: "Running Shoes"
         * }
         */

        const ids = new Set(
          data
            .map((favourite) => favourite.productId)
            .filter((id) => id !== undefined && id !== null),
        );

        setFavouriteIds(ids);
      } catch (error) {
        console.error("Failed to load favourites:", error);
      }
    }

    loadFavourites();
  }, [authenticated]);

  // FILTER CHANGE

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleTenantChange = (event) => {
    setTenantId(event.target.value);
    setPage(0);
  };

  const handleCategoryChange = (event) => {
    setCategoryId(event.target.value);
    setPage(0);
  };

  // TOGGLE FAVOURITE

  const toggleFavourite = async (productId) => {
    if (!authenticated) {
      setFavouriteError("Please login to add products to favourites.");
      return;
    }

    try {
      setFavouriteError("");

      setFavouriteLoading((current) => ({
        ...current,
        [productId]: true,
      }));

      const isFavourite = favouriteIds.has(productId);

      if (isFavourite) {
        await removeFavourite(productId);

        setFavouriteIds((current) => {
          const updated = new Set(current);
          updated.delete(productId);
          return updated;
        });
      } else {
        await addFavourite(productId);

        setFavouriteIds((current) => {
          const updated = new Set(current);
          updated.add(productId);
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to update favourite:", error);

      setFavouriteError(
        error.response?.data?.message || "Unable to update favourite.",
      );
    } finally {
      setFavouriteLoading((current) => ({
        ...current,
        [productId]: false,
      }));
    }
  };

  // RENDER

  return (
    <div className="page-container">
      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>Products</h1>

          <p>Browse products from all brands</p>
        </div>
      </div>

      {/* FILTERS */}

      <div className="product-filters">
        <div className="search-box">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        <select value={tenantId} onChange={handleTenantChange}>
          <option value="">All Brands</option>

          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>

        <select value={categoryId} onChange={handleCategoryChange}>
          <option value="">All Categories</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* USER INFORMATION */}

      {user && (
        <div className="catalog-user-info">
          Welcome, <strong>{user.username}</strong>
        </div>
      )}

      {/* FAVOURITE ERROR */}

      {favouriteError && <div className="error-message">{favouriteError}</div>}

      {/* LOADING */}

      {loading && <div className="loading">Loading products...</div>}

      {/* PRODUCT ERROR */}

      {error && <div className="error-message">{error}</div>}

      {/* EMPTY RESULT */}

      {!loading && products.length === 0 && (
        <div className="empty-state">No products found.</div>
      )}

      {/* PRODUCTS */}

      <div className="product-grid">
        {products.map((product) => {
          const isFavourite = favouriteIds.has(product.id);

          const isFavouriteLoading = favouriteLoading[product.id];

          return (
            <div className="product-card" key={product.id}>
              {/* PRODUCT TOP */}

              <div className="product-card-top">
                <span className="product-brand">{product.tenantName}</span>

                <button
                  type="button"
                  className={`icon-button ${
                    isFavourite ? "favourite-active" : ""
                  }`}
                  onClick={() => toggleFavourite(product.id)}
                  disabled={isFavouriteLoading}
                  title={
                    isFavourite ? "Remove from favourites" : "Add to favourites"
                  }
                >
                  <Heart
                    size={18}
                    fill={isFavourite ? "currentColor" : "none"}
                  />
                </button>
              </div>

              {/* PRODUCT IMAGE */}

              <div className="product-image-placeholder">
                {product.name?.charAt(0)?.toUpperCase()}
              </div>

              {/* PRODUCT DETAILS */}

              <div className="product-card-body">
                <p className="product-category">{product.categoryName}</p>

                <h3>{product.name}</h3>

                <p className="product-description">
                  {product.description || "No description available."}
                </p>

                <div className="product-price-row">
                  <strong>₹{Number(product.price).toFixed(2)}</strong>

                  <span>Stock: {product.quantity}</span>
                </div>

                {/* ADD TO CART */}

                <button
                  className="primary-button"
                  disabled={product.quantity <= 0}
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart size={18} />

                  {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={page === 0}
            onClick={() => setPage((current) => current - 1)}
          >
            <ChevronLeft size={18} />
          </button>

          <span>
            Page {page + 1} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((current) => current + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
