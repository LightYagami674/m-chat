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
        socket.username=e.username;
        socket.roomname=e.roomname;


    })

    //handler for getting and sending messages
    socket.on('sendmessage',function (e) {

        socket.to(e.roomname).broadcast.emit('recievemessage',{username:e.username,message:e.message});

    })

    //if user disconnects immediately
    socket.on('disconnect',function(){
        if(socket.roomname in users) {

            users[socket.roomname].splice(users[socket.roomname].indexOf(socket.username), 1);

            if(isRoomEmpty(users[socket.roomname])){
                delete users[socket.roomname];
                var list=getRoomList();
                io.emit('resroomlist',{list:list});
            }
            io.to(socket.roomname).emit('updateuserlist',{list:users[socket.roomname]});


        }



    })


    
    //exclusive event for showlist
    socket.on('showlist',function (e) {
        socket.emit('updateuserlist',{list:users[e.roomname]});
    })


    socket.on('reqroomlist',function(){
        var list = getRoomList();
        socket.emit('resroomlist',{list:list});
    })



    //image handling events
    socket.on('sendImage',function (e) {
        var tdata=e.image;
        socket.to(socket.roomname).emit("recieveImage",{username:socket.username,image:tdata});

    })




})




function jsonCheck(user,room) {
    if(room in users){
        return !users[room].includes(user);
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
        var list=getRoomList();
        io.emit("resroomlist",{list:list});

    }
}

function getRoomList(){
    var list=[];
    for(room in users){
        list.push(room);
    }

    return list;
}

function isRoomEmpty(room) {
    if(room.length===0) {
        return true;
    }
    else{
        return false;
    }

}






http.listen(process.env.PORT || 8080, function () {
    console.log("Server Running :D")
})