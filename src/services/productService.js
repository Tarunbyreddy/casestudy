import api from "./api";

export async function getProducts({
  search = "",
  categoryId = "",
  tenantId = "",
  page = 0,
  size = 8,
}) {

  const params = {
    page,
    size,
  };

  if (search.trim()) {
    params.search = search;
  }

  if (categoryId) {
    params.categoryId = categoryId;
  }

  if (tenantId) {
    params.tenantId = tenantId;
  }

  const response = await api.get("/products", {
    params,
  });

  return response.data;
}


export async function getTenantProducts(
  tenantName,
  {
    search = "",
    categoryId = "",
    page = 0,
    size = 8,
  } = {}
) {

  const params = {
    page,
    size,
  };

  if (search.trim()) {
    params.search = search;
  }

  if (categoryId) {
    params.categoryId = categoryId;
  }

  const response = await api.get(
    `/${tenantName}/products`,
    {
      params,
    }
  );

  return response.data;
}


export async function createProduct(
  tenantName,
  product
) {

  const response = await api.post(
    `/${tenantName}/products`,
    product
  );

  return response.data;
}


export async function updateProduct(
  tenantName,
  productId,
  product
) {

  const response = await api.put(
    `/${tenantName}/products/${productId}`,
    product
  );

  return response.data;
}


export async function deleteProduct(
  tenantName,
  productId
) {

  await api.delete(
    `/${tenantName}/products/${productId}`
  );
}