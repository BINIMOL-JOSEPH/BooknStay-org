import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import StyledTitle from '../HeaderStyle/HeaderStyle';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';

const NavigationBar = () => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);

    return (
        <div>
<AppBar position="static" sx={{ backgroundColor: '#333' }}>
                <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <StyledTitle />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                color: 'white',
                            }}
                            component={Link}
                            to='/login'
                            data-testid="login-button"
                        >
                            Login  
                        </Button>
                        <Button
                            sx={{
                                display: 'flex',
                                alignItems: 'center',   
                                color: 'white',
                            }}
                            onClick={handlePopoverOpen}
                            data-testid="register-button"
                        >
                            Register
                            <Popover
                            data-testid='popover'
                            open={open}
                            anchorEl={anchorEl}
                            onClose={handlePopoverClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <MenuItem button component={Link} to="/customer-registration" data-testid='customer'>Customer</MenuItem>
                            <MenuItem button component={Link} to="/hotel-registration" data-testid='hotel'>Hotel</MenuItem>
                        </Popover>
                        </Button>
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    );
};

export default NavigationBar;
