$(function(){
    browser.storage.local.get(['summary'], function(data){
        $('#summary').html(data.summary);
    });
});