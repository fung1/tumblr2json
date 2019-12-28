// Function to inject JSON data from Tumblr (method borrowed from: https://www.nczonline.net/blog/2009/07/28/the-best-way-to-load-external-javascript/)
var loadScript = function(url, callback){

    var script = document.createElement("script")
    script.type = "text/javascript";

	script.onerror = function() {
      	$('#submit').attr('disabled', 'disabled');
      	$('#submit').removeClass('blue green').addClass('red');
      	$('#submit').val('Error, refresh and try again');
	}

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

// Blog domain
var username;

// Blog data model
var blog = {
	tumblelog: {},
	posts: []
};

// Array we'll push into
var postArray = [];

// Total pages
var totalPages;

// Global API variable
var tumblr_api_read;

// Status update function
var updateStatus = function(page) {
	percentage = ((page/totalPages) * 100).toFixed(1);
    if (page == totalPages) {
    	status = 'Complete!'
    }

    else {
		status = percentage + '% downloaded';
	}

	$('#submit').val(status);
};

// Looping function to fetch posts
var fetchPosts = function(index) {
	
	// Update status
	updateStatus(index + 1);

	// Set URL with pagination
	var start = index * 50;
	var url = 'https://' + username + '.tumblr.com/api/read/json?num=50&start=' + start;

	// Perform request
	loadScript(url, function(){

    	// Get posts
    	var posts = tumblr_api_read.posts;

    	// Push posts into array
    	for (var i in posts) {
		  post = posts[i];
		  postArray.push(post);
		}

		// Bump the index
		index++;

		// If we're not finished, keep going
	    if (index != totalPages)
	    {					   	
	        fetchPosts(index);
	    }

	    // If we're finished, download the results
	    else {

	    	blog.posts = postArray;

	    	json = JSON.stringify(blog,null,2);

			// Download the JSON file
			var blob = new Blob([json]);
			if (window.navigator.msSaveOrOpenBlob)
			    window.navigator.msSaveBlob(blob, username + ".json");
			else
			{
			    var a = window.document.createElement("a");
			    a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
			    a.download = username + ".json";
			    document.body.appendChild(a);
			    a.click(); 
			    document.body.removeChild(a);
			}			

	    }					

	});

}; 

// Get blog details and start fetching
var startProcess = function() {
	loadScript('https://' + username + '.tumblr.com/api/read/json?num=0', function(){

			blog.tumblelog = tumblr_api_read.tumblelog;

	        totalPages = Math.ceil(tumblr_api_read['posts-total'] / 50);

	      	$('#submit').attr('disabled', 'disabled');
	      	$('#submit').removeClass('blue red').addClass('green');
			
			fetchPosts(0);

	});
}

// Click download button
$('#user').on('submit', function(e) {
    e.preventDefault();
    username = $('#username').val();
    startProcess();
});
