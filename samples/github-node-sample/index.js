var feignjs = require("feignjs");
var RequestClient  = require("feignjs-request");
var program = require("commander");


var githubApiDescription = {
	getReposOfUser: "GET /users/{user}/repos",
	getCommits: "GET /repos/{user}/{repo}/commits{?sha}"
}


var client = feignjs.builder()
	   .client(new RequestClient({defaults: {headers: {'User-Agent': 'request'}}}))
	   .target(githubApiDescription, 'https://api.github.com');



program.command("repos <user>").description("shows repos of a user")
.action(function(user){
	console.log("Showing repos of " + user);
	client.getReposOfUser(user).then(function(result){
		result.forEach(function(repo){
			console.log(repo.full_name);	
		})
	}).catch(function(err){
		console.error(err);
	})
})

program.command("commits <user> <repo> [treeish]").description("shows commits in a repo")
.action(function(user, repo, treeish){
	console.log("Showing commits of " + user + "/" + repo);
	client.getCommits({	user: user,
						repo: repo, 
						sha: treeish})
	.then(function(result){
		result.forEach(function(commit){
			console.log(commit.sha.substring(0,8) + " (" + commit.commit.author.name + "): " + commit.commit.message);	
		})	
	}).catch(function(err){
		console.error(err);
	})
})



program.parse(process.argv);