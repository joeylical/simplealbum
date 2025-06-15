import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormGroup, FormControlLabel, Checkbox, Popover } from "@mui/material";
import axios from "axios";

import Avatar from "../UserList/avatar";

import "./styles.css";

function t2t(t) {
  return (new Date(t)).toLocaleString();
}

/**
 * Define TopBar, a React component of CS142 Project 5.
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: this.props.uid,
      user: this.props.user,
      page: this.props.page,
      current_user: this.props.current_user,
      login_uid: this.props.login_uid,
      logout: this.props.logout,
      dialog: false,
      selectAll: true,
      selected: new Set(),
      file: '',
      popup: false,
      activities: [],
    };
    this.logout = this.logout.bind(this);
  }

  static getDerivedStateFromProps(props) {
    return {
      login_uid: props.login_uid,
      uid: props.uid,
      user: props.user,
      page: props.page,
    };
  }

  logout() {
    axios.get("/admin/logout").then(() => {
      console.log(this);
      this.state.logout();
    }).catch((error) => {
      console.log(error);
    });
  }

  upload() {
    const input = document.querySelector('#uploader');
    input.click();
  }

  real_upload() {
    const formData = new FormData();
    formData.append('file', this.state.file);
    let perm;
    if(this.state.selectAll) {
      perm = {perm: 'all'};
    } else {
      perm = {perm: [...this.state.selected]};
    }
    formData.append('perm', JSON.stringify(perm));
    axios.post('/photos/new', formData).then((err, result) => {
      console.log(err, result);
      this.closeDialog();
    });
  }

  closeDialog() {
    this.setState({
      dialog: false,
    });
  }

  updateActivities() {
    axios.get('/activities').then((result) => {
      if('data' in result && result.data.length > 0) {
        this.setState({
          popup: true,
          activities: result.data,
        });
      }
    });
  }

  render() {
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          <Avatar uid={this.state.uid} size={48} />
          <Typography variant="h5" color="inherit">
            {this.state.page==='detail'?this.state.user:'Photos of '+this.state.user}
          </Typography>

          <input
            type="file"
            id="uploader"
            style={{
              display: "none",
            }}
            onChange={(e)=>this.setState({
              dialog: true,
              file: e.target.files[0]
            })}
            />
          <Dialog
            open={this.state.dialog}
            onClose={()=>this.closeDialog()}
            >
            <DialogTitle
              width="md"
              >
              Select Who Can View
            </DialogTitle>
            <DialogContent>
              <FormGroup>
                <FormControlLabel 
                  key='all'
                  control={<Checkbox />}
                  checked={this.state.selectAll}
                  label='ALL'
                  onChange={()=>{this.setState({selectAll: !this.state.selectAll});}}
                  />
                {this.state.dialog?window.users.filter(u => u._id !== this.state.login_uid).map(user => (
                  <FormControlLabel
                    key={user._id}
                    checked={this.state.selected.has(user._id)}
                    control={<Checkbox />}
                    disabled={this.state.selectAll}
                    label={user.first_name + ' ' + user.last_name}
                    onChange={(e)=>{
                      const selected = this.state.selected;
                      if(e.target.checked) {
                        selected.add(user._id);
                      } else {
                        selected.delete(user._id);
                      }
                      this.setState({
                        selected: selected
                      });
                    }}
                    />
                )):''}
              </FormGroup>
              <Typography variant="body1" fontStyle={"italic"} gutterBottom>
                {((!this.state.selectAll)&&(this.state.selected.size===0))?'Only you can see the picture':''}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={()=>this.real_upload()}>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
          <Button
            style={{
              marginLeft: "auto",
            }}
            variant="contained"
            onClick={this.upload}
            >
              Upload
          </Button>
          <Button
            id='ActivityButton'
            style={{
              marginLeft: "10px",
            }}
            variant="contained"
            onClick={()=>this.updateActivities()}
            >
              Activities
          </Button>
          <Popover
            id="activities"
            open={this.state.popup}
            anchorEl={()=>document.querySelector('#ActivityButton')}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            style={{
              flexFlow: 'column',
              display: 'flex'
            }}
            onClose={()=>this.setState({popup: false})}
            >
            {
              this.state.popup?this.state.activities.map(activity => {
                switch(activity.type) {
                  case 'login':
                  case 'logout':
                  case 'register':
                    return (
                      <Typography variant="body" key={activity.time.toLocaleString()} style={{display:'block'}}>
                        <Link to={"/users/"+activity.userid}>
                          {activity.username}
                        </Link>
                        {' ' + activity.type + ' ' + t2t(activity.time)}
                      </Typography>
                    );
                  case 'upload':
                    return (
                      <div
                        style={{
                          flexFlow: 'row'
                        }}
                        key={activity.time.toLocaleString()}
                        >
                          <Link to={"/users/"+activity.userid}>
                            <img
                              style={{
                                maxHeight: '80px',
                                maxWidth: '80px',
                              }}
                              src={'/images/'+activity.photo_path}
                              />
                            <Typography variant="body">
                            {activity.username + ' ' + activity.type + ' ' + t2t(activity.time)}
                            </Typography>
                          </Link>
                      </div>
                    );
                  case 'comment':
                    return (
                      <div
                        style={{
                          flexFlow: 'row'
                        }}
                        key={activity.time.toLocaleString()}
                        >
                          <Link to={"/users/"+activity.userid}>
                            <img
                              style={{
                                maxHeight: '80px',
                                maxWidth: '80px',
                              }}
                              src={'/images/'+activity.photo_path}
                              />
                            <Typography variant="body">
                            {activity.username + ' ' + activity.type + ' ' + activity.comment + t2t(activity.time)}
                            </Typography>
                          </Link>
                      </div>
                    );
                  default:
                    return <span />;
                }
              }):''
            }
          </Popover>
          <Button
            style={{
              color: "white",
              marginLeft: "10px",
            }}
            variant="text"
            onClick={this.logout}
            >
              {this.state.current_user}, Logout
          </Button>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
