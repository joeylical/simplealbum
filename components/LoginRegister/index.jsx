import React from "react";
import { TextField, Button, AppBar } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import Register from "./LoginRegister";

import "./styles.css";

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      registering: false,
      update: this.props.update,
    };
    
    //todo: figure out why it's needed to do like this
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(type, event) {
    if (type === 'username') {
      this.setState({username: event.target.value});
    }else if (type === 'password') {
      this.setState({password: event.target.value});
    }
  }

  handleSubmit(event) {
    console.log(this.state.username, this.state.password);
    axios.post("/admin/login", {
      loginname: this.state.username,
      password: this.state.password,
    }).then((response) => {
      this.state.update(this.state.username, response.data._id);
    }).catch((error) => {
      console.log(error);
    });
    event.preventDefault();
  }

  done() {
    this.setState({registering: false});
  }

  render() {
    if (this.state.registering) {
      return <Register done={()=>this.done()}/>;
    } else {
      return (
        <Box className="LoginForm">
          <AppBar>
              <h2
                style={{
                  margin: "10px",
                }}>
                  Sign In or Sign Up
              </h2>
          </AppBar>
          <form
            method="post"
            action="/admin/login"
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
              value={this.state.username}
              onChange={(event) => this.handleChange('username', event)}
            />
            <TextField
              style={{
                width: "100%",
                marginTop: "20px",
              }}
              type="password"
              label="Password"
              name="password"
              value={this.state.password}
              onChange={(event) => this.handleChange('password', event)}
            />
            <div
              style={{
                marginTop: "40px",
                display: "flex",
                width: "100%",
                flexFlow: "row",
                justifyContent: "space-evenly"
              }}>
              <Button
                variant="contained"
                type="submit"
                >
                  Sign In
              </Button>
              <Button variant="contained"
                onClick={()=>this.setState({registering: true})}
                >
                  Sign Up
              </Button>
            </div>
          </form>
        </Box>
      );
    }
  }
}

export default LoginRegister;