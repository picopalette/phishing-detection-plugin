
/*
$('a').click(function(){
    alert("You are about to go to "+$(this).attr('href'));
});
*/

var result = {};
//---------------------- 1.  IP Address  ----------------------

var url = window.location.href;
// alert(url);
var urlDomain = window.location.hostname;

//url="0x58.0xCC.0xCA.0x62"

var patt = /(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]?[0-9])(\.|$){4}/;
var patt2 = /(0x([0-9][0-9]|[A-F][A-F]|[A-F][0-9]|[0-9][A-F]))(\.|$){4}/;


if(patt.test(urlDomain)||patt2.test(urlDomain)){ 
    result["IP Address"]="1";
}else{
    result["IP Address"]="-1";
}

//alert(result);

//---------------------- 2.  URL Length  ----------------------


//alert(url.length);
if(url.length<54){
    result["URL Length"]="-1";
}else if(url.length>=54&&url.length<=75){
    result["URL Length"]="0";
}else{
    result["URL Length"]="1";
}
//alert(result);


//---------------------- 3.  Tiny URL  ----------------------

var onlyDomain = urlDomain.replace('www.','');

if(onlyDomain.length<7){
    result["Tiny URL"]="1";
}else{
    result["Tiny URL"]="-1";
}
//alert(result);

//---------------------- 4.  @ Symbol  ----------------------

patt=/@/;
if(patt.test(url)){ 
    result["@ Symbol"]="1";
}else{
    result["@ Symbol"]="-1";
}

//---------------------- 5.  Redirecting using //  ----------------------

if(url.lastIndexOf("//")>7){
    result["Redirecting using //"]="1";
}else{
    result["Redirecting using //"]="-1";
}

//---------------------- 6. (-) Prefix/Suffix in domain  ----------------------

patt=/-/;
if(patt.test(urlDomain)){ 
    result["(-) Prefix/Suffix in domain"]="1";
}else{
    result["(-) Prefix/Suffix in domain"]="-1";
}

//---------------------- 7.  No. of Sub Domains  ----------------------

patt=/./;
if((onlyDomain.match(patt)||[]).length=1){ 
    result["No. of Sub Domains"]="-1";
}else if((onlyDomain.match(patt)||[]).length=2){ 
    result["No. of Sub Domains"]="0";    
}else{
    result["No. of Sub Domains"]="1";
}

//---------------------- 8.  HTTPS  ----------------------


patt=/https:\/\//;
if(patt.test(url)){
    result["HTTPS"]="-1";
}else{
    result["HTTPS"]="1";
}

//---------------------- 9.  Domain Registration Length  ----------------------

//---------------------- 10. Favicon  ----------------------

/*
alert("hello there");
var msg ="..";
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        alert("working");
      //msg+=chrome.webRequest.onBeforeRequest.frameAncestors[0];
    },
    {urls: ["<all_urls>"]},
    []);
alert(msg);
*/

//---------------------- 11. Using Non-Standard Port  ----------------------

//---------------------- 12.  HTTPS in URL's domain part  ----------------------


patt=/https/;
if(patt.test(onlyDomain)){
    result["HTTPS in URL's domain part"]=",1";
}else{
    result["HTTPS in URL's domain part"]=",-1";
}

// alert(result);

chrome.runtime.sendMessage(result, function(response) {
    console.log(result);
    console.log(response);
});
