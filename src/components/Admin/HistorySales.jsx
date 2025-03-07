import { Box, useToast } from "@chakra-ui/react";
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabase";

const HistorySales = () => {
    const [sales, setSales] = useState([]);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editableData, setEditableData] = useState(null);
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        const { data, error } = await supabase
            .from('sales')
            .select('*');
        if (error) {
            toast({ title: 'Error', description: 'Error al obtener las ventas', status: 'error' });
        } else {
            setSales(data);
        }
    };

    const handleEdit = (sale) => {
        setEditingId(sale.id);
        setEditableData(sale);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditableData((prev) => ({ ...prev, [name]: value }));
    };
     const handleSave = async (id) => {
        const { error } = await supabase.from('sales').update(editableData).match({ id });
        if (!error) {
            toast({ title: 'Éxito', description: 'Venta actualizada correctamente.', status: 'success' });
            setEditingId(null);
            fetchSales();
        } else {
            toast({ title: 'Error', description: 'No se pudo actualizar la venta.', status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('sales').delete().match({ id });
        if (!error) {
            toast({ title: 'Éxito', description: 'Venta eliminada correctamente.', status: 'success' });
            fetchSales();
        } else {
            toast({ title: 'Error', description: 'No se pudo eliminar la venta.', status: 'error' });
        }
    };

    const filteredSales = sales.filter((sale) => 
        sales.patients.pt_firstname.toLowerCase().includes(search.toLowerCase()) ||
        sales.patients.pt_lastname.toLowerCase().includes(search.toLowerCase())
    );

    const handleNavigate = (route = null) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (route) {
            navigate(route);
            return;
        }
        if (!user || !user.role_id) {
            navigate('/LoginForm');
            return;
        }
        switch (user.role_id) {
            case 1:
                navigate('/Admin');
                break;
            case 2:
                navigate('/Optometra');
                break;
            case 3:
                navigate('/Vendedor');
                break;
            default:
                navigate('/');
        }
    };

    return (
        <Box>
            
        </Box>
    )

}