import React from "react";
import {Link} from 'react-router-dom';
import { Divider, ImageList, ImageListItem, Button, Typography } from "@mui/material";
import reactStringReplace from "react-string-replace";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import CommentDialog from "./comment";

/**
 * Define UserPhotos, a React component of CS142 Project 5.
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: this.props.match.params.userId,
      user: {},
      photos: [],
      dialogOpen: 0,
      dialogId: '',
      cb: this.props.update,
    };
    setTimeout(()=> {
      fetchModel('/photosOfUser/'+this.state.uid).then(
        (photos) => {
          this.setState({
            user: window.users.filter((user)=>user._id===this.state.uid)[0] || {},
            photos: photos,
            dialogId: '',
          });
          this.state.cb(this.state.uid, this.state.user.first_name+' '+this.state.user.last_name, 'photo');
        },
        console.log
      );
    }, 100);

    // this.state.cb(this.state.uid, this.state.user.first_name+' '+this.state.user.last_name, 'photo');
    UserPhotos.instance = this;
  }

  openDialog(photoId) {
    console.log('openDialog');
    this.setState(()=>({
      dialogOpen: this.state.dialogOpen+1,
      dialogId: photoId,
    }));
  }

  static getDerivedStateFromProps(props) {
    const uid = props.match.params.userId;
    if (uid !== UserPhotos.instance.state.uid) {
      fetchModel(`/photosOfUser/${uid}`).then(
        (photos) => {
          if (UserPhotos.instance.state.user._uid !== uid) {
            const user = 'users' in window?window.users.filter((u)=>u._id===uid)[0]:{};
            const name = user.first_name+' '+user.last_name;
            UserPhotos.instance.setState({
              user: user,
              photos: photos
            });
            props.update(uid, name, 'photo');
          }
        },
        console.log
      );
    }

    return {
      uid: uid,
    };
  }

  addComment(photoId, comment) {
    console.log(photoId);
    const photo = this.state.photos.filter((p)=>p._id===photoId)[0];
    const user = 'users' in window?window.users.filter((u)=>u._id===comment.user_id)[0]:{};
    comment.user = user;
    photo.comments.push(comment);
    this.setState({
      photos: this.state.photos,
    });
  }

  render() {
    return (
      <React.Fragment>
        <Link to={'/users/'+this.state.uid} >
          <Button variant="contained" >Back</Button>
        </Link>
        <ImageList sx={{ width: 500 }} cols={1} >
          {
            this.state.photos.map((photo) => (
              <ImageListItem key={photo.file_name}>
                <img className="photo" src={'/images/' + photo.file_name} />
                {
                  'comments' in photo ? photo.comments.map((comment) => (
                    <div key={comment._id||new Date().toISOString()}>
                      <Typography variant="h6">
                        {comment.user.first_name + ' ' + comment.user.last_name}
                      </Typography>
                      <Typography variant="subtitle2">
                        {comment.date_time}
                      </Typography>
                      <Typography variant="body1" width="500px">
                        {/* {comment.comment} */}
                        {reactStringReplace(comment.comment,
                                        /(@\[[\w\d ]+\]\([0-9a-f]+\))/gi,  // !!there must be a () around the regexp
                                        (match, i) => {
                                          const m = match.match(/@\[(?<display>[\w\d ]+)\]\((?<id>[0-9a-f]+)\)/);
                                          return (<Link key={i} to={"/users/"+m.groups.id}> {m.groups.display} </Link>);
                                        })}
                      </Typography>
                      <Divider />
                    </div>
                  )) : <span />
                }
                <Button 
                  variant="contained"
                  style={{
                    width: "150px",
                    margin: "auto",
                    marginTop: "20px",
                    marginBottom: "20px",
                  }}
                  onClick={()=>this.openDialog(photo._id)}
                  >
                    New Comment
                </Button>
              </ImageListItem>
            ))
          }
        </ImageList>
        <CommentDialog status={this.state.dialogOpen} photoId={this.state.dialogId} addComment={(a,b)=>this.addComment(a,b)}/>
      </React.Fragment>
    );
  }
}

export default UserPhotos;
