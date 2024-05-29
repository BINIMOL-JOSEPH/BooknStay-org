import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { userService } from "../../UserService";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Alert from "@mui/material/Alert";
import { List, ListItem, ListItemText } from "@mui/material";
import CollapsibleSidebar from "../Sidebar/Sidebar";

const defaultTheme = createTheme();

const ViewCustomer = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const response = await userService.ViewCustomer(String(id));
      if (Array.isArray(response.data)) {
        setData(response.data);
        setErrorMessage("");
      } 
    } catch (error) {
      if (error.response) {
        if (error.response.data.detail) {
          Swal.fire({
            position: "top",
            icon: "error",
            title: error.response.data.detail,
            showConfirmButton: false,
            timer: 5000,
          });
        }
      }
    }
  };

  const handleSuspend = (id) => {
    navigate(`/suspend-customer/${id}`);
  };

  const handleDelete = async (id) => {
    navigate(`/delete-customer/${id}`);
  }

  const handleActivate = async (id) => {
   navigate(`/activate-customer/${id}`)
  }
  const renderActionButtons = (customer) => {
    if (customer.status === "inactive") {
      return null;
    }
  
    if (customer.status === "suspended" || customer.status === "deleted") {
      return (
        <Stack
          sx={{ display: "flex", mt: 2, alignItems: "center" }}
          direction="row"
          data-testid="navigate-stack"
        >
          <Button
            data-testid="activate"
            variant="contained"
            color="success"
            onClick={() => handleActivate(customer.id)}

          >
            Activate
          </Button>
          <Button
            data-testid="delete"
            sx={{ marginLeft: 2 }}
            variant="contained"
            color="error"
            onClick={() => handleDelete(customer.id)}
          >
            Delete
          </Button>
        </Stack>
      );
    } else {
      return (
        <Stack
          sx={{ display: "flex", mt: 2, alignItems: "center" }}
          direction="row"
          data-testid="navigate-stack"
        >
          <Button
            data-testid="suspend"
            variant="contained"
            color="warning"
            onClick={() => handleSuspend(customer.id)}
          >
            Suspend
          </Button>
          <Button
            data-testid="delete"
            sx={{ marginLeft: 2 }}
            variant="contained"
            color="error"
            onClick={() => handleDelete(customer.id)}
          >
            Delete
          </Button>
        </Stack>
      );
    }
  };
  return (
    <>
      <CollapsibleSidebar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "90vh",
          width: "100%",
          backgroundColor: "#F8F8F8",
        }}
      >
        <ThemeProvider theme={defaultTheme}>
          {data.map((customer, index) => (
            <Card
              key={customer.index}
              sx={{ minWidth: 300, marginTop: '40px', textAlign: "center" }}
            >
              <CardHeader title={customer.first_name + " " + customer.last_name} />
              <CardContent sx={{ textAlign: "left" }}>
                {errorMessage && (
                  <Stack sx={{ width: "50%", mt: 2 }} spacing={10}>
                    <Alert severity="info" sx={{ mx: "auto" }}>
                      {errorMessage}
                    </Alert>
                  </Stack>
                )}
                {!errorMessage && (
                  <>
                <List sx={{ ml: 0, textAlign: "left" }}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <>
                              <div>
                                <b>Email: </b>
                                {customer.email}
                              </div>
                              <div>
                                <b>Phone Number: </b>
                                {customer.phone_number}
                              </div>
                              <div>
                                <b>Date Joined: </b>
                                {customer.date_joined}
                              </div>
                              <div data-testid="status">
                                <b>Status: </b>
                                {customer.status}
                              </div>
                              <div>
                                <b>Updated On: </b>
                                {customer.updated_on}
                              </div>
                              <div>
                                <b>Deleted On: </b>
                                {customer.deleted_on}
                              </div>
                            </>
                          }
                        />
                      </ListItem>
                    </List>
                    {renderActionButtons(customer)}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </ThemeProvider>
      </Box>
    </>
  );
};

export default ViewCustomer;
