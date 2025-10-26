import { FunctionDeclaration, Type } from "@google/genai";

// ------------------ Tool Function Implementations ------------------

// Mock function to get weather
function getWeather(location: string): object {
  if (location.toLowerCase().includes("tokyo")) {
    return { location: "Tokyo", temperature: "15°C", condition: "Cloudy" };
  } else if (location.toLowerCase().includes("san francisco")) {
    return { location: "San Francisco", temperature: "22°C", condition: "Sunny" };
  } else {
    return { location, temperature: "20°C", condition: "Clear" };
  }
}

// Mock function to get order status
function getOrderStatus(orderId: string): object {
  const orderIdNumber = parseInt(orderId, 10);
  if (isNaN(orderIdNumber)) {
     return { orderId, status: "Invalid Order ID format" };
  }
  if (orderIdNumber > 500) {
      return { orderId, status: "Shipped" };
  } else {
      return { orderId, status: "Processing" };
  }
}

// ------------------ Tool Definitions and Mappings ------------------

// Mapping of function names to their implementations
export const toolImplementations: { [key: string]: (...args: any[]) => any } = {
  getWeather,
  getOrderStatus,
};

// Gemini function declarations
export const functionDeclarations: FunctionDeclaration[] = [
  {
    name: "getWeather",
    description: "Get the current weather in a given location",
    parameters: {
      type: Type.OBJECT,
      properties: {
        location: {
          type: Type.STRING,
          description: "The city and state, e.g. San Francisco, CA",
        },
      },
      required: ["location"],
    },
  },
  {
    name: "getOrderStatus",
    description: "Get the status of a customer order",
    parameters: {
      type: Type.OBJECT,
      properties: {
        orderId: {
          type: Type.STRING,
          description: "The ID of the order to check.",
        },
      },
      required: ["orderId"],
    },
  },
];