import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  getTenantProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import { getCategories } from "../services/categoryService";

function MyStorePage() {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    categoryId: "",
  });

  const tenantName = user?.tenantName;

  const loadData = async () => {
    if (!tenantName) return;

    try {
      setLoading(true);
      setError("");

      const [productData, categoryData] = await Promise.all([
        getTenantProducts(tenantName, {
          page: 0,
          size: 50,
        }),
        getCategories(),
      ]);

      setProducts(productData.content || []);
      setCategories(categoryData);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load store data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenantName]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingProduct(null);

    setForm({
      name: "",
      description: "",
      price: "",
      quantity: "",
      categoryId: "",
    });

    setShowForm(true);
    setError("");
  };

  const openEditForm = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      quantity: product.quantity,
      categoryId: product.categoryId,
    });

    setShowForm(true);
    setError("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const productData = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        quantity: Number(form.quantity),
        categoryId: Number(form.categoryId),
      };

      if (editingProduct) {
        await updateProduct(tenantName, editingProduct.id, productData);
      } else {
        await createProduct(tenantName, productData);
      }

      closeForm();
      await loadData();
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteProduct(tenantName, productId);

      await loadData();
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Unable to delete product.");
    }
  };

  if (!tenantName) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>No tenant assigned</h2>
          <p>Your account is not associated with a store.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{tenantName} Store</h1>

          <p className="page-subtitle">
            Manage products belonging to your brand.
          </p>
        </div>

        <button className="primary-btn" onClick={openCreateForm}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-card">
          <div className="form-header">
            <h2>{editingProduct ? "Update Product" : "Add Product"}</h2>

            <button className="icon-btn" onClick={closeForm}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name</label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Price</label>

                <input
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Quantity</label>

                <input
                  name="quantity"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>

                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button type="submit" className="primary-btn" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingProduct
                    ? "Update Product"
                    : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h2>No products yet</h2>
          <p>Add your first product to this store.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-card-body">
                <span className="product-category">{product.categoryName}</span>

                <h3>{product.name}</h3>

                <p className="product-description">
                  {product.description || "No description available."}
                </p>

                <div className="product-meta">
                  <strong>₹{Number(product.price).toFixed(2)}</strong>

                  <span className="stock">Stock: {product.quantity}</span>
                </div>
              </div>

              <div className="product-actions">
                <button
                  className="secondary-btn"
                  onClick={() => openEditForm(product)}
                >
                  <Pencil size={16} />
                  Edit
                </button>

                <button
                  className="danger-btn"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyStorePage;
