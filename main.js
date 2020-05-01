audio_file.onchange = function(){
    var files = this.files;
    var file = URL.createObjectURL(files[0]); 
    audio_player.src = file; 
};
