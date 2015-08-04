
var githubApiDescription = {
	getReposOfUser: "GET /users/{user}/repos",
	getCommits: "GET /repos/{user}/{repo}/commits{?sha}"
}

var client = feign.builder()
	   .client(new FeignJquery())
	   .target(githubApiDescription, 'https://api.github.com');


$(document).ready(function(){
	$("#showRepos").click(function(){
		var user = $("#user").val();
		$("#repositories").empty();
		client.getReposOfUser(user).then(function(result){
			result.forEach(function(repo){
				$("#repositories").append(repo.full_name + "<br />");
			})
		}).catch(function(err){
			console.log(err);
		})
	})
	
	$("#showCommits").click(function(){
		var user = $("#cuser").val();
		var reponame = $("#repo").val();
		var sha = $("#sha").val();
		if (sha === "") 
			sha = null;
		
		$("#commits").empty();
		client.getCommits({
			user: user, 
			repo: reponame, 
			sha: sha
		}).then(function(result){
			result.forEach(function(commit){
				$("#commits").append(commit.sha.substring(0,8) + " (" + commit.commit.author.name + "): " + commit.commit.message + "<br />");
			})
		}).catch(function(err){
			console.log(err);
		})
	})
})