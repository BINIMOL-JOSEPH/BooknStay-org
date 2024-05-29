import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import { createTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import CollapsibleSidebar from "../Sidebar/Sidebar";
import Swal from "sweetalert2";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Rating from "@mui/material/Rating";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import ReplyIcon from "@mui/icons-material/Reply";
import { TextField, Breadcrumbs } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { hotelService } from "../../HotelService";
import { Link } from "react-router-dom";
import NoDataFound from "./NoDataFound";
import Loading from "../Loading/Loading";
const defaultTheme = createTheme();

function ListReviewByHotels() {
  const [data, setData] = useState([]);
  const [reviewId, setReviewId] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [feedbackData, setFeedbackData] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewsByHotels();
  }, []);

  const fetchReviewsByHotels = async () => {
    try {
      const response = await hotelService.FetchReviewsByHotels();
      setData(response.data);
      setLoading(false);

    } catch (error) {
      if (error.response) {
        Swal.fire({
          position: "top",
          icon: "error",
          title: error.response.data,
          showConfirmButton: false,
          timer: 5000,
        });
      }
      setLoading(false);
    }
  };

  const handleAddFeedbacks = async () => {
    try {
      const response = await hotelService.AddFeedbacks(reviewId, feedbackData);
      Swal.fire({
        position: "top",
        icon: "success",
        title: response.data.message,
        showConfirmButton: false,
        timer: 5000,
      });
      fetchReviewsByHotels();
      handleCloseDialog();
      setFeedbackData("");

    } catch (error) {
      if (error.response) {
        Swal.fire({
          position: "top",
          icon: "error",
          title: error.response.data.message,
          showConfirmButton: false,
          timer: 5000,
        });
        handleCloseDialog();
      }
    }
  };

  const handleFeedbackschange = async (e) => {
    const inputValue = e.target.value;
    setFeedbackData((prevData) => ({
      ...prevData,
      feedbacks: inputValue,
    }));

    if (!inputValue.trim()) {
      setFeedbackError("Please add a feedback.");
    } else {
      setFeedbackError("");
    }
  };

  const handleFormattedDateHotel = (created_at) => {
    const formattedDateHotel = new Date(created_at).toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

    return formattedDateHotel;
  };

  const handleOpenDialog = (reviewId) => {
    setReviewId(reviewId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    if (openDialog) {
      setReviewId(null);
      setOpenDialog(false);
    }
  };
  if (loading) {
    return (

      <Loading />
    );
  }
  return (
    <>
      <CollapsibleSidebar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          width: "100%",
          marginBottom: "3%",
          backgroundColor: "#F8F8F8",
        }}
      >
        {data.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mt: 2 }}
          >
            <Link to="/hotel-dashboard">Home</Link>
            <Typography color="textPrimary">Review List</Typography>
          </Breadcrumbs>
        )}

        {data.length === 0 && <NoDataFound />}
        {data.map((review) => (
          <Card
            key={review.index}
            sx={{
              display: "flex",
              mt: 5,
              mb: "-1%",
              width: "70%",
              boxShadow: "1px 1px 10px rgba(0, 0, 0, 0.3)",
            }}
            data-testid="card"
          >
            <Box sx={{ display: "flex", flexDirection: "column", width: "100%", }} >
              <CardContent sx={{ flex: "1 0 auto" }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}  sx={{ mt: 1 }} >
                  <Avatar sx={{ width: 55, height: 55 }}>
                    {review.rating}
                  </Avatar>
                  <Stack>
                    <Typography component="div" variant="h6"
                      sx={{
                        ml: 1,
                        color: "grey",
                        mt: -0.1,
                        fontSize: "large",
                        fontWeight: "bold",
                      }}
                    >
                      {review.customer_name}
                    </Typography>
                    <Rating
                      name="size-large"
                      size="medium"
                      value={review.rating}
                      data-testid="rating"
                      readOnly
                      sx={{ ml: 0.5, mt: -0.5 }}
                    />
                  </Stack>
                </Stack>
                <Typography component="div" sx={{ ml: 9, mt: 2, fontWeight: "bold", fontSize: "18px" }} >
                  {review.title}
                </Typography>
                <Typography variant="body1" component="div" sx={{ ml: 9 }}>
                  {review.comment}
                </Typography>
                <Typography component="div" sx={{ ml: 9, mt: 2, color: "grey", mb: -2, fontSize: "small", }} >
                  Posted On: {handleFormattedDateHotel(review.created_at)}
                  {!review.feedbacks && (
                    <IconButton sx={{ color: "grey", fontSize: "15px", ml: "70%" }} onClick={() => handleOpenDialog(review.id)} data-testid="reply-icon" >
                      <ReplyIcon />
                       Reply
                    </IconButton>
                  )}
                </Typography>

                {review.feedbacks && (
                  <>
                    <Divider orientation="horizontal" variant="inset" flexItem
                      sx={{
                        mt: "3%",
                        mr: "3%",
                        borderBottomWidth: "1px",
                        background: "black",
                      }}
                    />
                    <Box
                      sx={{
                        backgroundColor: "#F0F0F0",
                        padding: "10px",
                        borderRadius: "5px",
                        mt: "2%",
                        ml: "7%",
                        width: "90%",
                        position: "relative",
                      }}
                    >
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1 }} >
                        <Typography component="div" sx={{ ml: 9, mt: "1%", fontWeight: "bold", fontSize: "15px", color: "grey", }} >
                          Reply:
                        </Typography>
                        <Typography component="div"
                          sx={{
                            position: "absolute",
                            mt: "1%",
                            right: "5px",
                            color: "grey",
                            fontSize: "small",
                          }}
                        >
                          {handleFormattedDateHotel( review.feedbacks_created_at )}
                        </Typography>
                      </Stack>
                      <Typography variant="subtitle1" component="div" sx={{ mt: "2%", ml: "2%" }} >
                        {review.feedbacks}
                      </Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Box>
          </Card>
        ))}
      </Box>

      {/* dialog for adding feedbacks */}
      <Dialog open={openDialog} onClose={handleCloseDialog} data-testid="dialog" fullWidth maxWidth="sm" >
        <DialogTitle>Feedbacks</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <TextField
              autoComplete="given-name"
              name="feedbacks"
              required
              id="feedbacks"
              label="Feedbacks"
              value={feedbackData.feedbacks}
              autoFocus
              size="large"
              sx={{ mt: 2, mb: 2, width: { md: 550 }, }}
              multiline
              rows={7}
              onChange={handleFeedbackschange}
            />
            {feedbackError && (
              <Typography variant="body2" color="error" sx={{ fontSize: 13, mt: -1, mb: 1 }} >
                {feedbackError}
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button data-testid="cancelbutton" onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button color="success" data-testid="add-feedbacks" onClick={() => handleAddFeedbacks()} disabled={feedbackError} >
            ADD FEEDBACK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ListReviewByHotels;
