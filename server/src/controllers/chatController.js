import Groq from 'groq-sdk';
import { getOrderStatus } from '../services/orderService.js';

export const handleChat = async (req, res, next) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('Server missing GROQ_API_KEY');
      return res.status(500).json({ error: 'Server configuration error: API key missing.' });
    }
    const groq = new Groq({ apiKey });

    const { message, history } = req.body;
    
    const systemInstruction = `You are ManjuBot, the official customer support AI for Manju's Atelier.
Your ONLY source of truth for store policies are the following rules. DO NOT hallucinate standard e-commerce policies.
1. PAYMENTS: We ONLY accept UPI payments with manual UTR validation. We do NOT accept credit cards, debit cards, PayPal, Cash on Delivery (COD), or any other methods.
2. RETURNS/EXCHANGES: Customers have exactly 7 days post-delivery to request a return or exchange via their account dashboard. Custom/personalized items CANNOT be returned.
3. BEHAVIOR: Answer the user's question directly, concisely, and naturally. DO NOT append robotic, repetitive questions at the end of every response (e.g., do not constantly ask if they want to track an order unless it flows naturally in the conversation).

If the user asks a question about an order, you have a tool to look up their order status by Order ID.`;

    const tools = [{
      type: 'function',
      function: {
        name: 'get_order_status',
        description: 'Get the current status of an order using the order ID.',
        parameters: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              description: 'The ID of the order to track (e.g., 1001)',
            },
          },
          required: ['orderId'],
        },
      }
    }];

    // Format history for Groq (OpenAI compatible)
    const messages = [
      { role: 'system', content: systemInstruction },
      ...(history || []).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    const response = await groq.chat.completions.create({
      model: 'gpt-oss-20b',
      messages: messages,
      tools: tools,
      tool_choice: 'auto',
      temperature: 0.2
    });

    const responseMessage = response.choices[0].message;
    let finalResponseText = responseMessage.content || "";

    // Check if a tool was called
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
       const toolCall = responseMessage.tool_calls[0];
       if (toolCall.function.name === 'get_order_status') {
         const args = JSON.parse(toolCall.function.arguments);
         const orderData = await getOrderStatus(args.orderId);
         
         const followupMessages = [
            ...messages,
            responseMessage,
            {
               role: 'tool',
               tool_call_id: toolCall.id,
               name: toolCall.function.name,
               content: JSON.stringify(orderData ? orderData : { error: "Order not found" })
            }
         ];

         const followupResponse = await groq.chat.completions.create({
            model: 'gpt-oss-20b',
            messages: followupMessages,
            tools: tools,
            temperature: 0.2
         });
         
         finalResponseText = followupResponse.choices[0].message.content;
       }
    }

    res.status(200).json({ text: finalResponseText });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process chat message.' });
  }
};
