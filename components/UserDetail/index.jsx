import React from "react";
import {Link} from 'react-router-dom';
import { Paper, Typography, Grid, Divider, Button } from "@mui/material";
import reactStringReplace from "react-string-replace";

import "./styles.css";
import Avatar from "../UserList/avatar";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserDetail, a React component of CS142 Project 5.
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: this.props.match.params.userId,
      user: {},
      cb: this.props.update,
      thumb: {},
    };
    fetchModel(`/user/${this.state.uid}`).then(
      (user) => {
        this.setState({
          user: user
        });
        this.state.cb(this.state.uid, this.state.user.first_name+' '+this.state.user.last_name, 'detail');
      },
      console.log
    );
    fetchModel(`/userdetail/${this.state.uid}`).then(
      (photo) => {
        this.setState({
          thumb: photo,
        });
      }
    );
    UserDetail.instance = this;
  }

  // When the component is rendered for the second time, the constructor is not called again.
  // Before rendering, the caller will invoke this method to update the states.
  // Not sure if it's the best practise.
  static getDerivedStateFromProps(props) {
    const uid = props.match.params.userId;

    if (uid !== UserDetail.instance.state.uid) {
      fetchModel(`/user/${uid}`).then(
        (user) => {
          const name = user.first_name+' '+user.last_name;
          const old_name = UserDetail.instance.state.user.first_name + ' ' + UserDetail.instance.state.user.last_name;
          if (!old_name || (name !== old_name)) {
            props.update(uid, name, 'detail');
            UserDetail.instance.setState({
              uid: uid,
              user: user
            });
            UserDetail.instance.state.cb(uid, name, 'detail');
          }
        },
        console.log
      );
      fetchModel(`/userdetail/${uid}`).then(
        (photo) => {
          UserDetail.instance.setState({
            thumb: photo,
          });
        }
      );
    }

    return {uid: uid};
  }

  render() {
    if ('length' in this.state.thumb && this.state.thumb.length > 0) {
      return (
        <Paper
          sx={{
            p: 2,
            margin: 'auto',
            maxWidth: 600,
            flexGrow: 1
          }}
          >
          <Grid container spacing={1} >
            <Grid item xs={6}>
              <Avatar uid={this.state.uid} size={144} />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h3" gutterBottom>{this.state.user.first_name + ' ' + this.state.user.last_name}</Typography>
              <Typography variant="h6" gutterBottom>{this.state.user.occupation}</Typography>
              {/* <Typography variant="body1" gutterBottom>{this.state.user.description}</Typography> */}
              <Typography variant="body2" gutterBottom>{this.state.user.location}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" gutterBottom>{this.state.user.description}</Typography>
            </Grid>
            <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center">
              <Grid item xs={3}>
                <Link to={'/photos/' + this.state.uid} >
                  <Button variant="contained" >Photos!</Button>
                </Link>
              </Grid>
            </Grid>
            {this.state.thumb.map(t => (
              <div key={t._id}>
                <Grid item xs={12}>
                  <Link to={'/photos/' + t.user_id} >
                    <img src={'/images/' + t.file_name} 
                      style={{
                        margin: "auto",
                        width: "50%"
                      }}
                      />
                  </Link>
                </Grid>
                <Grid item xs={12}>
                  <Typography 
                    variant="body1" 
                    gutterBottom>
                    {reactStringReplace(('comments' in t && t.comments.length>0?t.comments[0].comment:''),
                                        /(@\[[\w\d ]+\]\([0-9a-f]+\))/gi,  // !!there must be a () around the regexp
                                        (match, i) => {
                                          const m = match.match(/@\[(?<display>[\w\d ]+)\]\((?<id>[0-9a-f]+)\)/);
                                          return (<Link key={i} to={"/users/"+m.groups.id}> {m.groups.display} </Link>);
                                        })}
                  </Typography>
                </Grid>
              </div>
            ))}
          </Grid>
        </Paper>
      );
    } else {
      return (
        <Paper
          sx={{
            p: 2,
            margin: 'auto',
            maxWidth: 600,
            flexGrow: 1
          }}
          >
          <Grid container spacing={1} >
            <Grid item xs={6}>
              <Avatar uid={this.state.uid} size={144} />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h3" gutterBottom>{this.state.user.first_name + ' ' + this.state.user.last_name}</Typography>
              <Typography variant="h6" gutterBottom>{this.state.user.occupation}</Typography>
              {/* <Typography variant="body1" gutterBottom>{this.state.user.description}</Typography> */}
              <Typography variant="body2" gutterBottom>{this.state.user.location}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" gutterBottom>{this.state.user.description}</Typography>
            </Grid>
            <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center">
              <Grid item xs={3}>
                <Link to={'/photos/' + this.state.uid} >
                  <Button variant="contained" >Photos!</Button>
                </Link>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      );
    }
  }
}

export default UserDetail;
