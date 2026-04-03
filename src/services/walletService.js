import apiClient from '../api/client';

// ─── WALLETS ───
export async function fetchWallets() {
  const { data } = await apiClient.get('/wallets');
  return data.data;
}

export async function fetchWallet(id) {
  const { data } = await apiClient.get(`/wallets/${id}`);
  return data.data;
}

export async function createWallet(walletData) {
  const { data } = await apiClient.post('/wallets', walletData);
  return data.data;
}

export async function updateWallet(id, walletData) {
  const { data } = await apiClient.put(`/wallets/${id}`, walletData);
  return data.data;
}

export async function deleteWallet(id) {
  await apiClient.delete(`/wallets/${id}`);
}
