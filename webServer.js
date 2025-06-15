/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs142 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const express = require("express");

const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const uploader = multer({ dest: 'images/'});

const { createHash } = require('node:crypto');

const app = express();
app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");
const Activity = require("./schema/activity.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
// const cs142models = require("./modelData/photoApp.js").cs142models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

function check_login(request) {
  console.log(request.session);
  return 'user' in request.session && request.session.user !== '';
}

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", function (request, response) {
  if (check_login(request)) {
    User.find(function(error, users) {
      if (error) {
        response.status(400).send(error);
      } else {
        response.status(200).send(JSON.stringify(users.map(u => ({
          _id: u._id,
          first_name: u.first_name,
          last_name: u.last_name
        }))));
      }
    });
  } else {
    response.status(401).send('not login');
  }

});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", function (request, response) {
  if (!check_login(request)) {
    response.status(401).send('not login');
    return;
  }
  const id = request.params.id;
  console.log(`access /user/${id}`);
  User.find({_id: id}).exec(function(error, users) {
    if (error) {
      response.status(400).send(error);
    } else if (users.length !== 1) {
      response.status(400).send(users.toString());
    } else {
      const user = {
        _id: users[0]._id,
        first_name: users[0].first_name,
        last_name: users[0].last_name,
        location: users[0].location,
        description: users[0].description,
        occupation: users[0].occupation
      };
      response.status(200).send(JSON.stringify(user));
    }
  });
});

app.get("/userdetail/:id", function(request, response) {
  if (!check_login(request)) {
    response.status(401).send('not login');
    return;
  }

  const uid = request.params.id;

  Photo.find({$and: [
                {user_id: uid}, 
                {$or: [
                  {perm: {$exists: false}}, 
                  {perm: {$elemMatch: {$eq:request.session.user}}},
                  {user_id: request.session.user}]}]}, undefined, {limit:1, sort: 'date_time'}).exec(function(err, photo) {
    if(err) {
      response.status(200).send(JSON.stringify({}));
    } else {
      console.log(photo);
      if (photo.length > 0) {
        if (photo[0].comments.length > 0) {
          photo[0].comments.sort(i=>i.date_time);
          photo[0].comments = photo[0].comments.slice(-1);
        } else {
          photo[0].comments = [];
        }
      } else {
        photo = [{}];
      }

      const last = photo[0];
      const idobj = mongoose.Types.ObjectId(uid);
      // Photo.find({comments: {$elemMatch: {mentions: {$elemMatch: {$eq: idobj}}}}}, function(error, photos) {
      Photo.find({$and: [
                  {comments: 
                    {$elemMatch: 
                      {mentions: 
                        {$elemMatch: 
                          {$eq: idobj}}}}}, 
                  {$or: [
                    {perm: {$exists: false}}, 
                    {perm: {$elemMatch: {$eq:request.session.user}}},
                    {user_id: request.session.user}]}]}, function(error, photos) {
        console.log(photos);
        const final = [].concat(last, ...photos).filter(x => 'comments' in x);
        response.status(200).contentType('json').send(JSON.stringify(final));
      });
    }
  });
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", function (request, response) {
  if (!check_login(request)) {
    response.status(401).send('not login');
    return;
  }

  const id = request.params.id;
  console.log(`access /photosOfUser/${id}`);

  Photo.find({$and: [
              {user_id: id}, 
              {$or: [
                {perm: {$exists: false}}, 
                {perm: {$elemMatch: {$eq:request.session.user}}},
                {user_id: request.session.user}]}]}).exec(function(error, photos) {
    if (error) {
      response.status(400).send(error);
    } else {
      const users = [];
      photos.forEach(p => {
        p.comments.forEach(c => {
          const cpid= c.user_id.toString();
          if (users.indexOf(cpid) < 0){
            users.push(cpid);
          }
        });
      });

      User.find({_id: {$in: users}}).exec(function(err, us) {
        if(err) {
          console.log(err);
        }
        const users_table = new Map(
          us.map(u => ([u._id.toString(), {
            first_name: u.first_name,
            last_name: u.last_name
          }]))
        );
        
        const newphoto = photos.map(p => ({
          _id: p._id,
          file_name: p.file_name,
          date_time: p.date_time,
          user_id: p.user_id,
          comments: p.comments.map(c => ({
            comment: c.comment,
            date_time: c.date_time,
            _id: c._id,
            user: users_table.get(c.user_id.toString())
          }))
        }));

        response.status(200).contentType('json').send(JSON.stringify(newphoto));
      });
    }
  });
});

function logActivity(type, username, userid, photoid=null, photopath=null, comment=null) {
  const activity = {
    type: type,
    time: new Date(),
    username: username,
    userid: userid
  };

  switch(type) {
    case 'login':
      break;
    case 'logout':
      break;
    case 'register':
      break;
    case 'upload':
      activity.photo_id = photoid;
      activity.photo_path = photopath;
      break;
    case 'comment':
      activity.photo_id = photoid;
      activity.photo_path = photopath;
      activity.comment = comment;
      break;
    default:
      break;
  }

  const act = new Activity(activity);
  act.save();
}

