import React,{useEffect, useState} from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { hotelService } from "../../HotelService";
import NavigationBar from "../NavigationBar/NavigationBar";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CollapsibleSidebar from "../Sidebar/Sidebar";
import ReactDOM from 'react-dom';
import ErrorPage from "./ErrorPage";
import NoActiveHotelsFound from "./NoActiveHotelsFound";

const defaultTheme = createTheme();

const SelectHotels = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
	const [errorMessage, setErrorMessage] = useState("");
    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [formError, setFormError] = useState("")
    const [formValid, setFormValid] = useState(false);
    const [formData,setFormData] = useState({location:''})
    const inputs={location: formData.location,
        check_in_date:checkInDate,check_out_date:checkOutDate}
    const [selectedSort, setSelectedSort] = useState('');
    const [open, setOpen] = useState(true);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchActiveHotelData();
    }, [])

    const setDefaultDate = async() =>{
        const date = new Date();
        date.setDate(date.getDate() + 1);
        const defaultCheckIn = date.toISOString().split('T')[0];
        date.setDate(date.getDate() + 1);
        const defaultCheckOut = date.toISOString().split('T')[0];
        setCheckInDate(defaultCheckIn);
        setCheckOutDate(defaultCheckOut);
    }
    useEffect(() => {
        setDefaultDate();
    },[setCheckInDate, setCheckOutDate]);

    const fetchActiveHotelData = async () =>{
        setOpen(true)
        setErrorMessage('')
        try{
            const response = await hotelService.FetchActiveHotel();  
            if (Array.isArray(response.data)) {
                setData(response.data);
                setErrorMessage("")
            }else{
                setErrorMessage("Data is not received in the correct format")
            }        
        }catch (error) {
            if (error.response) {
              setData([]);
              setFormError('');
              setErrorMessage(error.response.data.message);
            } else {
              setErrorMessage("");
              setFormError('');
              ReactDOM.render(<ErrorPage />, document.getElementById('root'));
            }
          }
        }
    const handleLocation = (e) => {
        const inputValue = e.target.value;
        
        setFormData((prevData) => ({
            ...prevData,
            location: inputValue,
          }));

    };

    const handleCheckInDateChange = (e) => {
        const inputValue = e.target.value;
        if(checkOutDate < inputValue){
            const selectedDate = new Date(inputValue);
            const nextDay = new Date(selectedDate);
            nextDay.setDate(selectedDate.getDate() + 1);
            setCheckOutDate(nextDay.toISOString().split('T')[0]);
        }
        setCheckInDate(inputValue);
        setFormError('');
    };

    const handleCheckOutDateChange = (e) => {
        const inputValue = e.target.value;
        if(inputValue < checkInDate ){
            const selectedDate = new Date(inputValue);
                const nextDay = new Date(selectedDate);
                nextDay.setDate(selectedDate.getDate() - 1);
                setCheckInDate(nextDay.toISOString().split('T')[0]);
        }
        setCheckOutDate(inputValue);
        setFormError('');
        
    };

    const handleSelectHotel =async ()=>{
        setOpen(true)
        setErrorMessage('')
        try{
            if(formValid){
                const response = await hotelService.FetchSelectedHotel(inputs)
                if (Array.isArray(response.data.hotel_data)) {
                    setData(response.data.hotel_data);
                    if (response.data.message != ''){
                        setErrorMessage(response.data.message)
                    }
                    setFormError('')
                }else{
                    setFormError('')
                    setErrorMessage("Data is not received in the correct format")
                } 
            }else{
                setFormError("Please provide preferences to filter best suited hotels")
                setTimeout(() => {
                    setFormError('');
                }, 3000);
            }
        }catch(error){
            if(error.response){
                setData([])
                setFormError('')
                setErrorMessage(error.response.data.message)			
            }
        }
    }
    const checkFormValidity = () => {
        setFormValid(
          formData.location.trim() !== '' &&
          checkInDate.trim() !== '' &&
          checkOutDate.trim() !== '' &&
          checkInDate < checkOutDate

        );
      };

      useEffect(() => {
        checkFormValidity();
      }, [
        formData.location,
        checkInDate,checkOutDate
      ]);

    const handleNavigation = async(hotel_Id) => {
        localStorage.setItem('hotel_id',hotel_Id)
        const queryParams = new URLSearchParams({
            checkInDate: checkInDate,
            checkOutDate: checkOutDate
        });
        navigate(`/view-selected-hotels/${hotel_Id}?${queryParams.toString()}`);
    };

    const handleSort = async(value) => {
        setSelectedSort(value);
        const input = {option: value}
        setOpen(true)
        try{
            const response = await hotelService.SortActiveHotel(input)
            if (Array.isArray(response.data)) {
                setData(response.data);
                setErrorMessage("")
            }else{
                setErrorMessage("Data is not received in the correct format")
            }        
        }catch (error) {
            if (error.response) {
              setData([]);
              setFormError('');
              setErrorMessage(error.response.data.message);
            } else {
              setErrorMessage("");
              setFormError('');
              ReactDOM.render(<ErrorPage />, document.getElementById('root'));
            }
          }

    };

    return (
        <>
        {user ? (<CollapsibleSidebar/>):(<NavigationBar/>)}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100%',
            width: '100%', backgroundColor: '#F8F8F8', mb: '3%'}}>
        <ThemeProvider theme={defaultTheme}>
            <Stack direction='column' sx={{ width: '100%',height:'40%', backgroundImage: "url('https://booknstay.innovaturelabs.com/hotel_image1.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat", alignItems: 'center'}}>

            <Typography variant="h1" component="h2" sx={{mt:'7%',justifyContent:'center',fontSize:50, fontWeight:'bold',color:'white'}}>Welcome to BookNStay...</Typography>
            <Typography variant="h5" component="div" sx={{mt:'1%',justifyContent:'center',fontSize:20,color:'white'}}>Make your choices</Typography>
        
            <Stack direction="row" spacing={2} sx={{justifyContent:'center',alignItems: 'center',width:'60%',minHeight:'10vh',mt:'10%',mb:'3%',bgcolor:'rgba(255, 255, 255, 0.8)'}}>
                <TextField id="Location" name="location" label="Location" autoFocus size="small" data-testid='location'
                    sx={{ mb: 2,ml:20, width: { sm: 200}}} value={formData.location} onChange={handleLocation}></TextField>
                <TextField type='date' name="check-in date" id="CheckinDate"  size = 'small' 
                    data-testid='check-in-date' label="Check In" value={checkInDate} 
                    onChange={handleCheckInDateChange}  sx={{ mb: 2,width: { sm: 200 } }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    inputProps={{
                        min: new Date().toISOString().split('T')[0],
                    }}
                />
                <TextField type='date' name="check-in date" id="CheckinDate"  size = 'small' 
                    data-testid='check-out-date' label="Check Out" value={checkOutDate} 
                    onChange={handleCheckOutDateChange} sx={{ mb: 2,width: { sm: 200 } }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    inputProps={{
                        min: new Date().toISOString().split('T')[0],
                    }}
                />
                <Button variant="contained" onClick={handleSelectHotel} data-testid='search'>Search</Button>
            </Stack>
        </Stack>
        <Stack direction='row' sx={{ width: '100%',height:'60px', alignItems: 'left',backgroundColor:'#CEE9E3'}} data-testid='sort-stack'>
            <Typography variant="h5" component="div" sx={{justifyContent:'center',fontSize:18,
                    fontWeight:'bold',color:'black',mt:'1.2%',ml:'20%',fontFamily:'sans-serif'}}>
                SORT BY:
            </Typography>
            <Typography variant="h5" component="div" data-testid='sort-rating' sx={{justifyContent:'center',fontSize:18,color: selectedSort === '1' ? '#07a5a1' : 'black',
                    mt:'1.2%',ml:'7%',fontFamily:'sans-serif',"&:hover": { cursor: 'pointer' }}} onClick={() => handleSort('1')}>
                <strong>User Rating</strong>(highest first)
            </Typography>
            <Typography variant="h5" component="div" data-testid='sort-price' sx={{justifyContent:'center',fontSize:18,color: selectedSort === '2' ? '#07a5a1' : 'black',
                    mt:'1.2%',ml:'7%',fontFamily:'sans-serif',"&:hover": { cursor: 'pointer' }}} onClick={() => handleSort('2')}>
                <strong>Price</strong>(highest first)
            </Typography>
            <Typography variant="h5" component="div" data-testid='sort-low-price' sx={{justifyContent:'center',fontSize:18,color: selectedSort === '3' ? '#07a5a1' : 'black',
                    mt:'1.2%',ml:'7%',fontFamily:'sans-serif',"&:hover": { cursor: 'pointer' }}} onClick={() => handleSort('3')}>
                <strong>Price</strong>(lowest first)
            </Typography>
        </Stack>
        {formError && <Stack sx={{ width: '70%', mt:5}} spacing={10}><Alert severity="info" sx={{mx: 'auto'}}>{formError}</Alert></Stack>}
        {data.length === 0  && <NoActiveHotelsFound />}

        {(errorMessage && open) && data.length >0 && <Stack sx={{ width: '70%', mt:5}} spacing={10}><Alert severity="info" sx={{mx: 'auto'}} onClose={() => setOpen(false)}>{errorMessage}</Alert></Stack>}
        {data.map((hotel,index) => (
        <Box key={hotel.index} sx={{ width: "90%", mt: '2%' }}>
        <Card 
            key={hotel.index} 
            onClick={() => handleNavigation(hotel.hotel_details.id)}
            sx={{  
                display: "flex", 
                ml : '2.5%', 
                mb : '-0.5%', 
                width: "95%", 
                position : 'relative', 
                borderRadius: 3, 
                overflow: 'hidden', 
                boxShadow: '1px 1px 10px rgba(0, 0, 0, 0.1)',
                "&:hover": {
                    outline: '2px solid #40A2E3',
                    cursor: 'pointer',
                    transform: 'scale(1.05)',
                    boxShadow: '0 13px 40px -5px hsla(240, 30.1%, 28%, 0.12), 0 8px 32px -8px hsla(0, 0%, 0%, 0.14), 0 -6px 32px -6px hsla(0, 0%, 0%, 0.02)',
                    width: "91%",
                    ml: '4.5%',
                },
            }} 
            data-testid='detail-card'
        >
        <CardMedia
            component="img"
            sx={{
                width: 350,
                height: 240,
                mt : '1%',
                ml : '1%',
                mb : '1%',
                borderRadius: 3, 
                overflow: 'hidden'
            }}
            image={hotel.hotel_image}
            alt="Hotel image"
        />
        <Divider orientation="vertical" variant="middle" flexItem />
        <Box sx={{ display: 'flex', flexDirection: 'column', width:'48%' }}>
            <CardContent sx={{ flex: '1 0 auto' }}>
                <Typography component="div" variant="h5" sx={{fontWeight : 'bold'}}>
                    {hotel.hotel_details.hotel_name}
                </Typography>
                <Typography variant="subtitle1"  component="div" sx={{fontWeight : 'bold', color: 'grey'}}>
                    {hotel.hotel_details.address}<br/>
                </Typography>
                <Typography variant="subtitle1" component="div">
                    {hotel.hotel_details.city} | {hotel.hotel_details.district} | {hotel.hotel_details.state}
                </Typography>
                <Typography variant="subtitle1" component="div" sx={{ mt : '2%', fontSize : 'medium', color : '#0D9276'}}>
                    {hotel.hotel_details.description?.split(',').map((part, index) => (
                        <div key={part.index}>✓ {part.trim()}</div>
                    ))}
                </Typography>
                <Typography variant="subtitle1"  component="div" style={{ fontSize: 'smaller' }}>
                <br/>Email id: {hotel.hotel_details.email}<br/>
                     contact: {hotel.hotel_details.phone_number}
                </Typography> 
            </CardContent>
        </Box>
        <Divider orientation="vertical" variant="middle" flexItem sx={{ backgroundColor: 'black', mr: '2%' }} />

        <Box  sx={{ display: 'flex', flexDirection: 'column', width: "20%", mt: 'auto', mr: '2%', mb: '0.5%', alignItems: 'flex-end', }}>
        {(hotel.average_rating>0) && (
            <Stack direction="column" sx={{ mt: '4%' }}>
                <Box
                    sx={{
                        backgroundColor: '#0B60B0',
                        color: 'white',
                        padding: '3px 20px', 
                        borderRadius: '4px',
                        display: 'inline-block',
                    }}
                >
                    <Typography component="div" sx={{ fontWeight: 'bold', fontSize: 'medium' }}>
                        {hotel.average_rating}
                    </Typography>
                </Box>
                <Typography component="div" variant="subtitle1" sx={{ color: 'grey', fontSize: 'small' }}>
                    ({hotel.rating_count} Ratings) 
                </Typography>
            </Stack>
        )}


            {hotel.lowest_rate && (
                <>
                    <Stack direction="row" sx={{ mt : '35%', mb : '-0.5%' }}>
                        <Typography  component="div" variant="h4" sx={{fontWeight : 'bold'}}>
                            {hotel.lowest_rate}
                        </Typography>
                        <Typography component="div" variant="subtitle1" sx={{ mt : '5%'}}>&nbsp; INR</Typography>
                    </Stack>
                    <Stack direction="column" sx={{ display: "flex",  alignItems: 'flex-end'}}>
                        <Typography component="div" variant="subtitle1" sx={{ color: "grey", fontSize: "small" }}>
                            ₹ {hotel.hotel_details.service_charge} service charges 
                        </Typography>
                        <Typography component="div" variant="subtitle1" sx={{ color: "grey", fontSize: "small" }}>
                            Per Night
                        </Typography>
                    </Stack>       
                </>
            )}
            <Typography variant="subtitle1" component="div" sx={{ color: '#39A7FF',fontSize: 'small', fontWeight: 'bold', alignSelf: 'flex-end' }}>
                Login to Book Now & Pay later !
            </Typography>
        </Box>
        </Card>
        </Box>
        ))}
        </ThemeProvider>
        </Box>
        </>
    );
}

export default SelectHotels;

