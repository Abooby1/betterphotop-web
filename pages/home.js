wireframes.home = ``;

pages.home = async function() {
	let renderPost = await getModule("post");
  let createpost = await getModule("createpost");
  let newPost = findC("newPost");
  if (newPost == null) {
    newPost = createpost("pageHolder");
  }

	if(!findI("signInUpBar") && !userID) {
		let signInUpBar = createElement("stickyContainer", "div", main);
		signInUpBar.id = "signInUpBar";
		signInUpBar.innerHTML = `
		<span class="signInUpText">Ready to Join the Hangout?</span>
		<button class="signInButton">
			Login
		</button>

		<div id="migrateTag">
			Still don't have an Exotek Account? Migrate before <i>October 21, 2023</i> to keep your account. <a href="#migrate" style="font-weight:1000;">Migrate Now</a>
		</div>
		`;
		findC("signInButton").addEventListener("click", function() {
			openLoginModal("signin", "Login");
		});
		if (findC("pageHolder") != null) {
			main.insertBefore(signInUpBar, findC("pageHolder"));
		}
	}

  if (userID == null) {
    if (newPost.style.display != "none") {
      newPost.style.display = "none";
    }
  } else {
		findI("newPostUsername").textContent = account.User || "";
    if (newPost.style.display != "flex") {
      newPost.style.display = "flex";
      let newPic = decideProfilePic(account);
      if (findI("newPostUserPfp").src != newPic) {
        findI("newPostUserPfp").src = newPic;
      }
    }
  }
  
  modifyParams("post");
  modifyParams("chat");
  modifyParams("group");
  modifyParams("user");
  
  let loadingPosts = false;
  let postHolder;
	let cursorId;
	let observer = new IntersectionObserver(handleIntersection);
  
  setAccountSub("home");
  async function loadPosts() {
    postHolder = findC("postHolder");
    loadingPosts = true;
    let getURL = "posts/home";
		if(homeView == "recent") {
			getURL = "posts";
		}
    if (cursorId) {
      getURL += "?cursor=" + cursorId;
    } else {
      if (postHolder != null) {
        postHolder.remove();
        postHolder = null;
      }
    }
    if (postHolder == null) {
      postHolder = createElement("postHolder", "div", pageHolder);

			if(userID) {
				postHolder.innerHTML = `
		 			<div class="stickyContainer settingsTabs" style="margin-bottom:8px;top:unset;" id="tabs">
					  <span class="tab ${homeView == "active"?"selected":""}" id="tab-active" tabindex="0">Active</span>
					  <span class="tab ${homeView == "recent"?"selected":""}" id="tab-recent" tabindex="0">Recent</span>
					</div>
				`;
	
				tempListen(findI("tab-active"), "click", function() {
					homeView = "active";
					setPage('home');
				});
				tempListen(findI("tab-recent"), "click", function() {
					homeView = "recent";
					setPage('home');
				});
			}
    }
    let [code, response] = await sendRequest("GET", getURL);
    if (code == 200) {
      let data = JSON.parse(response);
			cursorId = data.cursor;
      let posts = data.posts;
      let users = getObject(data.users, "_id");
      let likes = getObject(data.likes, "_id");
      for (let i = 0; i < posts.length; i++) {
        let post = posts[i];
				if (account.BlockedUsers == null || !account.BlockedUsers.includes(post.UserID)) {
					renderPost(postHolder, post, users[post.UserID], { isLiked: (likes[post._id + userID] != null), observer });
				}
      }
      if (posts.length > 14) {
        loadingPosts = false;
      }
      setPostUpdateSub();
      setupPostChats();
      updateChatting(posts);
    }
  }

  loadPosts();
  
  tempListen(document, "scroll", function() {
    if (postHolder != null && (window.innerHeight + window.scrollY) >= postHolder.offsetHeight - 500 && !loadingPosts) {
      loadPosts();
    }
  });
	
	/*
  // Load Needed Modules
  let renderPost = await getModule("post");
  let createpost = await getModule("createpost");
  let newPost = findC("newPost");
  if (newPost == null) {
    newPost = createpost("pageHolder");
  }

  if (userID == null) {
    if (newPost.style.display != "none") {
      newPost.style.display = "none";
    }
  } else {
    if (newPost.style.display != "flex") {
      newPost.style.display = "flex";
      let newPic = decideProfilePic(account);
      if (findI("newPostUserPfp").src != newPic) {
        findI("newPostUserPfp").src = newPic;
      }
      findI("newPostUsername").textContent = account.User || "";
    }
  }
  
  modifyParams("post");
  modifyParams("chat");
  modifyParams("group");
  modifyParams("user");
  
  let loadingPosts = false;
  let postHolder;
	let cursorId;
  
  setAccountSub("home");
  async function loadPosts() {
    postHolder = findC("postHolder");
    loadingPosts = true;
    let getURL = "posts";
    if (cursorId) {
      getURL += "?cursor=" + cursorId;
    } else {
      if (postHolder != null) {
        postHolder.remove();
        postHolder = null;
      }
    }
    if (postHolder == null) {
      postHolder = createElement("postHolder", "div", pageHolder);
    }
    let [code, response] = await sendRequest("GET", getURL);
    if (code == 200) {
      let data = JSON.parse(response);
			cursorId = response.cursor;
			console.log(response.cursor)
      let posts = data.posts;
      let users = getObject(data.users, "_id");
      let likes = getObject(data.likes, "_id");
      for (let i = 0; i < posts.length; i++) {
        let post = posts[i];
        renderPost(postHolder, post, users[post.UserID], { isLiked: (likes[post._id + userID] != null) });
      }
      if (posts.length > 14) {
        loadingPosts = false;
      }
      setPostUpdateSub();
      setupPostChats();
      updateChatting(posts);
    }
  }

  loadPosts();
  
  tempListen(document, "scroll", function() {
    if (postHolder != null && (window.innerHeight + window.scrollY) >= postHolder.offsetHeight - 500 && !loadingPosts) {
      loadPosts();
    }
  });
	*/
}