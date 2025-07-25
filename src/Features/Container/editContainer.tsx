


"use client";
import React, { useState, useEffect } from 'react';
import { Container, ContainerProduct } from '@/types';
import { useUpdateContainerMutation, useGetContainerQuery } from '@/redux/api/auth/container/containerApi';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Loading from '@/redux/Shared/Loading';

const EditContainerPage = () => {
    const { id } = useParams();
    const router = useRouter();
    console.log('Param ID:', id); // Debug: Check the ID from URL
    const { data: containerData, isLoading, error, isSuccess } = useGetContainerQuery(id as string, { skip: !id });
    const [container, setContainer] = useState<Container>({
        _id: '',
        containerNumber: '',
        containerName: '',
        isDeleted: false,
        containerStatus: 'onTheWay',
        deliveryDate: '',
        shippingCost: 0,
        containerProducts: [],
        createdAt: '',
        updatedAt: '',
        __v: 0,
    });
    const [updateContainer, { isLoading: isUpdating }] = useUpdateContainerMutation();

    useEffect(() => {
        console.log('Container Data:', containerData); // Debug: Log the full response
        if (containerData?.data) {
            console.log('Fetched Container Data:', containerData.data); // Debug: Log the data
            setContainer(containerData.data); // Set the single Container object
        } else if (isSuccess && !containerData) {
            console.log('No data returned for ID:', id); // Debug: No data case
        }
    }, [containerData, id, isSuccess]);

    if (isLoading) return (
        <Loading title='Loading Container Edit data ........' />
    );
    if (error) {
        const errorMessage = error && 'data' in error && typeof error.data === 'object' && error.data !== null
            ? (error.data as { message?: string }).message || 'Unknown error'
            : 'Failed to load container data';
        return <div className="p-6 text-red-500">Error loading container data: {errorMessage}</div>;
    }
    if (!containerData?.data) return <div className="p-6 text-yellow-500">No container data found for ID: {id || 'undefined'}</div>;

    const handleContainerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setContainer((prev) => ({ ...prev, [name]: value }));
    };

    const handleProductChange = (id: string, field: keyof ContainerProduct, value: string | number) => {
        setContainer((prev) => ({
            ...prev,
            containerProducts: prev.containerProducts.map((prod) =>
                prod._id === id ? { ...prod, [field]: value } : prod
            ),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation for container fields
        if (!container.containerNumber || !container.containerName || !container.deliveryDate || !container.shippingCost) {
            toast.error('Please fill all container details.');
            return;
        }

        // Validate delivery date
        const deliveryDate = new Date(container.deliveryDate);
        // Compare with current date in Dhaka timezone (approximate)
        const now = new Date();
        // Convert 'now' to a string in 'YYYY-MM-DD' format to compare with container.deliveryDate as string
        const todayString = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Dhaka"})).toISOString().split('T')[0];

        if (isNaN(deliveryDate.getTime()) || container.deliveryDate < todayString) {
            toast.error('Please select a valid future delivery date.');
            return;
        }
        
        // Validate each product in the containerProducts array
        if (container.containerProducts.length === 0) {
            toast.error('Please add at least one product to the container.');
            return;
        }

        for (const product of container.containerProducts) {
            if (!product.category || !product.itemNumber || product.quantity <= 0 || product.purchasePrice <= 0 || product.salesPrice <= 0 || !product.packetSize) {
                toast.error(`Please ensure all details for product ${product.itemNumber || 'unknown'} are filled correctly.`);
                return;
            }
        }

        try {
            await updateContainer({
                id: container._id, data: {
                    containerNumber: container.containerNumber,
                    containerName: container.containerName,
                    containerStatus: container.containerStatus,
                    deliveryDate: container.deliveryDate,
                    shippingCost: Number(container.shippingCost),
                    containerProducts: container.containerProducts.map(prod => ({
                        ...prod,
                        quantity: Number(prod.quantity),
                        perCaseCost: Number(prod.perCaseCost),
                        purchasePrice: Number(prod.purchasePrice),
                        salesPrice: Number(prod.salesPrice)
                        // packetSize is already a string, no conversion needed
                    })),
                }
            }).unwrap();
            toast.success('Container updated successfully');
            router.push('/dashboard/container');
        } catch (error) {
            console.error('API Error:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toast.error(`Failed to update container: ${(error as any)?.data?.message || 'Unknown error'}`);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Edit Container</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Container Number</label>
                        <input
                            type="text"
                            name="containerNumber"
                            value={container.containerNumber || ''}
                            onChange={handleContainerChange}
                            className="border p-2 w-full rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Container Name</label>
                        <input
                            type="text"
                            name="containerName"
                            value={container.containerName || ''}
                            onChange={handleContainerChange}
                            className="border p-2 w-full rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Delivery Date</label>
                        <input
                            type="date"
                            name="deliveryDate"
                            value={container.deliveryDate || ''}
                            onChange={handleContainerChange}
                            className="border p-2 w-full rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Container Status</label>
                        <select
                            name="containerStatus"
                            value={container.containerStatus || 'onTheWay'}
                            onChange={handleContainerChange}
                            className="border p-2 w-full rounded"
                            required
                        >
                            <option value="onTheWay">On the Way</option>
                            <option value="arrived">Arrived</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Shipping Cost</label>
                        <input
                            type="number"
                            name="shippingCost"
                            value={container.shippingCost || 0}
                            onChange={handleContainerChange}
                            className="border p-2 w-full rounded"
                            required
                        />
                    </div>
                </div>

                {container.containerProducts.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-3">Container Products</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border p-2 text-left">Category</th>
                                        <th className="border p-2 text-left">Item Number</th>
                                        <th className="border p-2 text-left">Quantity</th>
                                        <th className="border p-2 text-left">Per Case Cost</th>
                                        <th className="border p-2 text-left">Sales Price</th>
                                        <th className="border p-2 text-left">Purchase Price</th>
                                        <th className="border p-2 text-left">Packet Size</th> {/* Added Packet Size column header */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {container.containerProducts.map((prod) => (
                                        <tr key={prod._id} className="border-t">
                                            <td className="border p-2">
                                                <input
                                                    type="text"
                                                    value={prod.category || ''}
                                                    onChange={(e) => handleProductChange(prod._id, 'category', e.target.value)}
                                                    className="border p-1 w-full rounded"
                                                    required // Keep required if it's always mandatory
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <input
                                                    type="text"
                                                    value={prod.itemNumber || ''}
                                                    onChange={(e) => handleProductChange(prod._id, 'itemNumber', e.target.value)}
                                                    className="border p-1 w-full rounded"
                                                    required
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <input
                                                    type="number"
                                                    value={prod.quantity || 0}
                                                    onChange={(e) => handleProductChange(prod._id, 'quantity', Number(e.target.value))}
                                                    className="border p-1 w-full rounded"
                                                    required
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <input
                                                    type="number"
                                                    value={prod.perCaseCost || ''}
                                                    onChange={(e) => handleProductChange(prod._id, 'perCaseCost', e.target.value ? Number(e.target.value) : 0)}
                                                    className="border p-1 w-full rounded"
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <input
                                                    type="number"
                                                    value={prod.salesPrice || 0}
                                                    onChange={(e) => handleProductChange(prod._id, 'salesPrice', Number(e.target.value))}
                                                    className="border p-1 w-full rounded"
                                                    required
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <input
                                                    type="number"
                                                    value={prod.purchasePrice || 0}
                                                    onChange={(e) => handleProductChange(prod._id, 'purchasePrice', Number(e.target.value))}
                                                    className="border p-1 w-full rounded"
                                                    required
                                                />
                                            </td>
                                            <td className="border p-2">
                                                <input
                                                    type="text"
                                                    value={prod.packetSize || ''}
                                                    onChange={(e) => handleProductChange(prod._id, 'packetSize', e.target.value)}
                                                    className="border p-1 w-full rounded"
                                                    required // Packet size is now a required field for products
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                <div className="mt-6 flex space-x-4">
                    <button
                        type="submit"
                        className="bg-red-500 hover:bg-red-600 text-white p-2 px-6 rounded-md transition duration-200"
                        disabled={isUpdating}
                    >
                        {isUpdating ? 'Updating...' : 'Update Container'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard/container")}
                        className="bg-gray-500 hover:bg-gray-600 text-white p-2 px-6 rounded-md transition duration-200">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditContainerPage;