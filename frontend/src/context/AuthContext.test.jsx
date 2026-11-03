import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import apiClient from '../api/apiClient';

vi.mock('../api/apiClient', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
const Session = () => {
  const auth = useAuth();
  return <><p>{auth.isAuthLoading ? 'restoring' : auth.isAuthenticated ? `signed in: ${auth.user.name}` : 'signed out'}</p>
    <button onClick={() => auth.login({ email: 'qa@example.com', password: 'test-password-only' })}>Sign in</button>
    <button onClick={auth.logout}>Sign out</button></>;
};
beforeEach(() => { localStorage.clear(); vi.resetAllMocks(); });
afterEach(cleanup);

it('restores a valid saved session after a refresh', async () => {
  localStorage.setItem('token', 'saved-test-token');
  apiClient.get.mockResolvedValue({ data: { user: { name: 'QA User' } } });
  render(<AuthProvider><Session /></AuthProvider>);
  expect(await screen.findByText('signed in: QA User')).toBeTruthy();
  expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
});
it('rejects an invalid saved session and clears the stale token', async () => {
  localStorage.setItem('token', 'invalid-test-token');
  apiClient.get.mockRejectedValue({ response: { status: 401 } });
  render(<AuthProvider><Session /></AuthProvider>);
  expect(await screen.findByText('signed out')).toBeTruthy();
  expect(localStorage.getItem('token')).toBeNull();
});
it('supports login and logout without leaving a stored token', async () => {
  apiClient.post.mockResolvedValue({ data: { token: 'new-test-token', user: { name: 'QA User' } } });
  render(<AuthProvider><Session /></AuthProvider>);
  await screen.findByText('signed out');
  fireEvent.click(screen.getByText('Sign in'));
  expect(await screen.findByText('signed in: QA User')).toBeTruthy();
  expect(localStorage.getItem('token')).toBe('new-test-token');
  fireEvent.click(screen.getByText('Sign out'));
  await waitFor(() => expect(screen.getByText('signed out')).toBeTruthy());
  expect(localStorage.getItem('token')).toBeNull();
});
it('ends an active session when an API request reports an expired JWT', async () => {
  localStorage.setItem('token', 'saved-test-token');
  apiClient.get.mockResolvedValue({ data: { user: { name: 'QA User' } } });
  render(<AuthProvider><Session /></AuthProvider>);
  await screen.findByText('signed in: QA User');
  fireEvent(window, new Event('auth:expired'));
  expect(await screen.findByText('signed out')).toBeTruthy();
});
