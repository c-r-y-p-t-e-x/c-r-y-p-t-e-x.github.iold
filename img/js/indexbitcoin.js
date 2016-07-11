
var ColorFader = function() {
	this.numSteps = 0;
	this.startingRed = 0;
	this.startingGreen = 0;
	this.startingBlue = 0;
	this.endingRed = 0;
	this.endingGreen = 0;
	this.endingBlue = 0;
	this.deltaRed = 0;
	this.deltaGreen = 0;
	this.deltaBlue = 0;
	this.currentRed = 0;
	this.currentGreen = 0;
	this.currentBlue = 0;
	this.currentStep = 0;
	this.timerID = 0;
};

var defaults = {	
	startR : 0, 
	startG : 0, 
	startB : 0, 
	endR : 255, 
	endG : 255, 
	endB : 255, 
	nSteps : 25,
	nTotalTime : 1,
	onFade : function(){},
	onFadeComplete : function(){}
};

ColorFader.prototype.getColors = function(options) {
  this.options = options || defaults;
  this.currentRed = this.startingRed = parseInt(this.options.startR, 10);
  this.currentGreen = this.startingGreen = parseInt(this.options.startG, 10);
  this.currentBlue = this.startingBlue = parseInt(this.options.startB, 10);
  this.endingRed = parseInt(this.options.endR, 10);
  this.endingGreen = parseInt(this.options.endG, 10);
  this.endingBlue = parseInt(this.options.endB, 10);
  this.numSteps = parseInt(this.options.nSteps, 10);
  this.deltaRed = (this.endingRed - this.startingRed) / this.numSteps;
  this.deltaGreen = (this.endingGreen - this.startingGreen) / this.numSteps;
  this.deltaBlue = (this.endingBlue - this.startingBlue) / this.numSteps;
  this.currentStep = 0;
  this.nTotalTime = this.options.nTotalTime;
  var out = [];
  var self = this;
  var _fade = function() {
    self.currentStep++;
    if (self.currentStep <= self.numSteps) {
      var hexRed = ColorFader.decToHex(self.currentRed);
      var hexGreen = ColorFader.decToHex(self.currentGreen);
      var hexBlue = ColorFader.decToHex(self.currentBlue);
      var color = "#" + hexRed + "" 
      + hexGreen + "" 
      + hexBlue + "";
      out.push(color);
      self.currentRed += self.deltaRed;
      self.currentGreen += self.deltaGreen;
      self.currentBlue += self.deltaBlue;
      _fade();
    } else {
      var hexRed = ColorFader.decToHex(self.endingRed);
      var hexGreen = ColorFader.decToHex(self.endingGreen);
      var hexBlue = ColorFader.decToHex(self.endingBlue);
      var color = "#" + hexRed + "" 
      + hexGreen + "" 
      + hexBlue + "";
      out.push(color);
    }
  };
  _fade();
  return out;
};
  
ColorFader.hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

ColorFader.decToHex = function(decNum) {
	decNum = Math.floor(decNum);
	var decString = "" + decNum;
	for (var i=0; i<decString.length; i++) {
		if (decString.charAt(i)>='0' && decString.charAt(i)<='9') {}
		else {
			console.log(decString+" is not a valid decimal number because it contains " + decString.charAt(i));
 			return decNum;
		}
	}
	var result = decNum, remainder = "", hexNum = "";
	var hexAlphabet = new Array("0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F");
	while (result>0) {
		result=Math.floor(decNum/16);
		remainder=decNum%16;
		decNum=result;
		hexNum=""+hexAlphabet[remainder]+""+hexNum;
	};
	if (hexNum.length==1)
		hexNum="0"+hexNum;
	else if (hexNum.length==0)
		hexNum="00";
	return hexNum;
}; 

var hexDigits = new Array
        ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"); 

//Function to convert hex format to a rgb color
function rgb2hex(rgb) {
 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
 return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
 }

var getNextFadeColor = function(col) {
  col = rgb2hex(col);
  var rgb = ColorFader.hexToRgb(col);
  var cf = new ColorFader();
  var cols = cf.getColors({	
	startR : rgb.r, 
	startG : rgb.g, 
	startB : rgb.b, 
	endR : 255, 
	endG : 255, 
	endB : 255, 
	nSteps : 2
  });
  return cols[1];
};

