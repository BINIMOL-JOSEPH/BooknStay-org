import { useParams } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { hotelService, } from '../../HotelService';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

const InvoiceDownload =() =>{
    const { id } = useParams();
    
    const [error,setError] = useState("")
    const [pdfSrc, setPdfSrc] = useState("");

    useEffect(() =>{
        DownloadInvoice()

    },[])

    const DownloadInvoice = async () => {
        try {
            const response = await hotelService.DownloadPaymentInvoice(String(id));
            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            setPdfSrc(fileURL);
        } catch (error) {
            setError("Unable to download the invoice")
        }
    };

    return(
        <Box
      sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', 
         width: '100%', backgroundColor: '#F8F8F8', height: '100%'
      }}
    >
        {pdfSrc && (
          <iframe title="Invoice" src={pdfSrc} width="100%" height="815px" data-testid='invoice-preview'
          style={{ border: 'none' }}>
          </iframe>
        )}
        {error && (
           
        <Alert severity="info" sx={{mt : 3, ml : 3, mr : 1, width : '95%'}}>{error}</Alert>
        )}
        </Box>

    );


}

export default InvoiceDownload;