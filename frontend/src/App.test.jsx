import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import App from './App';

const state = vi.hoisted(() => ({ auth: {}, requests: [] }));
vi.mock('./context/AuthContext', () => ({ useAuth: () => state.auth }));
vi.mock('./api/apiClient', () => ({ default: { get: vi.fn(async (url) => {
  state.requests.push(url);
  if (url === '/dashboard') return { data: { summary: {}, recentRFQs: [], recentQuotations: [] } };
  if (url === '/health') return { data: { status: 'ok' } };
  return { data: {} };
}) } }));

const Location = () => <output aria-label="Current route">{useLocation().pathname}</output>;
const visit = (route) => render(<MemoryRouter initialEntries={[route]}><App /><Location /></MemoryRouter>);

beforeEach(() => {
  state.requests = [];
  state.auth = { isAuthLoading: false, isAuthenticated: false, user: null, token: null };
});
afterEach(cleanup);

describe('Production routes and session boundaries', () => {
  it.each(['/', '/dashboard', '/suppliers', '/items', '/rfqs', '/diagnostics', '/unknown'])('%s sends visitors to login', async (route) => {
    visit(route);
    await waitFor(() => expect(screen.getByLabelText('Current route').textContent).toBe('/login'));
    expect(screen.getByRole('heading', { name: 'Welcome back.' })).toBeTruthy();
    expect(state.requests).toEqual([]);
  });
  it('keeps registration directly accessible', () => {
    visit('/register');
    expect(screen.getByLabelText('Current route').textContent).toBe('/register');
    expect(screen.getByLabelText('Confirm Password')).toBeTruthy();
  });
  it('waits for session restoration before redirecting', () => {
    state.auth.isAuthLoading = true;
    visit('/');
    expect(screen.getByText('Restoring session...')).toBeTruthy();
    expect(screen.getByLabelText('Current route').textContent).toBe('/');
  });
  it('sends authenticated users home to their dashboard', async () => {
    state.auth = { isAuthLoading: false, isAuthenticated: true, user: { name: 'QA User' }, token: 'test' };
    visit('/');
    await waitFor(() => expect(screen.getByLabelText('Current route').textContent).toBe('/dashboard'));
    expect(await screen.findByRole('heading', { name: /QA User/ })).toBeTruthy();
    expect(state.requests).toContain('/dashboard');
  });
  it('keeps safe diagnostics behind authentication', async () => {
    state.auth = { isAuthLoading: false, isAuthenticated: true, user: { name: 'QA User' }, token: 'test' };
    visit('/diagnostics');
    expect(await screen.findByText('The API is healthy.')).toBeTruthy();
    expect(state.requests).toEqual(['/health']);
  });
});
