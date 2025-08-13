import React from 'react';
import { useForm, usePage, Head } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

export default function TransactionTypes() {
    const { types } = usePage().props;
    const [editId, setEditId] = React.useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    React.useEffect(() => {
        if (editId) {
            const type = types.data.find(t => t.id === editId);
            if (type) {
                setData({ name: type.name, description: type.description || '' });
            }
        } else {
            reset();
        }
    }, [editId]);

    function handleSubmit(e) {
        e.preventDefault();
        if (editId) {
            put(route('transaction-types.update', editId), {
                onSuccess: () => { setEditId(null); reset(); },
            });
        } else {
            post(route('transaction-types.store'), { onSuccess: reset });
        }
    }

    function handleEdit(id) {
        setEditId(id);
    }

    function handleDelete(id) {
        destroy(route('transaction-types.destroy', id));
    }

    return (
        <AppLayout>
            <Head title="Transaction Types" />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-4">Transaction Types</h1>
                <form onSubmit={handleSubmit} className="mb-6 space-y-2">
                    <Input
                        placeholder="Name"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                    />
                    <Input
                        placeholder="Description"
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                    />
                    <div className="space-x-2">
                        <Button type="submit" disabled={processing}>
                            {editId ? 'Update' : 'Create'}
                        </Button>
                        {editId && (
                            <Button type="button" variant="outline" onClick={() => setEditId(null)}>
                                Cancel
                            </Button>
                        )}
                    </div>
                    {errors.name && <div className="text-red-500">{errors.name}</div>}
                </form>
                <table className="w-full border">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1">Name</th>
                            <th className="border px-2 py-1">Description</th>
                            <th className="border px-2 py-1">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {types?.data?.map(type => (
                            <tr key={type.id}>
                                <td className="border px-2 py-1">{type.name}</td>
                                <td className="border px-2 py-1">{type.description}</td>
                                <td className="border px-2 py-1 space-x-2">
                                    <Button size="sm" onClick={() => handleEdit(type.id)}>Edit</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(type.id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
