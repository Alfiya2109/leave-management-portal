import React, { useState, useEffect } from 'react';

const LeaveTypeForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        max_days_per_year: '',
        requires_document: false
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                max_days_per_year: initialData.max_days_per_year || '',
                requires_document: initialData.requires_document || false
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Leave Type Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    placeholder="e.g., Sick Leave"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Max Days Per Year</label>
                <input
                    type="number"
                    name="max_days_per_year"
                    value={formData.max_days_per_year}
                    onChange={handleChange}
                    required
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    placeholder="e.g., 10"
                />
            </div>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    name="requires_document"
                    checked={formData.requires_document}
                    onChange={handleChange}
                    id="requires_document"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="requires_document" className="ml-2 block text-sm text-gray-900">
                    Requires Document Proof
                </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {initialData ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    );
};

export default LeaveTypeForm;
