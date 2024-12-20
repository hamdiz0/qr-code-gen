'use client';

import { useState } from 'react';
import axios from 'axios';
import Head from 'next/head';

export default function Home() {
  const [url, setUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/generate-qr/?url=${encodeURIComponent(url)}`, null, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const blob = new Blob([response.data], { type: 'image/png' });
      const qrCodeImageUrl = URL.createObjectURL(blob);
      setQrCodeUrl(qrCodeImageUrl);
    } catch (error) {
      console.error('Error generating QR Code:', error);
    }
  };

  return (
  <>
    <head>
        <title>QR Code Generator</title> {/* Page Title */}
    </head>
  
    <div style={styles.container}>
      <h1 style={styles.title}>QR Generator</h1>
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
      {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} />}
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
    textAlign: 'left',
    position: 'absolute',
    top: '0',
    width: '100%',
    backgroundColor: '#00ab00',
    color: '#1e1e1e',
    padding: '5px'
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
    color: '#121212'
  },
  button: {
    padding: '10px 20px',
    marginTop: '20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#00ab00',
    color: '#1e1e1e',
    cursor: 'pointer',
    fontSize: '20px'
  },
  qrCode: {
    marginTop: '20px',
    maxWidth: '100%', // Ensure the image is responsive
  },
};
