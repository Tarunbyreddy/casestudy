import api from "./api";

export async function getFavourites() {
  const response = await api.get("/favourites");
  return response.data;
}

export async function addFavourite(productId) {
  const response = await api.post(`/favourites/${productId}`);
  return response.data;
}

export async function removeFavourite(productId) {
  await api.delete(`/favourites/${productId}`);
}