$('#instrument').change(function(){
initWS();
});

function getFutureSuffix() {
	return $('#instrument').val();
}
var bidTV = [];
var askTV = [];
var baDelta = [];

function initWS() {
  bidTV = [];
  askTV = [];
  baDelta = []; 
  var wsUri ="wss://real.okcoin.com:10440/websocket/okcoinapi"; 
  websocket = new WebSocket(wsUri); 
  websocket.onopen = function(evt) { 
   websocket.send("{'event':'addChannel','channel':'ok_btcusd_future_depth_" + getFutureSuffix() + "'}"); 
   websocket.send("{'event':'addChannel','channel':'ok_btcusd_future_ticker_" + getFutureSuffix() + "'}"); 
   websocket.send("{'event':'addChannel','channel':'ok_btcusd_future_trade_" + getFutureSuffix() + "'}"); 
  };   
  
websocket.onmessage = function(evt) { 
  var incoming = JSON.parse(evt.data)[0];
  var depth = incoming.data;
  var channel = incoming.channel;
      $("#donate").css('display','block');
  if(channel === 'ok_btcusd_future_depth_' + getFutureSuffix()) 
     doDepth(depth, last);
  if(channel === 'ok_btcusd_future_ticker_' + getFutureSuffix()) {
     var $last = $('#last');
     var lv = parseFloat($last.text());
     $last.text(depth.last);
     alast.push(parseFloat(depth.last));
     if(alast.length > 100) alast.shift();
     $("#graph").sparkline(alast, slSettings);
    
     TweenMax
      .to($last, 0.1, { 
        'opacity' : 1, 
        'color' : depth.last > lv ? '#00ff00' : (depth.last < lv ? '#ff0000' : getNextFadeColor($last.css('color').toString()))
      });
     TweenMax
      .to($last, 0.1, { 
        'opacity' : 0.6, 
        delay : 0.1
      });    
  }
  if(channel === 'ok_btcusd_future_trade_' + getFutureSuffix()) {

    if(depth.length>1) {
      for(var dd in depth) {
        dd = depth[dd];
        alast.push(parseFloat(dd[0]));
        if(alast.length > 100) alast.shift();
      }
      $("#graph").sparkline(alast, slSettings);
    } else {
      var lastt = depth[0];
      alast.push(parseFloat(lastt[0]));
      if(alast.length>100) alast.shift();
      var pp = "#p" + lastt[0].replace('.','_');
      $(pp).css('background-color',lastt[3] === 'bid' ? '#00ff00' :'#ff0000'); 
      $("#graph").sparkline(alast, slSettings);
    }
  }
};
  
  
}

initWS();

var getTotalVolume = function(mm) {
  var v = 0;
  _.each(mm, function(b){
    v += b[1];
  });
  return v;
}
var getVolumeBounds = function(mm) {
  var v = {
    min : mm[0][1],
    max : mm[0][1],
  };
  _.each(mm, function(b){
    if(v.min>b[1]) v.min=b[1];
    if(v.max<b[1]) v.max=b[1];
  });
  v.range = v.max - v.min;
  return v;
}

var doBook = function(m, rev) {
   if(rev) m.reverse();
	var o = '', 
     vol = 0, 
       i = 0, 
      oo = [];
  _.each(m, function(bid){
    var tvol = bid[1];
    vol   += tvol;
    bid[2] = tvol;
    bid[1] = vol;
    if(i>9) {
      bid[2] += tvol;
      if(i%3===2) 
        oo.push(m[i]);
    } 
    else oo.push(m[i]);
    i++;
  });
  if(rev) oo.reverse();
  return oo; 
};

