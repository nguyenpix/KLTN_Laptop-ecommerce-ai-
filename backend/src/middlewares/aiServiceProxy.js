import fetch from 'node-fetch';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/api/v1';

/**
 * Reverse Proxy Middleware to forward AI & Recommendation requests to the AI Microservice.
 */
export const forwardToAIService = (targetBasePath) => {
  return async (req, res, next) => {
    try {
      const targetUrl = `${AI_SERVICE_URL}${targetBasePath}${req.url === '/' ? '' : req.url}`;
      
      const headers = {
        'Content-Type': 'application/json',
      };

      if (req.headers.authorization) {
        headers['authorization'] = req.headers.authorization;
      }

      const fetchOptions = {
        method: req.method,
        headers,
      };

      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
        fetchOptions.body = JSON.stringify(req.body);
      }

      const aiResponse = await fetch(targetUrl, fetchOptions);
      const data = await aiResponse.json();

      return res.status(aiResponse.status).json(data);
    } catch (error) {
      console.warn(`⚠️ AI Microservice unavailable at ${AI_SERVICE_URL}${targetBasePath}. Fallback or error.`);
      // If AI Microservice is offline, pass to next handlers or return helpful error
      return res.status(503).json({
        success: false,
        message: 'AI & Recommendation Microservice is currently unavailable. Please ensure ai-service is running on port 8000.',
        error: error.message
      });
    }
  };
};
