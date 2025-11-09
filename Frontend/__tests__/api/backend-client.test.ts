import { backendClient, BackendError, TimeoutError } from '@/lib/backend-client';

describe('Backend Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(backendClient).toBeDefined();
      expect(backendClient.baseURL).toBe(process.env.NEXT_PUBLIC_BACKEND_URL || '/api');
    });

    it('should set custom timeout', () => {
      expect(backendClient.timeout).toBe(30000); // 30 seconds default
    });

    it('should enable retry logic by default', () => {
      expect(backendClient.retryConfig).toEqual({
        maxRetries: 3,
        retryDelay: 1000,
        exponentialBackoff: true,
      });
    });
  });

  describe('Request Handling', () => {
    it('should make successful GET request', async () => {
      const result = await backendClient.get('/presentations');

      expect(result).toHaveProperty('presentations');
      expect(Array.isArray(result.presentations)).toBe(true);
    });

    it('should make successful POST request', async () => {
      const data = {
        topic: 'AI in Healthcare',
        slideCount: 10,
        tone: 'formal',
      };

      const result = await backendClient.post('/generate-slides', data);

      expect(result).toHaveProperty('slides');
      expect(result).toHaveProperty('title');
    });

    it('should make successful PUT request', async () => {
      const data = { title: 'Updated Title' };

      const result = await backendClient.put('/presentations/pres-123', data);

      expect(result).toHaveProperty('metadata');
      expect(result.metadata.version).toBeGreaterThan(1);
    });

    it('should make successful DELETE request', async () => {
      const result = await backendClient.delete('/presentations/pres-123');

      expect(result).toEqual({ success: true });
    });

    it('should include authorization header when token is set', async () => {
      const mockFetch = jest.spyOn(global, 'fetch');
      backendClient.setAuthToken('test-token-123');

      await backendClient.get('/presentations');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );

      backendClient.clearAuthToken();
    });

    it('should send JSON content-type for POST requests', async () => {
      const mockFetch = jest.spyOn(global, 'fetch');

      await backendClient.post('/generate-slides', { topic: 'Test' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed request up to maxRetries', async () => {
      const mockFetch = jest
        .spyOn(global, 'fetch')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );

      const result = await backendClient.get('/presentations');

      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(result).toEqual({ success: true });
    });

    it('should use exponential backoff for retries', async () => {
      jest.useFakeTimers();

      const mockFetch = jest
        .spyOn(global, 'fetch')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );

      const promise = backendClient.get('/presentations');

      // First retry after 1000ms
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      // Second retry after 2000ms (exponential backoff)
      jest.advanceTimersByTime(2000);
      await Promise.resolve();

      const result = await promise;

      expect(result).toEqual({ success: true });
      jest.useRealTimers();
    });

    it('should throw error after max retries exceeded', async () => {
      const mockFetch = jest
        .spyOn(global, 'fetch')
        .mockRejectedValue(new Error('Network error'));

      await expect(backendClient.get('/presentations')).rejects.toThrow(
        BackendError
      );

      expect(mockFetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should not retry on 4xx client errors', async () => {
      const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Bad Request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(backendClient.get('/presentations')).rejects.toThrow(
        BackendError
      );

      expect(mockFetch).toHaveBeenCalledTimes(1); // No retries for client errors
    });

    it('should retry on 5xx server errors', async () => {
      const mockFetch = jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );

      const result = await backendClient.get('/presentations');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true });
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout request after configured duration', async () => {
      jest.useFakeTimers();

      const mockFetch = jest
        .spyOn(global, 'fetch')
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve(
                    new Response(JSON.stringify({ success: true }), {
                      status: 200,
                    })
                  ),
                60000
              )
            )
        );

      const promise = backendClient.get('/presentations', { timeout: 5000 });

      jest.advanceTimersByTime(5000);

      await expect(promise).rejects.toThrow(TimeoutError);

      jest.useRealTimers();
    });

    it('should allow custom timeout per request', async () => {
      jest.useFakeTimers();

      const mockFetch = jest
        .spyOn(global, 'fetch')
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve(
                    new Response(JSON.stringify({ success: true }), {
                      status: 200,
                    })
                  ),
                3000
              )
            )
        );

      const promise = backendClient.get('/presentations', { timeout: 10000 });

      jest.advanceTimersByTime(3000);
      const result = await promise;

      expect(result).toEqual({ success: true });

      jest.useRealTimers();
    });
  });

  describe('Error Normalization', () => {
    it('should normalize 400 Bad Request error', async () => {
      const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 'Validation failed',
            details: { topic: 'Required' },
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );

      try {
        await backendClient.post('/generate-slides', {});
      } catch (error) {
        expect(error).toBeInstanceOf(BackendError);
        if (error instanceof BackendError) {
          expect(error.status).toBe(400);
          expect(error.message).toBe('Validation failed');
          expect(error.details).toEqual({ topic: 'Required' });
        }
      }
    });

    it('should normalize 401 Unauthorized error', async () => {
      const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      try {
        await backendClient.get('/presentations');
      } catch (error) {
        expect(error).toBeInstanceOf(BackendError);
        if (error instanceof BackendError) {
          expect(error.status).toBe(401);
          expect(error.message).toBe('Unauthorized');
        }
      }
    });

    it('should normalize 500 Internal Server Error', async () => {
      const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Internal Server Error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      try {
        await backendClient.get('/presentations');
      } catch (error) {
        expect(error).toBeInstanceOf(BackendError);
        if (error instanceof BackendError) {
          expect(error.status).toBe(500);
        }
      }
    });

    it('should handle network errors gracefully', async () => {
      const mockFetch = jest
        .spyOn(global, 'fetch')
        .mockRejectedValue(new Error('Network request failed'));

      try {
        await backendClient.get('/presentations');
      } catch (error) {
        expect(error).toBeInstanceOf(BackendError);
        if (error instanceof BackendError) {
          expect(error.message).toContain('Network');
        }
      }
    });
  });

  describe('Request Cancellation', () => {
    it('should cancel request using AbortController', async () => {
      const controller = new AbortController();

      const promise = backendClient.get('/presentations', {
        signal: controller.signal,
      });

      controller.abort();

      await expect(promise).rejects.toThrow('aborted');
    });

    it('should cancel multiple concurrent requests', async () => {
      const controller = new AbortController();

      const promises = [
        backendClient.get('/presentations', { signal: controller.signal }),
        backendClient.get('/presentations/123', { signal: controller.signal }),
        backendClient.get('/presentations/456', { signal: controller.signal }),
      ];

      controller.abort();

      await expect(Promise.all(promises)).rejects.toThrow('aborted');
    });
  });

  describe('P0 Feature Access', () => {
    it('should access grid layout feature', async () => {
      const result = await backendClient.get('/p0/grid-layout/slide-1');

      expect(result).toHaveProperty('layout');
      expect(result).toHaveProperty('columns');
    });

    it('should access typography feature', async () => {
      const result = await backendClient.get('/p0/typography/slide-1');

      expect(result).toHaveProperty('fontFamily');
      expect(result).toHaveProperty('fontSize');
    });

    it('should access color palette feature', async () => {
      const result = await backendClient.get('/p0/colors/slide-1');

      expect(result).toHaveProperty('palette');
      expect(result).toHaveProperty('colors');
    });

    it('should export presentation', async () => {
      const result = await backendClient.post('/p0/export/pres-123', {
        format: 'pptx',
      });

      expect(result).toHaveProperty('downloadUrl');
      expect(result.format).toBe('pptx');
    });
  });

  describe('P1 Feature Access', () => {
    it('should access collaboration feature', async () => {
      const result = await backendClient.get(
        '/p1/collaboration/pres-123/users'
      );

      expect(result).toHaveProperty('users');
      expect(Array.isArray(result.users)).toBe(true);
    });

    it('should access version history', async () => {
      const result = await backendClient.get('/p1/versions/pres-123');

      expect(result).toHaveProperty('versions');
      expect(Array.isArray(result.versions)).toBe(true);
    });
  });

  describe('P2 Feature Access', () => {
    it('should generate voice narration', async () => {
      const result = await backendClient.post('/p2/voice-narration/slide-1', {
        text: 'Test narration',
      });

      expect(result).toHaveProperty('audioUrl');
      expect(result).toHaveProperty('duration');
    });

    it('should access AR presentation', async () => {
      const result = await backendClient.get('/p2/ar/pres-123');

      expect(result).toHaveProperty('arUrl');
      expect(result).toHaveProperty('supported');
    });
  });
});
