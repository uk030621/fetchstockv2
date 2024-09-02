"use client";

import { useEffect, useState } from 'react';

export default function Home() {
    const [stocks, setStocks] = useState([]);
    const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
    const [newStock, setNewStock] = useState({ symbol: '', sharesHeld: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [editingSymbol, setEditingSymbol] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
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
    
            setStocks(updatedStocks);
            calculateTotalPortfolioValue(updatedStocks);
        } catch (error) {
            console.error('Error fetching data:', error);
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

            // Debugging: Log the new stock data being sent to the server
            console.log('Sending new stock data:', newStock);

            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStock)
            });

            if (response.ok) {
                setNewStock({ symbol: '', sharesHeld: 0 });
                setIsEditing(false);
                setEditingSymbol('');

                // Debugging: Log successful addition or update
                console.log(`${isEditing ? 'Updated' : 'Added'} stock successfully`);

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
                // Debugging: Log successful deletion
                console.log(`Deleted stock with symbol: ${symbol}`);

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

        // Debugging: Log the stock being edited
        console.log('Editing stock:', stock);
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1 className='heading'>FTSE Stock Portfolio</h1>
            <h2 className="sub-heading" style={{ marginTop: '20px' }}>Total Value: £{totalPortfolioValue}</h2>
            
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
             <button className='inputs' onClick={addOrUpdateStock}>{isEditing ? 'Update Stock' : 'Add Stock'}</button>
                {isEditing && <button className='inputs' onClick={() => {
                    setIsEditing(false);
                    setNewStock({ symbol: '', sharesHeld: 0 });
                }}>Cancel</button>}

                <button className='inputs' onClick={fetchData}>Refresh Data</button>
            </div>

            {/* Stock Table */}
            <table style={{ margin: '0 auto', borderCollapse: 'collapse', width: '80%' }}>
                <thead className='table-heading'>
                    <tr>
                        <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2' }}>Stock Symbol</th>
                        <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2' }}>Price per share (£)</th>
                        <th style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f2f2f2' }}>Shares held</th>
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
        </div>
    );
}
