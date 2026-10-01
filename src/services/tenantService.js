import api from "./api";

export async function getTenants() {

  const response = await api.get("/tenants");

  return response.data;
}


export async function createTenant(tenant) {

  const response = await api.post(
    "/tenants",
    tenant
  );

  return response.data;
}


export async function deleteTenant(id) {

  await api.delete(`/tenants/${id}`);
}