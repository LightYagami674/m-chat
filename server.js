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


var users=[];

io.on('connection',function(socket){


    //usercheck event
    socket.on('usercheck',function (e) {
        var user=e.username
        var res=arrCheck(user,users);
        socket.emit('usercheckresult',{result:res});

    })

    //adding user to the users array
    socket.on('adduser',function (e) {
        users.push(e.username);
        socket.join(e.roomname);
        //emit to all
        io.to(e.roomname).emit('updateuserlist',{list:users});
        console.log("added "+e.username+" to the room "+e.roomname);

    })

    //handler for getting and sending messages
    socket.on('sendmessage',function (e) {

        console.log("Got message from "+e.username+" inside the room "+e.roomname);
        socket.broadcast.to(e.roomname).emit('recievemessage',{username:e.username,message:e.message});

    })

    //leave the socket
    socket.on('leave',function(e){
        users.splice(users.indexOf(e.username),1);
        socket.leave(e.roomname);
        io.to(e.roomname).emit('updateuserlist',{list:users});
    })
    
    //exclusive event for showlist
    socket.on('showlist',function (e) {
        socket.emit('updateuserlist',{list:users});
    })




})


function arrCheck(user,users){
    for(i=0;i<users.length;i++){

        if(user===users[i]){
            return false;
        }

    }

    return true;
}









http.listen(8080, function () {
    console.log("Server Running :D")
})