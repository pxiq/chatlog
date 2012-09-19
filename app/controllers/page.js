var c = module.exports;

c.beforeAction = function(){
   
}

c.index = function(){
    // if(!this.session('user')) 
    //   this.redirect('page/user');
    // else 
    this.render('page/index');
}

c.room = function(){
   var displayname      = this.get("displayname");
   var signature   = this.get("signature");
   var room_id      = this.get("room_id");
   this.render('page/room',{displayname:displayname,signature:signature,room_id:room_id});
}

c.join_room = function(){
   this.layout="empty";
   var room_id  = this.get("room_id");
   this.render('page/join_room',{room_id:room_id});
}

c.create_room = function(){
   this.layout="empty";
   this.render('page/create_room');
}