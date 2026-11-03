import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import PrivateImage from './PrivateImage';
import apiClient from '../api/apiClient';

vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ token: 'private-test-token' }) }));
vi.mock('../api/apiClient', () => ({ default: { get: vi.fn() } }));
vi.mock('../api/apiConfig', () => ({ getImageUrl: (path) => `https://api.example.invalid${path}` }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('loads a private image as a blob without placing a token in the URL and releases it on unmount', async () => {
  const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-image');
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  apiClient.get.mockResolvedValue({ data: new Blob(['test-image']) });
  const view = render(<PrivateImage imagePath="/uploads/test.png" alt="Private logo" />);
  await waitFor(() => expect(screen.getByAltText('Private logo').getAttribute('src')).toBe('blob:test-image'));
  expect(apiClient.get).toHaveBeenCalledWith('https://api.example.invalid/uploads/test.png', expect.objectContaining({ responseType: 'blob' }));
  expect(create).toHaveBeenCalled();
  view.unmount(); expect(revoke).toHaveBeenCalledWith('blob:test-image');
});
it('shows an accessible error if the upload cannot be read', async () => {
  apiClient.get.mockRejectedValue(new Error('unavailable'));
  render(<PrivateImage imagePath="/uploads/test.png" alt="Private logo" />);
  expect(await screen.findByText('Image unavailable')).toBeTruthy();
});
