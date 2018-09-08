var rootFontSize = 14;
var fontSize = 14;

var lrcUrl = '';
var musicUrl = '';
var albumUrl = '';
var downUrl = '';

var lrc = '';
var lrcLineHeight = 1.4;
var blurRadius = 1;
var currentTime = 0;
var isWeixin = 0;
var swfUrl = '';

var nolrc = "<div class='nolrc'>抱歉，暂无歌词</div>";

var screenSize = {
	width: 0,
	height: 0
};

var font_ratio = 1;
var current_orientation = 'Portrait';

var sources = [
false,
'来自杰克船长',
'来自杰克船长',
'来自杰克船长',
'杰克船长'
];

var styleEl = null;
var intervalTimer = null;
var ignoreTimeUpdate = true;

function Init(options) {
	font_ratio = rootFontSize / document.getElementById('ot').offsetWidth;
	if (!IsPC()) {
		styleEl = document.getElementById('style');
		getOrientation();
		if (current_orientation === 'Portrait') {
			styleEl.href = 'client_player/css/portrait.css';
		} else if (current_orientation === 'Landscape') {
			styleEl.href = 'client_player/css/landscape.css';
		}
		window.addEventListener("orientationchange", orientationChange, false);
		window.addEventListener("resize", MobileResized, false);
		albumUrl = options.middleImgUrl;
		screenSize.width =  window.innerWidth ? window.innerWidth : document.body.offsetWidth;
		screenSize.height = window.innerHeight ? window.innerHeight : document.body.offsetHeight;
	} else {
		loadcss('client_player/css/pc.css');
		albumUrl = options.largeImgUrl;
	}
	lrcUrl = encodeURI(decodeURI(options.lrcUrl));
	musicUrl = encodeURI(decodeURI(options.musicUrl));
	downUrl = encodeURI(decodeURI(options.downUrl));
	isWeixin = (options.isWeixin === '1') || is_weixin();
	swfUrl = encodeURI(decodeURI(options.swfUrl));
	if(downUrl == ''){
		$(".downloadButton").hide();
		$(".downloadButton").unbind('click');
	}else{
		$(".downloadButton").show();
		$(".downloadButton").click(function() {
			download(downUrl, isWeixin);
		});
	}
	if (sources[options.carrierCode]) {
		if(4 == options.carrierCode){
			$('#source').html('<img src="client_player/images/xiami.png" />' + sources[options.carrierCode]);
		}else{
			$('#source').html(sources[options.carrierCode]);
		}
	}else{
		$('#source').hide();
    }
	bgInit();
	fontInit();
	coverInit();
	playerInit();
	lrcInit();
	layoutUpdate();
}

function Update() {
	if (fontUpdate()) {
		layoutUpdate();
		bgUpdate();
		if ($('#topmask').css('display') !== 'none')
			$('#topmask').fadeOut(300);
		
	}
}

function MobileResized() {
	layoutUpdate();
	bgUpdate();
	if ($('#topmask').css('display') !== 'none')
		$('#topmask').fadeOut(300);
}

//平台、设备和操作系统   
function IsPC() 
{ 
	var userAgentInfo = navigator.userAgent; 
	var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"); 
	var flag = true;
	for (var v = 0; v < Agents.length; v++) { 
		if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; } 
	} 
	return flag;
}

function is_weixin()
{  
	return /MicroMessenger/i.test(navigator.userAgent); 
}

function orientationChange()
{
	$('#topmask').show();
	getOrientation();
	if (current_orientation === 'Portrait') {
		styleEl.href = '../client_player/css/portrait.css';
	} else if (current_orientation === 'Landscape') {
		styleEl.href = '../client_player/css/landscape.css';
	}
}

function getOrientation() {
	switch (window.orientation) {
		case 0: // Portrait
		case 180: // Upside-down Portrait
		current_orientation = 'Portrait';
		break;
		case -90: // Landscape: turned 90 degrees counter-clockwise
		case 90: // Landscape: turned 90 degrees clockwise
		current_orientation = 'Landscape';
		break;
		default:
		break;
	}
}

