'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [url, setUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false); // track loading state

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);                         // start loading spinner
      setQrCodeUrl('');                         // clear previous QR code

      const useInternalRoute = process.env.NEXT_PUBLIC_USE_INTERNAL_ROUTE; // Switch between internal and external routing
      const apiUrl = useInternalRoute
        ? '/api/generate-qr'                                                // Internal route handled by Next.js
        : `${process.env.NEXT_PUBLIC_EXTERNAL_API}/generate-qr`;            // External route from environment variable

      if (!apiUrl) {
        throw new Error('API URL is not configured');
      }

      const response = await axios.post(`${apiUrl}?url=${encodeURIComponent(url)}`, null, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const blob = new Blob([response.data], { type: 'image/png' });
      const qrCodeImageUrl = URL.createObjectURL(blob);
      setQrCodeUrl(qrCodeImageUrl);
    } catch (error) {
      console.error('Error generating QR Code:', error);
    } finally {
      setLoading(false); // stop loading spinner
    }
  };

  return (
    <>
      <head>
        <title>QR Code Generator</title> {/* Page Title */}
      </head>
    
      <div style={styles.container}>
        <h1 style={styles.title}>QR Code Generator</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL like https://example.com"
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Generate</button>
        </form>
        <div style={styles.qrCodeContainer}>
          {loading && <div className="spinner" style={styles.spinner}></div>} {/* Show spinner */}
          {qrCodeUrl && !loading && <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} />} {/* Show QR code */}
        </div>
      </div>
    </>
  );
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1e1e',
    color: 'white',
  },
  title: {
    margin: '0',
    lineHeight: '1.15',
    fontSize: '3rem',
    textAlign: 'center',
    position: 'absolute',
    top: '0',
    width: '100%',
    backgroundColor: '#00ab00',
    color: '#1e1e1e',
    padding: '5px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: 'none',
    marginTop: '20px',
    width: '300px',
    color: '#121212',
  },
  button: {
    padding: '10px 20px',
    marginTop: '20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#00ab00',
    color: '#1e1e1e',
    cursor: 'pointer',
    fontSize: '20px',
  },
  qrCodeContainer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    width: '200px',
  },
  qrCode: {
    maxWidth: '100%', // Ensure the image is responsive
    maxHeight: '100%',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '6px solid #1e1e1e',
    borderTop: '6px solid #00ab00',
    borderRadius: '50%',
    backgroundColor: 'tansparent',
    animation: 'spin 1s linear infinite',
  },
};

// Add spinner animation
const spinnerStyle = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

export const globalStyles = () => (
  <style>
    {spinnerStyle}
  </style>
);
