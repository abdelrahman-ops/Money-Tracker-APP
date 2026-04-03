import apiClient from '../api/client';

// ─── CATEGORIES ───
export async function fetchCategories() {
  const { data } = await apiClient.get('/categories');
  return data.data;
}

export async function createCategory(categoryData) {
  const { data } = await apiClient.post('/categories', categoryData);
  return data.data;
}

export async function updateCategory(id, categoryData) {
  const { data } = await apiClient.put(`/categories/${id}`, categoryData);
  return data.data;
}

export async function deleteCategory(id) {
  await apiClient.delete(`/categories/${id}`);
}
