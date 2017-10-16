function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function moveObj (obj_id) {
  var el = document.getElementById(obj_id);
  var window_w = window.innerWidth;
  // var obj_x_pos = Number.parseInt(el.style.right.replace("px",""));
  el.style.right = window_w*3+"px";
  setTimeout(function(){
    document.body.removeChild(el);
  },500);
}
function swipeBackground(){
  var el = document.createElement('div');
  var window_w = window.innerWidth;
  var window_h = window.innerHeight;
  var obj_id = 'swipping-'+getRandomInt(0,5000);
  el.setAttribute('class','swipping');
  el.setAttribute('id',obj_id);
  el.style.width = (window_w*2)+"px";
  el.style.height = window_h+"px";
  el.style.right = "-"+window_w+"px";
  document.body.appendChild(el);
  navigator.vibrate(150);
  moveObj(obj_id);
}

(function (){
  console.log("App loaded");

  document.body.addEventListener('click', swipeBackground);

})();
