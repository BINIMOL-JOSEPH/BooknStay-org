import React, { useEffect, useState, useRef } from "react";
import { createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CollapsibleSidebar from "../Sidebar/Sidebar";
import { Card, Avatar, Divider, Dialog, DialogActions } from "@mui/material";
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link, useNavigate } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import VerifiedIcon from '@mui/icons-material/Verified';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { userService } from "../../UserService";
import EditUser from "../EditUser/EditUser";

const defaultTheme = createTheme();

const ProfilePage = () => {

    const [data, setdata] = useState({ first_name: '', last_name: '', phone_number: '', email: '', address: '', state: '' });
    const [dialogOpen, setDialogOpen] = useState(false);

    const loginCardRef = useRef(null);
    const profileCardRef = useRef(null);
    const navigate = useNavigate("");

    const fetchUserDetails = async () => {
        try {
            const response = await userService.GetEditUser();

            const userData = response.data;
            setdata({
                first_name: userData.first_name || "",
                last_name: userData.last_name || "",
                phone_number: userData.phone_number || "",
                email: userData.email || "",
                address: userData.address || "",
                state: userData.state || ""
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const scrollToLoginCard = () => {
        window.scrollTo({
            top: loginCardRef.current.offsetTop,
            behavior: "smooth"
        });
    };

    const scrollToProfileCard = () => {
        window.scrollTo({
            top: profileCardRef.current.offsetTop,
            behavior: "smooth"
        });
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    return (
        <>
            <CollapsibleSidebar />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    backgroundColor: '#F8F8F8',
                }}
            >
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mt: 2, mb: 5 }} >
                    <Link to="/">Home</Link>
                    <Typography color="textPrimary">My Profile</Typography>
                </Breadcrumbs>
                <Stack direction={'row'} sx={{ width: '100%', height: '70rem', mt: '2%' }} data-testid='stack'>
                    <Card sx={{ width: '21%', height: '48%', ml: '4%', borderRadius: '3%', boxShadow: '1px 1px 10px rgba(0, 0, 0, 0.1)' }} data-testid='nav-card'>
                        <Avatar sx={{ mt: "8%", width: "53%", height: "38%", ml: '24%', mb: '5%', backgroundImage: 'linear-gradient(45deg, #ace143, #219393)' }} />
                        <Typography variant="h5" align="center" sx={{ fontWeight: "bold", fontFamily: 'serif' }} >
                            {data.first_name} {data.last_name}
                        </Typography>
                        <Typography variant="h5" align="center" sx={{ color: "grey", fontSize: "small", mt: '2%', fontFamily: 'Lato,  sans-serif' }} >
                            PERSONAL PROFILE
                        </Typography>
                        <List sx={{ mt: '4%' }}>
                            <ListItemButton onClick={scrollToProfileCard}>
                                <ListItemIcon><PersonOutlineOutlinedIcon style={{ color: '#7d7676' }} /></ListItemIcon>
                                <ListItemText primary={<Typography sx={{ mt: '3%', fontWeight: 'bold', fontFamily: 'serif', color: '#7d7676' }} > Profile </Typography>} />
                            </ListItemButton>
                            <ListItemButton onClick={scrollToLoginCard}>
                                <ListItemIcon><LoginOutlinedIcon style={{ color: '#7d7676' }} /></ListItemIcon>
                                <ListItemText primary={<Typography sx={{ mt: '3%', fontWeight: 'bold', fontFamily: 'serif', color: '#7d7676' }} > Login Details </Typography>} />
                            </ListItemButton>
                            <ListItemButton onClick={handleLogout}>
                                <ListItemIcon><LogoutOutlinedIcon style={{ color: '#7d7676' }} /></ListItemIcon>
                                <ListItemText primary={<Typography sx={{ mt: '3%', fontWeight: 'bold', fontFamily: 'serif', color: '#7d7676' }} > Logout </Typography>} />
                            </ListItemButton>
                        </List>
                    </Card>
                    <Stack direction={'column'} sx={{ width: '80%' }}>
                        <Card ref={profileCardRef} sx={{ width: '92%', ml: '3%', borderRadius: '13px', height: '34%' }} >
                            <Stack direction={'row'} sx={{ width: '100%' }}>
                                <Stack direction={'column'} sx={{ width: '90%' }}>
                                    <Typography variant="h5" sx={{ fontWeight: "bold", fontFamily: 'serif', fontSize: '30px', ml: '2%', mt: '2%' }} >
                                        Profile
                                    </Typography>
                                    <Typography variant="h5" sx={{ color: "grey", fontSize: "medium", ml: '2%', fontFamily: 'Lato,  sans-serif' }} >
                                        Basic info, for a faster booking experience
                                    </Typography>
                                </Stack>
                                <Button onClick={handleDialogOpen} variant="outlined" sx={{ width: '10%', height: '40px', mt: '2%', mr: '2%', fontWeight: 'bold' }} data-testid='edit-button'>
                                    <ModeEditIcon sx={{ height: '16px', mt: '-5%', ml: '-5%' }} /> Edit
                                </Button>
                            </Stack>
                            <Stack direction={'row'} >
                                <Typography variant="h5" sx={{ color: "#4a4a4a", fontSize: "medium", mt: '4%', ml: '2%', fontFamily: 'serif' }} >
                                    Name
                                </Typography>
                                <Typography variant="h5" sx={{ width: '70%', color: "#4a4a4a", fontSize: "medium", mt: '4%', ml: '17%', fontFamily: 'serif', fontWeight: 'bold' }} >
                                    {data.first_name} {data.last_name}
                                </Typography>
                            </Stack>
                            <Divider orientation="horizontal" variant="middle" flexItem sx={{ mt: "2%", backgroundColor: "#999999" }} />
                            <Stack direction={'row'}>
                                <Typography variant="h5" sx={{ color: "#4a4a4a", fontSize: "medium", mt: '2%', ml: '2%', fontFamily: 'serif' }} >
                                    Phone
                                </Typography>
                                <Typography variant="h5" sx={{ width: '70%', color: "#4a4a4a", fontSize: "medium", mt: '2%', ml: '17%', fontFamily: 'serif', fontWeight: 'bold' }} >
                                    {data.phone_number}
                                </Typography>
                            </Stack>
                            <Divider orientation="horizontal" variant="middle" flexItem sx={{ mt: "2%", backgroundColor: "#999999" }} />
                            <Stack direction={'row'}>
                                <Typography variant="h5" sx={{ color: "#4a4a4a", fontSize: "medium", mt: '2%', ml: '2%', fontFamily: 'serif' }} >
                                    Address
                                </Typography>
                                <Typography variant="h5" sx={{ width: '70%', color: "#4a4a4a", fontSize: "medium", mt: '2%', ml: '19%', fontFamily: 'serif', fontWeight: 'bold' }} >
                                    {data.address ? (
                                        <Typography variant="h5" sx={{ width: '100%', color: "#4a4a4a", fontSize: "medium", ml: '-4.5%', fontFamily: 'serif', fontWeight: 'bold' }} >
                                            {data.address}
                                        </Typography>
                                    ) : (
                                        <Link component={Button} onClick={handleDialogOpen} variant="h5" style={{ textDecoration: 'none', fontSize: "medium", marginTop: '4%', marginLeft: '-5%', fontFamily: 'serif', fontWeight: 'bold' }} >
                                            +&nbsp;Add
                                        </Link>
                                    )}
                                </Typography>
                            </Stack>
                            <Divider orientation="horizontal" variant="middle" flexItem sx={{ mt: "2%", backgroundColor: "#999999" }} />
                            <Stack direction={'row'}>
                                <Typography variant="h5" sx={{ color: "#4a4a4a", fontSize: "medium", mt: '2%', ml: '2%', fontFamily: 'serif' }} >
                                    State
                                </Typography>
                                <Typography variant="h5" sx={{ width: '70%', color: "#4a4a4a", fontSize: "medium", mt: '2%', ml: '21%', fontFamily: 'serif', fontWeight: 'bold' }} >
                                    {data.state ? (
                                        <Typography variant="h5" sx={{ width: '100%', color: "#4a4a4a", fontSize: "medium", ml: '-4.5%', fontFamily: 'serif', fontWeight: 'bold' }} >
                                            {data.state}
                                        </Typography>
                                    ) : (
                                        <Link component={Button} onClick={handleDialogOpen} variant="h5" style={{ textDecoration: 'none', fontSize: "medium", marginTop: '4%', marginLeft: '-5%', fontFamily: 'serif', fontWeight: 'bold' }} >
                                            +&nbsp;Add
                                        </Link>
                                    )}
                                </Typography>
                            </Stack>
                        </Card>
                        <Card ref={loginCardRef} sx={{ width: '92%', ml: '3%', mt: '3%', borderRadius: '13px' }} >
                            <Stack direction={'column'} sx={{ width: '90%' }}>
                                <Typography variant="h5" sx={{ fontWeight: "bold", fontFamily: 'serif', fontSize: '30px', ml: '2%', mt: '2%' }} >
                                    Login Details
                                </Typography>
                                <Typography variant="h5" sx={{ color: "grey", fontSize: "medium", ml: '2%', fontFamily: 'Lato,  sans-serif' }} >
                                    Manage your email address and password
                                </Typography>
                            </Stack>
                            <Stack direction={'row'} >
                                <Typography variant="h5" sx={{ color: "#4a4a4a", fontSize: "medium", mt: '4%', ml: '2%', fontFamily: 'serif' }} >
                                    Email Id
                                </Typography>
                                <Stack direction={'row'} sx={{ mt: '4%', ml: '15%' }}>
                                    <Typography variant="h5" sx={{ color: "#4a4a4a", fontSize: "medium", fontFamily: 'serif', fontWeight: 'bold' }} >
                                        {data.email}
                                    </Typography>
                                    <VerifiedIcon sx={{ color: "#219393", ml: '5%', mt: '-1%' }} />
                                    <Typography variant="h5" sx={{ color: "#219393", fontSize: "medium", ml: '1%', fontFamily: 'serif', fontWeight: 'bold' }} >
                                        Verified
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Divider orientation="horizontal" variant="middle" flexItem sx={{ mt: "2%", backgroundColor: "#999999" }} />
                            <Stack direction={'row'}>
                                <Typography variant="h5" sx={{ color: "#4a4a4a", fontSize: "medium", mt: '2%', ml: '2%', fontFamily: 'serif' }} >
                                    Password
                                </Typography>
                                <Typography variant="h5" sx={{ color: "#4a4a4a", fontSize: "medium", mt: '2%', ml: '14%', fontFamily: 'serif', fontWeight: 'bold' }} >
                                    ***********
                                </Typography>
                                <Link to='/change-password' style={{ textDecoration: 'none', fontWeight: 'bold', fontFamily: 'serif', marginTop: '2%', marginLeft: '50%' }}>
                                    Change Password ?
                                </Link>
                            </Stack>
                            <Divider orientation="horizontal" variant="middle" flexItem sx={{ mt: "2%", backgroundColor: "#999999" }} />
                        </Card>
                    </Stack>
                </Stack>
            </Box>

            <Dialog open={dialogOpen} data-testid="dialog" >
                <EditUser action={fetchUserDetails} action1={handleDialogClose} />
                <DialogActions>
                    <Button onClick={handleDialogClose} data-testid="cancelbutton" >
                        CLOSE
                    </Button>
                </DialogActions>
            </Dialog>
        </>

    );
}

export default ProfilePage;
