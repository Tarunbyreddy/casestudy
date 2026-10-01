import { useEffect, useState } from "react";
import api from "../services/api";

import { getUsers, createUser, deleteUser } from "../services/userService";

function AdminPage() {
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [roles, setRoles] = useState([]);

  const [tenantName, setTenantName] = useState("");
  const [tenantDomain, setTenantDomain] = useState("");

  const [categoryName, setCategoryName] = useState("");

  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    roleId: "",
    tenantId: "",
    keycloakUserId: "",
  });

  const [loading, setLoading] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD ADMIN DATA
  // --------------------------------------------------

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError("");

      const [tenantResponse, userResponse, categoryResponse] =
        await Promise.all([
          api.get("/tenants"),
          getUsers(),
          api.get("/categories"),
        ]);

      setTenants(tenantResponse.data);
      setUsers(userResponse);
      setCategories(categoryResponse.data);

      /*
       * Roles are loaded separately because the backend
       * currently exposes roles through the RoleRepository/
       * service only if a role endpoint exists.
       *
       * For now we use the roles already defined in Keycloak
       * and your database:
       *
       * ADMIN = 1
       * TENANT = 2
       * USER = 3
       *
       * We will make this dynamic if you have a /roles endpoint.
       */
      setRoles([
        { id: 1, name: "ADMIN" },
        { id: 2, name: "TENANT" },
        { id: 3, name: "USER" },
      ]);
    } catch (err) {
      console.error("Failed to load admin data:", err);

      setError(err.response?.data?.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // CREATE TENANT
  // --------------------------------------------------

  const handleCreateTenant = async (event) => {
    event.preventDefault();

    if (!tenantName.trim() || !tenantDomain.trim()) {
      setError("Tenant name and domain are required.");
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.post("/tenants", {
        name: tenantName.trim(),
        domain: tenantDomain.trim(),
      });

      setTenantName("");
      setTenantDomain("");

      setMessage("Tenant created successfully.");

      await loadAdminData();
    } catch (err) {
      console.error("Failed to create tenant:", err);

      setError(err.response?.data?.message || "Failed to create tenant.");
    }
  };

  // --------------------------------------------------
  // DELETE TENANT
  // --------------------------------------------------

  const handleDeleteTenant = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tenant?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(`/tenants/${id}`);

      setMessage("Tenant deleted successfully.");

      await loadAdminData();
    } catch (err) {
      console.error("Failed to delete tenant:", err);

      setError(err.response?.data?.message || "Failed to delete tenant.");
    }
  };

  // --------------------------------------------------
  // CREATE CATEGORY
  // --------------------------------------------------

  const handleCreateCategory = async (event) => {
    event.preventDefault();

    if (!categoryName.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.post("/categories", {
        name: categoryName.trim(),
      });

      setCategoryName("");

      setMessage("Category created successfully.");

      await loadAdminData();
    } catch (err) {
      console.error("Failed to create category:", err);

      setError(err.response?.data?.message || "Failed to create category.");
    }
  };

  // --------------------------------------------------
  // DELETE CATEGORY
  // --------------------------------------------------

  const handleDeleteCategory = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(`/categories/${id}`);

      setMessage("Category deleted successfully.");

      await loadAdminData();
    } catch (err) {
      console.error("Failed to delete category:", err);

      setError(err.response?.data?.message || "Failed to delete category.");
    }
  };

  // --------------------------------------------------
  // USER FORM CHANGE
  // --------------------------------------------------

  const handleUserChange = (event) => {
    const { name, value } = event.target;

    setUserForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // CREATE USER
  // --------------------------------------------------

  const handleCreateUser = async (event) => {
    event.preventDefault();

    if (
      !userForm.username.trim() ||
      !userForm.email.trim() ||
      !userForm.roleId
    ) {
      setError("Username, email and role are required.");
      return;
    }

    /*
     * Tenant is required only for TENANT users.
     */

    const selectedRole = roles.find(
      (role) => Number(role.id) === Number(userForm.roleId),
    );

    if (selectedRole?.name === "TENANT" && !userForm.tenantId) {
      setError("Please select a tenant for a TENANT user.");
      return;
    }

    try {
      setCreatingUser(true);
      setError("");
      setMessage("");

      const userData = {
        username: userForm.username.trim(),
        email: userForm.email.trim(),
        roleId: Number(userForm.roleId),
        tenantId: userForm.tenantId ? Number(userForm.tenantId) : null,
        keycloakUserId: userForm.keycloakUserId.trim() || null,
      };

      await createUser(userData);

      setUserForm({
        username: "",
        email: "",
        roleId: "",
        tenantId: "",
        keycloakUserId: "",
      });

      setMessage("User created successfully.");

      await loadAdminData();
    } catch (err) {
      console.error("Failed to create user:", err);

      setError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setCreatingUser(false);
    }
  };

  // --------------------------------------------------
  // DELETE USER
  // --------------------------------------------------

  const handleDeleteUser = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await deleteUser(id);

      setMessage("User deleted successfully.");

      await loadAdminData();
    } catch (err) {
      console.error("Failed to delete user:", err);

      setError(err.response?.data?.message || "Failed to delete user.");
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>

          <p className="mt-4 text-gray-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>

          <p className="mt-2 text-gray-600">
            Manage tenants, users and product categories.
          </p>
        </div>

        {/* MESSAGES */}

        {message && (
          <div className="mb-6 bg-green-100 text-green-700 p-4 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* ================================================== */}
        {/* CREATE TENANT */}
        {/* ================================================== */}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Add Tenant
          </h2>

          <form
            onSubmit={handleCreateTenant}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <input
              type="text"
              placeholder="Tenant name"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              className="border rounded-lg px-4 py-2"
            />

            <input
              type="text"
              placeholder="Tenant domain"
              value={tenantDomain}
              onChange={(e) => setTenantDomain(e.target.value)}
              className="border rounded-lg px-4 py-2"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
            >
              Add Tenant
            </button>
          </form>
        </div>

        {/* ================================================== */}
        {/* TENANTS */}
        {/* ================================================== */}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tenants</h2>

          {tenants.length === 0 ? (
            <p className="text-gray-500">No tenants found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3">ID</th>

                    <th className="p-3">Name</th>

                    <th className="p-3">Domain</th>

                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b">
                      <td className="p-3">{tenant.id}</td>

                      <td className="p-3 font-medium">{tenant.name}</td>

                      <td className="p-3">{tenant.domain}</td>

                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteTenant(tenant.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ================================================== */}
        {/* CREATE USER */}
        {/* ================================================== */}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add User</h2>

          <form
            onSubmit={handleCreateUser}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* USERNAME */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>

              <input
                type="text"
                name="username"
                placeholder="Username"
                value={userForm.username}
                onChange={handleUserChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              />
            </div>

            {/* EMAIL */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={userForm.email}
                onChange={handleUserChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              />
            </div>

            {/* ROLE */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>

              <select
                name="roleId"
                value={userForm.roleId}
                onChange={handleUserChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              >
                <option value="">Select role</option>

                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {/* TENANT */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant
              </label>

              <select
                name="tenantId"
                value={userForm.tenantId}
                onChange={handleUserChange}
                className="border rounded-lg px-4 py-2 w-full"
              >
                <option value="">No Tenant</option>

                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>

            {/* KEYCLOAK USER ID */}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keycloak User ID
              </label>

              <input
                type="text"
                name="keycloakUserId"
                placeholder="Optional Keycloak user ID"
                value={userForm.keycloakUserId}
                onChange={handleUserChange}
                className="border rounded-lg px-4 py-2 w-full"
              />

              <p className="text-xs text-gray-500 mt-1">
                Use the Keycloak user's ID so the application user is linked to
                Keycloak.
              </p>
            </div>

            {/* SUBMIT */}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={creatingUser}
                className="bg-blue-600 text-white rounded-lg px-5 py-2 hover:bg-blue-700 disabled:opacity-50"
              >
                {creatingUser ? "Creating User..." : "Create User"}
              </button>
            </div>
          </form>
        </div>

        {/* ================================================== */}
        {/* CATEGORIES */}
        {/* ================================================== */}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Categories
          </h2>

          <form
            onSubmit={handleCreateCategory}
            className="flex flex-col md:flex-row gap-3 mb-6"
          >
            <input
              type="text"
              placeholder="Category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="border rounded-lg px-4 py-2 flex-1"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Category
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <span className="font-medium">{category.name}</span>

                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ================================================== */}
        {/* USERS */}
        {/* ================================================== */}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Users</h2>

          {users.length === 0 ? (
            <p className="text-gray-500">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3">ID</th>

                    <th className="p-3">Username</th>

                    <th className="p-3">Email</th>

                    <th className="p-3">Role</th>

                    <th className="p-3">Tenant</th>

                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-3">{user.id}</td>

                      <td className="p-3">{user.username}</td>

                      <td className="p-3">{user.email}</td>

                      <td className="p-3">{user.roleName || "-"}</td>

                      <td className="p-3">{user.tenantName || "-"}</td>

                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
