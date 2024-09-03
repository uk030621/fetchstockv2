"use client";

import { useEffect, useState } from 'react';

export default function Home() {
    const [stocks, setStocks] = useState([]);
    const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
    const [newStock, setNewStock] = useState({ symbol: '', sharesHeld: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [editingSymbol, setEditingSymbol] = useState('');
    const [isLoading, setIsLoading] = useState(true); // Loading state

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true); // Show loading message
        try {
            const response = await fetch('/api/stock');
            const data = await response.json();
    
            const updatedStocks = await Promise.all(
                data.map(async (stock) => {
                    const priceResponse = await fetch(`/api/stock?symbol=${stock.symbol}`);
                    const priceData = await priceResponse.json();
    
                    const pricePerShare = parseFloat(priceData.pricePerShare);
                    const totalValue = pricePerShare * stock.sharesHeld;
    
                    return {
                        ...stock,
                        pricePerShare: pricePerShare.toLocaleString('en-GB', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }),
                        totalValue: isNaN(totalValue)
                            ? '0.00'
                            : totalValue.toLocaleString('en-GB', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            })
                    };
                })
            );
    
            // Sort the updatedStocks array by totalValue from high to low
            updatedStocks.sort((a, b) => {
                const totalValueA = parseFloat(a.totalValue.replace(/,/g, ''));
                const totalValueB = parseFloat(b.totalValue.replace(/,/g, ''));
                return totalValueB - totalValueA; // Sort high to low
            });
    
            setStocks(updatedStocks);
            calculateTotalPortfolioValue(updatedStocks);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false); // Hide loading message
        }
    };
    

    const calculateTotalPortfolioValue = (stocks) => {
        const totalValue = stocks.reduce((acc, stock) => acc + parseFloat(stock.totalValue.replace(/,/g, '')), 0);
        setTotalPortfolioValue(totalValue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 }));
    };

    const addOrUpdateStock = async () => {
        try {
            const method = isEditing ? 'PUT' : 'POST';
            const endpoint = isEditing ? `/api/stock?symbol=${editingSymbol}` : '/api/stock';

            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStock)
            });

            if (response.ok) {
                setNewStock({ symbol: '', sharesHeld: 0 });
                setIsEditing(false);
                setEditingSymbol('');
                fetchData();
            } else {
                console.error(`Failed to ${isEditing ? 'update' : 'add'} stock`);
            }
        } catch (error) {
            console.error(`Error ${isEditing ? 'updating' : 'adding'} stock:`, error);
        }
    };

    const deleteStock = async (symbol) => {
        try {
            const response = await fetch('/api/stock', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol })
            });

            if (response.ok) {
                fetchData();
            } else {
                console.error(`Failed to delete stock with symbol: ${symbol}`);
            }
        } catch (error) {
            console.error('Error deleting stock:', error);
        }
    };

    const startEditing = (stock) => {
        setIsEditing(true);
        setNewStock({ symbol: stock.symbol, sharesHeld: stock.sharesHeld });
        setEditingSymbol(stock.symbol);
    };

    return (
        
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
           {/* <a className='hyperlink1' href="https://uk.finance.yahoo.com/lookup" onClick="window.close()" rel="noopener noreferrer"style={{ color: 'black' }}>Stock symbol lookup</a>*/}
            <a className='hyperlink1' href="https://uk.finance.yahoo.com/lookup" target="_blank" rel="noopener noreferrer" style={{ color: 'black' }}>Stock symbol lookup</a>
            <h1 className='heading'>FTSE Stock Portfolio</h1>
            <h2 className="sub-heading" style={{ marginTop: '20px' }}>Total Value: <span className='total-value'>£{totalPortfolioValue}</span></h2>
            
            {/* Add or Update Stock Form */}
            <div>
                <input className='inputs'
                    type="text"
                    placeholder="Stock Symbol"
                    value={newStock.symbol}
                    onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() })}
                    disabled={isEditing} // Disable symbol input while editing
                />
                <input
                    className="inputs"
                    type="number"
                    placeholder="Shares Held"
                    value={newStock.sharesHeld}
                    onChange={(e) => setNewStock({ ...newStock, sharesHeld: Number(e.target.value) })}
                    onFocus={(e) => {
                        if (e.target.value === '0') {
                            setNewStock({ ...newStock, sharesHeld: '' });
                        }
                    }}
                />
            </div>

            {/* Buttons */}
            <div style={{ margin: '20px' }}>
                <button className='input-stock-button' onClick={addOrUpdateStock}>{isEditing ? 'Update Stock' : 'Add Stock'}</button>
                {isEditing && <button className='input-stock-button' onClick={() => {
                    setIsEditing(false);
                    setNewStock({ symbol: '', sharesHeld: 0 });
                }}>Cancel</button>}
                <button className='input-stock-button' onClick={fetchData}>Refresh Data</button>
            </div>

            {/* Stock Table */}
            {isLoading ? (
                <p>Loading...</p> // Show loading message while fetching data
            ) : (
                <table style={{ margin: '0 auto', borderCollapse: 'collapse', width: '80%' }}>
                    <thead className='table-heading'>
                        <tr>
                            <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2' }}>Stock Symbol</th>
                            <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2' }}>Share price (£)</th>
                            <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2' }}>Share holding (n)</th>
                            <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2' }}>Total value (£)</th>
                            <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map(stock => (
                            <tr key={stock.symbol}>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{stock.symbol}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{stock.pricePerShare}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{stock.sharesHeld}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{stock.totalValue}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>
                                    <button className="edit-button" onClick={() => startEditing(stock)}>Edit</button>
                                    <button className="delete-button" onClick={() => deleteStock(stock.symbol)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
