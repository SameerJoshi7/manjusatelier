import { GoogleGenAI, Type } from '@google/genai';
import { getOrderStatus } from '../services/orderService.js';

// Initialize the Gemini AI client
// It will automatically use process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

export const handleChat = async (req, res, next) => {
  try {
    const { message, history, language } = req.body;
    
    let systemInstruction = "You are a helpful customer support bot for Manju's Atelier. You can help users track their orders. Be polite and concise.";
    if (language === 'hi') {
      systemInstruction = "आप मंजू के एटलियर (Manju's Atelier) के लिए एक सहायक ग्राहक सेवा बॉट हैं। आप उपयोगकर्ताओं को उनके ऑर्डर ट्रैक करने में मदद कर सकते हैं। हमेशा हिंदी में उत्तर दें और विनम्र रहें।";
    }

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
      model: 'gemini-3.5',
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
            model: 'gemini-3.5',
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
    res.status(500).json({ error: 'Failed to process chat message. Please ensure GEMINI_API_KEY is set in your .env file.' });
  }
};
