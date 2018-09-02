
/*
$('a').click(function(){
    alert("You are about to go to "+$(this).attr('href'));
});
*/
var result = "";
//---------------------- 1.  IP Address  ----------------------

var url = window.location.href;
//alert(url);
var urlDomain = window.location.hostname;
//url="0x58.0xCC.0xCA.0x62"
var patt = /(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]?[0-9])(\.|$){4}/;
var patt2 = /(0x([0-9][0-9]|[A-F][A-F]|[A-F][0-9]|[0-9][A-F]))(\.|$){4}/;
if(patt.test(urlDomain)||patt2.test(urlDomain)){ 
    result+="1";
}else{
    result+="-1";
}
//alert(result);

//---------------------- 2.  URL Length  ----------------------

if(url.length<54){
    result+=",-1";
}else if(url.length>=54&&url.length<=75){
    result+=",0";
}else{
    result+=",1";
}
//alert(result);

//---------------------- 3.  Tiny URL  ----------------------

var onlyDomain = urlDomain.replace('www.','');

if(onlyDomain.length<7){
    result+=",1";
}else{
    result+=",-1";
}
//alert(result);

//---------------------- 4.  @ Symbol  ----------------------

patt=/@/;
if(patt.test(url)){ 
    result+=",1";
}else{
    result+=",-1";
}
//alert(result);

//---------------------- 5.  Redirecting using //  ----------------------

if(url.lastIndexOf("//")>7){
    result+=",1";
}else{
    result+=",-1";
}

//---------------------- 6. (-) Prefix/Suffix in domain  ----------------------

patt=/-/;
if(patt.test(urlDomain)){ 
    result+=",1";
}else{
    result+=",-1";
}
//alert(result);

//---------------------- 7.  No. of Sub Domains  ----------------------

patt=/./;
if((onlyDomain.match(patt)||[]).length=1){ 
    result+=",-1";
}else if((onlyDomain.match(patt)||[]).length=2){ 
    result+=",0";
}else{
    result+=",1";
}
//alert(result);

//---------------------- 8.  HTTPS  ----------------------

patt=/https:\/\//;
if(patt.test(url)){
    result+=",-1";
}else{
    result+=",1";
}

//---------------------- 9.  Domain Registration Length  ----------------------

//---------------------- 10. Favicon  ----------------------

//---------------------- 11. Using Non-Standard Port  ----------------------

//---------------------- 12.  HTTPS in URL's domain part  ----------------------

patt=/https/;
if(patt.test(onlyDomain)){
    result+=",1";
}else{
    result+=",-1";
}
alert(result);
//---------------------- 13.  Request URL  ----------------------
