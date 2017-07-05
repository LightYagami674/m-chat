var app = require('express')();
var express=require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('plugins'));


app.get('/', function (req,res) {
    res.sendfile("index.html")
})

app.get('/index',function (req,res){
    res.sendfile("index.html")
})

app.get('/chatpage',function (req,res) {
    res.sendfile("chatpage.html")
})


var users={};

io.on('connection',function(socket){

    //usercheck event
    socket.on('usercheck',function (e) {

        var res=jsonCheck(e.username,e.roomname);
        socket.emit('usercheckresult',{result:res});

    })

    //adding user to the users array
    socket.on('adduser',function (e) {
        addToUsersList(e.username,e.roomname);
        socket.join(e.roomname);
        //emit to all
        io.to(e.roomname).emit('updateuserlist',{list:users[e.roomname]});
        console.log(users);

    })

    //handler for getting and sending messages
    socket.on('sendmessage',function (e) {

        socket.to(e.roomname).broadcast.emit('recievemessage',{username:e.username,message:e.message});

    })

    //leave the socket
    socket.on('leave',function(e){

        var room=e.roomname;

        users[room].splice(users[room].indexOf(e.username),1);
        socket.leave(e.roomname);
        io.to(e.roomname).emit('updateuserlist',{list:users[e.roomname]});
    })
    
    //exclusive event for showlist
    socket.on('showlist',function (e) {
        socket.emit('updateuserlist',{list:users[e.roomname]});
    })




})




function jsonCheck(user,room) {
    if(room in users){
        return true;
    }
    else{
        return true;
    }
}

function addToUsersList(name,room) {
    if(room in users){
        users[room].push(name);
    }
    else{
        users[room]=[];
        users[room].push(name);
    }
}









http.listen(process.env.PORT || 8080, function () {
    console.log("Server Running :D")
})