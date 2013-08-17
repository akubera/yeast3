
$(uttt_init);

function uttt_init() {
  console.log("uttt_init");
  extend_jquery();    
}


function extend_jquery() {
  console.log("extending jquery");
  // 
  jQuery.fn.center = function () {
      this.css("position","absolute");
      this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");
      this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
      return this;
  }

}