var doDepth = function(depth) {
  // bid, ask, total volume bid/ask
  var bids = depth.bids, asks = depth.asks, b = '';
  var bt = getTotalVolume(bids);
  var at = getTotalVolume(asks);
  var vbb = getVolumeBounds(bids);
  var vba = getVolumeBounds(asks);
  
  var gvbo = function(_vb,_v) {
    var dv = _v / _vb.range;
    dv = dv < 0.1 ? 0.1 : dv;
    return dv;
  };
  
  // bid volumes array, ask volumes array
  // bid/ask volume delta array
  bidTV.push(bt);
  if(bidTV.length > alast.length) bidTV.shift();
  askTV.push(at);
  if(askTV.length > alast.length) askTV.shift();
  baDelta.push(bt - at);
  if(baDelta.length > alast.length +20) baDelta.shift();
  var tv = bt > at ? bt : at;
  var dv = tv / ( $('#bids').parent().width() - 82 );

  // calculate and draw asks
  var wholePart = 0;
  _.each(doBook(asks, true), function(bid) {
    var aprice = bid[0].toFixed(2).toString().split('.');
    var priceColor = ( aprice[0] !== wholePart ? 'white': '#333' );
    b += '<div class="volrow">';
    b += '<div class="vol" style="opacity:' + gvbo(vba,bid[2])+ '">' + bid[2] + '</div>';
    b += '<div class="price"><span style="color:' + priceColor + '">' + aprice[0].toString();
    b += '</span>.' + aprice[1].toString() + '</div>';
    b += '<div class="volbar askbar" title="' + bid[1] + '" id="p' 
    	+ bid[0].toString().replace('.','_') 
    + '" style="width:' + ( bid[1] / dv ) + 'px"><div class="thisask" style="width:' + ( bid[2] / dv < 1 ? 1 : bid[2] / dv ) + 'px"></div></div></div>';
    wholePart = aprice[0];
  });
  $('#bids').html(b);
  $('.tipsy').remove();
  
  // calculate and draw bids
  b = '', wholePart = 0;
  _.each(doBook(bids), function(bid) {
    var aprice = bid[0].toFixed(2).toString().split('.');
    var priceColor = ( aprice[0] !== wholePart ? 'white': '#333' );
    b += '<div class="volrow">';
    b += '<div class="vol" style="opacity:' + gvbo(vbb,bid[2])+ '">' + bid[2] + '</div>';
    b += '<div class="price"><span style="color:' + priceColor + '">' + aprice[0].toString();
    b += '</span>.' + aprice[1].toString() + '</div>';
    b += '<div class="volbar bidbar" title="' + bid[1] + '" id="p' 
    	+ bid[0].toString().replace('.','_') 
    	+ '" style="width:' 
    	+ ( bid[1] / dv ) + 'px"><div class="thisbid" style="width:' 
       + ( bid[2] / dv < 1 ? 1 : bid[2] / dv ) + 'px"></div></div></div>'

    wholePart = aprice[0];
  });
  $('#asks').html(b);
  $('.volbar').tipsy({gravity:'e'});
  
  // draw bid volume line graph
  $("#bidgraph").sparkline(bidTV, {
        height:40, 
        width:240,
        lineColor:'green',
        fillColor:null,
        type: 'line'
  });
  // composite asks volume line graph onto bids
  $("#bidgraph").sparkline(askTV, {
        height:40, 
        width:240,
        lineColor:'red',
        fillColor:null,
        type: 'line',
        composite:true
  });
    // draw bid volume line graph
  $("#bop").sparkline([bt,at], {
        height:20, 
        width:20,
        lineColor:'green',
        fillColor:null,
        type: 'pie',
        sliceColors: ['green','maroon']
  });
 // $("#bop").css('opacity',1);
  TweenMax
      .to( $("#bop"), 0.1, { 
        'opacity' : 1 });
  TweenMax.to( $("#bop"), 0.1, { 
        'opacity' : 0.8,
        delay : 0.1 });
  // composite bid/asks volume delta graph onto bids
  $("#bidgraph").sparkline(baDelta, {
    type: 'line',
    height:40, 
    width:340,
    composite:true,
    fillColor:null,
    lineColor:'lime',
    lineHeight:4,
    type: 'discrete',
    thresholdValue: 0,
    thresholdColor: 'red'});
};
var slSettings = {
  type: 'line',
  lineWidth:2,
  height:40, 
  width:340,
  fillColor: null,
  lineColor: 'lime',
  spotRadius: 3.5};
var last = 0;
var alast = [];