import React, { useEffect, useState } from "react";
import { Route, useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabase";


const Sales = () => {
    const naviagate = useNavigate();

    const [formData, setFormData] = useState ({
        patient: '',
        branch_id:'',
        date:'',
        frame:'',
        lens:'',
        delivery_time:'',
        days:'',
        p_frame:0,
        p_lens:0,
        price:0,
        tota:0,
        credit:0,
        balance:0,
        payment_in:0,
        message:''
    });

    const [sales, setSales] = useState([]);
        
    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        const {data, error} = await supabase.from('sales').select('id, patient');
        if (error) console.error('Error fetching sales:', error);
        else setSales(data);
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        const { data, error } = await supabase.from('sales').insert([formData]);
        if (error) console.error('Error al registar venta:', error);
        else console.log('Venta registrada:', data);
    };

    const handleReset = () => {
        setFormData({
            patient:'',
            branch_id:'',
            date:'',
            frame:'',
            lens:'',
            delivery_time:'',
            days:'',
            p_frame:0,
            p_lens:0,
            price:0,
            tota:0,
            credit:0,
            balance:0,
            payment_in:0,
            message:''
        });
    };
    const handleNavigate = (route) => navigate(route);
    
}