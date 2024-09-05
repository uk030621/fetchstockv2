// app/page.js
'use client'; // This is a client component since we are using form and state
import Link from 'next/link';
import { useState } from 'react';
import axios from 'axios';

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('GBP');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState(null);

  const handleConvert = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/convert', {
        amount,
        fromCurrency,
        toCurrency,
      });
      setResult(response.data.result);
    } catch (error) {
      console.error("Error fetching the conversion rate:", error);
      setResult("Error occurred.");
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '15px' }}>
      <Link className="home-link" href = "/">Home</Link>
      <h1 className='currency-converter-heading'>Currency Converter</h1>
      <form onSubmit={handleConvert}>
        <input className='currency-input'
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="Amount" 
          required 
        />
        <select className='selector'
          value={fromCurrency} 
          onChange={(e) => setFromCurrency(e.target.value)}
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          {/* Add more currencies if needed */}
        </select>
        <select className='selector'
          value={toCurrency} 
          onChange={(e) => setToCurrency(e.target.value)}
        >
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
          <option value="GBP">GBP</option>
          {/* Add more currencies if needed */}
        </select>
        <button className='convert-button' type="submit">Convert</button>
      </form>

      {result && (
        <h2 className='result'>{amount} {fromCurrency} = {result} {toCurrency}</h2>
      )}
    </div>
  );
}
