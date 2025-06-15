import React from 'react';
import { Dialog, DialogTitle, DialogActions, DialogContent, TextField, Button } from "@mui/material";
import axios from 'axios';
import { MentionsInput, Mention } from 'react-mentions';
import "./styles.css";

class CommentDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dialog: false,
      photoId: this.props.photoId,
      comment: '',
      addComment: this.props.addComment,
      users: [],
      mentions: [],
    };
    setTimeout(() => {
      this.setState({
        users: window.users.map(u=>({id: u._id, display: u.first_name + ' ' + u.last_name}))
      });
    }, 100);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    const dialog = props.status;
    const photoId = props.photoId;
    // props is always get from parent
    if (dialog && dialog !== state.status) {
      return {
        dialog: true,
        photoId: photoId,
        status: dialog,
        mentions: [],
      };
    } else {
      return {};
    }
    
  }

  closeDialog() {
    this.setState({
      dialog: false,
    });
  }

  handleChange(event) {
    this.setState({
      comment: event.target.value,
    });
  }

  handleSubmit() {
    console.log(0 && this);
    // console.log(event.target.value);
    console.log(this.state.comment);
    axios.post("/commentsOfPhoto/"+this.state.photoId.toString(),{comment: this.state.comment, mentions: this.state.mentions}).then((response) => {
      console.log(response);
      //todo: add a new comment entry
      //      or refresh
      this.state.addComment(this.state.photoId, response.data);
    }).catch(console.log);
    this.setState({
      dialog: false,
      comment: ''
    });
  }

  addMention(id) {
    const mentions = this.state.mentions;
    mentions.push(id);
    this.setState({
      mentions: mentions
    });
  }

  render() {
    return (
      <Dialog
        open={this.state.dialog}
        onClose={this.closeDialog}
        style={{
          // width: "400px",
            overflow: 'visible',
            flexFlow: "column",
        }}
        // overflowY='visible'
        maxWidth='sm'
        fullWidth={true}
        >
        <DialogTitle>New Comment</DialogTitle>
        <DialogContent
          style={{
            overflow: 'visible'
          }}
          >
          {/* <TextField
            label="Comment"
            style={{
              width: "100%",
              margin: "10px 0px",
            }}
            multiline
            rows={5}
            value={this.state.comment}
            onChange={this.handleChange}
          /> */}
          <MentionsInput 
            className='mentionWrapper'
            value={this.state.comment} 
            onChange={this.handleChange}
            rows={5}
            placeholder='Comment'
            >
            <Mention
              trigger="@"
              data={this.state.users}
              onAdd={(id)=>this.addMention(id)}
              // markup='<a href="/users/__id__">__display__</a>'
            />
          </MentionsInput>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            style={{
              marginBottom: "20px"
            }}
            onClick={this.handleSubmit}
            >
            Publish!
          </Button>
          <Button
            variant="contained"
            style={{
              marginBottom: "20px"
            }}
            onClick={()=>this.closeDialog()}
            >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default CommentDialog;