app.get("/activities", function(request, response) {
  if (check_login(request)) {
    Activity.find(undefined, undefined, {limit:5, sort: {time: -1}}).exec((err, activities) => {
      if(!err && activities.length > 0) {
        response.status(200).contentType('json').send(JSON.stringify(activities));
      } else {
        response.status(200).contentType('json').send(JSON.stringify({}));
      }
    });
  } else {
    response.status(401).send('failed');
  }
});

app.get("/admin/login", function(request, response) {
  if (check_login(request)) {
    response.status(200).send(JSON.stringify({user: request.session.user}));
  } else {
    response.status(401).send('failed');
  }
});

function hash(salt_string, password) {
  const sha1 = createHash('sha-1');
  sha1.update(salt_string);
  sha1.update(password);
  return sha1.digest('hex');
}

app.post("/admin/login", function(request, response) {
  const username = request.body.loginname;
  const password = request.body.password;
  //todo: login logic
  console.log(username, password);
  User.find({login_name: username}).exec((err, user) => {
    if (!err && user.length) {
      console.log(user);
      const u = user[0];
      const salt_string = u.salt_string;
      const ph = hash(salt_string, password);
      if (ph === u.password) {
        request.session.user = u._id;
        request.session.username = u.first_name + ' ' + u.last_name;
        logActivity('login', request.session.username, request.session.user);
        response.status(200).send(JSON.stringify(u));
      } else {
        response.status(401).send('failed');
      }

    } else {
      response.status(401).send('failed');
    }
  });
});

app.get("/admin/logout", function(request, response) {
  logActivity('logout', request.session.username, request.session.user);
  delete request.session.user;
  response.status(200).send('ok');
});

app.post("/commentsOfPhoto/:photo_id", function(request, response) {
  if (!check_login(request)) {
    response.status(401).send('not login');
    return;
  }

  const photoid = request.params.photo_id;
  const comment = request.body.comment;
  const mentions = request.body.mentions;
  console.log(mentions);
  console.log(photoid, comment);
  if (comment.length !== 0) {
    Photo.find({_id: photoid}).exec((err, photos) => {
      if (err) {
        console.log(err);
        response.status(400).send('failed');
      } else {
        const photo = photos[0];
        // const mention_str = /@\[(?<display>[\w\d ]+)\]\((?<id>[0-9a-f]+)\)/;
        // comment = escape(comment);
        // comment = comment.replace(mention_str, '<a href="#/users/$<id>">$<display></a>');
        const new_comment = {
          comment: comment,
          date_time: new Date().toISOString(),
          user_id: request.session.user,
          mentions: mentions,
        };
        photo.comments = photo.comments.concat([new_comment]);
        photo.save();
        logActivity('comment', request.session.username, request.session.user, photo._id, photo.file_name, comment);
        response.status(200).send(JSON.stringify(new_comment));
      }
    });
  } else {
    response.status(400).send('empty comment');
  }
});

app.post("/photos/new", uploader.single('file'), function(request, response) {
  if (!check_login(request)) {
    response.status(401).send('not login');
    return;
  }

  const file = request.file;
  const perm = JSON.parse(request.body.perm);
  let newItem = {
    user_id: request.session.user,
    file_name: file.filename,
    date_time: new Date(),
    comments: [],
  };
  if (typeof perm.perm === "string" && perm.perm === "all") {
    console.log('all permit. do nothing');
  } else if (perm.perm instanceof Array) {
    console.log('add perm', perm.perm);
    newItem.perm = perm.perm;
  }

  const newPhoto = new Photo(newItem);
  newPhoto.save().then((photo) => {
    console.log(photo);
    logActivity('upload', request.session.username, request.session.user, photo._id, photo.file_name);
    response.status(200).send('ok');
  }).catch((err) => {
    console.log(err);
    response.status(400).send('failed');
  });
});

function salt() {    
  let t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  let a = t.length;
  let n = "";
  for(let i = 0;i < 32;i++) {
    n += t.charAt(Math.floor(Math.random() * a));
  }
  return n;
}

app.post('/user', function(request, response) {
  const login_name = request.body.login_name;
  const password = request.body.password;
  const first_name = request.body.first_name;
  const last_name = request.body.last_name;
  const location = request.body.location;
  const description = request.body.description;
  const occupation = request.body.occupation;
  const salt_string = salt();

  User.find({login_name: login_name}).exec((err, users) => {
    if (err) {
      console.log(err);
    } else if (users.length > 0) {
      console.log('existed');
      response.status(200).send('existed');
    } else {
      const newUser = new User({
        login_name: login_name,
        password: hash(salt_string, password),
        first_name: first_name,
        last_name: last_name,
        location: location,
        description: description,
        occupation: occupation,
        salt_string: salt_string,
      });
      newUser.save().then(nu => {
        logActivity('register', first_name + ' ' + last_name, nu._id);
        response.status(200).send('ok');
      });
    }
  });
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