function loadcss(path){
	if(!path || path.length === 0){
		throw new Error('argument "path" is required !');
	}
	var head = document.getElementsByTagName('head')[0];
	var link = document.createElement('link');
	link.href = path;
	link.rel = 'stylesheet';
	link.type = 'text/css';
	head.appendChild(link);
}

function bgInit() {
	var bgImage = document.getElementById('bg_image');
	bgImage.onload = function() {
		bgUpdate();
		$(bgImage).css({'background-image': 'url(' + albumUrl + ')'});
	};
	bgImage.src = albumUrl;
}

function bgUpdate() {
	var bgImage = document.getElementById('bg_image');
	var bgImage_ratio = bgImage.offsetWidth / bgImage.offsetHeight;
	var window_ratio = screenSize.width / screenSize.height;
	if (bgImage_ratio > window_ratio) {
		$(bgImage).css({"height": '100%', 'width': 'auto'});
		var ix = (screenSize.width - bgImage.offsetWidth) / 2;
		$(bgImage).css({"left": ix, "top": 0});
	} else if (bgImage_ratio < window_ratio) {
		$(bgImage).css({"width": '100%', 'height': 'auto'});
		var iy = (screenSize.height - bgImage.offsetHeight) / 2;
		$(bgImage).css({"top": iy, "left": 0});
	} else {
		$(bgImage).css({"width": '100%', 'height': '100%'});
	}
}

function coverInit() {
	var cover = document.getElementById('album');
	var coverImg = $('.cd img')[0];
	coverImg.onload = function() {
		coverUpdate();
		$(coverImg).addClass('show');
		$('#topmask').fadeOut(300);
	};
	coverImg.src = albumUrl;
}

function coverUpdate() {
	var cover = document.getElementById('album');
	var coverImg = $('.cd img')[0];
	var coverImg_ratio = coverImg.offsetWidth / coverImg.offsetHeight;
	if (coverImg_ratio > 1) {
		$('.cd img').css({'height': '100%', 'width': 'auto'});
		var ix = (cover.offsetWidth - coverImg.offsetWidth) / 2;
		$('.cd img').css({'margin-left': ix + 'px'});
	} else {
		$('.cd img').css({'width': '100%', 'height': 'auto'});
	}
}

function fontInit() {
	if (!IsPC()) {
		screenSize.width = window.innerWidth ? window.innerWidth : document.body.offsetWidth;
		if (current_orientation === 'Portrait') {
			fontSize = parseInt(rootFontSize * screenSize.width / 360 * font_ratio);
		} else if (current_orientation === 'Landscape') {
			fontSize = parseInt(rootFontSize * screenSize.width / 640 * font_ratio);
		}
	}
	$('html, body').css({'font-size': fontSize + 'px'});
}

function fontUpdate() {
	var w = window.innerWidth ? window.innerWidth : document.body.offsetWidth;
	var h = window.innerHeight ? window.innerHeight : document.body.offsetHeight;
	var re1 = current_orientation === 'Portrait' && h >= w;
	var re2 = current_orientation === 'Landscape' && w >= h;
	if (re1 || re2) {
		fontInit();
		return true;
	}
	return false;
}

