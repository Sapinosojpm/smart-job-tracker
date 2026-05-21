'use client';

import React from 'react';
import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ToastProvider() {
  return (
    <>
      <style>{`
        :root {
          --toastify-color-light: #ffffff;
          --toastify-color-dark: #1e293b;
          --toastify-color-success: #10b981;
          --toastify-color-warning: #f59e0b;
          --toastify-color-error: #ef4444;
          --toastify-color-info: #3b82f6;
          --toastify-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          --toastify-toast-width: 400px;
          --toastify-toast-min-height: 60px;
          --toastify-toast-max-height: 800px;
          --toastify-z-index: 9999;
        }
        .Toastify__toast {
          border-radius: 16px !important;
          box-shadow: 0 10px 40px -8px rgba(0,0,0,0.18), 0 2px 8px -2px rgba(0,0,0,0.08) !important;
          font-size: 13.5px !important;
          font-weight: 600 !important;
          padding: 14px 16px !important;
          border: 1px solid rgba(0,0,0,0.06) !important;
        }
        .Toastify__toast--success {
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%) !important;
          border-color: #bbf7d0 !important;
          color: #14532d !important;
        }
        .Toastify__toast--error {
          background: linear-gradient(135deg, #fff1f2 0%, #ffffff 100%) !important;
          border-color: #fecaca !important;
          color: #7f1d1d !important;
        }
        .Toastify__toast--warning {
          background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%) !important;
          border-color: #fde68a !important;
          color: #78350f !important;
        }
        .Toastify__toast--info {
          background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%) !important;
          border-color: #bfdbfe !important;
          color: #1e3a8a !important;
        }
        .Toastify__progress-bar--success { background: #10b981 !important; }
        .Toastify__progress-bar--error   { background: #ef4444 !important; }
        .Toastify__progress-bar--warning { background: #f59e0b !important; }
        .Toastify__progress-bar--info    { background: #3b82f6 !important; }
        .Toastify__toast-body { align-items: flex-start !important; gap: 10px !important; }
        .Toastify__close-button { opacity: 0.4 !important; align-self: center !important; }
        .Toastify__close-button:hover { opacity: 0.8 !important; }
        .Toastify__spinner { border-right-color: #3b82f6 !important; }
      `}</style>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
        className="z-[9999] !mt-3 !mr-3"
        toastClassName="!shadow-xl"
      />
    </>
  );
}
