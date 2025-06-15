import React from "react";
import {Link} from 'react-router-dom';
import {
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";

import "./styles.css";
import Avatar from "./avatar";

/**
 * Define UserList, a React component of CS142 Project 5.
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: props.users,
    };
  }

  static getDerivedStateFromProps(props) {
    return {
      users: props.users
    };
  }

  render() {
    return (
      <div>
        {/* <Typography variant="body1">
          This is the user list, which takes up 3/12 of the window. You might
          choose to use <a href="https://mui.com/components/lists/">Lists</a>{" "}
          and <a href="https://mui.com/components/dividers/">Dividers</a> to
          display your users like so:
        </Typography> */}
        
        <List component="nav" sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
        {
          this.state.users.map((user) => (
            <div key={user._id}>
              <Link to={'/users/' + user._id} >
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar uid={user._id.toString()} size={48} />
                </ListItemAvatar>
                <ListItemText
                  primary={user.first_name + ' ' + user.last_name}
                  secondary={(
                    <React.Fragment>
                      <Typography
                        sx={{ display: 'inline' }}
                        component='span'
                        variant='body2'
                        color='text.primary'
                      >
                        {user.occupation}
                      </Typography>
                      {/* {' - ' + user.description} */}
                    </React.Fragment>
                  )}
                />
              </ListItem>
              </Link>
              <Divider />
            </div>
          ))
        }
        </List>
        {/* <Typography variant="body1">
          The model comes in from window.cs142models.userListModel()
        </Typography> */}
      </div>
    );
  }
}

export default UserList;