function playerInit() {
	var progress = $('#progress');
	var player = $("#jquery_jplayer_single");
	var playerData = null;

	progress.noUiSlider({
		start: [ 0 ],
		range: {
			'min': [   0 ],
			'max': [ 100 ]
		}
	});

	player.jPlayer({
		ready: function (event) {
			if (musicUrl.match(/\.m4a/i)) {
				$(this).jPlayer("setMedia", {
					m4a: musicUrl
				});
			} else {
				$(this).jPlayer("setMedia", {
					mp3: musicUrl
				});
			}
			playerData = player.data("jPlayer");
		},
		play: function(event) {
			if ((lrc!="")&&(lrc != null)) {
				$.lrc.start(lrc, function() {
					return currentTime;
				});
			}
			ignoreTimeUpdate = false;
			$("#logowebkit").addClass("logowebkit");
		},
		pause: function(event) {
			ignoreTimeUpdate = true;
			$("#logowebkit").removeClass("logowebkit");
		},
		timeupdate: function(event) {
			if (!ignoreTimeUpdate) {
				progress.val(event.jPlayer.status.currentPercentAbsolute);
				var base = $('.noUi-base', progress);
				var origin = $('.noUi-origin', progress);
				origin.css({
					'left': Math.floor(base[0].offsetWidth - origin[0].offsetWidth)
				});
			}
			if(event.jPlayer.status.currentTime==0) {
				currentTime = 0;
			} else {
				currentTime = event.jPlayer.status.currentTime;
			}
		},
		preload: "auto",
		smoothPlayBar: true,
		cssSelectorAncestor: "#jp_container_single",
		swfPath: swfUrl,
		supplied: "mp3, m4a",
		wmode: "window"
	});

	progress.on({
		slide: function() {
			$('.jp-progress-passed').css({'margin-left': progress.val() - 100 + '%'});
			ignoreTimeUpdate = true;
		},
		set: function(){
			$('.jp-progress-passed').css({'margin-left': progress.val() - 100 + '%'});
		},
		change: function() {
			player.jPlayer("playHead", progress.val() * (100 / player.data("jPlayer").status.seekPercent));
			if (player.data("jPlayer").status.paused || player.data("jPlayer").status.ended) {
				player.jPlayer("play");
			}
			ignoreTimeUpdate = false;
		}
	});

}

function lrcInit() {
	if($('#lrc_content').val() ==""){
		$("#lrc").html(nolrc);
	}else{
		lrc = $('#lrc_content').val();
		lrc = replaceTtpod(lrc);
		$.lrc.hoverTop = 2;
		$.lrc.start(lrc, 'init');
		$.lrc.lineheight = $('#lrc li')[0].offsetHeight;
	}

}

function download(url, isWeixin){
	if(isWeixin) {
		$('#overlay').show();
		$('#overlay').click(function() {
			$(this).hide().unbind('click');
		});
	} else {
		window.open(encodeURI(decodeURI(url)));
	}
}

function layoutUpdate() {
	if (!IsPC()) {
		screenSize.width =  window.innerWidth ? window.innerWidth : document.body.offsetWidth;
		screenSize.height = window.innerHeight ? window.innerHeight : document.body.offsetHeight;
	} else {
		screenSize.width =  360;
		screenSize.height = 640;
	}
	var height = 0;
	height += document.getElementById('info').offsetHeight;
	height += document.getElementById('album').offsetHeight;
	height += document.getElementById('lrc').offsetHeight;
	height += document.getElementById('player_controller').offsetHeight;
	if (document.getElementById('download'))
		height += document.getElementById('download').offsetHeight;
	var spaceHeight = screenSize.height - height;
	// $('.holder-1').css({'height': spaceHeight * 0.18});
	// $('.holder-2').css({'height': spaceHeight * 0.18});
	// $('.holder-3').css({'height': spaceHeight * 0.20});
	// $('.holder-4').css({'height': spaceHeight * 0.15});
	// $('.holder-5').css({'height': spaceHeight * 0.14});
	// $('.holder-6').css({'height': spaceHeight * 0.15});
	if (parseInt($('.spaceholder').css('height')) < 6) {
		$('.spaceholder').css({'height': 6});
	}
}

function replaceTtpod(str){
	if (!str) {
		return "";
	}
	
	var newStr = str;
	newStr = newStr.replace(/好音质,剑北音乐!/g, '');
	newStr = newStr.replace(/好音质,剑北音乐./g, '');
	newStr = newStr.replace(/好音质,剑北音乐/g, '');
	newStr = newStr.replace(/www.jianbei.xyz/g, '');
	newStr = newStr.replace(/剑北音乐/g, '剑北');
	
	return newStr;
}