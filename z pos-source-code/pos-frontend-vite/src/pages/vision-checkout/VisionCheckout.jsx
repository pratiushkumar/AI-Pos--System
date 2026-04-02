import React, { useState, useEffect } from 'react';

import api from '../../utils/api';

const VisionCheckout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Connect to the Python Vision Server
    const visionUrl = import.meta.env.VITE_VISION_WS_URL || 'ws://localhost:8080';
    const ws = new WebSocket(visionUrl);

    ws.onopen = () => {
      setConnectionStatus('Connected to AI-POS Vision System');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === 'ADD_ITEM') {
          setCartItems((prevItems) => {
            // Check if item already exists to avoid duplicates
            const exists = prevItems.find((i) => i.sku === data.sku);
            if (exists) {
              return prevItems.map((i) =>
                i.sku === data.sku ? { ...i, qty: i.qty + 1 } : i
              );
            } else {
              // We'll give it a random mock price for the demo
              const price = (Math.random() * 10 + 2).toFixed(2);
              return [...prevItems, { ...data, qty: 1, price }];
            }
          });
        }
      } catch (e) {
        console.error("Error parsing WebSocket message: ", e);
      }
    };

    ws.onclose = () => {
      setConnectionStatus('Disconnected. Ensure Python server is running.');
    };

    ws.onerror = (error) => {
      setConnectionStatus('Connection Error.');
    };

    return () => {
      ws.close();
    };
  }, []);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      // Constructing standard payment payload
      const payload = {
        storeId: 1, // Dynamic in full prod
        subscriptionId: 1, // Fallback placeholder
        gateway: 'CASHFREE',
        amount: parseFloat(total.toFixed(2)),
        description: `POS Vision Checkout - ${cartItems.length} items`
      };

      const response = await api.post('/api/payments/initiate', payload);
      
      if (response.data && response.data.checkoutUrl) {
        // Option 1: Redirect to checkout URL for proper deduction and store settlement
        window.location.href = response.data.checkoutUrl;
      } else {
        alert("Payment initiated successfully but no redirect URL provided.");
        setCartItems([]); // clear cart
      }
    } catch (error) {
      console.error("Payment failed", error);
      alert("Payment failed: " + (error.response?.data?.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Camera/Status Info */}
        <div className="w-full md:w-5/12 p-10 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 text-white flex flex-col justify-center items-center text-center">
          <div className="mb-8">
            <svg className="w-24 h-24 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Vision Checkout</h2>
          <p className="text-purple-200 mb-8 leading-relaxed">
            Place your items on the checkout counter. Our Computer Vision AI will automatically detect and ring them up. No barcode scanner required.
          </p>
          <div className="px-5 py-3 bg-black/40 rounded-full text-sm font-medium flex items-center gap-3 backdrop-blur-md">
            <span className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${connectionStatus.includes('Connected') ? 'bg-green-400 text-green-400 animate-pulse' : 'bg-red-500 text-red-500'}`}></span>
            {connectionStatus}
          </div>
        </div>

        {/* Right Side: Virtual Cart */}
        <div className="w-full md:w-7/12 p-10 flex flex-col bg-white">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 flex justify-between items-end">
            Current Order
            <span className="text-sm font-normal text-gray-500">{cartItems.length} Items</span>
          </h3>
          
          <div className="flex-1 overflow-y-auto mb-8 min-h-[300px]">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p>Waiting for items to be scanned...</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {cartItems.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-gray-50 p-5 rounded-2xl shadow-sm border border-gray-100/50">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{item.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-medium">{item.sku}</span>
                        <span className="text-xs text-gray-400">AI Conf: {(item.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-xl">${item.price}</p>
                      <p className="text-sm text-gray-500 font-medium">Qty: {item.qty}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 font-semibold text-lg">Total Amount</span>
              <span className="text-4xl font-black text-gray-900">${total.toFixed(2)}</span>
            </div>
            <button 
              onClick={handlePayment}
              disabled={cartItems.length === 0 || isProcessing}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center ${
                cartItems.length > 0 && !isProcessing
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : ''}
              {isProcessing ? 'Processing Payment...' : 'Complete Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionCheckout;
