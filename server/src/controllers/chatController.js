import { GoogleGenAI, Type } from '@google/genai';
import { getOrderStatus } from '../services/orderService.js';

// The Gemini AI client will be initialized inside the handler
// to ensure process.env variables are fully loaded.

export const handleChat = async (req, res, next) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Server missing GEMINI_API_KEY');
      return res.status(500).json({ error: 'Server configuration error: API key missing.' });
    }
    const ai = new GoogleGenAI({ apiKey });

    const { message, history } = req.body;
    
    const systemInstruction = "You are ManjuBot, a helpful customer support bot for Manju's Atelier. You can help users track their orders. Be polite and concise.";

    const tools = [{
      functionDeclarations: [{
        name: 'get_order_status',
        description: 'Get the current status of an order using the order ID.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            orderId: {
              type: Type.STRING,
              description: 'The ID of the order to track (e.g., 1001)',
            },
          },
          required: ['orderId'],
        },
      }],
    }];

    // Format history for Gemini API
    const contents = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    
    // Add current message
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        tools: tools,
        temperature: 0.2
      }
    });

    let finalResponseText = response.text;

    // Check if a tool was called
    if (response.functionCalls && response.functionCalls.length > 0) {
       const functionCall = response.functionCalls[0];
       if (functionCall.name === 'get_order_status') {
         const { orderId } = functionCall.args;
         const orderData = getOrderStatus(orderId);
         
         const functionResponse = {
            role: 'function',
            parts: [{
                functionResponse: {
                    name: 'get_order_status',
                    response: orderData ? orderData : { error: "Order not found" }
                }
            }]
         };

         // Call model again with the function response to generate natural language reply
         const followupContents = [
            ...contents,
            { role: 'model', parts: response.parts },
            functionResponse
         ];

         const followupResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: followupContents,
            config: {
                systemInstruction,
                tools: tools,
                temperature: 0.2
            }
         });
         finalResponseText = followupResponse.text;
       }
    }

    res.status(200).json({ text: finalResponseText });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process chat message.' });
  }
};
