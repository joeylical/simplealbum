import React from "react";
import { TextField, Button, AppBar } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";

import "./styles.css";

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        login_name: '',
        password: '',
        first_name: '',
        last_name: '',
        location: '',
        description: '',
        occupation: '',
        done: this.props.done,
    };
    
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    console.log(this.state.username, this.state.password);
    axios.post("/user", {
        login_name: this.state.login_name,
        password: this.state.password,
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        location: this.state.location,
        description: this.state.description,
        occupation: this.state.occupation,
    }).then((reponse) => {
      console.log(reponse);
      //todo: ok or not ok
      this.state.done();
    }).catch((error) => {
      console.log(error);
    });
    event.preventDefault();
  }

  render() {
    return (
      <Box className="RegisterForm">
        <AppBar>
            <h2
              style={{
                margin: "10px",
              }}>
                Sign In or Sign Up
            </h2>
        </AppBar>
        {/* const login_name = request.body.login_name;
        const password = request.body.password;
        const first_name = request.body.first_name;
        const last_name = request.body.last_name;
        const location = request.body.location;
        const description = request.body.description;
        const occupation = request.body.occupation; */}
        <form
          style={{
            marginTop: "100px",
            width: "400px",
            marginLeft: "auto",
            marginRight: "auto",
            flexFlow: "column",
          }}
          onSubmit={this.handleSubmit}
          >
          <TextField
            style={{
              width: "100%",
            }}
            type="text"
            label="Login Name"
            name="loginname"
            onChange={(event) => this.setState({login_name: event.target.value})}
          />
          <TextField
            style={{
              width: "100%",
              marginTop: "20px",
            }}
            type="password"
            label="Password"
            name="password"
            onChange={(event) => this.setState({password: event.target.value})}
          />
          <TextField
            style={{
              width: "100%",
            }}
            type="text"
            label="First Name"
            name="first_name"
            onChange={(event) => this.setState({first_name: event.target.value})}
          />
          <TextField
            style={{
              width: "100%",
            }}
            type="text"
            label="Last Name"
            name="last_name"
            onChange={(event) => this.setState({last_name: event.target.value})}
          />
          <TextField
            style={{
              width: "100%",
            }}
            type="text"
            label="Location"
            name="location"
            onChange={(event) => this.setState({location: event.target.value})}
          />
          <TextField
            style={{
              width: "100%",
            }}
            type="text"
            rows={5}
            label="Description"
            name="description"
            onChange={(event) => this.setState({description: event.target.value})}
          />
          <TextField
            style={{
              width: "100%",
            }}
            type="text"
            label="Occupation"
            name="occupation"
            onChange={(event) => this.setState({occupation: event.target.value})}
          />
          <div
            style={{
              marginTop: "40px",
              display: "flex",
              width: "100%",
              flexFlow: "row",
              justifyContent: "space-evenly"
            }}>
            <Button variant="contained"
              onClick={this.handleSubmit}
              >
                Sign Up
            </Button>
          </div>
        </form>
      </Box>
    );
  }
}

export default Register;