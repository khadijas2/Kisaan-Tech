// src/pages/Finance.jsx

import React, { useState, useEffect } from 'react';
import {
    getTransactions,
    addTransaction,
    deleteTransaction,
    getBudget,
    setBudget
} from '../api/finance';

export default function Finance() {
    const [txs, setTxs] = useState([]);
    const [bud, setBud] = useState({ plannedIncome: 0, plannedExpense: 0 });
    const [form, setForm] = useState({
        type: 'expense',
        category: '',
        amount: '',
        notes: ''
    });

    // Load on mount
    useEffect(() => {
        refresh();
    }, []);

    const refresh = () => {
        getTransactions().then(r => setTxs(r.data));
        getBudget().then(r => setBud(r.data));
    };

    const handleTxSubmit = async e => {
        e.preventDefault();
        await addTransaction({ ...form, amount: Number(form.amount) });
        setForm({ type: 'expense', category: '', amount: '', notes: '' });
        refresh();
    };

    const handleBudgetChange = async e => {
        e.preventDefault();
        await setBudget({
            plannedIncome: bud.plannedIncome,
            plannedExpense: bud.plannedExpense
        });
        refresh();
    };

    // Calculate running totals
    const totalIncome = txs
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = txs
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    // Remaining budget = plannedExpense - actualExpense
    const actualExpense = totalExpense;
    const remaining = bud.plannedExpense - actualExpense;

    return (
        <div className="p-6 space-y-6">
            {/* ── Budget Summary Cards ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded shadow">
                    <h4 className="text-sm font-medium">Planned Income</h4>
                    <p className="text-2xl">{bud.plannedIncome} Rs</p>
                </div>
                <div className="p-4 bg-red-50 rounded shadow">
                    <h4 className="text-sm font-medium">Planned Expense</h4>
                    <p className="text-2xl">{bud.plannedExpense} Rs</p>
                </div>
                <div
                    className={`p-4 rounded shadow ${remaining < 0 ? 'bg-red-100' : 'bg-blue-50'
                        }`}
                >
                    <h4 className="text-sm font-medium">Remaining Budget</h4>
                    <p className="text-2xl">{remaining} Rs</p>
                </div>
            </div>

            {/* ── Current Totals ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-green-100 rounded shadow">
                    <h4 className="text-sm font-medium">Current Income</h4>
                    <p className="text-2xl">{totalIncome} Rs</p>
                </div>
                <div className="p-4 bg-red-100 rounded shadow">
                    <h4 className="text-sm font-medium">Current Expense</h4>
                    <p className="text-2xl">{totalExpense} Rs</p>
                </div>
            </div>

            {/* ── Budget Form ──────────────────────────────────────────────── */}
            <form onSubmit={handleBudgetChange} className="flex space-x-4 items-end">
                <div>
                    <div className="p-2 bg-blue-100 rounded shadow">
                        <h1 className='text-xl'>Input Planned Budget</h1>
                    </div>
                    <label className="block text-sm">Income</label>
                    <input
                        type="number"
                        value={bud.plannedIncome}
                        onChange={e =>
                            setBud(b => ({ ...b, plannedIncome: Number(e.target.value) }))
                        }
                        className="border rounded px-2 py-1 w-32"
                    />
                </div>
                <div>
                    <label className="block text-sm">Expense</label>
                    <input
                        type="number"
                        value={bud.plannedExpense}
                        onChange={e =>
                            setBud(b => ({ ...b, plannedExpense: Number(e.target.value) }))
                        }
                        className="border rounded px-2 py-1 w-32"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    Save Budget
                </button>
            </form>

            {/* ── Transaction Table ───────────────────────────────────────── */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 mt-6">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Date', 'Type', 'Category', 'Amount', 'Notes', 'Actions'].map(
                                hdr => (
                                    <th
                                        key={hdr}
                                        className="px-4 py-2 text-left text-sm font-medium text-gray-600"
                                    >
                                        {hdr}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {txs.map(tx => (
                            <tr key={tx._id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm">
                                    {new Date(tx.date).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 text-sm">{tx.type}</td>
                                <td className="px-4 py-2 text-sm">{tx.category}</td>
                                <td className="px-4 py-2 text-sm">{tx.amount} Rs</td>
                                <td className="px-4 py-2 text-sm">{tx.notes}</td>
                                <td className="px-4 py-2 text-sm space-x-2">
                                    <button
                                        onClick={() => {
                                            /* TODO: open edit form */
                                        }}
                                        className="text-indigo-600 hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteTransaction(tx._id).then(refresh)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Add Transaction Form ────────────────────────────────────── */}
            <form
                onSubmit={handleTxSubmit}
                className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4"
            >
                <select
                    value={form.type}
                    onChange={e =>
                        setForm(f => ({ ...f, type: e.target.value }))
                    }
                    className="border rounded px-2 py-1"
                >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
                <input
                    type="text"
                    placeholder="Category"
                    value={form.category}
                    onChange={e =>
                        setForm(f => ({ ...f, category: e.target.value }))
                    }
                    className="border rounded px-2 py-1"
                    required
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={e =>
                        setForm(f => ({ ...f, amount: e.target.value }))
                    }
                    className="border rounded px-2 py-1"
                    required
                />
                <input
                    type="text"
                    placeholder="Notes"
                    value={form.notes}
                    onChange={e =>
                        setForm(f => ({ ...f, notes: e.target.value }))
                    }
                    className="border rounded px-2 py-1"
                />
                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Add
                </button>
            </form>
        </div>
    );
}