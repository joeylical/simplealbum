import React from "react";
import ReactDOM from "react-dom";
import { Grid, Typography, Paper } from "@mui/material";
import { HashRouter, Route, Switch } from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import fetchModel from "./lib/fetchModelData";
import LoginRegister from "./components/LoginRegister";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      current_uid: '',
      current_user: '',
      login_user: '',
      login_uid: '',
      page: '',
    };

    this.logout = this.logout.bind(this);
    window.users = null;

    fetchModel('/admin/login').then(
      (obj) => {
        this.setState({login_user: obj.user});
        this.updateUsers();
      },
      console.log
    );
  }

  updateUsers() {
    fetchModel('/user/list').then(
      (users) => {
        window.users = users;
        this.setState({users: users});
      },
      console.log
    );
    window.users = this.state.users; //this.state.users.filter((user) => user._uid === id);
  }

  updateState(uid, user, page) {
    if (user !== this.state.current_user || page !== this.state.page) {
      this.setState({
        current_uid: uid,
        current_user: user,
        page: page,
      });
    }
  }

  setLoginUser(user, uid) {
    console.log('setLoginUser',user,uid);
    this.setState({
      login_user: user,
      login_uid: uid
    });
    this.updateUsers();
  }

  logout() {
    console.log('logout');
    window.users = [];
    this.setState({
      users: [],
      current_uid: '',
      current_user: '',
      login_user: '',
      login_uid: '',
      page: '',
    });
  }

  render() {
    if (this.state.login_user !== '') {
      return (
        <HashRouter>
          <div>
            {this.state.current_user}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TopBar
                  uid={this.state.current_uid}
                  user={this.state.current_user}
                  page={this.state.page}
                  logout={this.logout}
                  current_user={this.state.login_user}
                  login_uid={this.state.login_uid}
                  />
              </Grid>
              <div className="cs142-main-topbar-buffer" />
              <Grid item sm={3}>
                <Paper className="cs142-main-grid-item">
                  <UserList users={this.state.users} />
                </Paper>
              </Grid>
              <Grid item sm={9}>
                <Paper className="cs142-main-grid-item">
                  <Switch>
                    <Route
                      exact
                      path="/"
                      render={() => (
                        <Typography variant="body1">
                          Welcome to your photosharing app! This{" "}
                          <a href="https://mui.com/components/paper/">Paper</a>{" "}
                          component displays the main content of the application.
                          The {"sm={9}"} prop in the{" "}
                          <a href="https://mui.com/components/grid/">Grid</a> item
                          component makes it responsively display 9/12 of the
                          window. The Switch component enables us to conditionally
                          render different components to this part of the screen.
                          You don&apos;t need to display anything here on the
                          homepage, so you should delete this Route component once
                          you get started.
                        </Typography>
                      )}
                    />
                    <Route
                      path="/users/:userId"
                      render={(props) => <UserDetail update={(...args) => this.updateState(...args)} {...props} />}
                    />
                    <Route
                      path="/photos/:userId"
                      render={(props) => <UserPhotos update={(...args) => this.updateState(...args)} {...props} />}
                    />
                    <Route path="/users" component={UserList} />
                  </Switch>
                </Paper>
              </Grid>
            </Grid>
          </div>
        </HashRouter>
      );
    } else {
        return (
          <LoginRegister update={(user, uid)=>this.setLoginUser(user, uid)}/>
      );
    }
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
